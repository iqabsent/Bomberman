// enums / flags
var TYPE = {
	NOTHING: 0,
	PASSABLE: 1,
	SOFT_BLOCK: 2,
	HARD_BLOCK: 4,
	BOMB: 8,
	EXPLOSION: 16,
	POWER: 32,
	DOOR: 64
};
var STATE = {
	ERROR: 0,
	LOADING: 1, 
	PLAYING: 2,
	PAUSED: 4
};
var KEY = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	W: 87,
	S: 83,
	D: 68,
	ENTER: 13
}
var POWER = {
	FLAME: 0,
	BOMB: 1,
	SPEED: 2,
	DETONATE: 4,
	PASS_BOMB: 8,
	PASS_WALL: 16,
	FIREPROOF: 32,
	INVINCIBLE: 64
}
var SPEED = {
	SLOWEST: 0.5,
	SLOW: 1.0,
	NORMAL: 1.5,
	FAST: 2.0
}

// constants
var MAX_CANVAS_HEIGHT = 600;
var DEFAULT_CANVAS_WIDTH = 600;
var DEFAULT_CANVAS_HEIGHT = 403;
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 403;
var BLOCK_WIDTH = 30;
var BLOCK_HEIGHT = 26;
var MAP_WIDTH = 25;
var MAP_HEIGHT = 13;
var OFFSET_X = 0;
var OFFSET_Y = 65;
var DRAG_TOLERANCE = 30;
var BOMB_FUSE_TIME = 9; // in frames
var MAX_BOMBS = 10;
var MAX_YIELD = 5;
var ONE_OVER_BLOCK_WIDTH = 1 / BLOCK_WIDTH;
var ONE_OVER_BLOCK_HEIGHT = 1 / BLOCK_HEIGHT;
var DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
var DEFAULT_LIVES = 3;
var INVINCIBILITY_TIMER = 35;

// enemy type data
var ENEMY = {
	BALOM: {
		movement_speed: SPEED.SLOW,
		spawn_distance: 8,
		action_frequency: 0.08,
		frames_between_actions: 5,
		can_pass: TYPE.PASSABLE
	},
	ONIL: {
		movement_speed: SPEED.NORMAL,
		spawn_distance: 16,
		action_frequency: 0.12,
		frames_between_actions: 2,
		can_pass: TYPE.PASSABLE
	},
	DAHL: {
		movement_speed: SPEED.NORMAL,
		spawn_distance: 16,
		action_frequency: 0.12,
		frames_between_actions: 2,
		can_pass: TYPE.PASSABLE
	},
	MINVO: {
		movement_speed: SPEED.FAST,
		spawn_distance: 16,
		action_frequency: 0.12,
		frames_between_actions: 2,
		can_pass: TYPE.PASSABLE
	},
	DORIA: {
		movement_speed: SPEED.SLOWEST,
		spawn_distance: 16,
		action_frequency: 0.12,
		frames_between_actions: 2,
		can_pass: TYPE.PASSABLE|TYPE.SOFT_BLOCK
	},
	OVAPE: {
		movement_speed: SPEED.NORMAL,
		spawn_distance: 16,
		action_frequency: 0.12,
		frames_between_actions: 2,
		can_pass: TYPE.PASSABLE|TYPE.SOFT_BLOCK
	},
	PASS: {
		movement_speed: SPEED.FAST,
		spawn_distance: 16,
		action_frequency: 0.12,
		frames_between_actions: 2,
		can_pass: TYPE.PASSABLE
	},
	PONTAN: {
		movement_speed: SPEED.NORMAL,
		spawn_distance: 16,
		action_frequency: 0.12,
		frames_between_actions: 2,
		can_pass: TYPE.PASSABLE|TYPE.SOFT_BLOCK
	}
}

