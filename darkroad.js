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


Lane.prototype.drawInit = function (g) {
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
Lane.prototype.runsTowardsCamera = function () {
    if ((this.end.z - this.start.z) < 0) {
        return true;
    }

    return false;
}

Lane.prototype.getNormalizedVector = function () {
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
 * Sign
 **/
function Sign(engine) {
    this.engine = engine;
    this.signWorldDepth = getRandomInt(-230, -95);
    this.signWorldCenter = -42;
    this.signWidth = 10;
    this.lights = [];
};

Sign.prototype.drawInit = function (g) {
    var coord1 = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.signWorldCenter - this.signWidth / 2, this.engine.laneHeight + 35, this.signWorldDepth); // top left
    var coord2 = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.signWorldCenter + this.signWidth / 2, this.engine.laneHeight + 7, this.signWorldDepth); // bottom right
    var signPixelHeight = coord2[1] - coord1[1];

    var coord3 = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.signWorldCenter - 4.4, this.engine.laneHeight + 7, this.signWorldDepth); // foot top left
    var coord4 = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.signWorldCenter - 4.2, this.engine.laneHeight + 0, this.signWorldDepth); // foot bottom right

    var coordRightFootTL = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.signWorldCenter + 4.2, this.engine.laneHeight + 7, this.signWorldDepth); // foot top left
    var coordRightFootBR = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.signWorldCenter + 4.4, this.engine.laneHeight + 0, this.signWorldDepth); // foot bottom right

    var coordArrowTop = worldToScreen(this.engine.screenWidth, this.engine.screenHeight,
        this.signWorldCenter + 0.7 * this.signWidth / 2, this.engine.laneHeight + 32, this.signWorldDepth);
    var coordText1 = worldToScreen(this.engine.screenWidth, this.engine.screenHeight,
        this.signWorldCenter + 0.45 * this.signWidth / 2, this.engine.laneHeight + 30, this.signWorldDepth); // right top
    var coordText2 = worldToScreen(this.engine.screenWidth, this.engine.screenHeight,
        this.signWorldCenter + 0.35 * this.signWidth / 2, this.engine.laneHeight + 19, this.signWorldDepth); // right top

    var numberOfLights = 2 + getRandomInt(0, 2);
    var coordLightsTL = worldToScreen(this.engine.screenWidth, this.engine.screenHeight,
        this.signWorldCenter - this.signWidth / 2 + 0.3, this.engine.laneHeight + 35.5, this.signWorldDepth + 0.5);
    var coordLightsBR = worldToScreen(this.engine.screenWidth, this.engine.screenHeight,
        this.signWorldCenter + this.signWidth / 2 - 0.3, this.engine.laneHeight + 35, this.signWorldDepth + 0.5);
    var lightWidth = 0.92 * (coordLightsBR[0] - coordLightsTL[0]) / numberOfLights;
    var lightGap = ((coordLightsBR[0] - coordLightsTL[0]) - lightWidth * numberOfLights) / (numberOfLights - 1);

    var signGradient = this.engine.svg
        .insert('defs', ":first-child")
        .append('linearGradient')
        .attr('id', 'sign-gradient')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0.1)
        .attr('y2', 1)
    ;

    signGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', getRandomInt(0, 2) === 1 ? '#09093b' : '#00563a') // blue or green
    ;
    signGradient // black
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#000000')
        ;


    var signArrowGradient = this.engine.svg
        .insert('defs', ":first-child")
        .append('linearGradient')
        .attr('id', 'sign-arrow-gradient')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0.1)
        .attr('y2', 1)
    ;

    signArrowGradient // white
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#bbbbbb')
    ;
    signArrowGradient // black
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#000')
    ;

    var signBorderGradient = this.engine.svg
        .insert('defs', ":first-child")
        .append('linearGradient')
        .attr('id', 'sign-border-gradient')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0.1)
        .attr('y2', 1)
    ;
    signBorderGradient // white
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#888')
    ;
    signBorderGradient // black
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#111')
    ;

    this.signRect = g.append('rect')
        .attr('id', 'sign')
        .attr('x', coord1[0])
        .attr('y', coord1[1])
        .attr('width', coord2[0] - coord1[0])
        .attr('height', coord2[1] - coord1[1])
        .attr('rx', 3)
        .attr('fill', 'url(#sign-gradient)')
        .attr('stroke', 'url(#sign-border-gradient)')
        .attr('stroke-width', '1')
    ;

    var arrowScale = signPixelHeight / 120;
    this.signArrowPath = g.append('path')
        .attr('id', 'sign-arrow')
        .attr('transform', 'translate(' + coordArrowTop[0] + ' ' + coordArrowTop[1] + ') scale(' + arrowScale + ') ')
        .attr('d', 'M 0 0 l 4 4 v 96 h -8 v -16 l -14 -14 v -4 h 4 l 10 10 v -72 z')
        .attr('fill', 'url(#sign-arrow-gradient)');
    ;

    this.textTop = g.append('text')
        .attr('id', 'sign-text-top')
        .attr('x', coordText1[0])
        .attr('y', coordText1[1])
        .attr('style', 'fill:#aaaaaa;font-family:"Open Sans";direction:rtl;font-size:' + signPixelHeight / 11)
        .text(this.engine.getRandomCityName())
        ;

    this.textBottom = g.append('text')
        .attr('id', 'sign-text-bottom')
        .attr('x', coordText2[0])
        .attr('y', coordText2[1])
        .attr('style', 'fill:#555555;font-family:"Open Sans";direction:rtl;font-size:' + signPixelHeight / 11)
        .text(this.engine.getRandomCityName())
        ;

    this.footLeft = g.append('rect')
        .attr('id', 'sign-foot-left')
        .attr('x', coord3[0])
        .attr('y', coord3[1])
        .attr('width', coord4[0] - coord3[0])
        .attr('height', coord4[1] - coord3[1])
        .attr('fill', '#0e0e16')
        ;
    this.footRight = g.append('rect')
        .attr('id', 'sign-foot-right')
        .attr('x', coordRightFootTL[0])
        .attr('y', coordRightFootTL[1])
        .attr('width', coordRightFootBR[0] - coordRightFootTL[0])
        .attr('height', coordRightFootBR[1] - coordRightFootTL[1])
        .attr('fill', '#0e0e16')
        ;

    for (var i = 0; i < numberOfLights; ++i) {
        var light = g.append('rect')
            .attr('id', 'sign-light-' + i.toString())
            .attr('x', coordLightsTL[0] + (lightWidth + lightGap) * i)
            .attr('y', coordLightsTL[1])
            .attr('width', lightWidth)
            .attr('height', coordLightsBR[1] - coordLightsTL[1])
            .attr('fill', '#bfbfbf')
        ;
        this.lights.push(light);
    }
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

