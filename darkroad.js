document.addEventListener("DOMContentLoaded", init, false);

/**
 * Lane
 **/
function Lane(engine, start, end) {
	this.engine = engine;
	this.start = start;
	this.end = end;
	this.speed = 3;
	this.normalizedVector = null;
	this.normalizedVector = this.getNormalizedVector();


	this.cars = [];
}


Lane.prototype.drawInit = function(g) {
	var start1ScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.start.x - 7, this.start.y, this.start.z);
	var start2ScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.start.x + 7, this.start.y, this.start.z);
	var end1ScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.end.x + 7, this.end.y, this.end.z);
	var end2ScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.end.x - 7, this.end.y, this.end.z);

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
 * Light
 **/
function Light(car, name, relativePosition, color) {
	this.car = car;
	this.name = name;
	this.relativePosition = relativePosition;
	this.color = color;
	this.radius = 0.6;
	this.sequence = null;
	this.element = null;
}

Light.prototype.drawInit = function(g) {
	this.element = g.append('circle').attr('id', 'car' + this.car.id + '_' + this.name).attr('cx', -1).attr('cy', -1).attr('r', 1).attr('fill', this.color);
}

Light.prototype.update = function() {
	var coords = worldToScreen(this.car.engine.screenWidth, this.car.engine.screenHeight,
		this.car.coordinates.x + this.relativePosition.x,
		this.car.coordinates.y + this.relativePosition.y,
		this.car.coordinates.z + this.relativePosition.z);

	var radiusCoords = worldToScreen(this.car.engine.screenWidth, this.car.engine.screenHeight,
		this.car.coordinates.x + this.relativePosition.x + this.radius,
		this.car.coordinates.y + this.relativePosition.y,
		this.car.coordinates.z + this.relativePosition.z);

	this.element.attr('cx', coords[0]).attr('cy', coords[1]).attr('r', Math.abs(coords[0] - radiusCoords[0]));
}

Light.prototype.remove = function() {
	this.element.remove();
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
	this.lightingUp = null;
	this.lights = [];
	this.frontLights = [];
}

Car.prototype.drawInit = function(g) {if (this.lane.runsTowardsCamera() === true) {
		var color = '';
		if (this.lane.runsTowardsCamera() === true) {
			color = 'white';
			var randomInt = getRandomInt(0, 10)
			if (randomInt === 8) {
				color = '#CFF5FF'; // bluish
			} else if (randomInt === 9) {
				color = '#FDFDBA'; // yellowish
			}
		}

		var leftLight = new Light(this, 'left', {'x': -3, 'y': 0, 'z': -3}, color);
		leftLight.drawInit(g);
		this.lights.push(leftLight);
		this.frontLights.push(leftLight);

		var rightLight = new Light(this, 'left', {'x': 3, 'y': 0, 'z': -3}, color);
		rightLight.drawInit(g);
		this.lights.push(rightLight);
		this.frontLights.push(rightLight);
	}

	else {
		var color = 'red';

		var leftLight = new Light(this, 'left', {'x': -3, 'y': 0, 'z': -3}, color);
		leftLight.drawInit(g);
		this.lights.push(leftLight);

		var rightLight = new Light(this, 'left', {'x': 3, 'y': 0, 'z': -3}, color);
		rightLight.drawInit(g);
		this.lights.push(rightLight);
	}
}

Car.prototype.remove = function(g) {
	var i;
	for (i = 0; i < this.lights.length; ++i) {
		this.lights[i].remove();
	}
}

Car.prototype.update = function(g) {
	var i;
	var side = this.flashCount >= 0 ? 1 : -1;

	// lighting up
	var randomInt = getRandomInt(0, 9000);
	if (this.lightingUp === null && randomInt === 9 && this.lane.runsTowardsCamera()) {
		this.lightingUp = 0;
	}

	if (this.lightingUp !== null) {
		if (this.lightingUp < 5 || this.lightingUp > 7) {
			for (i = 0; i < this.frontLights.length; ++i) {
				this.frontLights[i].radius = 1.2;
			}
		} else {
			for (i = 0; i < this.frontLights.length; ++i) {
				this.frontLights[i].radius = 0.6;
			}
		}
		++this.lightingUp;
		if (this.lightingUp === 11) {
			this.lightingUp = null;
			for (i = 0; i < this.frontLights.length; ++i) {
				this.frontLights[i].radius = 0.6;
			}
		}
	}

	// move elements
	for (i = 0; i < this.lights.length; ++i) {
		this.lights[i].update();
	}

	this.coordinates.x = this.coordinates.x + this.speed * this.lane.getNormalizedVector().x;
	this.coordinates.y = this.coordinates.y + this.speed * this.lane.getNormalizedVector().y;
	this.coordinates.z = this.coordinates.z + this.speed * this.lane.getNormalizedVector().z;

	var normalizedVectorZ = this.lane.getNormalizedVector().z;
	if ((this.coordinates.z - this.lane.end.z) / Math.abs(this.coordinates.z - this.lane.end.z) === normalizedVectorZ / Math.abs(normalizedVectorZ)) {
		this.engine.removeCar(this);
	}

}