// level data
var LEVEL = [
	{ power: 'FLAME', enemies: { BALOM: 6 }},
	{ power: 'BOMB', enemies: { BALOM: 3, ONIL: 3 }},
	{ power: 'DETONATOR', enemies: { BALOM: 2, ONIL: 2, DAHL: 2 }},
	{ power: 'SPEED', enemies: { BALOM: 1, ONIL: 2, DAHL: 2, MINVO: 2 }},
	{ power: 'BOMB', enemies: { ONIL: 4, DAHL: 3 }},
	{ power: 'BOMB', enemies: { ONIL: 2, DAHL: 3, MINVO: 2 }},
	{ power: 'FLAME', enemies: { ONIL: 2, DAHL: 3, OVAPE: 2 }},
	{ power: 'DETONATOR', enemies: { ONIL: 1, DAHL: 2, MINVO: 4}},
	{ power: 'PASS_BOMB', enemies: { ONIL: 1, DAHL: 1, MINVO: 4, DORIA: 1 }},
	{ power: 'PASS_WALL', enemies: { ONIL: 1, DAHL: 1, MINVO: 1, OVAPE: 1, DORIA: 3 }},
	{ power: 'BOMB', enemies: { ONIL: 1, DAHL: 2, MINVO: 3, OVAPE: 1, DORIA: 1 }},
	{ power: 'BOMB', enemies: { ONIL: 1, DAHL: 1, MINVO: 1, OVAPE: 1, DORIA: 4 }},
	{ power: 'DETONATOR', enemies: { DAHL: 3, MINVO: 3, DORIA: 2 }},
	{ power: 'PASS_BOMB', enemies: { OVAPE: 7, PASS: 1 }},
	{ power: 'FLAME', enemies: { DAHL: 1, MINVO: 3, DORIA: 3, PASS: 1 }},
	{ power: 'PASS_WALL', enemies: { MINVO: 3, DORIA: 4, PASS: 1 }},
	{ power: 'BOMB', enemies: { DAHL: 5, DORIA: 2, PASS: 1 }},
	{ power: 'PASS_BOMB', enemies: { BALOM: 3, ONIL: 3, PASS: 2 }},
	{ power: 'BOMB', enemies: { BALOM: 1, OVAPE: 1, ONIL: 1, DAHL: 3, PASS: 2 }},
	{ power: 'DETONATOR', enemies: { ONIL: 1, DAHL: 1, MINVO: 1, OVAPE: 1, DORIA: 2, PASS: 2 }},
	{ power: 'PASS_BOMB', enemies: { OVAPE: 3, DORIA: 4, PASS: 2 }},
	{ power: 'DETONATOR', enemies: { DAHL: 4, MINVO: 3, DORIA: 1, PASS: 1 }},
	{ power: 'BOMB', enemies: { DAHL: 2, MINVO: 2, OVAPE: 2, DORIA: 2, PASS: 1 }},
	{ power: 'DETONATOR', enemies: { DAHL: 1, MINVO: 1, OVAPE: 2, DORIA: 4, PASS: 1 }},
	{ power: 'PASS_BOMB', enemies: { ONIL: 2, DAHL: 1, MINVO: 1, OVAPE: 2, DORIA: 2, PASS: 1 }},
	{ power: 'INVINCIBLE', enemies: { BALOM: 1, ONIL: 1, DAHL: 1, MINVO: 1, OVAPE: 1, DORIA: 2, PASS: 1 }},
	{ power: 'FLAME', enemies: { BALOM: 1, ONIL: 1, OVAPE: 1, DORIA: 5, PASS: 1 }},
	{ power: 'BOMB', enemies: { ONIL: 1, DAHL: 3, MINVO: 3, DORIA: 1, PASS: 1 }},
	{ power: 'DETONATOR', enemies: { OVAPE: 5, DORIA: 2, PASS: 2 }},
	{ power: 'FIREPROOF', enemies: { DAHL: 3, MINVO: 2, OVAPE: 2, DORIA: 1, PASS: 1 }},
	{ power: 'PASS_WALL', enemies: { ONIL: 2, DAHL: 2, MINVO: 2, OVAPE: 2, DORIA: 2 }},
	{ power: 'BOMB', enemies: { ONIL: 1, DAHL: 1, MINVO: 3, DORIA: 4, PASS: 1 }},
	{ power: 'DETONATOR', enemies: { DAHL: 2, MINVO: 2, OVAPE: 1, DORIA: 3, PASS: 2 }},
	{ power: 'INVINCIBLE', enemies: { DAHL: 2, MINVO: 3, DORIA: 3, PASS: 2 }},
	{ power: 'PASS_BOMB', enemies: { DAHL: 2, MINVO: 1, OVAPE: 1, DORIA: 3, PASS: 2 }},
	{ power: 'FIREPROOF', enemies: { DAHL: 2, MINVO: 2, DORIA: 3, PASS: 3 }},
	{ power: 'DETONATOR', enemies: { DAHL: 2, MINVO: 1, OVAPE: 1, DORIA: 3, PASS: 3 }},
	{ power: 'FLAME', enemies: { DAHL: 2, MINVO: 2, DORIA: 3, PASS: 3 }},
	{ power: 'PASS_WALL', enemies: { DAHL: 1, MINVO: 1, OVAPE: 2, DORIA: 2, PASS: 4 }},
	{ power: 'INVINCIBLE', enemies: { DAHL: 1, MINVO: 2, DORIA: 3, PASS: 4 }},
	{ power: 'DETONATOR', enemies: { DAHL: 1, MINVO: 1, OVAPE: 1, DORIA: 3, PASS: 4 }},
	{ power: 'PASS_WALL', enemies: { MINVO: 1, OVAPE: 1, DORIA: 3, PASS: 5 }},
	{ power: 'PASS_BOMB', enemies: { MINVO: 1, OVAPE: 1, DORIA: 2, PASS: 6 }},
	{ power: 'DETONATOR', enemies: { MINVO: 1, OVAPE: 1, DORIA: 2, PASS: 6 }},
	{ power: 'INVINCIBLE', enemies: { OVAPE: 2, DORIA: 2, PASS: 6 }},
	{ power: 'PASS_WALL', enemies: { OVAPE: 2, DORIA: 2, PASS: 6 }},
	{ power: 'PASS_BOMB', enemies: { OVAPE: 2, DORIA: 2, PASS: 6 }},
	{ power: 'DETONATOR', enemies: { OVAPE: 1, DORIA: 2, PASS: 6, PONTAN: 1 }},
	{ power: 'FIREPROOF', enemies: { OVAPE: 2, DORIA: 1, PASS: 6, PONTAN: 1 }},
	{ power: 'INVINCIBLE', enemies: { OVAPE: 2, DORIA: 1, PASS: 5, PONTAN: 2 }}
]