Light.prototype.drawInit = function (g) {
    this.element = g.append('circle').attr('id', 'car' + this.car.id + '_' + this.name).attr('cx', -1).attr('cy', -1).attr('r', 1).attr('fill', this.color);
}

Light.prototype.update = function () {
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

Light.prototype.remove = function () {
    this.element.remove();
}


/**
 * Car
 **/
function Car(engine, lane, id) {
    this.engine = engine;
    this.id = id;
    this.lane = lane;
    this.coordinates = { 'x': this.lane.start.x, 'y': this.lane.start.y + 2, 'z': this.lane.start.z };
    this.speed = this.lane.speed;
    this.lightingUp = null;
    this.lights = [];
    this.frontLights = [];
    this.lightToCenterDistance = getRandomInt(24, 29) / 10.0;
}

Car.prototype.drawInit = function (g) {
    if (this.lane.runsTowardsCamera() === true) {
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

        var leftLight = new Light(this, 'left', { 'x': -this.lightToCenterDistance, 'y': 0, 'z': -3 }, color);
        leftLight.drawInit(g);
        this.lights.push(leftLight);
        this.frontLights.push(leftLight);

        var rightLight = new Light(this, 'left', { 'x': this.lightToCenterDistance, 'y': 0, 'z': -3 }, color);
        rightLight.drawInit(g);
        this.lights.push(rightLight);
        this.frontLights.push(rightLight);
    }

    else {
        var color = 'red';

        var leftLight = new Light(this, 'left', { 'x': -this.lightToCenterDistance, 'y': 0, 'z': -3 }, color);
        leftLight.drawInit(g);
        this.lights.push(leftLight);

        var rightLight = new Light(this, 'left', { 'x': this.lightToCenterDistance, 'y': 0, 'z': -3 }, color);
        rightLight.drawInit(g);
        this.lights.push(rightLight);
    }
}

Car.prototype.remove = function (g) {
    var i;
    for (i = 0; i < this.lights.length; ++i) {
        this.lights[i].remove();
    }
}

Car.prototype.update = function (g) {
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
    this.coordinates = { 'x': this.lane.start.x, 'y': this.lane.start.y + 2, 'z': this.lane.start.z };
    this.speed = this.lane.speed;
    this.lightingUp = null;
    this.lights = [];
    this.flashCount = 10;
}

PoliceCar.prototype.drawInit = function (g) {
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
    this.flashLeftLightElement = g.append('circle').attr('id', 'car' + this.id + '_flash_l').attr('cx', -1).attr('cy', -1).attr('r', 10).attr('fill', '#0000d7');
    this.flashRightLightElement = g.append('circle').attr('id', 'car' + this.id + '_flash_r').attr('cx', -1).attr('cy', -1).attr('r', 10).attr('fill', '#0000d7');
}

PoliceCar.prototype.remove = function (g) {
    this.leftLightElement.remove();
    this.rightLightElement.remove();
    this.flashLeftLightElement.remove();
    this.flashRightLightElement.remove();
}

PoliceCar.prototype.update = function (g) {
    var side = this.flashCount >= 0 ? 1 : -1;
    var leftScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.coordinates.x - 2.7, this.coordinates.y, this.coordinates.z);
    var rightScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.coordinates.x + 2.7, this.coordinates.y, this.coordinates.z);
    var flashLeftScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.coordinates.x + 2.4, this.coordinates.y + 5, this.coordinates.z + 1);
    var flashRightScreenCoords = worldToScreen(this.engine.screenWidth, this.engine.screenHeight, this.coordinates.x - 2.4, this.coordinates.y + 5, this.coordinates.z + 1);
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

    if (side === 1) {
        this.flashLeftLightElement.attr('fill', '#0000d7');
        this.flashRightLightElement.attr('fill', '#00002a');
    } else {
        this.flashLeftLightElement.attr('fill', '#00002a');
        this.flashRightLightElement.attr('fill', '#0000d7');
    }

    // move elements
    this.leftLightElement.attr('cx', leftScreenCoords[0]).attr('cy', leftScreenCoords[1]).attr('r', r);
    this.rightLightElement.attr('cx', rightScreenCoords[0]).attr('cy', rightScreenCoords[1]).attr('r', r);
    this.flashLeftLightElement.attr('cx', flashLeftScreenCoords[0]).attr('cy', flashLeftScreenCoords[1]).attr('r', r * 1.8);
    this.flashRightLightElement.attr('cx', flashRightScreenCoords[0]).attr('cy', flashRightScreenCoords[1]).attr('r', r * 1.8);

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
 * Building
 **/
