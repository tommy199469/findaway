# findaway

You can run the run.sh to run docker container of api and database.

Step 1: set the .env file according to .env.exmaple &nbsp;
Step 2 : sudo chmod 775 ./run.sh &nbsp;
Step3(option) : run the unit test , cd ./test && npm i && npm test && npm test &nbsp;

## Unit Test
First time to run the unit test , testing for get order list , expect the result length is 1 , this case will be failed , because databasse still not have any record. It should be passed when run npm test again. &nbsp;
if the test case faild (testing for take order , expect success) , please change the order_id
