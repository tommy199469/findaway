var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect();

chai.use(chaiHttp);

describe('Test findaway api', function () {
    it('testing for get order list , expect null ', function (done) {
        chai.request('127.0.0.1:3000').get('/orders?page=0&limit=0')
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length(0);
          done();
        });
    }); 

    it('testing for get order list , expect the result length is 1 ', function (done) {
        chai.request('127.0.0.1:3000').get('/orders?page=1&limit=1')
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length(1);
          done();
        });
    }); 

    it('testing for get order list , expect error is PARAM_MUST_BE_INT ', function (done) {
        var data = [
            {page:"text" , limit : 0}, 
            {page:"text" , limit : 'window.alert("wowwowowo")'}, 
            {page:"" , limit : null}, 
            {page:null , limit : null}, 
            {page: "123" , limit : "123" }, 
        ];

        chai.request('127.0.0.1:3000').get(`/orders?page="123"&limit="123"`)
        .end(function(err, res){
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('error');
          res.body.error.should.equal('PARAM_MUST_BE_INT');
          done();
        });
    }); 

    it('testing for create order , expect success ', function (done) {
        chai.request('127.0.0.1:3000').post('/orders?page=0&limit=0')
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
          res.body.should.have.property('status');
          res.body.status.should.equal('UNASSIGNED');
          done();
        });
    }); 

    it('testing for create order , expect WRONG_PLACES ', function (done) {
        chai.request('127.0.0.1:3000').post('/orders?page=0&limit=0')
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

    it('testing for take order , expect success', function (done) {
        chai.request('127.0.0.1:3000').patch('/orders/6')
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.status.should.equal('SUCCESS');
          done();
        });
    }); 

    it('testing for take order , expect takem', function (done) {
        chai.request('127.0.0.1:3000').patch('/orders/6')
        .end(function(err, res){
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('status');
          res.body.status.should.equal('TAKEN');
          done();
        });
    }); 
});