function Building(engine) {
    this.engine = engine;
    this.buildingRect = null;
    this.warningLight = null;
    this.warningLightStart = getRandomInt(0, 240);
    this.warningLightBlinkLength = getRandomInt(120, 240);
};

Building.prototype.drawInit = function (g, x, horizonY, width, height) {
    var orangeSideBrightness = getRandomInt(2, 8) / 10;

    var buildingSideGradient = this.engine.svg
        .insert('defs', ":first-child")
        .append('linearGradient')
        .attr('id', 'building-side-gradient')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 0.95)
    ;
    buildingSideGradient // white
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgb(' + orangeSideBrightness * (160 + getRandomInt(-10, 10)) + ',' + orangeSideBrightness * (80 + getRandomInt(-10, 10)) + ',' + orangeSideBrightness * (50 + getRandomInt(-10, 10)) + ')')
    ;
    buildingSideGradient // black
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#000')
    ;

    this.buildingRect = g.append('rect')
        .attr('x', x + 2)
        .attr('y', horizonY - height + 2)
        .attr('width', width)
        .attr('height', height - 2)
        .attr('fill', 'url(#building-side-gradient)')
    ;
    this.buildingRect = g.append('rect')
        .attr('x', x)
        .attr('y', horizonY - height)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'rgb(' + getRandomInt(0, 4) + ',' + getRandomInt(0, 4) + ',' + getRandomInt(0, 4) + ')')
        ;

    if (height > 70) {
        this.warningLight = g.append('circle')
            .attr('cx', x + width / 2)
            .attr('cy', horizonY - height - 5)
            .attr('r', 1.5)
            .attr('fill', 'rgb(' + getRandomInt(160, 210) + ',' + getRandomInt(0, 10) + ',' + getRandomInt(0, 10) + ')')
            ;
    }
};