// image and animation info
var ASSET_PATH = "images/";
var ANI_DATA = {
	SOFT_BLOCK:	{ frames: 7 },
	MAN_UP: 	{ frames: 3 },
	MAN_DOWN:	{ frames: 3 },
	MAN_LEFT:	{ frames: 3 },
	MAN_RIGHT:	{ frames: 3 },
	MAN_DEATH:	{ frames: 7 },
	BALOM_LD:	{ frames: 3 },
	BALOM_RU:	{ frames: 3 },
	ONIL_LD:	{ frames: 3 },
	ONIL_RU:	{ frames: 3 },
	DAHL_LD:	{ frames: 3 },
	DAHL_RU:	{ frames: 3 },
	MINVO_LD:	{ frames: 3 },
	MINVO_RU:	{ frames: 3 },
	DORIA_LD:	{ frames: 3 },
	DORIA_RU:	{ frames: 3 },
	OVAPE_LD:	{ frames: 3 },
	OVAPE_RU:	{ frames: 3 },
	PASS_LD:	{ frames: 3 },
	PASS_RU:	{ frames: 3 },
	PONTAN_LD:	{ frames: 4 },
	PONTAN_RU:	{ frames: 4 },
	BOMB:		{ frames: 4 },
	EXPLO_C:	{ frames: 4, symmetric: true },
	EXPLO_T:	{ frames: 4, symmetric: true },
	EXPLO_B:	{ frames: 4, symmetric: true },
	EXPLO_L:	{ frames: 4, symmetric: true },
	EXPLO_R:	{ frames: 4, symmetric: true },
	EXPLO_H:	{ frames: 4, symmetric: true },
	EXPLO_V:	{ frames: 4, symmetric: true },
	ENEMY_DEATH:{ frames: 4 }
};
var IMG_DATA = {
	HARD_BLOCK: 'hard_block.jpg',
	BALOM_DEATH: 'balom_death.gif',
	ONIL_DEATH: 'onil_death.gif',
	DAHL_DEATH: 'dahl_death.gif',
	MINVO_DEATH: 'minvo_death.gif',
	DORIA_DEATH: 'doria_death.gif',
	OVAPE_DEATH: 'ovape_death.gif',
	PASS_DEATH: 'pass_death.gif',
	PONTAN_DEATH: 'pontan_death.gif',
	DOOR: 'door.gif',
	POWER_FLAME: 'power_flame.gif',
	POWER_BOMB: 'power_bomb.gif',
	POWER_DETONATE: 'power_detonate.gif',
	POWER_SPEED: 'power_speed.gif',
	POWER_PASS_BOMB: 'power_pass_bomb.gif',
	POWER_PASS_WALL: 'power_pass_wall.gif',
	POWER_FIREPROOF: 'power_fireproof.gif',
	POWER_INVINCIBLE: 'power_invincible.gif'
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
var grid = [];
var bombs = [];
var live_objects = [];
var enemies = [];
var key_press = [];
var keys_down = [];
var point;
var player;
var density = 2;
var scroll_offset_x = 0;
var scroll_offset_y = 0;
var last_press_fake = false; // used to distinguish touch/keyboard behaviour
var frame = 1; // used to advance animation frame
var time = 1; // used to dilate time in gameloop
var game_state = STATE.ERROR;
var door_spawned = false;
var power_spawned = false;
var soft_block_count = 0;
var level = 0;

var GameObject = (function () {

	function GameObject(grid_x, grid_y, type) {
		this._image = IMG[type] || new Image();
		this._type = TYPE[type] || TYPE.NOTHING;
		this._width = BLOCK_WIDTH;
		this._height = BLOCK_HEIGHT;
		if (typeof grid_x !== 'undefined'
			&& typeof grid_y !== 'undefined') {
			this.setGridPosition(grid_x, grid_y);
		}
	};

	GameObject.prototype.setImage = function (image) {
		this._image = image;
	};
	
	GameObject.prototype.setPosition = function (x, y) {
		this._x = x;
		this._y = y;
	};
	
	GameObject.prototype.setGridPosition = function (grid_x, grid_y){
		this._grid_x = grid_x;
		this._grid_y = grid_y;
	  
		this.setPosition(
			OFFSET_X + (grid_x * BLOCK_WIDTH),
			OFFSET_Y + (grid_y * BLOCK_HEIGHT)
		);
	};
	
	GameObject.prototype.getPosition = function () {
		return {x:this._x, y:this._y};
	};
	
	GameObject.prototype.getGridPosition = function () {
		return {x:this._grid_x, y:this._grid_y};
	};
		
	GameObject.prototype.draw = function (ctx) {
if(!this._image) console.log(this); // TODO: debug random bug
		if (this._image.src)
		ctx.drawImage(
			this._image, this._x - scroll_offset_x,
			this._y - scroll_offset_y,
			this._width, this._height
		);
	};
	
	GameObject.prototype.setType = function (type){
		this._type = type;
	};
	
	GameObject.prototype.addType = function (type){
		if (this._type & type) return;
		this._type += type;
	};
	
	GameObject.prototype.removeType = function (type){
		if (!(this._type & type)) return;
		this._type -= type;
	};
	
	GameObject.prototype.is = function (type){
		return this._type & type;
	};

	return GameObject;
	
})();

var AnimatedObject = (function () {

	function AnimatedObject(){
		this._animation = null;
		this._ticks_per_frame = 0;
		this._loop = true;
		this._frame = 0;
		this._ticks = 0;
		this._should_animate = false;
		this._queued_actions = [];
	};
	
	AnimatedObject.prototype = new GameObject;
	
	AnimatedObject.prototype.setAnimation = function (animation, stop_at_end) {
		if (this._animation == animation) return;
		this._animation = animation;
		this._loop = !stop_at_end;
		this._frame = 0;
		this._ticks = 0;
		this.setImage(this._animation[this._frame]);
	};
	
	AnimatedObject.prototype.animate = function () {
		if(this._animation && this._should_animate) {
			if(++this._ticks >= this._ticks_per_frame) {
				this._ticks = 0;
				if (++this._frame >= this._animation.length) {
					if(this._loop) {
						this._frame = 0;
					} else {
						this.end();
						return false;
					}
				}
				this.setImage(this._animation[this._frame]);
			}
		}
		// tick down queued actions
		for (var i = this._queued_actions.length; i; i--) {
			if(--this._queued_actions[i - 1].ticks_left <= 0) {
				this.trigger(this._queued_actions[i - 1].key);
				this._queued_actions.splice(i - 1, 1);
			}
		}
		return this._should_animate; // to detect ended animations
	};
	
	AnimatedObject.prototype.queue = function (key, frames, override_existing) {
		// check if action is already queued
		var queued = this._queued_actions.find(function (action) {
			return action.key == key;
		});
		if (!queued) {
			// queue action
			this._queued_actions.push({
				key: key,	// key should match a switch in trigger()
				ticks_left: parseFloat(frames * this._ticks_per_frame, 10)
			});
		} else if (override_existing) {
			queued.ticks_left = parseFloat(frames * this._ticks_per_frame, 10);
		}
		queued = null;
	};
	
	AnimatedObject.prototype.dequeue = function (key) {
		var queued = this._queued_actions.find(function (action) {
			return action.key == key;
		});
		if (queued) {
			this._queued_actions.splice(
				this._queued_actions.indexOf(queued),
				1
			);
		}
		queued = null;
	};
	
	AnimatedObject.prototype.trigger = function (key) {
		switch (key) {
			default: console.warn('no action bound to ' + key)
		};
	};
	
	AnimatedObject.prototype.end = function () {	
		this._should_animate = false;
		this._queued_actions = null;
	};
	
	return AnimatedObject;
	
})();

// Destroyable
// = Animated > Destroyable > SoftBlock/Moveable/Stateful
// - has burn()

var SoftBlockObject = (function () {

	function SoftBlockObject(grid_x, grid_y) {
		this._type = TYPE.SOFT_BLOCK;
		this._ticks_per_frame = 6;
		this.setAnimation(ANI.SOFT_BLOCK, true);
		this.setGridPosition(grid_x, grid_y);
	};
	
	SoftBlockObject.prototype = new AnimatedObject;
	
	SoftBlockObject.prototype.end = function () {
		grid[this._grid_x][this._grid_y] =
			new GameObject(this._grid_x, this._grid_y, 'PASSABLE');
		live_objects.splice(live_objects.indexOf(this), 1);
	};
	
	SoftBlockObject.prototype.burn = function () {
		// track soft block count to use as odds for door spawning
		if (soft_block_count) { soft_block_count--; }
		if (!power_spawned
			&& (!(soft_block_count - 1) || Math.random() < 1/(soft_block_count - 1))
		){
			// spawn power
			power_spawned = true;
			grid[this._grid_x][this._grid_y] =
				new PowerObject(this._grid_x, this._grid_y, LEVEL[level].power);
		} else if (!door_spawned
			&& (!soft_block_count || Math.random() < 1/soft_block_count)
		) {
			//spawn door
			door_spawned = true;
			grid[this._grid_x][this._grid_y] =
				new DoorObject(this._grid_x, this._grid_y);
		} else {
			// just burn soft block
			this._frame = 1;
			this._should_animate = true;
			this.queue('becomePassable', 3);
			live_objects.push(this);
		}
	};
	
	SoftBlockObject.prototype.trigger = function (key) {
		switch (key) {
			case 'becomePassable': this.becomePassable(); break;
			default: console.warn('no action bound to ' + key);
		};
	};
	
	SoftBlockObject.prototype.becomePassable = function () {
		this.addType(TYPE.PASSABLE);
	};
	
	return SoftBlockObject;
})();

var DoorObject = (function () {
	function DoorObject(grid_x, grid_y) {
		this._type = TYPE.DOOR|TYPE.PASSABLE;
		this._image = IMG.DOOR;
		this.setGridPosition(grid_x, grid_y);
	};
	
	DoorObject.prototype = new GameObject;
	
	return DoorObject;
})();

var PowerObject = (function () {
	function PowerObject(grid_x, grid_y, power_name) {
		this._type = TYPE.POWER|TYPE.PASSABLE;
		this._power = POWER[power_name];
		this._image = IMG['POWER_' + power_name];
		
		this.setGridPosition(grid_x, grid_y);
	};
	
	PowerObject.prototype = new GameObject;
	
	PowerObject.prototype.collect = function () {
		grid[this._grid_x][this._grid_y] =
			new GameObject(this._grid_x, this._grid_y, 'PASSABLE');
	};
	
	PowerObject.prototype.getType = function () {
		return this._power;
	};
	
	return PowerObject;
})();

var FlameObject = (function () {

	function FlameObject(grid_x, grid_y, type) {
		grid[grid_x][grid_y].addType(TYPE.EXPLOSION);
		this.setGridPosition(grid_x, grid_y);
		this.setAnimation(ANI['EXPLO_' + type], true);
		this._ticks_per_frame = 6;
		this._should_animate = true;
	};
	
	FlameObject.prototype = new AnimatedObject;
	
	FlameObject.prototype.end = function () {

		this._should_animate = false;
		grid[this._grid_x][this._grid_y].removeType(TYPE.EXPLOSION);
	};
	
	return FlameObject;
})();

var Explosion = (function () {

	function Explosion(grid_x, grid_y, yield){
		this._flames = []; // for animating and drawing
		this._flames.push(new FlameObject(grid_x, grid_y, 'C'));
		for (var d = 0; d < DIRECTIONS.length; d++) {
			var direct = DIRECTIONS[d];

			var hit = false;
			for (var i = 1; !hit && i <= yield; i++) {
				var target_x = grid_x + direct[0] * i;
				var target_y = grid_y + direct[1] * i;
				var target = grid[target_x][target_y];
				if (!target) continue;
				if (target.is(TYPE.PASSABLE)) {
					var type = (direct[0])
						? (i == yield) ? ['L', '', 'R'][1 + direct[0]] : 'H' 
						: (i == yield) ? ['T', '', 'B'][1 + direct[1]] : 'V';
					this._flames.push(
						new FlameObject(target_x, target_y, type)
					);
				}
				if (target.is(TYPE.BOMB)) {	target.burn(); }
				if (target.is(TYPE.HARD_BLOCK)) { hit = true; }
				if (target.is(TYPE.SOFT_BLOCK)) {
					hit = true;
					target.burn();
				}
			}
		}

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
		this._flames.forEach(function (flame) { flame.end(); });
		this._flames = null;
		live_objects.splice(live_objects.indexOf(this),1);
	};
	
	return Explosion;
})();

var MovingObject = (function () {
	
	function MovingObject(){
		this._movement_speed = SPEED.NORMAL;
		this._grid_x = 0;
		this._grid_y = 0;	
		this._direction_x = 0;
		this._direction_y = 0;
		this._error_x = 0;
		this._error_y = 0;
		this._default_animation = null;
		this._spawn_point = { x: null, y: null }
		this._can_pass = TYPE.PASSABLE;
		this._flameproof = false;
		this._invincibility_timer = 0;
	};
		
	MovingObject.prototype = new AnimatedObject;
	
	MovingObject.prototype.spawn = function () {
		this._alive = true;
		this.setAnimation(this._default_animation);
		this.setGridPosition(this._spawn_point.x, this._spawn_point.y);
	};
	
	MovingObject.prototype.move = function () {
		// align with grid
		this._error_x = 0;
		this._error_y = 0;
		var grid_position = grid[this._grid_x][this._grid_y].getPosition();
		if(this._direction_x) {
			this._error_y = grid_position.y - this._y;
			if(this._error_y) {
				if(Math.abs(this._error_y) > this._movement_speed ) {
					if(this._error_y < 0) {
						this._error_y = -this._movement_speed;
					} else {
						this._error_y = this._movement_speed;
					}
				}
			}
		} else if(this._direction_y) {
			this._error_x = grid_position.x - this._x;
			if(this._error_x) {
				if(Math.abs(this._error_x) > this._movement_speed ) {
					if(this._error_x < 0) {
						this._error_x = -this._movement_speed;
					} else {
						this._error_x = this._movement_speed;
					}
				}
			}
		}
		
		this.setPosition(
			this._x + this._direction_x * this._movement_speed + this._error_x,
			this._y + this._direction_y * this._movement_speed + this._error_y
		);
		this.updateGridPosition();
	};
	
	MovingObject.prototype.updateGridPosition = function () {
		this._grid_x =
			Math.floor((this._x - OFFSET_X) * ONE_OVER_BLOCK_WIDTH + 0.5);
		this._grid_y =
			Math.floor((this._y - OFFSET_Y) * ONE_OVER_BLOCK_HEIGHT + 0.5);
	};
	
	MovingObject.prototype.collision = function (){	
		var target = grid
			[this._grid_x + this._direction_x]
			[this._grid_y + this._direction_y];
		
		if(!target.is(this._can_pass)) {
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
	
	MovingObject.prototype.checkBurn = function () {
		if (grid[this._grid_x][this._grid_y].is(TYPE.EXPLOSION)) this.burn();
	};
	
	MovingObject.prototype.burn = function () {}; // should be overridden
	
	MovingObject.prototype.physics = function () {
		this.collision();
		this.move();
		this.checkBurn();
	};
	
	return MovingObject;
})();

var BombObject = (function () {
  
	function BombObject(){
		this._type = TYPE.BOMB;
		this.setAnimation(ANI.BOMB);
		this._enabled = false;
		this._ticks_per_frame = 18;
		this._queued_actions = [];
		this._yield = 1;
		this._remote = false;
	};
		
	BombObject.prototype = new AnimatedObject;
  
	BombObject.prototype.enable = function (){
		this._enabled = true;
		this._frame = 0;
		this._should_animate = true;
		this.setImage(this._animation[0]);
		!this._remote && this.startTimer();
	};
	
	BombObject.prototype.disable = function (){
		this._enabled = false;
		this._should_animate = false;
		this.stopTimer();
	};
  
	BombObject.prototype.isEnabled = function (){
		return this._enabled;
	};
  
	BombObject.prototype.stopTimer = function (){
		this.dequeue('explode');
	};
  
	BombObject.prototype.startTimer = function (){
		this.queue('explode', BOMB_FUSE_TIME);
	};
  
	BombObject.prototype.plant = function (grid_x, grid_y, yield, remote){
		if (!grid[grid_x][grid_y].is(TYPE.PASSABLE)) return;
		this.setGridPosition(grid_x, grid_y);
		this._yield = yield;
		this._remote = !!remote;
		this.enable();
		grid[grid_x][grid_y] = this;
	};
	
	BombObject.prototype.explode = function (){
		this.stopTimer();
		this.disable();
		this.setImage(IMG.NOTHING);
		grid[this._grid_x][this._grid_y] =
			new GameObject(this._grid_x, this._grid_y, 'PASSABLE');
		live_objects.push(new Explosion(this._grid_x, this._grid_y, this._yield));
	};
  
	BombObject.prototype.burn = function () {
		this.stopTimer();
		this.queue('explode', 0.5);
	};
	
	BombObject.prototype.trigger = function (key) {
		switch (key) {
			case 'explode': this.explode(); break;
			default: console.warn('no action bound to ' + key);
		};
	};
  
	return BombObject;
})();

// StatefulObject
// = Moveable > Stateful > Player/Intelligent
// - has finite number of known states
// - each state has associated animation
// IntelligentObject (monsters)
// = Stateful > Intelligent
// - each state has associated behaviour

var EnemyObject = (function () {
	function EnemyObject(type, stats) {
		this._ticks_per_frame = 18;
		this._should_animate = true;
		this._recently_acted = false;
		this._can_pass = stats.can_pass;
		this._default_movement_speed = stats.movement_speed;
		this._frames_between_actions = stats.frames_between_actions;
		this._action_frequency = stats.action_frequency;
		this._spawn_point = findRandomPassable(stats.spawn_distance);
		this._default_animation = ANI[type + '_LD'];
		this._left_down_animation = ANI[type + '_LD'];
		this._right_up_animation = ANI[type + '_RU'];
		this._death_frame = IMG[type + '_DEATH'];
		this._queued_actions = []; // needs this; instance shared otherwise -_-
		this._action_triggers = [
			{
				check: function () {
					return !this._movement_speed
							|| (!this._recently_acted
								&& this.isAligned()
								&& Math.random() < this._action_frequency)
				}.bind(this),
				action: function() {
					this.moveDirection.apply(this);
				}.bind(this)
			}
		];
		this.spawn();
	};

	EnemyObject.prototype = new MovingObject();
	
	EnemyObject.prototype.isAlive = function () {
		return this._alive;
	};
	
	EnemyObject.prototype.isAligned = function () {
		var grid_position = grid[this._grid_x][this._grid_y].getPosition();
		return Math.abs(
			grid_position.x - this._x + grid_position.y - this._y
		) <= this._movement_speed;
	};
	
	EnemyObject.prototype.startDeathAnimation = function () {
		this.setAnimation(ANI.ENEMY_DEATH, true);
		this._should_animate = true;
	};
	
	EnemyObject.prototype.burn = function () {
		if (!this._alive) return;
		this._alive = false;
		this._should_animate = false;
		this._movement_speed = 0;
		this.queue('startDeathAnimation', 5);
		this.setImage(this._death_frame);
	};
	
	EnemyObject.prototype.end = function () {
		this._action_triggers = null;
		this._queued_actions = null;
		enemies.splice(enemies.indexOf(this),1);
	};
	
	EnemyObject.prototype.checkTriggers = function () {
		var action_options = this._action_triggers.filter(function (trigger) {
			return trigger.check();
		});
		if (action_options.length) {
			pickOne(action_options).action();
			action_options = null;
			return true;
		}
		action_options = null;
		return false;
	};
	
	EnemyObject.prototype.getRandomDirection = function () {
		var position = this.getGridPosition();
		var options = [];
		for (var i = 0; i < DIRECTIONS.length; i++) {

			if (grid
					[position.x + DIRECTIONS[i][0]]
					[position.y + DIRECTIONS[i][1]].is(this._can_pass)) {
				options.push(i);
			}
		}
		var random_direction = [0,0];
		if (options.length) {
			random_direction = DIRECTIONS[pickOne(options)];	
		}
		options = null;
		return random_direction;
	};
	
	EnemyObject.prototype.moveDirection = function (direction) {
		var new_direction = direction || this.getRandomDirection();
		this._direction_x = new_direction[0];
		this._direction_y = new_direction[1];
		this._movement_speed = this._default_movement_speed;
		this.setAnimation(
			this._direction_x < 0 || this._direction_y > 0
				? this._left_down_animation
				: this._right_up_animation
		);
	};
	
	EnemyObject.prototype.act = function () {
		if (!this._alive) return;
		if (this.checkTriggers()) {
			this._recently_acted = true;
			this.queue('endActionDebounce', this._frames_between_actions);
		}
	};
	
	EnemyObject.prototype.trigger = function (key) {
		switch (key) {
			case 'endActionDebounce': this.endActionDebounce(); break;
			case 'startDeathAnimation': this.startDeathAnimation(); break;
			default: console.warn('no action bound to ' + key);
		};
	};
	
	EnemyObject.prototype.endActionDebounce = function () {
		this._recently_acted = false;
	};
	
	return EnemyObject;
})();

var Enemy = function enemyFactory(type){
	if (!ENEMY[type]) return;
	return new EnemyObject(type, ENEMY[type]);
}

var powerUp = {
	[POWER.FLAME]: function () {
		this._bomb_yield = Math.min(this._bomb_yield + 1, MAX_YIELD);
	},
	[POWER.BOMB]: function () {
		this._max_bombs = Math.min(this._max_bombs + 1, MAX_BOMBS);
	},
	[POWER.SPEED]: function () {
		this._max_movement_speed = SPEED.FAST;
	},
	[POWER.DETONATE]: function () {
		this._can_detonate = true;
		this.disarmBombs();
	},
	[POWER.PASS_BOMB]: function () {
		this._can_pass = this._can_pass|TYPE.BOMB;
	},
	[POWER.PASS_WALL]: function () {
		this._can_pass = this._can_pass|TYPE.SOFT_BLOCK;
	},
	[POWER.FIREPROOF]: function () {
		this._flameproof = true;
	},
	[POWER.INVINCIBLE]: function () {
		this._invincibility_timer = INVINCIBILITY_TIMER;
	}
}

// TODO: Player >> Stateful?
var PlayerObject = (function () {

	function PlayerObject(){
		this._ticks_per_frame = 6;
		this._default_animation = ANI.MAN_DOWN;
		this._spawn_point = { x: 1, y: 1 };
		this._lives = DEFAULT_LIVES;
		this._bomb_yield = 1;
		this._max_bombs = 1;
		this._max_movement_speed = SPEED.NORMAL;
		this._invincibility_timer = 0;
		this._can_detonate = false;
		this.spawn();
	};

	PlayerObject.prototype = new MovingObject;
	
	PlayerObject.prototype.spawn = function () {
		this._alive = true;
		this.setAnimation(this._default_animation);
		this.setGridPosition(this._spawn_point.x, this._spawn_point.y);
	};
	
	PlayerObject.prototype.getLives = function () {
		return this._lives;
	};
	
	PlayerObject.prototype.end = function () {
		this._should_animate = false;
		scroll_offset_x = 0;
		scroll_offset_y = 0;
		if (this._lives) { this._lives--; }
		this.spawn();
		if (!last_press_fake) {
			key_press[KEY.UP] = keys_down[KEY.UP];
			key_press[KEY.DOWN] = keys_down[KEY.DOWN];
			key_press[KEY.LEFT] = keys_down[KEY.LEFT];
			key_press[KEY.RIGHT] = keys_down[KEY.RIGHT];
		} else { keys_down = []; }
	};
	
	PlayerObject.prototype.burn = function () {
		if (!this._alive) return;
		this._alive = false;
		this._should_animate = true;
		this._movement_speed = 0;
		this.setAnimation(ANI.MAN_DEATH, true);
	};
	
	PlayerObject.prototype.checkBurn = function () {
		if (grid[this._grid_x][this._grid_y].is(TYPE.EXPLOSION)) this.burn();
		for (i = 0; i < enemies.length; i++){
			if (!enemies[i].isAlive()) continue;
			var enemyPosition = enemies[i].getGridPosition();
			if (enemyPosition.x === this._grid_x
				&& enemyPosition.y === this._grid_y) this.burn();
		}
	};
	
	PlayerObject.prototype.checkPickup = function () {	
		if (grid[this._grid_x][this._grid_y].is(TYPE.POWER)) {
			powerUp[grid[this._grid_x][this._grid_y].getType()].call(this);
			grid[this._grid_x][this._grid_y].collect();
		}
	};
	
	PlayerObject.prototype.checkDoor = function () {
		if (!door_spawned) { return; }
		if (grid[this._grid_x][this._grid_y].is(TYPE.DOOR)) {
			// TODO: handle next level transition
			nextLevel();
		}
	}
	
	PlayerObject.prototype.disarmBombs = function () {
		// TODO: bombs aggregated by player
		for (i = 0; i < this._max_bombs; i++) {
			if(bombs[i].isEnabled()) {
				bombs[i].stopTimer();
			}
		}
	}
	
	PlayerObject.prototype.physics = function () {
		this.collision();
		this.move();
		this.checkBurn();
		this.checkPickup();
		this.checkDoor();
	};
	
	PlayerObject.prototype.scrollLevel = function () {
		if(CAN_SCROLL_X && (this._direction_x || this._error_x)) {
			// moving horizontally
			scroll_offset_x =
				this._x + this._movement_speed * this._direction_x
				- SCROLL_MIN_X + this._error_x;
			if(scroll_offset_x < 0) scroll_offset_x = 0;
			if(scroll_offset_x > SCROLL_MAX_X) scroll_offset_x = SCROLL_MAX_X;
		}
	
		if(CAN_SCROLL_Y && (this._direction_y || this._error_y)) {
			// moving vertically
			scroll_offset_y =
				this._y + this._movement_speed * this._direction_y
				- SCROLL_MIN_Y + this._error_y;
			if(scroll_offset_y < 0) scroll_offset_y = 0;
			if(scroll_offset_y > SCROLL_MAX_Y) scroll_offset_y = SCROLL_MAX_Y;
		}
	};
   
	PlayerObject.prototype.handleKeyPress = function (key_code) {
		if (!this._alive) return;
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
		if (!this._alive) return;
		if (keys_down[KEY.UP]
			|| keys_down[KEY.DOWN]
			|| keys_down[KEY.LEFT]
			|| keys_down[KEY.RIGHT]
		) {
			this._movement_speed = this._max_movement_speed;
			this._should_animate = true;
		} else {
			this._should_animate = false;
			this._movement_speed = 0;
		}

		if (keys_down[KEY.S]) {
			keys_down[KEY.S] = false;
			// plant bomb
			for (i = 0; i < this._max_bombs; i++) {
				if(!bombs[i].isEnabled()) {
					bombs[i].plant(
						this._grid_x,
						this._grid_y,
						this._bomb_yield,
						this._can_detonate
					);
					break;
				}
			}
		}
		
		if (keys_down[KEY.D] && this._can_detonate) {
			keys_down[KEY.D] = false;
			// detonate bombs .. TODO: one at a time; FIFO
			for (i = 0; i < this._max_bombs; i++) {
				if(bombs[i].isEnabled()) {
					bombs[i].explode();
				}
			}
		}
	};
	
	return PlayerObject;
})();

var Hud = (function () {

	function Hud() {};

	Hud.prototype.handleKeyPress = function(key_code) {	
		// handle pause/unpause
		switch(key_code) {
			case KEY.ENTER:
				this.togglePause();
				break;
		}
	};
	
	Hud.prototype.togglePause = function () {
		if (is(game_state, STATE.PLAYING)) {
			game_state ^= STATE.PAUSED;
		}
	};
	
	Hud.prototype.draw = function () {
		var scale = CANVAS_HEIGHT / DEFAULT_CANVAS_HEIGHT;
		ctx.font = '14px monospace';
		ctx.fillStyle = 'white';
		ctx.fillText(
			"Bomb: Tap left edge (on touch device), or S on keyboard",
			20 / scale,
			50 / scale
		);
		ctx.fillText(
			"Left " + player.getLives(),
			(window.innerWidth - 100) / scale,
			50 / scale
		);
		if (is(game_state, STATE.PAUSED)) {
			ctx.fillText(
				"PAUSE",
				window.innerWidth * 0.5 / scale,
				ctx.canvas.height * 0.5 / scale 
			);
		};
	};
	
	return Hud;
})();

// TODO: grid management system?
// TODO: live_object manager?
function findRandomPassable(min_distance_from_start) {
	var passable = findPassable(min_distance_from_start);
	var random_passable = pickOne(passable);
	passable = null;
	return random_passable;
};

function findPassable(min_distance_from_start) {
	var passable = [];
	for (var i = 1; i < MAP_WIDTH - 1; i++) {
		for (var j = 1; j < MAP_HEIGHT - 1; j++) {
			if (i + j < min_distance_from_start) continue;
			if (grid[i][j].is(TYPE.PASSABLE)) passable.push({x: i, y: j});
		}
	}
	return passable;
};

function init(){
	sizeCanvas(); // sets up ctx
	window.onresize = sizeCanvas;
		
	preload(); // loads all images
	
	point = new PointDevice();
	player = new PlayerObject();
	hud = new Hud();
  
	for (i = 0; i < MAX_BOMBS; i++) {
		bombs.push(new BombObject());
	}
	
	generateMap();
	spawnEnemies(LEVEL[level].enemies);
	game_state = STATE.PLAYING;
	gameloop(); // kick off loop; uses requestAnimationFrame
};

function preload() {
	Object.keys(IMG_DATA).forEach(function (key) {
			IMG[key] = new Image();
			IMG[key].src = ASSET_PATH + IMG_DATA[key];
	});
	IMG.NOTHING = new Image();
	Object.keys(ANI_DATA).forEach(function (key) {
		ANI[key] = [];
		for (var frame = 0; frame < ANI_DATA[key].frames; frame++) {
			ANI[key].push(new Image());
			ANI[key][ANI[key].length - 1].src =
				ASSET_PATH + key.toLowerCase() + frame + '.gif';
		}
		if (ANI_DATA[key].symmetric) {
			for (var frame = ANI_DATA[key].frames - 2; frame >= 0; frame--) {
				ANI[key].push(new Image());
				ANI[key][ANI[key].length - 1].src =
					ASSET_PATH + key.toLowerCase() + frame + '.gif';
			}
		}
	});
};

function sizeCanvas() {
	var canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	CANVAS_HEIGHT = Math.min(window.innerHeight, MAX_CANVAS_HEIGHT);
	canvas.height = CANVAS_HEIGHT;
	var scale = canvas.height / DEFAULT_CANVAS_HEIGHT;
	CANVAS_WIDTH = Math.min(window.innerWidth, MAP_WIDTH * BLOCK_WIDTH * scale);
	canvas.width = CANVAS_WIDTH;
	ctx.scale(scale, scale);
	
	SCROLL_MIN_X = Math.round((CANVAS_WIDTH - BLOCK_WIDTH) * 0.5 / scale);
	SCROLL_MAX_X = Math.round(MAP_WIDTH * BLOCK_WIDTH - CANVAS_WIDTH / scale);
	SCROLL_MIN_Y = Math.round((CANVAS_HEIGHT - BLOCK_HEIGHT) * 0.5 / scale);
	SCROLL_MAX_Y = Math.round(
		MAP_HEIGHT * BLOCK_HEIGHT + OFFSET_Y - CANVAS_HEIGHT / scale
	);
}

function generateMap() {
	door_spawned = false;
	power_spawned = false;
	soft_block_count = 0;
	for (x = 0; x < MAP_WIDTH; x++){
		grid[x] = [];
		for (y = 0; y < MAP_HEIGHT; y++){
			if (x == 0 || y == 0 || x == MAP_WIDTH - 1 || y == MAP_HEIGHT - 1
				|| (x % 2 == 0 && y % 2 == 0)){
				// hard block border and grid blocks
				grid[x][y] = new GameObject(x, y, 'HARD_BLOCK');
			} else if (x + y < 4 || Math.random() * 10 >= density) {
				// empty space around starting position and by density
				grid[x][y] = new GameObject(x, y, 'PASSABLE');
			} else {
				// generate soft blocks
				grid[x][y] = new SoftBlockObject(x, y);
				soft_block_count++;
			}
		}	
	}
};

function spawnEnemies(level_enemies) {
	Object.keys(level_enemies).forEach(function (type) {
		for (var i = 0; i < level_enemies[type]; i++) {
			enemies.push(Enemy(type));
		}
	})
};

function gameloop(){
	handleInput(key_press, keys_down);
	key_press = [];
	
	// if not paused
	if (is(game_state, STATE.PAUSED)) {
		window.requestAnimationFrame(gameloop);
		hud.draw();
	} else {
		ai();
		physics();
		animate();
		window.requestAnimationFrame(gameloop);
		draw();
		hud.draw();
	}
};

function nextLevel(){
	level++;
	level%=50;
	player.spawn();
	generateMap();
	spawnEnemies(LEVEL[level].enemies);
	scroll_offset_x = 0;
}

function handleInput(key_press, keys_down) {
	key_press.forEach(function (value, index) {
		if (value) {
			hud.handleKeyPress(index);
			if (!is(game_state, STATE.PAUSED)) {
				player.handleKeyPress(index);
			}
		}
	});
	player.handleKeysDown(keys_down);
};

function ai() {
	for (i = 0; i < enemies.length; i++){ enemies[i].act(); }
};

function physics() {
	player.physics();
	player.scrollLevel();
	for (i = 0; i < enemies.length; i++){ enemies[i].physics(); }
};

function animate(){
	player.animate();
	bombs.forEach(function (bomb) {
		if(bomb.isEnabled()) {
			bomb.animate();
		}
	});
	for (i = live_objects.length; i; i--){ live_objects[i - 1].animate(); }
	for (i = enemies.length; i; i--){ enemies[i - 1].animate(); }
};

function draw(){
	ctx.clearRect(0, 0 , CANVAS_WIDTH, CANVAS_HEIGHT);
	for (x = 0; x < MAP_WIDTH; x++){
		for (y = 0; y < MAP_HEIGHT; y++){
			grid[x][y].draw(ctx);
		}
	}
	for (i = 0; i < bombs.length; i++){ bombs[i].draw(ctx);	}
	for (i = 0; i < live_objects.length; i++){ live_objects[i].draw(ctx); }
	for (i = 0; i < enemies.length; i++){ enemies[i].draw(ctx); }
	player.draw(ctx);
};

// keys
window.addEventListener('keydown', function (event) {
	// record only if key is not already in down state
	last_press_fake = false;
	if (!keys_down[event.keyCode]) {
		key_press[event.keyCode] = true; // cleared every tick
		keys_down[event.keyCode] = true;
	}
}, false);
window.addEventListener('keyup', function (event) {
	keys_down[event.keyCode] = false;
	
	// if movement key released, and another is down, switch
	key_press[KEY.UP] = keys_down[KEY.UP];
	key_press[KEY.DOWN] = keys_down[KEY.DOWN];
	key_press[KEY.LEFT] = keys_down[KEY.LEFT];
	key_press[KEY.RIGHT] = keys_down[KEY.RIGHT];
	
}, false);

// point devices
var PointDevice = (function () {
  
	function PointDevice(){
		this._touch = false;
		this._touch_x = 0;
		this._touch_y = 0;
	};

	PointDevice.prototype.point = function (x, y) {
		// catch button press
		if (x < 100) { // TODO: find good margin
			keys_down[KEY.S] = true;
			return;
		}
		this._touch_x = x;
		this._touch_y = y;
		this._touch = true;
	};
  
	PointDevice.prototype.releaseKeys = function () {
		keys_down = [];
	};
  
	PointDevice.prototype.move = function (x, y)  {
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
			if (this._drag) last_press_fake = true;
		}
	};
  
	PointDevice.prototype.moved = function (x, y)  {
		if(!this._touch) {
			this.point(x, y);
		} else {
			this.move(x, y);
		}
	};
  
	PointDevice.prototype.stop = function () {
		if (!this._touch) return;
		if( !this._drag ){
			this.releaseKeys();
		}
		this._touch_x = 0;
		this._touch_y = 0;
		this._touch = false;
		this._drag = false;
	};
  
	return PointDevice;
})();

// mouse
window.addEventListener('mousedown', function (event) {
	point.point(event.clientX, event.clientY);
}, false);
window.addEventListener('mouseup', function (event) {
	point.stop();
}, false);
window.addEventListener('mousemove', function (event) {
	point.move(event.clientX, event.clientY);
}, false);

// touch TODO: handle multi-touch input
window.addEventListener('touchend', function (event) {
	point.stop();
}, false);
window.addEventListener('touchmove', function (event) {
	point.moved(event.touches[0].pageX, event.touches[0].pageY);
}, false);

// utility functions
function pickOne(array) {
	return (array.length)
		? array[Math.floor(Math.random() * array.length)]
		: null;
}

function is(flag, state) {
	return flag & state;
}
