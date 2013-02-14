var cube1, cube2, cube3;
var permacubes = new Array();
var bricks = new Array();
var grid = new Array();
var grid2 = new Array();
var player;
var TXS = {};
var TYPE = {};
var count = 0;
var mapwidth = 51;
var mapheight = 15;
var blockwidth = 35;
var density= 5;
var startx= blockwidth+5;
var starty= blockwidth+blockwidth;
var DEFAULT_MOVEMENT_SPEED = 2;
var pressedKeys = [];
var PLAYER_MOVEMENT_SPEED = 2;
var offsetx = 5;
var offsety = 35;
var TYPE = {
	NOTHING: 0,
	PASSABLE: 1,
	SOMETHING: 2
};

var Key = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	W: 87,
	S: 83,
	
}

var GameObject = (function() {
    // "private" variables 
    var _x;
	var _y;
	var _width;
	var _height;
	var _image;
	var _type;
	
    // constructor
    function GameObject(){
		this._image = new Image();
		this._type = TYPE.NOTHING;
		
	};
	
    // add the methods to the prototype so that all of the 
    // GameObject instances can access the private static
	

    GameObject.prototype.getImage = function() {
        return this._image;
    };
	
    GameObject.prototype.setImage = function(file_name) {
        this._image.src = file_name;
    };
	
	GameObject.prototype.setSize = function(size) {
		this._width = size;
		this._height = size;
	};
	
	GameObject.prototype.setPosition = function(x, y) {
		this._x = x;
		this._y = y;
	};
	
	GameObject.prototype.getPosition = function() {
		return {x:this._x, y:this._y};
	};
	
	GameObject.prototype.draw = function(ctx) {
	
		if (this._image.src)
			ctx.drawImage(this._image, this._x, this._y, this._width, this._height);
	};
	
	GameObject.prototype.setType = function(type){
		this._type = type;
	};
	
	GameObject.prototype.is = function(type){
		return this._type & type;
		
	};

    return GameObject;
	
})();

var MovingObject = (function() {
	var _movement_speed;
	var _direction_x ;
	var _direction_y ;
	var _grid_x;
	var	_grid_y;
	
	function MovingObject(){
		this._movement_speed = DEFAULT_MOVEMENT_SPEED;
		this._grid_x = 0;
		this._grid_y = 0;	
		this._direction_x = 0 ;
		this._direction_y = 0;		
	};
		
	var super_class = new GameObject();
	MovingObject.prototype = super_class;
	
	MovingObject.prototype.move = function() {
		this.setPosition(
			this._x+this._direction_x*this._movement_speed, 
			this._y+this._direction_y*this._movement_speed
		);
	};
	
	MovingObject.prototype.collision = function(){	
		var offset_x = offsetx;
		var offset_y = offsety;
		var center_x = this._x + blockwidth/2;
		var center_y = this._y + blockwidth/2;
		this._grid_x = Math.floor((center_x - offset_x) / blockwidth);
		this._grid_y = Math.floor((center_y - offset_y) / blockwidth);
		
		if (this._direction_x){
			this._direction_y = 0;
			var target_x = this._grid_x + this._direction_x;
			var target = grid[target_x][this._grid_y];
			if (target.is(TYPE.PASSABLE) == 0){
				if(this._direction_x < 0) {
					//moving left
					if(this._x - this._movement_speed < target.getPosition().x + blockwidth){
						this._direction_x = 0;
					}					
				} else {
					//moving right
					if(this._x + this._movement_speed > target.getPosition().x - blockwidth){
						this._direction_x = 0;
					};
				}
			}
		} else if (this._direction_y){
			var target_y = this._grid_y + this._direction_y;
			var target = grid[this._grid_x][target_y];
			if (target.is(TYPE.PASSABLE) == 0){
				if(this._direction_y < 0) {
					//moving up
					if(this._y - this._movement_speed < target.getPosition().y + blockwidth){
						this._direction_y = 0;
					}					
				} else {
					//moving down
					if(this._y + this._movement_speed > target.getPosition().y - blockwidth){
						this._direction_y = 0;
					};
				}
			}
		}

// logging code		
if (pressedKeys[Key.W]) {
	console.log("X: "+this._grid_x);
	console.log("Y: "+this._grid_y);
	console.log("PASSABLE: "+grid[this._grid_x][this._grid_y].is(TYPE.PASSABLE));
}
		
	};
	
	MovingObject.prototype.physics = function(){
		this.collision();
		this.move();
	};
	
	return MovingObject;
})();

var PlayerObject = (function() {

	function PlayerObject(){
		this._x = startx;
		this._y = starty;
		this._movement_speed = PLAYER_MOVEMENT_SPEED;
	};
		
	var super_class = new MovingObject();
	PlayerObject.prototype = super_class;
	
				
	PlayerObject.prototype.movement = function(x,y) {
		this._direction_x = 0;
		this._direction_y = 0;
		if (pressedKeys[Key.UP]) this._direction_y--; 
		if (pressedKeys[Key.DOWN]) this._direction_y++;
		if (pressedKeys[Key.LEFT]) this._direction_x--;
		if (pressedKeys[Key.RIGHT])this._direction_x++; 
		
		this.physics();
	};
	
	return PlayerObject;
})();

function init(){
	TXS.BRICK = "images/brick.png";
	TXS.PERMA = "images/permabrick.jpg";
	TXS.TYSON = "images/miketyson.jpg";
	
	ctx = document.getElementById('canvas').getContext('2d');
    player = new PlayerObject();
	player.setImage(TXS.TYSON);
	player.setSize(blockwidth);
					
	for (x=0; x<mapwidth; x++){
		grid[x]= new Array();
		for (y=0; y < mapheight; y++){
			grid[x][y] = new GameObject();
			grid[x][y].setSize(blockwidth);
			grid[x][y].setPosition(offsetx +(x * blockwidth), offsety +(y*blockwidth));
			//generate permanent cubes
			if (x==0 || y==0 || x==mapwidth-1 || y==mapheight-1 || (x%2 == 0 && y%2 == 0 )) {
			    grid[x][y].setImage(TXS.PERMA);
				grid[x][y].setType(TYPE.SOMETHING);
			} else {
				// keep starting position, grid block (1,1) open
				if (x+y<4){	
					grid[x][y].setType(TYPE.PASSABLE);
					continue
				}; 
				
				//generate destructible blocks
				if (Math.random()*10 < density){
					grid[x][y].setImage(TXS.BRICK);
					grid[x][y].setType(TYPE.SOMETHING);
					
				} else {
					grid[x][y].setType(TYPE.PASSABLE);
				}
			}
		}	
	}
	setInterval(gameloop,33.33);
};
	
function gameloop(){
	moveandcheck();
	draw();
};

function draw(){
	ctx.clearRect(0, 0 , blockwidth * mapwidth, blockwidth * mapheight);
	for (x=0; x<mapwidth; x++){
		for (y=0; y < mapheight; y++){
			grid[x][y].draw(ctx);
		}
	}
	player.draw(ctx);
};

function moveandcheck(){
	player.movement();	
};

window.addEventListener('keydown', function(event) {
	pressedKeys[event.keyCode] = true;
}, 
false);

window.addEventListener('keyup', function(event) {
	 pressedKeys[event.keyCode] = false;
}, 
false);