Building.prototype.update = function () {
    if (this.warningLight !== null) {
        //console.log((this.engine.getTickCounter() + this.warningLightStart) % (this.warningLightBlinkLength * 2));
        if ((this.engine.getTickCounter() + this.warningLightStart) % (this.warningLightBlinkLength * 2) < this.warningLightBlinkLength) {
            this.warningLight.attr('opacity', 0);
        } else {
            this.warningLight.attr('opacity', 1);
        }
    }
};

function City(engine, depth) {
    this.engine = engine;
    this.depth = depth; // max value == furthest away city is 100
    this.cityG = null;
    this.horizonY = null;
    this.centerX = getRandomInt(0, this.engine.screenWidth);
    this.buildings = [];
}

City.prototype.setHorizonY = function (horizonY) {
    this.horizonY = horizonY;
};

City.prototype.drawInit = function (g) {
    var i, building;
    this.cityG = g.append('g');

    var scaleFactor = Math.sqrt(130 / this.depth);
    var buildingScaleFactor = scaleFactor * 0.8;
    var numberOfBuildings = getRandomInt(6, 12);

    for (i = 0; i < numberOfBuildings; ++i) {
        building = new Building(this.engine);
        building.drawInit(this.cityG,
            this.centerX + getRandomInt(-80 * scaleFactor, 80 * scaleFactor),
            this.horizonY,
            getRandomInt(10 * buildingScaleFactor, 25 * buildingScaleFactor), // width
            getRandomInt(15 * buildingScaleFactor, 80 * buildingScaleFactor)) // height
        ;

        this.buildings.push(building);
    }
}

City.prototype.update = function () {
    for (index in this.buildings) {
        this.buildings[index].update();
    }
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

Star.prototype.drawInit = function (g) {
    this.circle = g.append('circle')
        .attr('cx', this.sky.polarPosition['x'] + this.position['x'])
        .attr('cy', this.sky.polarPosition['y'] + this.position['y'])
        .attr('r', this.radius)
        .attr('fill', '#CFDBFF');
}

Star.prototype.update = function () {
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
 * Moon
 **/
function Moon(engine, sky) {
    this.engine = engine;
    this.sky = sky;
    this.moonG = null;
    this.runner = Math.PI * 3 / 2 + (getRandomInt(0, 10) / 50);
    this.stepGranularity = 30000;
    this.polarPosition = { 'x': null, 'y': null };
    this.polarDistance = { 'x': null, 'y': null };
};

Moon.prototype.drawInit = function (skyG, skyRect) {
    this.polarPosition['x'] = +skyRect.attr('width') / 2 + getRandomInt(-skyRect.attr('width') / 2, +skyRect.attr('width') / 2);
    this.polarPosition['y'] = +skyRect.attr('height') + 80;
    this.polarDistance['x'] = +skyRect.attr('width') * 3 / 5;
    this.polarDistance['y'] = +skyRect.attr('height') * 7 / 8;

    this.moonG = skyG.append('g').attr('transform', 'translate(100, 100)');
    this.moonG.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 20).attr({ 'fill': '#faffd3', 'opacity': 0.6 });
    this.moonG.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 18).attr({ 'fill': '#faffd3' });
    this.moonG.append('circle').attr('cx', 2).attr('cy', 4).attr('r', 4).attr({ 'fill': '#e1e6be' });
    this.moonG.append('circle').attr('cx', -5).attr('cy', 2).attr('r', 3).attr({ 'fill': '#f0f0f0' });
    this.moonG.append('circle').attr('cx', -3).attr('cy', -6).attr('r', 3).attr({ 'fill': '#f0f0f0' });
}

