// constants
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 520;
var DEFAULT_MOVEMENT_SPEED = 2;
var PLAYER_MOVEMENT_SPEED = 2;
var BLOCK_WIDTH = 35;
var MAP_WIDTH = 25;
var MAP_HEIGHT = 13;
var OFFSET_X = 0;
var OFFSET_Y = 65;
var DRAG_TOLERANCE = 35;
var BOOM_TIME = 5000;
var MAX_BOMBS = 10;

// enums / flags
var TXS = {
  BRICK: "images/brick.png",
	PERMA: "images/permabrick.jpg",
	BOMBERMAN: "images/bomberman_down2.gif",
  BOMB: "images/miketyson.jpg",
  BOMB_EXPLODE: "images/girl.jpg"
};

var DEATHSCROLL = {
  ONE: "images/bomberman_man_death1.gif",
  TWO: "images/bomberman_man_death2.gif",
  THREE: "images/bomberman_man_death3.gif",
  FOUR: "images/bomberman_man_death4.gif",
  FIVE: "images/bomberman_man_death5.gif",
  SIX: "images/bomberman_man_death6.gif",
  SEVEN: "images/bomberman_man_death7.gif"
};

var BOMBERMAN_LEFT = {
  ONE: "images/bomberman_left1.gif",
  TWO: "images/bomberman_left2.gif",
  THREE: "images/bomberman_left3.gif"  
};

var BOMBERMAN_RIGHT = {
  ONE: "images/bomberman_right1.gif",
  TWO: "images/bomberman_right2.gif",
  THREE: "images/bomberman_right3.gif"  
};

var BOMBERMAN_UP = {
  ONE: "images/bomberman_up1.gif",
  TWO: "images/bomberman_up2.gif",
  THREE: "images/bomberman_up3.gif"  
};

var BOMBERMAN_DOWN = {
  ONE: "images/bomberman_down1.gif",
  TWO: "images/bomberman_down2.gif",
  THREE: "images/bomberman_down3.gif"  
};
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

// variables
var SCROLL_MIN_X = Math.round((CANVAS_WIDTH - BLOCK_WIDTH)/2);
var SCROLL_MAX_X = MAP_WIDTH * BLOCK_WIDTH + OFFSET_X * 2 - CANVAS_WIDTH;
var SCROLL_MIN_Y = Math.round((CANVAS_HEIGHT - BLOCK_WIDTH)/2);
var SCROLL_MAX_Y = MAP_HEIGHT * BLOCK_WIDTH + OFFSET_Y - CANVAS_HEIGHT;
var CAN_SCROLL_X = SCROLL_MIN_X > 0;
var CAN_SCROLL_Y = SCROLL_MIN_Y > 0;
var start_x = BLOCK_WIDTH + OFFSET_X;
var start_y = BLOCK_WIDTH + OFFSET_Y;
var grid = new Array();
var bombs = new Array();
var triggers = new Array();
var pressedKeys = [];
var point;
var player;
var bomb;
var density = 3;
var scroll_offset_x = 0;
var scroll_offset_y = 0;
var count = 1;
var frame = 1;


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
    if (pressedKeys[KEY.S]) {
      pressedKeys[KEY.S] = false;
      
			//grid[this._grid_x][this._grid_y].setType(TYPE.BOMB);
      
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
    this.setImage(TXS.BOMB);	
    _enabled = false;
	};
		
	var super_class = new GameObject();
	BombObject.prototype = super_class;
  
  BombObject.prototype.enable = function(){
    this._enabled = true;
    this.startTimer(); // shoud check for power up to manually detonate
  };
  
  BombObject.prototype.setGridPosition = function(grid_x, grid_y){
  this._grid_x = grid_x;
  this._grid_y = grid_y;
  
    this.setPosition(OFFSET_X +(grid_x * BLOCK_WIDTH), OFFSET_Y +(grid_y * BLOCK_WIDTH));
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
    console.log(this._timer);
    console.log(this);
    this.setImage(TXS.BOMB);	
    grid[this._grid_x][this._grid_y].setType(TYPE.PASSABLE);
    
    this._enabled = false;
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
	ctx = document.getElementById('canvas').getContext('2d');
  point = new PointDevice();
  player = new PlayerObject();
	player.setImage(TXS.BOMBERMAN);
  
  for (i = 0; i < MAX_BOMBS; i++) {
    bombs.push(new BombObject());
  }

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
  setInterval(playerimage, 400);
  setInterval(playermove, 100);
};
	
function gameloop(){
	moveandcheck();
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

function playerimage(){
 if (pressedKeys[KEY.W]) playdeath();
 
};

function playermove(){
 playermoveleft();
 playermoveright();
 playermoveup();
 playermovedown();
 };

function playdeath(){
  count++;
  switch (count){
    case 1: 
      player.setImage(DEATHSCROLL.ONE);
      break;
    case 2: 
      player.setImage(DEATHSCROLL.TWO);
      break;
    case 3: 
      player.setImage(DEATHSCROLL.THREE);
      break;
    case 4: 
      player.setImage(DEATHSCROLL.FOUR);
      break;
    case 5: 
      player.setImage(DEATHSCROLL.FIVE);
      break;
    case 6: 
      player.setImage(DEATHSCROLL.SIX);
      break;
    case 7: 
      player.setImage(DEATHSCROLL.SEVEN);
      break;
    default:
      player.setImage(TXS.BOMBERMAN);
      count = 1;
  };
};

function playermoveleft(){
    
  if (pressedKeys[KEY.LEFT]) {
    switch (frame){
      case 1: 
        player.setImage(BOMBERMAN_LEFT.ONE);
        frame++;
        break;
      case 2: 
        player.setImage(BOMBERMAN_LEFT.TWO);
        frame++;
        break;
      case 3: 
        player.setImage(BOMBERMAN_LEFT.THREE);
        frame++;
        
        break;
      case 4: 
        player.setImage(BOMBERMAN_LEFT.TWO);
        frame = 1
      break;
      
    };
  };
};
function playermoveright(){
  if (pressedKeys[KEY.RIGHT]){
    switch (frame){
      case 1: 
        player.setImage(BOMBERMAN_RIGHT.ONE);
        frame++;
        break;
      case 2: 
        player.setImage(BOMBERMAN_RIGHT.TWO);
        frame++;
        break;
      case 3: 
        player.setImage(BOMBERMAN_RIGHT.THREE);
        frame++;
        break;
      case 4: 
        player.setImage(BOMBERMAN_RIGHT.TWO);
        frame = 1;
        break;    
    };
  };
};
function playermovedown(){
  if (pressedKeys[KEY.DOWN]) {
    switch (frame){
      case 1: 
        player.setImage(BOMBERMAN_DOWN.ONE);
        frame++;
        break;
      case 2: 
        player.setImage(BOMBERMAN_DOWN.TWO);
        frame++;
        break;
      case 3: 
        player.setImage(BOMBERMAN_DOWN.THREE);
        frame++;
        break;
      case 4: 
        player.setImage(BOMBERMAN_DOWN.TWO);
        frame=1;
        break;      
    };
  };
};

function playermoveup(){
  if (pressedKeys[KEY.UP]) {
    switch (frame){
      case 1: 
        player.setImage(BOMBERMAN_UP.ONE);
        frame++;
        break;
      case 2: 
        player.setImage(BOMBERMAN_UP.TWO);
        frame++;
        break;
      case 3: 
        player.setImage(BOMBERMAN_UP.THREE);
        frame++;
        break;
      case 4: 
        player.setImage(BOMBERMAN_UP.TWO);
        frame=1
        break;
    };
  };
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


