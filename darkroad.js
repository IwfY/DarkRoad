document.addEventListener("DOMContentLoaded", init, false);

window.darkRoad = {};
window.darkRoad.screenWidth = 1600;
window.darkRoad.screenHeight = 900;

/**
 * Lane
 **/
function Lane(start, end) {
	this.start = start;
	this.end = end;
	this.speed = 3;
	this.normalizedVector = null;
	this.normalizedVector = this.getNormalizedVector();


	this.cars = [];
}


Lane.prototype.drawInit = function(g) {
	var start1ScreenCoords = worldToScreen(window.darkRoad.screenWidth, window.darkRoad.screenHeight, this.start.x - 7, this.start.y, this.start.z);
	var start2ScreenCoords = worldToScreen(window.darkRoad.screenWidth, window.darkRoad.screenHeight, this.start.x + 7, this.start.y, this.start.z);
	var end1ScreenCoords = worldToScreen(window.darkRoad.screenWidth, window.darkRoad.screenHeight, this.end.x + 7, this.end.y, this.end.z);
	var end2ScreenCoords = worldToScreen(window.darkRoad.screenWidth, window.darkRoad.screenHeight, this.end.x - 7, this.end.y, this.end.z);

	var pointsString = start1ScreenCoords[0] + ',' + start1ScreenCoords[1] + ' ' + start2ScreenCoords[0] + ',' + start2ScreenCoords[1] + ' ' + end1ScreenCoords[0] + ',' + end1ScreenCoords[1] + ' ' + end2ScreenCoords[0] + ',' + end2ScreenCoords[1];

	g.append('polygon').attr('points', pointsString).attr('fill', '#040404');
}

/**
 * get direction of lane
 *
 * return true if it runs in the direction of the camera; false otherwise
 **/
Lane.prototype.runsTowardsCamera = function() {
	if ((this.end.z - this.start.z) < 0) {
		return true;
	}

	return false;
}

Lane.prototype.getNormalizedVector = function() {
	if (this.normalizedVector !== null) {
		return this.normalizedVector;
	}

	var vector = {
		'x': this.end.x - this.start.x,
		'y': this.end.y - this.start.y,
		'z': this.end.z - this.start.z
	}

	var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);

	vector.x = vector.x / length;
	vector.y = vector.y / length;
	vector.z = vector.z / length;

	return vector;
}


/**
 * Car
 **/
function Car(engine, lane, id) {
	this.engine = engine;
	this.id = id;
	this.lane = lane;
	this.coordinates = {'x': this.lane.start.x, 'y': this.lane.start.y + 2, 'z': this.lane.start.z};
	this.speed = this.lane.speed;
}

Car.prototype.drawInit = function(g) {
	var color = this.lane.runsTowardsCamera() === true ? 'white' : 'red';
	this.leftLightElement = g.append('circle').attr('id', 'car' + this.id + '_l').attr('cx', -1).attr('cy', -1).attr('r', 10).attr('fill', color);
	this.rightLightElement = g.append('circle').attr('id', 'car' + this.id + '_r').attr('cx', -1).attr('cy', -1).attr('r', 10).attr('fill', color);
}

Car.prototype.remove = function(g) {
	this.leftLightElement.remove();
	this.rightLightElement.remove();
}

Car.prototype.update = function(g) {
	var leftScreenCoords = worldToScreen(window.darkRoad.screenWidth, window.darkRoad.screenHeight, this.coordinates.x - 3, this.coordinates.y, this.coordinates.z);
	var rightScreenCoords = worldToScreen(window.darkRoad.screenWidth, window.darkRoad.screenHeight, this.coordinates.x + 3, this.coordinates.y, this.coordinates.z);
	var r = (rightScreenCoords[0] - leftScreenCoords[0]) / 10;

	this.leftLightElement.attr('cx', leftScreenCoords[0]).attr('cy', leftScreenCoords[1]).attr('r', r);
	this.rightLightElement.attr('cx', rightScreenCoords[0]).attr('cy', rightScreenCoords[1]).attr('r', r);

	this.coordinates.x = this.coordinates.x + this.speed * this.lane.getNormalizedVector().x;
	this.coordinates.y = this.coordinates.y + this.speed * this.lane.getNormalizedVector().y;
	this.coordinates.z = this.coordinates.z + this.speed * this.lane.getNormalizedVector().z;

	var normalizedVectorZ = this.lane.getNormalizedVector().z;
	if ((this.coordinates.z - this.lane.end.z) / Math.abs(this.coordinates.z - this.lane.end.z) === normalizedVectorZ / Math.abs(normalizedVectorZ)) {
		this.engine.removeCar(this);
	}
}