Moon.prototype.update = function () {
    var x = this.polarPosition['x'] + Math.cos(this.runner) * this.polarDistance['x'];
    var y = this.polarPosition['y'] + Math.sin(this.runner) * this.polarDistance['y'];
    this.moonG.attr('transform', 'translate(' + x + ',' + y + ')');

    this.runner += 1 / this.stepGranularity * 2 * Math.PI;
};

/**
 * Sky
 **/
function Sky(engine) {
    this.engine = engine;
    this.skyG = null;
    this.polarPosition = {};
    this.height = this.engine.screenHeight / 2;
    this.stars = [];
    this.moon = new Moon(this.engine, this);
    this.counter = 0;
};

Sky.prototype.setHeight = function (height) {
    this.height = height;
}

Sky.prototype.drawInit = function (g) {
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


    var skyGradient = this.engine.svg
        .insert('defs', ":first-child")
        .append('linearGradient')
        .attr('id', 'sky-gradient')
        .attr('x1', 0.87)
        .attr('x2', 1.05)
        .attr('y1', 0.83)
        .attr('y2', 1.02)
        ;
    skyGradient // blue
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#06051f')
        ;
    skyGradient // red
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#320714')
        ;

    this.skyG = g.append('g')
        .attr('id', 'sky')
        .attr('clip-path', 'url(#sky-clip)');

    skyRect = this.skyG.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.engine.screenWidth)
        .attr('height', this.height)
        ;

    if (getRandomInt(0, 2) === 1) {
        skyRect.attr('fill', 'url(#sky-gradient)');
    } else {
        skyRect.attr('fill', '#06051f');
    }

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

    this.moon.drawInit(this.skyG, skyRect);

}

Sky.prototype.update = function () {
    var index;
    if (this.counter % 10 === 0) {
        for (index in this.stars) {
            this.stars[index].update();
        }
    }

    this.counter += 1;

    this.moon.update();
}



