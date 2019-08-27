// set up server
var config = require('./../../language-rescue/BackEnd/config/config.js'), // import config variables
  port = config.sandbox_port,                       // set the port
  express = require('express'),             // use express as the framwork
  app = express(),                          // create the server using express
  path = require('path');                   // utility module

var bodyParser = require("body-parser");

var snakes = [{"id":1,"color":"aaa783","length":45},{"id":2,"color":"bba433","length":33}];

startUpdateSnakeTimer();

app.use(express.static(path.join(__dirname, 'public'))); // this middleware serves static files, such as .js, .img, .css files

// Initialize server
var server = app.listen(port, function () {
  console.log('Listening on port %d', server.address().port);
});

// Use '/' to go to index.html via static middleware

// Use '/test' to send "test" as a response.

function startUpdateSnakeTimer()
{
	
}

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/test', function (req, res) {
  res.send('tested');
});

// create a get handler that will accept which direction arrow was press, which id pressed it



app.get('/getAllSnakes', function (req, res) {
  res.send(
	  {
		"result":"success",
		"snakes":snakes
	  }
  );
});

/*
app.get('/oddOrEven/:number', function(req,res) {
	if (req.params.number % 2 == 0)
	{
		res.send({
			result: 'even'
		});
	}
	else
	{
		res.send({
			result: 'odd'
		});
	}	
});
*/

app.use(bodyParser.json());


app.get('/', function(req,res){
	res.sendFile(path.resolve(__dirname + '/../../language-rescue/FrontEnd/StudentProjectLandingPage.html'));
});
