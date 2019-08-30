// set up server
var config = require('./../../language-rescue/BackEnd/config/config.js'), // import config variables
  port = config.sandbox_port,                       // set the port
  express = require('express'),             // use express as the framwork
  app = express(),                          // create the server using express
  path = require('path');                   // utility module

var bodyParser = require("body-parser");

var rooms = [];
var moveInterval;

app.use(express.static(path.join(__dirname, 'public'))); // this middleware serves static files, such as .js, .img, .css files

// Initialize server
var server = app.listen(port, function () {
  console.log('Listening on port %d', server.address().port);
});

// Use '/' to go to index.html via static middleware

// Use '/test' to send "test" as a response.

// create a get handler that will accept which direction arrow was press, which id pressed it


app.get('/setUpRoom', function (req, res) {
	var result           = '';
   	var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  	var charactersLength = characters.length;
   	for (var i = 0; i <= 5; i++) {
      		result += characters.charAt(Math.floor(Math.random() * charactersLength));
   	}
	var randX = Math.floor(Math.random() * 79);
	var randY = Math.floor(Math.random() * 39);
	var snake = new Snake(0, [randX,randY], result, null); //id(since he started the room hes number 0), blocks, roomCode	
	var room = new Room(result, snake, false, []);
	rooms.push(room);
	res.send({
		"result":"success",
		"code":result
	});
});

app.get('/JoinRoom/:AttemptID', function (req, res) {
	if(rooms != []) {
		for(var i = 0; i < rooms.length; i++) {
			if(rooms[i].ID == AttemptID) { //if entered a valid id
				var randX = Math.floor(Math.random() * 79);
				var randY = Math.floor(Math.random() * 39);
				for (var j = 0; j < rooms[i].snakes.length; j++) { //makes sure if they spawned where others did and if so make a new spawning spot
					if(rooms[i].snakes[j].blocks == [randX,randY]) {
						randX = Math.floor(Math.random() * 79);
						randY = Math.floor(Math.random() * 39);
						i = 0;
					}
				}
				var snake = new Snake(rooms[i].length, [randX,randY], AttemptID, null);
				res.send({
					"result":"success",
					"ID":rooms[i].length
				});
				break;
			}
		}
	} else {
		res.send({
			"result":"error"
		});
	}
});

app.get('/startMultiPlayerGame/:RoomID', function (req, res) {
	for(var i = 0; i < rooms.length; i++) {
		if(rooms[i].ID == RoomID) rooms[i].active = true;	
	}
	moveInterval = setInterval( function(){ 
			for (var i = 0; i < rooms.length; i++) {
				if(rooms[i].active == true) { // if im looking at a room that has started
					for(var j = 0; j < rooms[i].snakes.length; j++) { //looks through the list of snakes
						/*Move();  add these but make it multiplayer freindly
						if (isNoFuits) counter += 100;
						if (counter >= randTime) MakeFruit();
						*/
					}
				}
			}
		},60);
	res.send({
		"result":"success"
	});
});

app.get('/Direction:directionRequest', function (req, res) {
	
});

app.get('/getAllSnakes/:RoomID', function (req, res) {
	var CurrentRoom;
	var RoomID = req.params.RoomID;
	console.log("Got inside server handler 1");
  	for(var i = 0; i< rooms.length; i++) { //trys to find room with the id they sent in.
		if(rooms[i].ID == RoomID) {
			CurrentRoom = rooms[i];	
		}
	}
	res.send({
		"result":"success",
		"snakes":CurrentRoom.Snakes,
		"fruit":CurrentRoom.fruit
	  });
});

function Snake(ID, blocks, roomCode, dirrection) {
	this.ID = ID;
	this.blocks = blocks;
	this.roomCode = roomCode;
	this.dirrection = dirrection;
}

function Room(ID, Snakes, Active, fruit) {
	this.ID = ID;
	this.snakes = Snakes;
	this.active = Active;
	this.fruit = fruit;
}
















app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/test', function (req, res) {
  res.send('tested');
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
