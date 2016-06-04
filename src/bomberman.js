// constants
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 403;
var DEFAULT_MOVEMENT_SPEED = 1.5;
var PLAYER_MOVEMENT_SPEED = 1.5;
var BLOCK_WIDTH = 30;
var BLOCK_HEIGHT = 26;
var MAP_WIDTH = 25;
var MAP_HEIGHT = 13;
var OFFSET_X = 0;
var OFFSET_Y = 65;
var DRAG_TOLERANCE = 30;
var BOOM_TIME = 2600;
var MAX_BOMBS = 10;
var ONE_OVER_BLOCK_WIDTH = 1 / BLOCK_WIDTH;
var ONE_OVER_BLOCK_HEIGHT = 1 / BLOCK_HEIGHT;

// enums / flags
var TYPE = {
	NOTHING: 0,
	PASSABLE: 1,
	BRICK: 2,
	PERMA: 4,
	BOMB: 8,
	EXPLOSION: 16
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
	BRICK:		{ prefix: "brick", frames: 7, extension: "gif" },
	MAN_UP: 	{ prefix: "bbm_up", frames: 3, extension: "gif" },
	MAN_DOWN:	{ prefix: "bbm_down", frames: 3, extension: "gif" },
	MAN_LEFT:	{ prefix: "bbm_left", frames: 3, extension: "gif" },
	MAN_RIGHT:	{ prefix: "bbm_right", frames: 3, extension: "gif" },
	MAN_DEATH:	{ prefix: "bbm_death", frames: 7, extension: "gif" },
	BOMB:		{ prefix: "bomb", frames: 4, extension: "gif" },
	EXPLO_C:	{ prefix: "e_c", frames: 4, extension: "gif", symmetric: true },
	EXPLO_T:	{ prefix: "e_t", frames: 4, extension: "gif", symmetric: true },
	EXPLO_B:	{ prefix: "e_b", frames: 4, extension: "gif", symmetric: true },
	EXPLO_L:	{ prefix: "e_l", frames: 4, extension: "gif", symmetric: true },
	EXPLO_R:	{ prefix: "e_r", frames: 4, extension: "gif", symmetric: true },
	EXPLO_H:	{ prefix: "e_h", frames: 4, extension: "gif", symmetric: true },
	EXPLO_V:	{ prefix: "e_v", frames: 4, extension: "gif", symmetric: true }
};
var IMG_DATA = {
	PERMA: 'permabrick.jpg'
};

// image and animation instances - populated on preload()
var ANI = {};
var IMG = {};

// variables
var SCROLL_MIN_X = Math.round((CANVAS_WIDTH - BLOCK_WIDTH) * 0.5);
var SCROLL_MAX_X = MAP_WIDTH * BLOCK_WIDTH + OFFSET_X * 2 - CANVAS_WIDTH;
var SCROLL_MIN_Y = Math.round((CANVAS_HEIGHT - BLOCK_WIDTH) * 0.5);
var SCROLL_MAX_Y = MAP_HEIGHT * BLOCK_HEIGHT + OFFSET_Y - CANVAS_HEIGHT;
var CAN_SCROLL_X = SCROLL_MIN_X > 0;
var CAN_SCROLL_Y = SCROLL_MIN_Y > 0;
var start_x = BLOCK_WIDTH + OFFSET_X;
var start_y = BLOCK_HEIGHT + OFFSET_Y;
var grid = new Array();
var bombs = new Array();
var explosions = new Array();
var dying = new Array();
var key_press = [];
var keys_down = [];
var point;
var player;
var density = 2;
var scroll_offset_x = 0;
var scroll_offset_y = 0;
var yield = 5;

var frame = 1; // used to advance animation frame
var time = 1; // used to dilate time in gameloop

