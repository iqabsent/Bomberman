var GameObject = (function() {
    // "private" variables 
    var _x;
	var _y;
	var _width;
	var _height;
	var _image;
	

    // constructor
    function GameObject(){
		this._image = new Image();
	
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
	
	GameObject.prototype.draw = function(ctx) {
		ctx.drawImage(this._image, this._x, this._y, this._width, this._height);
	};
	
    return GameObject;
	
})();

var cube1, cube2, cube3;
var permacubes = new Array();
var bricks = new Array();
var TXS = {};
var count = 0;
var mapwidth = 51;
var mapheight = 11;
var blockwidth = 20;
var density= 2.8;

function init(){
	TXS.BRICK = "images/brick.PNG";
	TXS.PERMA = "images/permabrick.JPG";
	
	ctx = document.getElementById('canvas').getContext('2d');
	
	for (x=0; x<mapwidth; x++){
		for (y=0; y < mapheight; y++){
			//generate permanent cubes
			if (x==0 || y==0 || x==mapwidth-1 || y==mapheight-1 || (x%2 == 0 && y%2 == 0 )) {
			    
				permacubes[count] = new GameObject();
				permacubes[count].setSize(blockwidth);
				permacubes[count].setPosition(5 +(x * blockwidth), blockwidth +(y*blockwidth));
				permacubes[count].setImage(TXS.PERMA);
				count++;
			} else {
				if (Math.random()*10 < density){
					bricks.push(new GameObject());
					bricks[bricks.length-1].setSize(blockwidth);
					bricks[bricks.length-1].setPosition(5 +(x * blockwidth), blockwidth +(y*blockwidth));
					bricks[bricks.length-1].setImage(TXS.BRICK);
					
				
				}
			}
		}	
	}
	setInterval(gameloop,100);
	
};
	
	
	
	
	


function gameloop(){
	//moveandcheck();
	draw();
};

function draw(){
	/*ctx.clearRect(boxx, boxy , boxwidth, boxheight);
	ctx.drawImage(img,ballx-ballrad,bally-ballrad,2*ballrad,2*ballrad);
	ctx.fillRect(boxx,boxy,ballrad,boxheight);
	ctx.fillRect(boxx+boxwidth-ballrad,boxy,ballrad,boxheight);
	ctx.fillRect(boxx, boxy, boxwidth, ballrad);
	ctx.fillRect(boxx, boxy+boxheight-ballrad, boxwidth, boxheight);*/
	
	for (z = 0; z < count; z++){
		permacubes[z].draw(ctx); 
	}
	
	for (i = 0; i < bricks.length; i++){
		bricks[i].draw(ctx);
	}

};

function moveandcheck(){
	
};