/**
 * Police Car
 **/
function PoliceCar(engine, lane, id) {
	this.engine = engine;
	this.id = id;
	this.lane = lane;
	this.coordinates = {'x': this.lane.start.x, 'y': this.lane.start.y + 2, 'z': this.lane.start.z};
	this.speed = this.lane.speed;
	this.lightingUp = null;
	this.lights = [];
	this.flashCount = 10;
}

PoliceCar.prototype.drawInit = function(g) {
	var color = '';
	if (this.lane.runsTowardsCamera() === true) {
		color = 'white';
		var randomInt = getRandomInt(0, 10)
		if (randomInt === 8) {
			color = '#CFF5FF'; // bluish
		} else if (randomInt === 9) {
			color = '#FDFDBA'; // yellowish
		}
	} else {
		color = 'red';
	}

	this.leftLightElement = g.append('circle').attr('id', 'car' + this.id + '_l').attr('cx', -1).attr('cy', -1).attr('r', 10).attr('fill', color);
	this.rightLightElement = g.append('circle').attr('id', 'car' + this.id + '_r').attr('cx', -1).attr('cy', -1).attr('r', 10).attr('fill', color);
	this.flashLightElement = g.append('circle').attr('id', 'car' + this.id + '_flash').attr('cx', -1).attr('cy', -1).attr('r', 10).attr('fill', 'blue');
}

PoliceCar.prototype.remove = function(g) {
	this.leftLightElement.remove();
	this.rightLightElement.remove();
	this.flashLightElement.remove();
}

PoliceCar.prototype.update = function(g) {
	var side = this.flashCount >= 0 ? 1 : -1;
	var leftScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.coordinates.x - 3, this.coordinates.y, this.coordinates.z);
	var rightScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.coordinates.x + 3, this.coordinates.y, this.coordinates.z);
	var flashScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.coordinates.x + (3 * side), this.coordinates.y + 3, this.coordinates.z);
	var r = (rightScreenCoords[0] - leftScreenCoords[0]) / 10;

	// lighting up
	var randomInt = getRandomInt(0, 9000);
	if (this.lightingUp === null && randomInt === 9 && this.lane.runsTowardsCamera()) {
		this.lightingUp = 0;
	}

	if (this.lightingUp !== null) {
		if (this.lightingUp < 5 || this.lightingUp > 7) {
			r = r * 2;
		}
		++this.lightingUp;
		if (this.lightingUp === 11) {
			this.lightingUp = null;
		}
	}

	// move elements
	this.leftLightElement.attr('cx', leftScreenCoords[0]).attr('cy', leftScreenCoords[1]).attr('r', r);
	this.rightLightElement.attr('cx', rightScreenCoords[0]).attr('cy', rightScreenCoords[1]).attr('r', r);
	this.flashLightElement.attr('cx', flashScreenCoords[0]).attr('cy', flashScreenCoords[1]).attr('r', r * 2);

	this.coordinates.x = this.coordinates.x + this.speed * this.lane.getNormalizedVector().x;
	this.coordinates.y = this.coordinates.y + this.speed * this.lane.getNormalizedVector().y;
	this.coordinates.z = this.coordinates.z + this.speed * this.lane.getNormalizedVector().z;

	var normalizedVectorZ = this.lane.getNormalizedVector().z;
	if ((this.coordinates.z - this.lane.end.z) / Math.abs(this.coordinates.z - this.lane.end.z) === normalizedVectorZ / Math.abs(normalizedVectorZ)) {
		this.engine.removeCar(this);
	}

	this.flashCount = (this.flashCount < -10) ? 10 : this.flashCount - 1;

}

/**
 * Star
 **/
function Star(sky) {
	this.sky = sky;
	this.stepGranularity = 10000;
	this.circle = null;
	this.radius = getRandomInt(0, 15) / 10;
	this.polarDistance = getRandomInt(5, this.sky.engine.screenWidth);
	this.runner = getRandomInt(0, this.stepGranularity) / this.stepGranularity * 2 * Math.PI;
	this.position = {
		'x': Math.cos(this.runner) * this.polarDistance,
		'y': Math.sin(this.runner) * this.polarDistance
	};
};

Star.prototype.drawInit = function(g) {
	this.circle = g.append('circle')
		.attr('cx', this.sky.polarPosition['x'] + this.position['x'])
		.attr('cy', this.sky.polarPosition['y'] + this.position['y'])
		.attr('r', this.radius)
		.attr('fill', '#CFDBFF');
}

Star.prototype.update = function() {
	this.position['x'] = Math.cos(this.runner) * this.polarDistance;
	this.position['y'] = Math.sin(this.runner) * this.polarDistance;

	horizonDistance = Math.abs(this.sky.polarPosition['y'] + this.position['y'] - this.sky.height);

	if (horizonDistance < this.sky.height / 3) {
		this.circle.attr('opacity', horizonDistance / (this.sky.height / 3));
	}

	this.circle = this.circle
		.attr('cx', this.sky.polarPosition['x'] + this.position['x'])
		.attr('cy', this.sky.polarPosition['y'] + this.position['y']);

	this.runner += 1 / this.stepGranularity * 2 * Math.PI;
}