var GameObject = (function() {

	function GameObject(){
		this._image = new Image();
		this._type = TYPE.NOTHING;
		this._width = BLOCK_WIDTH;
		this._height = BLOCK_HEIGHT;
	};

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
	
	GameObject.prototype.setGridPosition = function(grid_x, grid_y){
		this._grid_x = grid_x;
		this._grid_y = grid_y;
	  
		this.setPosition(OFFSET_X + (grid_x * BLOCK_WIDTH), OFFSET_Y + (grid_y * BLOCK_HEIGHT));
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
	
	GameObject.prototype.addType = function(type){
		if (this._type & type) return;
		this._type += type;
	};
	
	GameObject.prototype.is = function(type){
		return this._type & type;		
	};

  return GameObject;
	
})();

var BasicObject = (function () {

	function BasicObject(grid_x, grid_y, type) {
		this._type = TYPE[type];
		if (IMG[type]) { this.setImage(IMG[type]); }
		this.setGridPosition(grid_x, grid_y);
	};
	
	var super_class = new GameObject();
	BasicObject.prototype = super_class;
	
	return BasicObject;
})();

var AnimatedObject = (function() {

	function AnimatedObject(){
		this._animation = null;
		this._frame = 0;
		this._ticks_per_frame = 0;
		this._ticks = 0;
		this._should_animate = false;
		this._loop = true;
	};
	
	var super_class = new GameObject();
	AnimatedObject.prototype = super_class;
	
	AnimatedObject.prototype.setAnimation = function(animation, stop_at_end) {
		if (this._animation == animation) return;
		this._animation = animation;
		this._loop = !stop_at_end;
		this._frame = 0;
		this._ticks = 0;
		this.setImage(this._animation[this._frame]);
	};
	
	AnimatedObject.prototype.animate = function() {
		if(this._animation && this._should_animate) {
			if(++this._ticks >= this._ticks_per_frame) {
				this._ticks = 0;
				if (++this._frame >= this._animation.length) {
					if(this._loop) {
						this._frame = 0;
					} else {
						this.end();
					}
				}
				this.setImage(this._animation[this._frame]);
			}
		}
		return this._should_animate; // to detect ended animations
	};
	
	AnimatedObject.prototype.end = function() {
		this._should_animate = false;
		this.setImage(new Image());
	};
	
	return AnimatedObject;
	
})();

var BrickObject = (function () {

	function BrickObject(grid_x, grid_y) {
		this._type = TYPE.BRICK;
		this._ticks_per_frame = 6;
		this.setAnimation(ANI.BRICK, true);
		this.setGridPosition(grid_x, grid_y);
	};
	
	var super_class = new AnimatedObject();
	BrickObject.prototype = super_class;
	
	BrickObject.prototype.end = function () {
		grid[this._grid_x][this._grid_y] =
			new BasicObject(this._grid_x, this._grid_y, 'PASSABLE');
		dying.splice(dying.indexOf(this), 1);
	};
	
	BrickObject.prototype.burn = function () {
		this._frame = 1;
		this._should_animate = true;
		// TODO: delay action by number of frames
		setTimeout(function () {
			this.addType(TYPE.PASSABLE);
		}.bind(this), 200);
		dying.push(this);
	};
	
	return BrickObject;
})();

// StatefulObject
// - has finite number of known states
// - each state has associated animation
// IntelligentObject
// - each state has associated behaviour

var FlameObject = (function () {

	function FlameObject(grid_x, grid_y, type) {
		var position = grid[grid_x][grid_y].getPosition();
		this.setPosition(position.x, position.y);
		this.setAnimation(ANI['EXPLO_' + type], true);
		this._ticks_per_frame = 6;
		this._should_animate = true;
	};
	
	var super_class = new AnimatedObject();
	FlameObject.prototype = super_class;
	
	return FlameObject;
})();

var Explosion = (function() {

	function Explosion(grid_x, grid_y, yield){
		this._flames = new Array();
		this._flames.push(new FlameObject(grid_x, grid_y, 'C'));
		[[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (direct){
			var hit = false;
			// TODO: set type flame in grid & clean up after
			for (var i = 1; !hit && i <= yield; i++) {
				var target_x = grid_x + direct[0] * i;
				var target_y = grid_y + direct[1] * i;
				var target = grid[target_x][target_y];
				if (!target) continue;
				if (target.is(TYPE.PASSABLE)) {
					var type = (direct[0])
						? (i == yield) ? ['L', '', 'R'][1 + direct[0]] : 'H' 
						: (i == yield) ? ['T', '', 'B'][1 + direct[1]] : 'V' 
					this._flames.push(new FlameObject(target_x, target_y, type));
				}
				if (target.is(TYPE.BOMB)) {	target.burn(); }
				if (target.is(TYPE.PERMA)) { hit = true; }
				if (target.is(TYPE.BRICK)) {
					hit = true;
					target.burn();
				}
			}
		}, this)
	};
	
	Explosion.prototype.animate = function () {
		for (var i = 0; i < this._flames.length; i++) {
			if(!this._flames[i].animate()) {
				this.end();
				break;
			}
		}
	};
	
	Explosion.prototype.draw = function (ctx) {
		for (var i = 0; i < this._flames.length; i++) {
			this._flames[i].draw(ctx);
		}
	};
	
	Explosion.prototype.end = function () {
		this._flames = [];
		explosions.splice(explosions.indexOf(this),1);
	};
	
	return Explosion;
})();

var MovingObject = (function() {
	
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
			this._x + this._direction_x * this._movement_speed, 
			this._y + this._direction_y * this._movement_speed
		);
		this.updateGridPosition();
	};
	
	MovingObject.prototype.updateGridPosition = function() {
		this._grid_x =
			Math.floor((this._x - OFFSET_X) * ONE_OVER_BLOCK_WIDTH + 0.5);
		this._grid_y =
			Math.floor((this._y - OFFSET_Y) * ONE_OVER_BLOCK_HEIGHT + 0.5);
	};
	
	MovingObject.prototype.collision = function(){	
		var target = grid
			[this._grid_x + this._direction_x]
			[this._grid_y + this._direction_y];
		
		if(!target.is(TYPE.PASSABLE)) {
			if (this._direction_x
				&& Math.abs(this._x + this._movement_speed * this._direction_x
					- target.getPosition().x) < BLOCK_WIDTH
				) this._movement_speed = 0;
			if (this._direction_y
				&& Math.abs(this._y + this._movement_speed * this._direction_y
					- target.getPosition().y) < BLOCK_HEIGHT
				) this._movement_speed = 0;
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
		this._movement_speed = 0;
		this.setImage(ANI.MAN_DOWN[1]);
		this._ticks_per_frame = 6;
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
			scroll_offset_x =
				this._x + this._movement_speed * this._direction_x
				- SCROLL_MIN_X + error_x;
			if(scroll_offset_x < 0) scroll_offset_x = 0;
			if(scroll_offset_x > SCROLL_MAX_X) scroll_offset_x = SCROLL_MAX_X;
		}
	
		if(CAN_SCROLL_Y && (this._direction_y || error_y)) {
			// moving vertically
			scroll_offset_y =
				this._y + this._movement_speed * this._direction_y
				- SCROLL_MIN_Y + error_y;
			if(scroll_offset_y < 0) scroll_offset_y = 0;
			if(scroll_offset_y > SCROLL_MAX_Y) scroll_offset_y = SCROLL_MAX_Y;
		}

		// do the usual stuff in move();
		this.setPosition(
			this._x + this._direction_x * this._movement_speed + error_x,
			this._y + this._direction_y * this._movement_speed + error_y
		);
		this.updateGridPosition();
	};
   
	PlayerObject.prototype.handleKeyPress = function (key_code) {
		// set direction and animation animation
		switch(key_code) {
			case KEY.UP:
				this._direction_x = 0;
				this._direction_y = -1;
				this.setAnimation(ANI.MAN_UP);
				break;
			case KEY.DOWN:
				this._direction_x = 0;
				this._direction_y = 1;
				this.setAnimation(ANI.MAN_DOWN);
				break;
			case KEY.LEFT:
				this._direction_x = -1;
				this._direction_y = 0;
				this.setAnimation(ANI.MAN_LEFT);
				break;
			case KEY.RIGHT:
				this._direction_x = 1;
				this._direction_y = 0;
				this.setAnimation(ANI.MAN_RIGHT);
				break;
		}
	};
	
	PlayerObject.prototype.handleKeysDown = function (keys_down) {
		if (keys_down[KEY.UP]
			|| keys_down[KEY.DOWN]
			|| keys_down[KEY.LEFT]
			|| keys_down[KEY.RIGHT]
		) {
			this._movement_speed = PLAYER_MOVEMENT_SPEED;
			this._should_animate = true;
		} else {
			this._should_animate = false;
			this._movement_speed = 0;
		}
		
		if (keys_down[KEY.S]) {
			keys_down[KEY.S] = false;
			// plant bomb
			for (i = 0; i < bombs.length; i++) {
				if(!bombs[i].isEnabled()) {
					bombs[i].plant(this._grid_x, this._grid_y);
					break;
				}
			}
		}	
	};
	
	return PlayerObject;
})();

