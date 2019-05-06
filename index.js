var express = require('express')
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
    console.log('origin' , origin);
    console.log('destination' , destination);

    if(origin.length != 2 || destination.length != 2 ){
        res.send({ 
            error: "Please check the input" 
        }, 400)      
    }

    // axios.post('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=Washington,DC&destinations=New+York+City,NY&key=${google_key}', {
    //     firstName: 'Fred',
    //     lastName: 'Flintstone'
    //   })
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });

    res.send({ 
        "id": 1,
        "distance": "wow",
        "status": "UNASSIGNED"
    }, 200)
})

app.listen(8080);
