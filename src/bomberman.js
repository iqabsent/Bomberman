// constants
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 400;
var DEFAULT_MOVEMENT_SPEED = 2;
var PLAYER_MOVEMENT_SPEED = 2;
var BLOCK_WIDTH = 35;
var MAP_WIDTH = 25;
var MAP_HEIGHT = 9;
var OFFSET_X = 5;
var OFFSET_Y = 35;
var DRAG_TOLERANCE = 35;

// enums / flags
var TXS = {
  BRICK: "images/brick.png",
	PERMA: "images/permabrick.jpg",
	TYSON: "images/miketyson.jpg"
};
var TYPE = {
	NOTHING: 0,
	PASSABLE: 1,
	SOMETHING: 2
};
var KEY = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	W: 87,
	S: 83,	
}

// variables
var SCROLL_MIN_X = Math.round((CANVAS_WIDTH - BLOCK_WIDTH)/2);
var SCROLL_MAX_X = MAP_WIDTH * BLOCK_WIDTH + OFFSET_X * 2 - SCROLL_MIN_X * 2 - BLOCK_WIDTH;
var SCROLL_MIN_Y = Math.round((CANVAS_HEIGHT - BLOCK_WIDTH)/2);
var SCROLL_MAX_Y = MAP_HEIGHT * BLOCK_WIDTH + OFFSET_Y * 2 - SCROLL_MIN_Y * 2 - BLOCK_WIDTH;
var CAN_SCROLL_X = SCROLL_MAX_X > SCROLL_MIN_X;
var CAN_SCROLL_Y = SCROLL_MAX_Y > SCROLL_MIN_Y;
var start_x = BLOCK_WIDTH + OFFSET_X;
var start_y = BLOCK_WIDTH + OFFSET_Y;
var grid = new Array();
var pressedKeys = [];
var point;
var player;
var density = 2;
var scroll_offset_x = 0;
var scroll_offset_y = 0;

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
    this._width = BLOCK_WIDTH;
    this._height = BLOCK_WIDTH;
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
			ctx.drawImage(
        this._image, this._x - scroll_offset_x,
        this._y - scroll_offset_y,
        this._width, this._height
      );
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
		var center_x = this._x + BLOCK_WIDTH/2;
		var center_y = this._y + BLOCK_WIDTH/2;
		this._grid_x = Math.floor((center_x - OFFSET_X) / BLOCK_WIDTH);
		this._grid_y = Math.floor((center_y - OFFSET_Y) / BLOCK_WIDTH);
		
		if (this._direction_x){
			this._direction_y = 0;
			var target_x = this._grid_x + this._direction_x;
			var target = grid[target_x][this._grid_y];
			if (target.is(TYPE.PASSABLE) == 0){
				if(this._direction_x < 0) {
					//moving left
					if(this._x - this._movement_speed < target.getPosition().x + BLOCK_WIDTH){
						this._direction_x = 0;
					}					
				} else {
					//moving right
					if(this._x + this._movement_speed > target.getPosition().x - BLOCK_WIDTH){
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
					if(this._y - this._movement_speed < target.getPosition().y + BLOCK_WIDTH){
						this._direction_y = 0;
					}					
				} else {
					//moving down
					if(this._y + this._movement_speed > target.getPosition().y - BLOCK_WIDTH){
						this._direction_y = 0;
					};
				}
			}
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
		this._x = start_x;
		this._y = start_y;
		this._movement_speed = PLAYER_MOVEMENT_SPEED;
	};
		
	var super_class = new MovingObject();
	PlayerObject.prototype = super_class;
	
  // overriding player move function to do scrolling and allignment stuff
	PlayerObject.prototype.move = function() {
  
    // align player with grid
    var error_x = 0;
    var error_y = 0;
    var grid_position = grid[this._grid_x][this._grid_y].getPosition();
    if(this._direction_x) {
      error_y = grid_position.y - this._y;
      if(error_y) {
        if(Math.abs(error_y) > this._movement_speed ) {
          if(error_y < 0) {
            error_y = -this._movement_speed;
          } else {
            error_y = this._movement_speed;
          }
        }
      }
    } else if(this._direction_y) {
      error_x = grid_position.x - this._x;
      if(error_x) {
        if(Math.abs(error_x) > this._movement_speed ) {
          if(error_x < 0) {
            error_x = -this._movement_speed;
          } else {
            error_x = this._movement_speed;
          }
        }
      }
    }
  
    // do scrolling stuff
    if(CAN_SCROLL_X && (this._direction_x || error_x)) {
      // moving horizontally
      scroll_offset_x = this._x + this._movement_speed * this._direction_x - SCROLL_MIN_X + error_x;
      
      if(scroll_offset_x < 0) scroll_offset_x = 0;
      if(scroll_offset_x > SCROLL_MAX_X)
        scroll_offset_x = SCROLL_MAX_X;
    }
    if(CAN_SCROLL_Y && (this._direction_y || error_y)) {
      // moving horizontally
      scroll_offset_y = this._y + this._movement_speed * this._direction_y - SCROLL_MIN_Y + error_y;
   
      if(scroll_offset_y < 0) scroll_offset_y = 0;
      if(scroll_offset_y > SCROLL_MAX_Y)
        scroll_offset_y = SCROLL_MAX_Y;
    }

    // do the usual stuff in move();
		this.setPosition(
			this._x+this._direction_x*this._movement_speed+error_x, 
			this._y+this._direction_y*this._movement_speed+error_y
		);
	};
  
	PlayerObject.prototype.movement = function() {
		this._direction_x = 0;
		this._direction_y = 0;
		if (pressedKeys[KEY.UP]) this._direction_y--; 
		if (pressedKeys[KEY.DOWN]) this._direction_y++;
		if (pressedKeys[KEY.LEFT]) this._direction_x--;
		if (pressedKeys[KEY.RIGHT])this._direction_x++;
    
		this.physics();
	};
	
	return PlayerObject;
})();