var BombObject = (function() {
  
	function BombObject(){
		this._type = TYPE.BOMB;
		this.setAnimation(ANI.BOMB);
		this._enabled = false;
		this._ticks_per_frame = 18;
	};
		
	var super_class = new AnimatedObject();
	BombObject.prototype = super_class;
  
	BombObject.prototype.enable = function(){
		this._enabled = true;
		this._frame = 0;
		this._should_animate = true;
		this.setImage(this._animation[0]);
		this.startTimer(); // should check for power up to manually detonate
	};
	
	BombObject.prototype.disable = function(){
		this._enabled = false;
		this._should_animate = false;
		this.stopTimer();
	};
  
	BombObject.prototype.isEnabled = function(){
		return this._enabled;
	};
  
	BombObject.prototype.stopTimer = function(){
		clearTimeout(this._timer);
	};
  
	BombObject.prototype.startTimer = function(){
		this._timer = setTimeout(this.explode.bind(this), BOOM_TIME);
	};
  
	BombObject.prototype.plant = function(grid_x, grid_y){
		if (!grid[grid_x][grid_y].is(TYPE.PASSABLE)) return;
		this.setGridPosition(grid_x, grid_y);
		this.enable();
		grid[grid_x][grid_y] = this;
	};
	
	BombObject.prototype.explode = function(){
		this.stopTimer();
		this.disable();
		this.setImage(IMG.NOTHING);
		grid[this._grid_x][this._grid_y] =
			new BasicObject(this._grid_x, this._grid_y, 'PASSABLE');
		explosions.push(new Explosion(this._grid_x, this._grid_y, yield));
	};
  
	BombObject.prototype.burn = function () {
		this.stopTimer();
		this._timer = setTimeout(this.explode.bind(this), 100);
	};
  
	return BombObject;
})();

