require('dotenv').config()
var express = require('express')
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
const axios = require('axios');


app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// config
var config = {
    google_key : process.env.google_key ? process.env.google_key : "",
    database : process.env.database ? process.env.database : "findaway",
    db_port : process.env.db_port ? process.env.db_port : "3306",
    db_url : process.env.db_url ? process.env.db_url : "127.0.0.1",
    db_user : process.env.db_user ? process.env.db_user : "root",
    db_user_pwd : process.env.db_user_pwd ? process.env.db_user_pwd : "password",
    port  : process.env.port ? process.env.port : 8080
}

function initDb(){
    var mysql = require('mysql');
    return mysql.createPool({
      host: config.db_url,
      port: config.db_port,
      database: config.database,
      user: config.db_user,
      password: config.db_user_pwd,
    });
}

function checkString(element){
    return typeof element == 'string'
}

app.post('/orders', function (req, res) {
    const {origin ,  destination} = req.body
    let error = ""

    // validate the params
    if(!origin  || !destination ){
        error = "EMPTY_PARAMS"
    }else if(origin.length != 2 || destination.length != 2 ){ 
        error = "PARAMS_NOT_CORRECT"
    }else if(!( checkString(origin[0]) && checkString(origin[1])) ){   
        error = "ORIGIN_IS_NOT_STRING"
    }else if(!( checkString(destination[0]) && checkString(destination[1])) ){
        error = "DESTINATION_IS_NOT_STRING"
    }

    if(error){
        return res.status(400).send({error})
    }

    let origins = `origins=${origin[0]},${origin[1]}`
    let destinations = `destinations=${destination[0]},${destination[1]}`

    axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&${origins}&${destinations}&key=${config.google_key}`)
      .then(function (response) {
        if(response.status == 200){
            const { data } = response
            // check result from google api
            let distance = data.rows[0] && data.rows[0].elements ? data.rows[0].elements[0].distance : null

            if(distance){
                // init db connection
                var dbconnecttion = initDb()

                distance = distance && distance.text ? parseInt(distance.text.replace(' km' , '')) : 0
                //  using mysql currenct timestamp
                var CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
                let set = {
                    status : 0 ,
                    distance : distance,
                    createDate : CURRENT_TIMESTAMP,
                    updateDate : CURRENT_TIMESTAMP
                }
                let sql = 'INSERT INTO `order` SET ?'
               
                dbconnecttion.query(sql,set ,  function (error, results) {
                    //  close db connection
                    dbconnecttion.end();
                    if (error) {
                        return res.status(500).send({error:"DB_ERROR"})
                    }
                    return res.status(201).send({
                        "id": results.insertId,
                        "distance": distance,
                        "status": "UNASSIGNED"                    
                    })
                });
            }else{ 
                return res.status(400).send({error:"WRONG_PLACES"})
            }

        }else{ 
            return res.status(500).send({error:"GOOGLE_ERROR"})
        }
      }).catch(function (error) {
        console.log(error);
        return res.status(500).send({error:"ERROR"})
      });

})

app.patch('/orders/:id', function (req, res) {
    const {id} = req.params
    var dbconnecttion = initDb()

    var CURRENT_TIMESTAMP = { toSqlString: function() { return 'CURRENT_TIMESTAMP()'; } };
    let sql = 'UPDATE `order` SET status = ? , updateDate = ?  WHERE id = ? and status = ? '

    dbconnecttion.query('SELECT id from `order` where id = ?' , [id] , function (error, results) {
        if(error){
            dbconnecttion.end();
            return res.status(500).send({status: "DB_ERROR"})
        }

        if( results && results[0] &&  results[0].id){
            dbconnecttion.query(sql, [1, CURRENT_TIMESTAMP , id , 0] ,  function (error, results) {
                dbconnecttion.end();
                if(error){
                    return res.status(500).send({status: "DB_ERROR"})
                }
                console.log('results' , results);
                let status = results.changedRows > 0 ? 'SUCCESS' : "TAKEN"
                let code = results.changedRows > 0 ? 200 : 400
                return res.status(code).send({status})
            })
        }else{
           dbconnecttion.end();
          return res.status(404).send({status: "NO_RECORD"})
        }
    })
})


function checkInt(param){
    return new RegExp('^[0-9]+$').test(param)
}

app.get('/orders', function (req, res) {

    const {page , limit} = req.query
    if(!checkInt(page) || !checkInt(limit)){
        return res.status(400).send({error : "PARAM_MUST_BE_INT"})
    }

    var dbconnecttion = initDb()
    dbconnecttion.query('Select count(*) as `TotalCount` from `order` ' , function (error, results) {

        if(error){
            dbconnecttion.end();
            return res.status(500).send({status: "DB_ERROR"})
        }

        if( results && results[0] && results[0].TotalCount){
            dbconnecttion.query('Select * from `order` limit ? OFFSET ?', [parseInt(limit) , parseInt(page)] ,  function (error, results) {
                // dbconnecttion.end();
                console.log('results' ,results);
                if(error){
                    return res.status(500).send({status: "DB_ERROR"})
                }
                return res.status(200).send(results)
            })
        }else{
           dbconnecttion.end();
          return res.status(404).send({status: "NO_RECORD"})
        }
    })
})

app.listen(config.port);
