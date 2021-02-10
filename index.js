const express = require('express');
const app = express();

const http = require('http');
const serv = http.Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});

serv.listen(2000);
console.log('Server started');


var socket_list = {};
var player_list = {};


var Player = function(id,name,color){
	var self = {
		x:250,
		y:250,
		id:id,
		name:name,
		color:color,
		number: "" + Math.floor(10 * Math.random()),
		pressingLeft: false,
		pressingRight: false,
		pressingUp: false,
		pressingDown: false,
		maxSpd:10,
	}

	self.updatePosition = function(){
		if(self.pressingRight){
			self.x += self.maxSpd;
		}
		if(self.pressingLeft){
			self.x -= self.maxSpd;
		}
		if(self.pressingUp){
			self.y -= self.maxSpd;
		}
		if(self.pressingDown){
			self.y += self.maxSpd;
		}
	}

	return self;
}


var io = require('socket.io')(serv,{});

io.sockets.on('connection',function(socket){
	console.log('New connection');
	
	var player = null;


	socket.on('started',function(data){
		socket.id = Math.random();
		socket_list[socket.id] = socket;

		player = Player(socket.id, data.pname, data.pcolor);
		player_list[socket.id] = player;

	});

	socket.on('disconnect',function(){
		delete socket_list[socket.id];
		delete player_list[socket.id];
	});

	socket.on('keyPress',function(data){
		if(data.inputId === 'left'){
			player.pressingLeft = data.state;
		}
		else if(data.inputId === 'right'){
			player.pressingRight = data.state;
		}
		else if(data.inputId === 'up'){
			player.pressingUp = data.state;
		}
		else if(data.inputId === 'down'){
			player.pressingDown = data.state;
		}
	});

});


setInterval(function(){

	var pack = [];

	for(var i in player_list){
		var player = player_list[i];
		player.updatePosition();
		pack.push({
			x:player.x,
			y:player.y,
			name:player.name,
			color:player.color,
			number:player.number
		});
	}

	for(var i in socket_list){
		var socket = socket_list[i];
		socket.emit('newPositions', pack);
	}


}, 1000/25);