var PointDevice = (function() {
  
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
		keys_down = [];
	};
  
	PointDevice.prototype.move = function(x, y)  {
		if(this._touch) {
			var change_in_x = x - this._touch_x;
			var change_in_y = y - this._touch_y;
			if ( Math.abs(change_in_x) > DRAG_TOLERANCE ) {
				this._drag = true;
				this.releaseKeys();
				if( change_in_x > 0 ) {
					keys_down[KEY.RIGHT] = true;
					key_press[KEY.RIGHT] = true;
				} else {
					keys_down[KEY.LEFT] = true;
					key_press[KEY.LEFT] = true;
				}
			} else if (Math.abs(change_in_y) > DRAG_TOLERANCE ) {
				this._drag = true;
				this.releaseKeys();
				if( change_in_y > 0 ) {
					keys_down[KEY.DOWN] = true;
					key_press[KEY.DOWN] = true;
				} else {
					keys_down[KEY.UP] = true;
					key_press[KEY.UP] = true;
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
			// click TODO: allow bomb plant with PointDevice
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

	generateMap();
	gameloop(); // kick off loop; uses requestAnimationFrame
};

function preload() {
	Object.keys(ANI_DATA).forEach(function (key) {
		ANI[key] = [];
		for (var frame = 0; frame < ANI_DATA[key].frames; frame++) {
			ANI[key].push(new Image());
			ANI[key][ANI[key].length - 1].src = ASSET_PATH + ANI_DATA[key].prefix + frame + '.' + ANI_DATA[key].extension;
		}
		if (ANI_DATA[key].symmetric) {
			for (var frame = ANI_DATA[key].frames - 2; frame >= 0; frame--) {
				ANI[key].push(new Image());
				ANI[key][ANI[key].length - 1].src = ASSET_PATH + ANI_DATA[key].prefix + frame + '.' + ANI_DATA[key].extension;
			}
		}
	});
	Object.keys(IMG_DATA).forEach(function (key) {
		IMG[key] = new Image();
		IMG[key].src = ASSET_PATH + IMG_DATA[key];
	});
	IMG.NOTHING = new Image();
};

function generateMap() {
	for (x = 0; x < MAP_WIDTH; x++){
		grid[x] = new Array();
		for (y = 0; y < MAP_HEIGHT; y++){
			if (x == 0 || y == 0 || x == MAP_WIDTH - 1 || y == MAP_HEIGHT - 1
				|| (x % 2 == 0 && y % 2 == 0)){
				// perma border and blocks
				grid[x][y] = new BasicObject(x, y, 'PERMA');
			} else if (x + y < 4 || Math.random() * 10 >= density) {
				// empty space around starting position and by density
				grid[x][y] = new BasicObject(x, y, 'PASSABLE');
			} else {
				// generate destructible blocks
				grid[x][y] = new BrickObject(x, y);
			}
		}	
	}
};
	
function gameloop(){
	handleInput(key_press, keys_down);
	key_press = [];
	physics();
	animate();
	window.requestAnimationFrame(gameloop);
	draw();
};

function handleInput(key_press, keys_down) {
	key_press.forEach(function (value, index) {
		if (value) player.handleKeyPress(index);
	});
	player.handleKeysDown(keys_down);
};

function physics() {
	player.physics();
};

function animate(){
	player.animate();
	bombs.forEach(function (bomb) {
		if(bomb.isEnabled()) {
			bomb.animate();
		}
	});
	// TODO: unify animated objects?
	explosions.forEach(function (explosion) { explosion.animate(); });
	dying.forEach(function (dying) { dying.animate(); });
};

function draw(){
	ctx.clearRect(0, 0 , CANVAS_WIDTH, CANVAS_HEIGHT);
	for (x = 0; x < MAP_WIDTH; x++){
		for (y = 0; y < MAP_HEIGHT; y++){
			grid[x][y].draw(ctx);
		}
	}
	for (i = 0; i < bombs.length; i++){	bombs[i].draw(ctx);	}
	for (i = 0; i < explosions.length; i++){ explosions[i].draw(ctx); }
	player.draw(ctx);
};

// keys
window.addEventListener('keydown', function(event) {
	// record only if key is not already in down state
	if (!keys_down[event.keyCode]) {
		key_press[event.keyCode] = true; // cleared every tick
		keys_down[event.keyCode] = true;
	}
}, false);
window.addEventListener('keyup', function(event) {
	keys_down[event.keyCode] = false;
	
	// if movement key released, and another is down, switch
	key_press[KEY.UP] = keys_down[KEY.UP];
	key_press[KEY.DOWN] = keys_down[KEY.DOWN];
	key_press[KEY.LEFT] = keys_down[KEY.LEFT];
	key_press[KEY.RIGHT] = keys_down[KEY.RIGHT];
	
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
