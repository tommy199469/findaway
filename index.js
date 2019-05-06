var express = require('express')
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
const axios = require('axios');
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// config
var config = {
    google_key : process.env.google_key ? process.env.google_key : ""
}

// function initDb(){
//     var mysql = require('mysql');
//     return mysql.createConnection({
//       host: '127.0.0.1',
//       database: 'test',
//       user: 'root',
//       password: 'password',
//     });
// }

app.post('/orders', function (req, res) {
    const {origin ,  destination} = req.body

    if(origin.length != 2 || destination.length != 2 ){
        res.send({ 
            error: "Please check the input" 
        }, 400)      
    }

    axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=Washington,DC&destinations=New+York+City,NY&key=${config.google_key}`)
      .then(function (response) {
        if(response.status == 200){
            const { data } = response
            let distance = data.rows[0] && data.rows[0].elements ? data.rows[0].elements[0].distance : null
            res.send({ 
                "id" : 1 ,
                "distance" : distance.text ? parseInt(distance.text.replace(' km' , '')) : 0,
                "status": "UNASSIGNED"
            }, 200)
        }else{
            res.send({ 
                code : 500,
                error_code : "GOOGLE_API_ERROR",
                message : "cannot call google api service"
            }, 500)        
        }
      }).catch(function (error) {
        console.log(error);
        res.send({ 
            code : 500,
            error_code : "ERROR",
            message : error
        }, 500)        
      });

})

app.listen(8080);
