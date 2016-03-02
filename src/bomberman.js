// constants
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 403;
var DEFAULT_MOVEMENT_SPEED = 2.5;
var PLAYER_MOVEMENT_SPEED = 2.5;
var BLOCK_WIDTH = 30;
var BLOCK_HEIGHT = 26;
var MAP_WIDTH = 25;
var MAP_HEIGHT = 13;
var OFFSET_X = 0;
var OFFSET_Y = 65;
var DRAG_TOLERANCE = 30;
var BOOM_TIME = 5000;
var MAX_BOMBS = 10;

// enums / flags
var TYPE = {
	NOTHING: 0,
	PASSABLE: 1,
	SOMETHING: 2,
	BOMB: 4
};
var KEY = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	W: 87,
	S: 83,	
}

// image and animation info
var ASSET_PATH = "images/";
var ANI_DATA = {
	MAN_UP: 	{ prefix: "bbm_up", frames: 3, extension: "gif" },
	MAN_DOWN:	{ prefix: "bbm_down", frames: 3, extension: "gif" },
	MAN_LEFT:	{ prefix: "bbm_left", frames: 3, extension: "gif" },
	MAN_RIGHT:	{ prefix: "bbm_right", frames: 3, extension: "gif" },
	MAN_DEATH:	{ prefix: "bbm_death", frames: 7, extension: "gif" },
	BOMB:		{ prefix: "bomb", frames: 3, extension: "gif" }
};
var IMG_DATA = {
	BRICK: 'brick.png',
	PERMA: 'permabrick.jpg'
};

// image and animation instances - populated on preload()
var ANI = {};
var IMG = {};

// variables
var SCROLL_MIN_X = Math.round((CANVAS_WIDTH - BLOCK_WIDTH)/2);
var SCROLL_MAX_X = MAP_WIDTH * BLOCK_WIDTH + OFFSET_X * 2 - CANVAS_WIDTH;
var SCROLL_MIN_Y = Math.round((CANVAS_HEIGHT - BLOCK_WIDTH)/2);
var SCROLL_MAX_Y = MAP_HEIGHT * BLOCK_HEIGHT + OFFSET_Y - CANVAS_HEIGHT;
var CAN_SCROLL_X = SCROLL_MIN_X > 0;
var CAN_SCROLL_Y = SCROLL_MIN_Y > 0;
var start_x = BLOCK_WIDTH + OFFSET_X;
var start_y = BLOCK_HEIGHT + OFFSET_Y;
var grid = new Array();
var bombs = new Array();
var pressedKeys = [];
var point;
var player;
var density = 2;
var scroll_offset_x = 0;
var scroll_offset_y = 0;