/**
 * transform world coordinates to screen coordinates
 *
 * considers eye to be at (0, 0, 1)
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
    this.cities = [];
    this.cityCount = getRandomInt(3, 7);
    this.initialCityDepth = 100 - getRandomInt(1, 20); // farthest city is drawn first

    this.screenWidth = d3.select('#dark-road').style('width').replace("px", "") - 10;
    this.screenHeight = d3.select('#dark-road').style('height').replace("px", "") - 10;

    if (isNaN(this.screenWidth) || isNaN(this.screenHeight)) {
        console.log('Error retrieving screen width and height.');
        return;
    }

    d3.select('#dark-road').style({ 'background-color': 'black' });
    this.svg = d3.select('#dark-road')
        .append('svg')
        .attr('version', '1.1')
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
    this.laneHeight = -80;

    var horizon = worldToScreen(this.screenWidth, this.screenHeight, 0, this.laneHeight, 1500);

    this.sky.setHeight(horizon[1]);
    this.sky.drawInit(this.g);

    var cityDepth = this.initialCityDepth;
    for (var i = 0; i < this.cityCount; ++i) {
        var city = new City(this, cityDepth);
        city.setHorizonY(horizon[1]);
        city.drawInit(this.g);
        this.cities.push(city);
        cityDepth -= getRandomInt(1, 20);
    }

    var lane1 = new Lane(this, { 'x': -28, 'y': this.laneHeight, 'z': -10 }, { 'x': -28, 'y': this.laneHeight, 'z': 1500 });
    lane1.drawInit(this.g);
    this.lanes.push(lane1);

    var lane2 = new Lane(this, { 'x': -12, 'y': this.laneHeight, 'z': -10 }, { 'x': -12, 'y': this.laneHeight, 'z': 1500 });
    lane2.speed = lane2.speed + 2;
    lane2.drawInit(this.g);
    this.lanes.push(lane2);

    var lane3 = new Lane(this, { 'x': 14, 'y': this.laneHeight, 'z': 1500 }, { 'x': 14, 'y': this.laneHeight, 'z': -10 });
    lane3.speed = lane3.speed + 2;
    lane3.drawInit(this.g);
    this.lanes.push(lane3);

    var lane4 = new Lane(this, { 'x': 30, 'y': this.laneHeight, 'z': 1500 }, { 'x': 30, 'y': this.laneHeight, 'z': -10 });
    lane4.drawInit(this.g);
    this.lanes.push(lane4);

    var lane5 = new Lane(this, { 'x': 30, 'y': this.laneHeight, 'z': 1300 }, { 'x': 480, 'y': this.laneHeight, 'z': 100 });
    lane5.speed = lane5.speed - 1.5;
    lane5.drawInit(this.g);
    this.lanes.push(lane5);

    var lane6 = new Lane(this, { 'x': -220, 'y': this.laneHeight, 'z': -10 }, { 'x': -520, 'y': this.laneHeight, 'z': 1500 });
    lane6.speed = lane6.speed - 1.5;
    lane6.drawInit(this.g);
    this.lanes.push(lane6);

    var lane7 = new Lane(this, { 'x': -500, 'y': this.laneHeight, 'z': 1500 }, { 'x': -200, 'y': this.laneHeight, 'z': -10 });
    lane7.speed = lane7.speed - 1.5;
    lane7.drawInit(this.g);
    this.lanes.push(lane7);

    var sign = new Sign(this);
    sign.drawInit(this.g);

    this.run();

}

DarkRoad.prototype.run = function () {
    this.interval = window.setInterval(this.update.bind(this), 50);
}

DarkRoad.prototype.getTickCounter = function () {
    return this.counter;
};

DarkRoad.prototype.removeCar = function (car) {
    var carIndex = this.cars.indexOf(car);
    this.cars.splice(carIndex, 1);

    car.remove();
    console.log('remove');
}

DarkRoad.prototype.addRandomCar = function () {
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

DarkRoad.prototype.update = function () {
    this.sky.update();

    if (getRandomInt(0, 20) === 9) {
        this.addRandomCar();
    }

    for (j = 0; j < this.cars.length; ++j) {
        this.cars[j].update();
    }

    for (index in this.cities) {
        this.cities[index].update();
    }

    //~ if (this.counter > 500) {
    //~ console.log('done');
    //~ window.clearInterval(this.interval);
    //~ }

    ++this.counter;

    return false;
}
DarkRoad.prototype.getRandomCityName = function () {
    var cities = [
        'Aachen', 'Accra', 'Albufeira', 'Analavory', 'Aşgabat', 'ასპინძა', 'عمّان', 'Bergen', 'Bern', 'Berlin', 'Brno', 'Cairo', 'القاهرة', 'ചവറ', 'Detroit',
        'Dodoma', 'Dresden', 'Dublin', 'دبي', 'Essen',
        'Fakaifou', 'Frankfurt', 'Görlitz', 'Halle', '浜松市', 'Hunhukwe',
        'Innsbruck', 'İzmir', 'Jena', 'Jerusalem', 'Kakata', 'Kigali', 'Kiev', 'Konstanz', 'Lascano', 'Liverpool',
        'Madrid', 'Málaga', 'Napoli', 'New York', 'Niamey', 'Находка', 'Oslo', 'Perth', 'Praha', 'Πάτρα', 'Quellón',
        'Quito', 'Roma', 'Tirana',
        'Скопје', 'Västerås', 'Wrocław', 'ວຽງຈັນ', '漳州市', 'الرباط'];
    return cities[getRandomInt(0, cities.length)];
}

function init() {
    window.darkRoad = new DarkRoad();
}
