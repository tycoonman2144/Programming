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

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


// Use '/' to go to index.html via static middleware

// Use '/test' to send "test" as a response.

// create a get handler that will accept which direction arrow was press, which id pressed it

function GetRandomID() {
	var result           = '';
	var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < 4; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

app.get('/setUpRoom', function (req, res) {
	var result = GetRandomID();
	for (var i = 0; i < rooms.length; i++) {
		if(rooms[i].ID == result) {
			result = GetRandomID(); //if its the same id as someone else's room, get a diffrent id
			i = 0;
		}
	}
	var randX = Math.floor(Math.random() * 79);
	var randY = Math.floor(Math.random() * 39);
	var snake = new Snake(0, [[randX,randY]], result, "right", 0, true); //id(since he started the room hes number 0), blocks, roomCode, dirrection, gorwing number, isAlive	
	var room = new Room(result, [snake], false, []);
	rooms.push(room);
	res.send({
		"result":"success",
		"code":result
	});
});

app.get('/JoinRoom/:AttemptID', function (req, res) {
	var AttemptID = req.params.AttemptID;
	if(rooms != []) {
		for(var i = 0; i < rooms.length; i++) {
			if(rooms[i].ID == AttemptID && rooms[i].Active == false) { //if entered a valid id and if room is not active
				var randX = Math.floor(Math.random() * 79);
				var randY = Math.floor(Math.random() * 39);
				for (var j = 0; j < rooms[i].snakes.length; j++) { //makes sure if they spawned where others did and if so make a new spawning spot
					if(rooms[i].snakes[j].blocks == [randX,randY]) {
						randX = Math.floor(Math.random() * 79);
						randY = Math.floor(Math.random() * 39);
						i = 0;
					}
				}
			} else {
				res.send({
					"result":"error",
				});	
			}
				var ClientID = rooms[i].snakes.length;
				var snake = new Snake(ClientID, [[randX,randY]], AttemptID, "right", 0, true);
				rooms[i].snakes.push(snake);
				res.send({
					"result":"success",
					"ID":ClientID
				});
				break;
			}
	} else {
		res.send({
			"result":"error"
		});
	}
});

app.get('/getAllSnakes/:RoomID', function (req, res) {
	var RoomID = req.params.RoomID;
	var CurrentRoom;
  	for(var i = 0; i< rooms.length; i++) { //trys to find room with the id they sent in.
		if(rooms[i].ID == RoomID) {
			CurrentRoom = rooms[i];	
		}
	}
	res.send({
		"result":"success",
		"snakes":CurrentRoom.snakes,
		"fruit":CurrentRoom.fruit
	  });
});

app.get('/startMultiPlayerGame/:RoomID', function (req, res) {
	var RoomID = req.params.RoomID;
	for(var i = 0; i < rooms.length; i++) {
		if(rooms[i].ID == RoomID) rooms[i].Active = true;	
	}
	moveInterval = setInterval( function(){ 
			for (var i = 0; i < rooms.length; i++) {
				if(rooms[i].active == true) { // if im looking at a room that has started
					for(var j = 0; j < rooms[i].snakes.length; j++) { //looks through the list of snakes
						Move(rooms[i].snakes[j], rooms[i]); //this includes growing, makeing/eating fruit, dieing
					}
				}
			}
		},60);
	res.send({
		"result":"success"
	});
});

function Move(snake, room) {
	var X_YList = [];
	var growing;
	var direction = snake.dirrection;
	if (snake.growing != 0) { //if im growing
		snake.growing = snake.growing - 1;
		growing = true;
	} else {
			growing = false;
	}
	if (direction == "up") {
		var x = snake.blocks[snake.blocks.length - 1][0];
		var y = snake.blocks[snake.blocks.length - 1][1] == 0 ? 39 : snake.blocks[snake.blocks.length - 1][1] - 1;
	}
	if (direction == "left") {		
		var x =  snake.blocks[snake.blocks.length - 1][0] == 0 ? 79 : snake.blocks[snake.blocks.length - 1][0] - 1;
		var y =  snake.blocks[snake.blocks.length - 1][1];
	}
	if (direction == "down") {
		var x = snake.blocks[snake.blocks.length - 1][0];
		var y = snake.blocks[snake.blocks.length - 1][1] == 39 ? 0 : snake.blocks[snake.blocks.length - 1][1] + 1;
	}
	if (direction == "right") {
		var x =  snake.blocks[snake.blocks.length - 1][0] == 79 ? 0 : snake.blocks[snake.blocks.length - 1][0] + 1;
		var y =  snake.blocks[snake.blocks.length - 1][1];
	}
	if (room.fruit == [x, y]) EatFruit(snake, room)
	for (var i = 0; i < room.snakes.length; i++) {
		for (var j = 0; j < room.snakes.blocks.length; j++) {
			if (room.snakes[i].blocks[j] == [x, y]) Dead(snake, room);  //if someone died
		}
	}
	//Color();		ADD THIS LATER
	X_YList = [x , y];
	snake.blocks.push(X_YList);		
	if (growing == false) snake.blocks.splice(0, 1);
}

function EatFruit(snake, room) {
	var randX = Math.floor(Math.random() * 80);
	var randY = Math.floor(Math.random() * 40);
	for (var i = 0; i < room.snakes.length; i++) {
		for (var j = 0; j < room.snakes.blocks.length) {
			if(room.snakes[i].blocks[j] == [randX, randY]) { // if in same spot that someone else is in
				var randX = Math.floor(Math.random() * 80);
				var randY = Math.floor(Math.random() * 40);
				i = 0;
				j = 0;
			}
		}
	}
	room.fruit = [randX, randY];
	snake.growing = 5;
}

function Dead(snake, room) {
	snake[i].alive = false;
	var howManyAlive = 0;
	for(var i = 0; i < room.snakes.length; i++) {
		if(room.snakes[i].alive == true) howManyAlive++;
	}
	if(howManyAlive == 1) room.Active = false; //ends game
}

app.get('/Direction/:infoToServer', function (req, res) {
	var InfoFromClient = req.params.infoToServer;
	for (var i = 0; i < rooms.length; i++) {
		if(rooms[i].ID == InfoFromClient.roomID) { //if same room as client
			for(var j = 0; j < rooms[i].snakes.length; j++) {
				if(rooms[i].snakes[j].ID == InfoFromClient.ID && rooms[i].snakes[j].alive == true) { //if same snake as client and if not dead
					rooms[i].snakes[j].dirrection = InfoFromClient.direction;
					res.send({
						"result":"success"
					});
				}
			}
		}
	}
});

app.get('/EndGame/:RoomID', function (req, res) {
	var RoomID = req.params.RoomID;
	for(var i = 0; i < rooms.length; i++) {
		if(rooms[i].ID == RoomID) rooms.splice(i, 1);	
	}
	var NumberOfRoomsActive = 0;
	for(var i = 0; i < rooms.length; i++) {
		if(rooms[i].Active == true) NumberOfRoomsActive++;
	}
	if (NumberOfRoomsActive == 0) clearInterval(moveInterval);
	res.send({
		"result":"success"
	});
});


function Snake(ID, blocks, roomCode, dirrection, growing, alive) {
	this.ID = ID;
	this.blocks = blocks;
	this.roomCode = roomCode;
	this.dirrection = dirrection;
	this.growing = growing;
	this.alive = alive;
}

function Room(ID, Snakes, Active, fruit) {
	this.ID = ID;
	this.snakes = Snakes;
	this.active = Active;
	this.fruit = fruit;
}














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
