var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect();

chai.use(chaiHttp);

var api_host = "127.0.0.1:3000"
var order_id = 2
describe('Test findaway api', function () {

    it('testing for create order , expect success ', function (done) {
      chai.request(api_host).post('/orders?page=0&limit=0')
      .send({
          "origin": ["22.335760", "114.160784"],
          "destination": ["22.334005", "114.166089"]
      })
      .end(function(err, res){
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('distance');
        res.body.should.have.property('status').equal('UNASSIGNED');
        done();
      });
    }); 

    it('testing for create order , expect WRONG_PLACES ', function (done) {
        chai.request(api_host).post('/orders?page=0&limit=0')
        .send({
            "origin": ["", ""],
            "destination": ["22.334005", "114.166089"]
        })
        .end(function(err, res){
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('error').equal('WRONG_PLACES');
          done();
        });
    }); 

    it('testing for get order list , expect null ', function (done) {
        chai.request(api_host).get('/orders?page=0&limit=0')
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length(0);
          done();
        });
    }); 

    it('testing for get order list , expect the result length is 1 ', function (done) {
        chai.request(api_host).get('/orders?page=1&limit=1')
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length(1);
          done();
        });
    }); 

    it('testing for get order list , expect error is PARAM_MUST_BE_INT ', function (done) {
        chai.request(api_host).get(`/orders?page="123"&limit="123"`)
        .end(function(err, res){
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('error').equal('PARAM_MUST_BE_INT');
          done();
        });
    }); 

    it('testing for take order , expect success', function (done) {
        chai.request(api_host).patch('/orders/'+order_id)
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('status').equal('SUCCESS');
          done();
        });
    }); 

    it('testing for take order , expect taken', function (done) {
        chai.request(api_host).patch('/orders/'+order_id)
        .end(function(err, res){
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('status').equal('TAKEN');
          done();
        }); 
    });

    it('testing for take order , expect error', function (done) {
      chai.request(api_host).patch('/orders/999')
      .end(function(err, res){
        res.should.have.status(404);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('status').equal('NO_RECORD');
        done();
      }); 
    });
});