/**
 * transform world coordinates to screen coordinates
 *
 * considers eye to be at (0, 0, -1)
 *
 **/
function worldToScreen(screenWidth, screenHeight, x, y, z) {
	var screenX, screenY, a, b,
		eyeZ = -1;

	if (z - eyeZ === 0) {
		return null;
	}

	a = Math.abs(eyeZ) * x / Math.abs(z - eyeZ);
	b = Math.abs(eyeZ) * -y / Math.abs(z - eyeZ);

	a = a + 1;
	//~ if (a < 0 || a > 2) {
		//~ return [-1, -1];
	//~ }

	b = b + 1;
	//~ if (b < 0 || b > 2) {
		//~ return [-1, -1];
	//~ }

	screenX = a / 2 * screenWidth;
	screenY = b / 2 * screenHeight;

	return [screenX, screenY];
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function DarkRoad() {
	var g;
	console.log('here');

	this.counter = 0;
	this.carCounter = 0;
	this.cars = [];
	this.lanes = [];
	this.lastLane = 0;

	d3.select('#dark-road').style({'background-color':'black'});
	this.g = d3.select('#dark-road').append('svg').append('g');
	var sky = this.g.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', window.darkRoad.screenWidth)
			.attr('height', window.darkRoad.screenHeight / 2)
			.attr('fill', '#000009');

	// add lanes
	var laneHeight = -50;

	var lane1 = new Lane({'x': -28, 'y': laneHeight, 'z': 0}, {'x': -28, 'y': laneHeight, 'z': 1500});
	lane1.drawInit(this.g);
	this.lanes.push(lane1);

	var lane2 = new Lane({'x': -12, 'y': laneHeight, 'z': 0}, {'x': -12, 'y': laneHeight, 'z': 1500});
	lane2.speed = lane2.speed + 2;
	lane2.drawInit(this.g);
	this.lanes.push(lane2);

	var lane3 = new Lane({'x': 14, 'y': laneHeight, 'z': 1500}, {'x': 14, 'y': laneHeight, 'z': 0});
	lane3.speed = lane3.speed + 2;
	lane3.drawInit(this.g);
	this.lanes.push(lane3);

	var lane4 = new Lane({'x': 30, 'y': laneHeight, 'z': 1500}, {'x': 30, 'y': laneHeight, 'z': 0});
	lane4.drawInit(this.g);
	this.lanes.push(lane4);

	var lane5 = new Lane({'x': 30, 'y': laneHeight, 'z': 1300}, {'x': 180, 'y': laneHeight, 'z': 200});
	lane5.speed = lane5.speed - 1.5;
	lane5.drawInit(this.g);
	this.lanes.push(lane5);

	var lane6 = new Lane({'x': -220, 'y': laneHeight, 'z': 0}, {'x': -520, 'y': laneHeight, 'z': 1500});
	lane6.speed = lane6.speed - 1.5;
	lane6.drawInit(this.g);
	this.lanes.push(lane6);

	var lane7 = new Lane({'x': -500, 'y': laneHeight, 'z': 1500}, {'x': -200, 'y': laneHeight, 'z': 0});
	lane7.speed = lane7.speed - 1.5;
	lane7.drawInit(this.g);
	this.lanes.push(lane7);

	this.run();

}

DarkRoad.prototype.run = function() {
	this.interval = window.setInterval(this.update.bind(this), 50);
}

DarkRoad.prototype.removeCar = function(car) {
	var carIndex = this.cars.indexOf(car);
	this.cars.splice(carIndex, 1);

	car.remove();
	console.log('remove');
}

DarkRoad.prototype.addRandomCar = function() {
	++(this.carCounter);
	var laneIndex = getRandomInt(0, this.lanes.length);
	if (laneIndex === this.lastLane) {
		return;
	}
	this.lastLane = laneIndex;
	var lane = this.lanes[laneIndex];
	var newCar = new Car(this, lane, this.carCounter);
	newCar.drawInit(this.g);

	this.cars.push(newCar);

}

DarkRoad.prototype.update = function() {
	if (getRandomInt(0, 30) === 9) {
		this.addRandomCar();
	}

	for(j = 0; j < this.cars.length; ++j) {
		this.cars[j].update();
	}

	++this.counter;

	//~ if (this.counter > 500) {
		//~ console.log('done');
		//~ window.clearInterval(this.interval);
	//~ }

	return false;
}

function init() {
	var darkRoad = new DarkRoad();
}