var frame = 1; // used to advance animation frame
var time = 1; // used to dilate time in gameloop

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
		this._height = BLOCK_HEIGHT;
	};
	
	// add the methods to the prototype so that all of the 
	// GameObject instances can access the private static

	GameObject.prototype.getImage = function() {
		return this._image;
	};

	GameObject.prototype.setImage = function(image) {
		this._image = image;
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

var AnimatedObject = (function() {
	var _animation; 
	var _ticks_per_frame;
	var _ticks;
	var _frame;
	var _should_animate;

	function AnimatedObject(){
		this._animation = null;
		this._frame = 0;
		this._ticks_per_frame = 0;
		this._ticks = 0;
		this._should_animate = false;
	};
	
	var super_class = new GameObject();
	AnimatedObject.prototype = super_class;
	
	AnimatedObject.prototype.setAnimation = function(animation) {
		this._animation = animation;
		this._frame = 0;
		this._ticks = 0;
		this.setImage(this._animation[frame]);
	};
	
	AnimatedObject.prototype.animate = function() {
		if(this._animation && this._should_animate) {
			if(++this._ticks >= this._ticks_per_frame) {
				this._ticks = 0;
				if (++this._frame >= this._animation.length) {
					this._frame = 0;
				}
				this.setImage(this._animation[this._frame]);
			}
		}
	};
	
	return AnimatedObject;
	
})();

// StatefulObject
// - has finite number of known states
// - each state has associated animation
// IntelligentObject
// - each state has associated behaviour

var MovingObject = (function() {
	var _movement_speed;
	var _direction_x;
	var _direction_y;
	var _grid_x;
	var	_grid_y;
	
	function MovingObject(){
		this._movement_speed = DEFAULT_MOVEMENT_SPEED;
		this._grid_x = 0;
		this._grid_y = 0;	
		this._direction_x = 0 ;
		this._direction_y = 0;		
	};
		
	var super_class = new AnimatedObject();
	MovingObject.prototype = super_class;
	
	MovingObject.prototype.move = function() {
		this.setPosition(
			this._x+this._direction_x*this._movement_speed, 
			this._y+this._direction_y*this._movement_speed
		);
	};
	
	MovingObject.prototype.collision = function(){	
		var center_x = this._x + BLOCK_WIDTH/2;
		var center_y = this._y + BLOCK_HEIGHT/2;
		this._grid_x = Math.floor((center_x - OFFSET_X) / BLOCK_WIDTH);
		this._grid_y = Math.floor((center_y - OFFSET_Y) / BLOCK_HEIGHT);
		
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
					if(this._y - this._movement_speed < target.getPosition().y + BLOCK_HEIGHT){
						this._direction_y = 0;
					}					
				} else {
					//moving down
					if(this._y + this._movement_speed > target.getPosition().y - BLOCK_HEIGHT){
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
		this.setImage(ANI.MAN_DOWN[1]);
		this._ticks_per_frame = 1;
	};
		
	var super_class = new MovingObject();
	PlayerObject.prototype = super_class;
	
	// overriding player move function to do scrolling and alignment stuff
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
		// todo .. react to key_pressed as opposed to key_held for setAnimation
		if (!pressedKeys[KEY.UP]
			&& !pressedKeys[KEY.DOWN]
			&& !pressedKeys[KEY.LEFT]
			&& !pressedKeys[KEY.RIGHT]) {
			this._direction_x = 0;
			this._direction_y = 0;
			this._should_animate = false; 	// should _should_animate be public?
											// should it have access functions?
		}
		if (pressedKeys[KEY.UP]) {
			this._direction_x = 0;
			if (this._direction_y != -1) {
				this.setAnimation(ANI.MAN_UP);
			}
			this._direction_y = -1;
			this._should_animate = true;
		}
		if (pressedKeys[KEY.DOWN]) {
			this._direction_x = 0;
			if (this._direction_y != 1) {
				this.setAnimation(ANI.MAN_DOWN);
			}
			this._direction_y = 1;
			this._should_animate = true;
		}
		if (pressedKeys[KEY.LEFT]) {
			this._direction_y = 0;
			if (this._direction_x != -1) {
				this.setAnimation(ANI.MAN_LEFT);
			}
			this._direction_x = -1;
			this._should_animate = true;
		}
		if (pressedKeys[KEY.RIGHT]) {
			this._direction_y = 0;
			if (this._direction_x != 1) {
				this.setAnimation(ANI.MAN_RIGHT);
			}
			this._direction_x = 1;
			this._should_animate = true;
		}
		if (pressedKeys[KEY.S]) {
			pressedKeys[KEY.S] = false;
		  
			for (i = 0; i < bombs.length; i++) {
				if(!bombs[i].isEnabled()) {
					bombs[i].setGridPosition(this._grid_x, this._grid_y);
					bombs[i].enable();
					grid[this._grid_x][this._grid_y] = bombs[i];
					break;
				}
			}
		};
		this.physics();
	};
	
	return PlayerObject;
})();

var BombObject = (function() {
	var _timer;
	var _enabled;
	var _grid_x;
	var _grid_y;
  
	function BombObject(){
		this.setAnimation(ANI.BOMB);
		_enabled = false;
		this._ticks_per_frame = 3;
	};
		
	var super_class = new AnimatedObject();
	BombObject.prototype = super_class;
  
	BombObject.prototype.enable = function(){
		this._enabled = true;
		this._should_animate = true;
		this.startTimer(); // should check for power up to manually detonate
	};
	
	BombObject.prototype.disable = function(){
		this._enabled = false;
		this._should_animate = false;
		this.stopTimer();
	};
  
	BombObject.prototype.setGridPosition = function(grid_x, grid_y){
		this._grid_x = grid_x;
		this._grid_y = grid_y;
	  
		this.setPosition(OFFSET_X +(grid_x * BLOCK_WIDTH), OFFSET_Y +(grid_y * BLOCK_HEIGHT));
	};
  
	BombObject.prototype.isEnabled = function(){
		return this._enabled;
	};
  
	BombObject.prototype.stopTimer = function(){
		clearTimeout(this._timer);
	};
  
	BombObject.prototype.startTimer = function(){
		var this_index = bombs.indexOf(this);
		this._timer = setTimeout("bombs["+this_index+"].boom()", BOOM_TIME);
	};
  
	BombObject.prototype.boom = function(){
		this.setImage(ANI.BOMB[0]);
		grid[this._grid_x][this._grid_y].setType(TYPE.PASSABLE);
		this.disable();
	};
  
	return BombObject;
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
		if(!this._touch) {
			this.point(x, y);
		} else {
			this.move(x, y);
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
	preload(); // loads all images
	ctx = document.getElementById('canvas').getContext('2d');
	point = new PointDevice();
	player = new PlayerObject();
  
	for (i = 0; i < MAX_BOMBS; i++) {
		bombs.push(new BombObject());
	}

	for (x=0; x<MAP_WIDTH; x++){
		grid[x]= new Array();
		for (y=0; y < MAP_HEIGHT; y++){
			grid[x][y] = new GameObject();
			grid[x][y].setPosition(OFFSET_X +(x * BLOCK_WIDTH), OFFSET_Y +(y * BLOCK_HEIGHT));
			//generate permanent cubes
			if (x==0 || y==0 || x==MAP_WIDTH-1 || y==MAP_HEIGHT-1 || (x%2 == 0 && y%2 == 0 )) {
				grid[x][y].setImage(IMG.PERMA);
				grid[x][y].setType(TYPE.SOMETHING);
			} else {
				// keep starting position, grid block (1,1) open
				if (x+y<4){	
					grid[x][y].setType(TYPE.PASSABLE);
					continue
				}; 
				
				//generate destructible blocks
				if (Math.random()*10 < density){
					grid[x][y].setImage(IMG.BRICK);
					grid[x][y].setType(TYPE.SOMETHING);
				} else {
					grid[x][y].setType(TYPE.PASSABLE);
				}
			}
		}	
	}
	setInterval(gameloop,33.33);
};

function preload() {
	Object.keys(ANI_DATA).forEach(function (key) {
		ANI[key] = [];
		for (var frame = 0; frame < ANI_DATA[key].frames; frame++) {
			ANI[key].push(new Image());
			ANI[key][ANI[key].length - 1].src = ASSET_PATH + ANI_DATA[key].prefix + frame + '.' + ANI_DATA[key].extension;
		}
	});
	Object.keys(IMG_DATA).forEach(function (key) {
		IMG[key] = new Image();
		IMG[key].src = ASSET_PATH + IMG_DATA[key];
	})
};
	
function gameloop(){
	moveandcheck();
	if (!(time++ % 3)) animate();
	draw();
};

function draw(){
	ctx.clearRect(0, 0 , CANVAS_WIDTH, CANVAS_HEIGHT);
	for (x=0; x<MAP_WIDTH; x++){
		for (y=0; y < MAP_HEIGHT; y++){
			grid[x][y].draw(ctx);
		}
	}
	for (i=0; i< bombs.length; i++){
		bombs[i].draw(ctx);
	}
  
	player.draw(ctx);
};

function moveandcheck(){
	player.movement();
};

function animate(){
	// should be internal to moving playerobject
	player.animate();
	
	// animate bombs
	bombs.forEach(function (bomb) {
		if(bomb.isEnabled()) {
			bomb.animate();
		}
	});
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
window.addEventListener('touchmove', function(event) {
	point.moved(event.touches[0].pageX, event.touches[0].pageY);
}, false);