/**
 * Sky
 **/
function Sky(engine) {
	this.engine = engine;
	this.skyG = null;
	this.polarPosition = {};
	this.height = this.engine.screenHeight / 2;
	this.stars = [];
	this.counter = 0;
};

Sky.prototype.setHeight = function(height) {
	this.height = height;
}

Sky.prototype.drawInit = function(g) {
	var skyRect, i, newStar;

	this.engine.svg
		.insert('defs', ":first-child")
			.append('clipPath')
				.attr('id', 'sky-clip')
				.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', this.engine.screenWidth)
					.attr('height', this.height);

	this.skyG = g.append('g')
		.attr('id', 'sky')
		.attr('clip-path', 'url(#sky-clip)');

	skyRect = this.skyG.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.engine.screenWidth)
			.attr('height', this.height)
			.attr('fill', '#000009');

	this.polarPosition = {
		'x': getRandomInt(20, this.engine.screenWidth - 20),
		'y': getRandomInt(20, (this.height) - 20)
	};

	// polar star
	this.skyG.append('circle').attr('cx', this.polarPosition['x']).attr('cy', this.polarPosition['y']).attr('r', 1).attr('fill', '#ffffff');

	for (i = 0; i < 200; ++i) {
		newStar = new Star(this);
		newStar.drawInit(this.skyG);
		this.stars.push(newStar);
	}

}

Sky.prototype.update = function() {
	var index;
	if (this.counter === 0) {
		for (index in this.stars) {
			this.stars[index].update();
		}
	}

	this.counter += 1;
	if (this.counter > 9) {
		this.counter = 0;
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
		return [-100, -100];
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

	this.counter = 0;
	this.carCounter = 0;
	this.cars = [];
	this.lanes = [];
	this.lastLane = 0;

	this.screenWidth = d3.select('#dark-road').style('width').replace("px", "") - 10;
	this.screenHeight = d3.select('#dark-road').style('height').replace("px", "") - 10;

	d3.select('#dark-road').style({'background-color':'black'});
	this.svg = d3.select('#dark-road')
		.append('svg')
			.attr('version','1.1')
			.attr('xmlns', 'http://www.w3.org/2000/svg');
	this.g = this.svg.append('g');

	// ground
	this.g.append('rect')
		.attr('x', '0')
		.attr('y', this.screenHeight / 2)
		.attr('width', this.screenWidth)
		.attr('height', this.screenHeight / 2)
		.attr('fill', '#000200')
	;

	this.sky = new Sky(this);

	// add lanes
	var laneHeight = -80;

	var horizon = worldToScreen(this.screenWidth, this.screenHeight, 0, laneHeight, 1500);

	this.sky.setHeight(horizon[1]);
	this.sky.drawInit(this.g);

	var lane1 = new Lane(this, {'x': -28, 'y': laneHeight, 'z': -10}, {'x': -28, 'y': laneHeight, 'z': 1500});
	lane1.drawInit(this.g);
	this.lanes.push(lane1);

	var lane2 = new Lane(this, {'x': -12, 'y': laneHeight, 'z': -10}, {'x': -12, 'y': laneHeight, 'z': 1500});
	lane2.speed = lane2.speed + 2;
	lane2.drawInit(this.g);
	this.lanes.push(lane2);

	var lane3 = new Lane(this, {'x': 14, 'y': laneHeight, 'z': 1500}, {'x': 14, 'y': laneHeight, 'z': -10});
	lane3.speed = lane3.speed + 2;
	lane3.drawInit(this.g);
	this.lanes.push(lane3);

	var lane4 = new Lane(this, {'x': 30, 'y': laneHeight, 'z': 1500}, {'x': 30, 'y': laneHeight, 'z': -10});
	lane4.drawInit(this.g);
	this.lanes.push(lane4);

	var lane5 = new Lane(this, {'x': 30, 'y': laneHeight, 'z': 1300}, {'x': 480, 'y': laneHeight, 'z': 100});
	lane5.speed = lane5.speed - 1.5;
	lane5.drawInit(this.g);
	this.lanes.push(lane5);

	var lane6 = new Lane(this, {'x': -220, 'y': laneHeight, 'z': -10}, {'x': -520, 'y': laneHeight, 'z': 1500});
	lane6.speed = lane6.speed - 1.5;
	lane6.drawInit(this.g);
	this.lanes.push(lane6);

	var lane7 = new Lane(this, {'x': -500, 'y': laneHeight, 'z': 1500}, {'x': -200, 'y': laneHeight, 'z': -10});
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

	var newCar;
	if (getRandomInt(0, 50) === 9) {
		newCar = new PoliceCar(this, lane, this.carCounter);
	} else {
		newCar = new Car(this, lane, this.carCounter);
	}
	newCar.drawInit(this.g);

	this.cars.push(newCar);

}

DarkRoad.prototype.update = function() {
	this.sky.update();

	if (getRandomInt(0, 20) === 9) {
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