var PointDevice = (function() {
  var _touch, _drag;
  var _last_x, _last_y;
  
	function PointDevice(){
		this._touch = false;
    this._touch_x = 0;
    this._touch_y = 0;
	};

  PointDevice.prototype.point = function(x, y) {
    this._touch_x = x;
    this._touch_y = y;
    this._touch = true;
  };
  
  PointDevice.prototype.releaseKeys = function(x, y) {
    pressedKeys[KEY.LEFT] = false;
    pressedKeys[KEY.RIGHT] = false;
    pressedKeys[KEY.UP] = false;
    pressedKeys[KEY.DOWN] = false;
  };
  
  PointDevice.prototype.move = function(x, y)  {
    if(this._touch) {
      var change_in_x = x - this._touch_x;
      var change_in_y = y - this._touch_y;
      if ( Math.abs(change_in_x) > DRAG_TOLERANCE ) {
        this._drag = true;
        this.releaseKeys();
        if( change_in_x > 0 ) {
          pressedKeys[KEY.RIGHT] = true;
        } else {
          pressedKeys[KEY.LEFT] = true;
        }
      } else if (Math.abs(change_in_y) > DRAG_TOLERANCE ) {
        this._drag = true;
        this.releaseKeys();
        if( change_in_y > 0 ) {
          pressedKeys[KEY.DOWN] = true;
        } else {
          pressedKeys[KEY.UP] = true;
        }
      }
    }
  };
  
  PointDevice.prototype.moved = function(x, y)  {
    if(this._touch) {
      var change_in_x = x;
      var change_in_y = y;
      if ( Math.abs(change_in_x) > DRAG_TOLERANCE ) {
        this._drag = true;
        this.releaseKeys();
        if( change_in_x > 0 ) {
          pressedKeys[KEY.RIGHT] = true;
        } else {
          pressedKeys[KEY.LEFT] = true;
        }
      } else if (Math.abs(change_in_y) > DRAG_TOLERANCE ) {
        this._drag = true;
        this.releaseKeys();
        if( change_in_y > 0 ) {
          pressedKeys[KEY.DOWN] = true;
        } else {
          pressedKeys[KEY.UP] = true;
        }
      }
    }
  };
  
  PointDevice.prototype.stop = function() {
    if( !this._drag ){
      // click
      this.releaseKeys();
    }
    this._touch_x = 0;
    this._touch_y = 0;
    this._touch = false;
    this._drag = false;
  };
  
  return PointDevice;
})();

function init(){
	ctx = document.getElementById('canvas').getContext('2d');
  point = new PointDevice();
  player = new PlayerObject();
	player.setImage(TXS.TYSON);
					
	for (x=0; x<MAP_WIDTH; x++){
		grid[x]= new Array();
		for (y=0; y < MAP_HEIGHT; y++){
			grid[x][y] = new GameObject();
			grid[x][y].setPosition(OFFSET_X +(x * BLOCK_WIDTH), OFFSET_Y +(y * BLOCK_WIDTH));
			//generate permanent cubes
			if (x==0 || y==0 || x==MAP_WIDTH-1 || y==MAP_HEIGHT-1 || (x%2 == 0 && y%2 == 0 )) {
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
	ctx.clearRect(0, 0 , BLOCK_WIDTH * MAP_WIDTH, BLOCK_WIDTH * MAP_HEIGHT);
	for (x=0; x<MAP_WIDTH; x++){
		for (y=0; y < MAP_HEIGHT; y++){
			grid[x][y].draw(ctx);
		}
	}
	player.draw(ctx);
};

function moveandcheck(){
	player.movement();	
};

// keys
window.addEventListener('keydown', function(event) {
	pressedKeys[event.keyCode] = true;
}, false);
window.addEventListener('keyup', function(event) {
	 pressedKeys[event.keyCode] = false;
}, false);

// mouse
window.addEventListener('mousedown', function(event) {
  point.point(event.clientX, event.clientY);
}, false);
window.addEventListener('mouseup', function(event) {
  point.stop();
}, false);
window.addEventListener('mousemove', function(event) {
  point.move(event.clientX, event.clientY);
}, false);

// touch
window.addEventListener('touchend', function(event) {
  point.stop();
}, false);
window.addEventListener('touchstart', function(event) {
  point.point(event.event.touches[0].pageX, event.touches[0].pageY);
}, false);
window.addEventListener('touchmove', function(event) {
  point.move(event.event.touches[0].pageX, event.touches[0].pageY);
}, false);
