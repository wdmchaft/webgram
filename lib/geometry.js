/*
 * Copyright (c) 2012 Calin Crisan <ccrisan@gmail.com>
 * 
 * This file is part of Webgram.
 * 
 * Webgram is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Webgram is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with Webgram.  If not, see <http://www.gnu.org/licenses/>.
 */


/**
 * @namespace A namespace containing basic geometric classes.
 */
Webgram.Geometry = Webgram.Namespace('Webgram.Geometry');

/**
 * @class A class representing a point in the two-dimensional space.
 * @param {Number} x the x coordinate
 * @param {Number} y the y coordinate
 */
Webgram.Geometry.Point = function (x, y) {
    /**
     * The x coordinate of the point.
     * @type Number
     */
    this.x = x;

    /**
     * The y coordinate of the point.
     * @type Number
     */
    this.y = y;
};

Webgram.Geometry.Point.prototype = {
    /**
     * Returns a translated version of this point. 
     * @param {Number} dx the amount to translate on the x axis
     * @param {Number} dy the amount to translate on the y axis
     * @returns {Webgram.Geometry.Point} the translated point
     */
    getTranslated: function (dx, dy) {
        return new Webgram.Geometry.Point(this.x + dx, this.y + dy);
    },
    
    /**
     * Returns a rotated version of this point.
     * @param {Number} angle the angle of rotation
     * @param {Webgram.Geometry.Point} center the rotation center;
     *  pas <tt>null</tt> or <tt>undefined</tt> to rotate
     *  around the origin
     * @returns {Webgram.Geometry.Point} the rotated point
     */
    getRotated: function (angle, center) {
        if (angle === 0) {
            return new Webgram.Geometry.Point(this.x, this.y);
        }
        
        if (!center) {
            center = new Webgram.Geometry.Point(0, 0);
        }
        
        var sine = Math.sin(angle);
        var cosine = Math.cos(angle);
        
        var x = center.x + (this.x - center.x) * cosine - (this.y - center.y) * sine;
        var y = center.y + (this.y - center.y) * cosine + (this.x - center.x) * sine;
        
        return new Webgram.Geometry.Point(x, y);
    },
    
    /**
     * Returns a scaled version of this point.
     * @param {Number} sx the x scaling factor
     * @param {Number} sy the y scaling factor
     * @returns {Webgram.Geometry.Point} the scaled point
     */
    getScaled: function (sx, sy) {
        return new Webgram.Geometry.Point(this.x * sx, this.y * sy);
    },
    
    /**
     * Calculates the distance between this point the one passed as argument.
     * @param {Webgram.Geometry.Point} point the other point
     * @returns {Number} the distance between to points
     */
    getDistanceTo: function (point) {
        return Math.sqrt((this.x - point.x) * (this.x - point.x) + (this.y - point.y) * (this.y - point.y));
    },
    
    /**
     * Determines the center of the segment formed by this point
     * and the one passed as argument.
     * @param {Webgram.Geometry.Point} point the other point
     * @returns {Webgram.Geometry.Point} the center of the segment
     */
    getCenterTo: function (point) {
        return new Webgram.Geometry.Point(
                (this.x + point.x) / 2,
                (this.y + point.y) / 2);
    },
    
    /**
     * Computes the angle formed by this point and the one
     * passed as argument.
     * @param {Webgram.Geometry.Point} point the other point
     * @returns {Number} the angle
     */
    getAngleTo: function (point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    },
    
    /**
     * Computes the coordinates of a point situated
     * at a given distance and angle from this point.
     * @param {Number} radius the distance from this point
     * @param {Number} angle the angle formed with this point
     * @returns {Webgram.Geometry.Point} the computed point
     */
    getPointAt: function (radius, angle) {
        return new Webgram.Geometry.Point(
            this.x + radius * Math.cos(angle),
            this.y + radius * Math.sin(angle)
        );
    },
    
    /**
     * Returns a version of this point with rounded coordinates.
     * @param {Number} roundTo the number to round to, defaults to <tt>1</tt>
     * @returns {Webgram.Geometry.Point} the point with rounded coordinates
     */
    round: function (roundTo) {
        if (!roundTo) {
            roundTo = 1;
        }
        
        return new Webgram.Geometry.Point(Math.round(this.x / roundTo) * roundTo, Math.round(this.y / roundTo) * roundTo);
    },
    
    /**
     * Creates an identical copy of this point.
     * @returns {Webgram.Geometry.Point} the clone of this point
     */
    clone: function () {
        return new Webgram.Geometry.Point(this.x, this.y);
    },

    /**
     * Tells whether two points are equal or not.
     * The comparison is made between this point and the
     * one given as argument.
     * @param {Webgram.Geometry.Point} point the other point
     * @returns {Boolean} <tt>true</tt> if the two points are equal, <tt>false</tt> otherwise
     */
    equals: function (point) {
        if (point == null) {
            return false;
        }
        
        return (point.x === this.x && point.y === this.y);
    }
};

/**
 * Returns a point with both coordinates set to <tt>0</tt>
 * @returns {Webgram.Geometry.Point} the <em>zero</em> point
 */
Webgram.Geometry.Point.zero = function () {
    return new Webgram.Geometry.Point(0, 0);
};

Webgram.Class('Webgram.Geometry.Point');


/**
 * @class A class that represents a size in the 2D space,
 * by encapsulating a <em>width</em> and a <em>height</em>.
 * @param {Number} width the width of the size object
 * @param {Number} height the height of the size object
 */
Webgram.Geometry.Size = function (width, height) {
    /**
     * The width of the size object.
     * @type Number
     */
    this.width = width;

    /**
     * The height of the size object.
     * @type Number
     */
    this.height = height;
};

Webgram.Geometry.Size.prototype = {
    /**
     * Returns a version of this size object with rounded dimensions.
     * @param {Number} roundTo the number to round to, defaults to <tt>1</tt>
     * @returns {Webgram.Geometry.Size} the rounded size object 
     */
    round: function (roundTo) {
        if (!roundTo) {
            roundTo = 1;
        }
        
        return new Webgram.Geometry.Size(Math.round(this.width / roundTo) * roundTo, Math.round(this.height / roundTo) * roundTo);
    },
    
    /**
     * Creates an identical copy of this size object.
     * @returns {Webgram.Geometry.Size} the clone of this size object
     */
    clone: function () {
        return new Webgram.Geometry.Size(this.width, this.height);
    },

    /**
     * Tells whether two size objects are equal or not.
     * The comparison is made between this size and the
     * one given as argument.
     * @param {Webgram.Geometry.Size} size the other size
     * @returns {Boolean} <tt>true</tt> if the two size objects are equal, <tt>false</tt> otherwise
     */
    equals: function (size) {
        if (size == null) {
            return false;
        }
        
        return (size.width === this.width && size.height === this.height);
    }
};

Webgram.Class('Webgram.Geometry.Size');


/**
 * @class A class that represents a rectangular region.
 */
Webgram.Geometry.Rectangle = function (x1, y1, x2, y2) {
    /**
     * The left coordinate of the rectangle.
     * @type Number
     */
    this.x1 = Math.min(x1, x2);

    /**
     * The top coordinate of the rectangle.
     * @type Number
     */
    this.y1 = Math.min(y1, y2);

    /**
     * The right coordinate of the rectangle.
     * @type Number
     */
    this.x2 = Math.max(x1, x2);

    /**
     * The bottom coordinate of the rectangle.
     * @type Number
     */
    this.y2 = Math.max(y1, y2);
};

Webgram.Geometry.Rectangle.prototype = {
    /**
     * Tells whether a point is inside this rectangular area or not.
     * @param {Webgram.Geometry.Point} point the point to test
     * @returns {Boolean} <tt>true</tt> if the point is inside, <tt>false</tt> otherwise
     */
    pointInside: function (point) {
        return (point.x >= this.x1) && (point.x <= this.x2) && (point.y >= this.y1) && (point.y <= this.y2);
    },

    /**
     * Returns the width of this rectangle.
     * @returns {Number} the width of this rectangle
     */
    getWidth: function () {
        return this.x2 - this.x1 + 1;
    },
    
    /**
     * Returns the height of this rectangle.
     * @returns {Number} the height of this rectangle
     */
    getHeight: function () {
        return this.y2 - this.y1 + 1;
    },
    
    /**
     * Returns the size of this rectangle.
     * @returns {Webgram.Geometry.Size} the size of this rectangle
     */
    getSize: function () {
        return new Webgram.Geometry.Size(this.x2 - this.x1 + 1, this.y2 - this.y1 + 1);
    },
    
    /**
     * Returns the center of this rectangle.
     * @returns {Webgram.Geometry.Point} the center of this rectangle
     */
    getCenter: function () {
        return new Webgram.Geometry.Point(
                (this.x1 + this.x2) / 2,
                (this.y1 + this.y2) / 2);
    },
    
    /**
     * Returns the <em>top-left</em> point of this rectangle.
     * @returns {Webgram.Geometry.Point} the top-left point of this rectangle
     */
    getTopLeft: function () {
        return new Webgram.Geometry.Point(this.x1, this.y1);
    },
    
    /**
     * Returns the <em>bottom-right</em> point of this rectangle. 
     * @returns {Webgram.Geometry.Point} the bottom-right point of this rectangle
     */
    getBottomRight: function () {
        return new Webgram.Geometry.Point(this.x2, this.y2);
    },
    
    /**
     * Returns the <em>top-right</em< point of this rectangle.
     * @returns {Webgram.Geometry.Point} the top-right point of this rectangle
     */
    getTopRight: function () {
        return new Webgram.Geometry.Point(this.x2, this.y1);
    },
    
    /**
     * Returns the <em>top-left</em> point of this rectangle.
     * @returns {Webgram.Geometry.Point} the top-left point of this rectangle
     */
    getBottomLeft: function () {
        return new Webgram.Geometry.Point(this.x1, this.y2);
    },
    
    /**
     * Returns a poly object composed of the four corners of this rectangle:
     * <em>top-left</em>, <em>top-right</em>, <em>bottom-right</em> and <em>bottom-left</em>.
     * @returns {Webgram.Geometry.Poly} the poly made of the corners of this rectangle
     */
    getPoly: function () {
        var point11 = new Webgram.Geometry.Point(this.x1, this.y1);
        var point21 = new Webgram.Geometry.Point(this.x2, this.y1);
        var point22 = new Webgram.Geometry.Point(this.x2, this.y2);
        var point12 = new Webgram.Geometry.Point(this.x1, this.y2);
        
        return new Webgram.Geometry.Poly([point11, point21, point22, point12]);
    },
    
    /**
     * Returns a translated version of this rectangle. 
     * @param dx the amount to translate on the x axis
     * @param dy the amount to translate on the y axis
     * @returns {Webgram.Geometry.Rectangle} the translated rectangle
     */
    getTranslated: function (dx, dy) {
        return new Webgram.Geometry.Rectangle(this.x1 + dx, this.y1 + dy, this.x2 + dx, this.y2 + dy);
    },
    
    /**
     * Returns a version of this rectangle with rounded coordinates. 
     * @param {Number} roundTo the number to round to, defaults to <tt>1</tt>
     * @returns {Webgram.Geometry.Rectangle} the rectangle with rounded coordinates
     */
    round: function (roundTo) {
        if (!roundTo) {
            roundTo = 1;
        }
        
        return new Webgram.Geometry.Rectangle(
                Math.round(this.x1 / roundTo) * roundTo,
                Math.round(this.y1 / roundTo) * roundTo,
                Math.round(this.x2 / roundTo) * roundTo,
                Math.round(this.y2 / roundTo) * roundTo);
    },
    
    /**
     * Returns a shrinked (or enlarged) version of this rectangle.
     * @param {Number} thickness the amount to shrink; pass a negative number
     * to enlarge instead of shrinking
     * @returns {Webgram.Geometry.Rectangle} the shrinked rectangle
     */
    getShrinked: function (thickness) {
        return new Webgram.Geometry.Rectangle(this.x1 + thickness, this.y1 + thickness, this.x2 - thickness, this.y2 - thickness);
    },
    
    /**
     * Creates an identical copy of this rectangle.
     * @returns {Webgram.Geometry.Rectangle} the clone of this rectangle
     */
    clone: function () {
        return new Webgram.Geometry.Rectangle(this.x1, this.y1, this.x2, this.y2);
    },

    /**
     * Tells whether two rectangles are equal or not.
     * The comparison is made between this rectangle and the
     * one given as argument.
     * @param {Webgram.Geometry.Rectangle} rectangle the other rectangle
     * @returns {Boolean} <tt>true</tt> if the two rectangles are equal, <tt>false</tt> otherwise
     */
    equals: function (rectangle) {
        if (rectangle == null) {
            return false;
        }
        
        return (rectangle.x1 === this.x1 && rectangle.y1 === this.y1 && 
                rectangle.x2 === this.x2 && rectangle.y2 === this.y2);
    }
};

Webgram.Class('Webgram.Geometry.Rectangle');


/**
 * @class A class that represents a polygonal geometric object.
 * @param {Array} points a list of points that this poly will be made of
 */
Webgram.Geometry.Poly = function (points) {
    /**
     * The points that this poly is made of.
     * @type Array
     */
    this.points = [];
    
    if (points) {
        this.points = points;
    }
};

Webgram.Geometry.Poly.prototype = {
    /**
     * Determines whether a given point is inside this poly or not.
     * @param {Webgram.Geometry.Poly} point the point to test
     * @returns {Boolean} <tt>true</tt> if the point is inside, <tt>false</tt> otherwise
     */
    pointInside: function (point) {
        var inside = false;
    
        for (var i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
            if (((this.points[i].y >= point.y) !== (this.points[j].y >= point.y)) &&
                (point.x <= (this.points[j].x - this.points[i].x) * (point.y - this.points[i].y) / (this.points[j].y - this.points[i].y) + this.points[i].x)) {
                inside = !inside;
            }
        }
    
        return inside;
    },
    
    /**
     * Returns the center (centroid) of this poly.
     * @returns {Webgram.Geometry.Point} the centroid of the poly
     */
    getCenter: function () {
        var cx = 0;
        var cy = 0;
        
        for (var i = 0; i < this.points.length; i++) {
            cx += this.points[i].x;
            cy += this.points[i].y;
        }
        
        return new Webgram.Geometry.Point(cx / this.points.length, cy / this.points.length);
    },
    
    /**
     * Returns a translated version of this poly. 
     * @param dx the amount to translate on the x axis
     * @param dy the amount to translate on the y axis
     * @returns {Webgram.Geometry.Poly} the translated poly
     */
    getTranslated: function (dx, dy) {
        var newPoints = [];
        for (var i = 0; i < this.points.length; i++) {
            newPoints.push(this.points[i].getTranslated(dx, dy));
        }
        
        return new Webgram.Geometry.Poly(newPoints);
    },
    
    /**
     * Returns a rotated version of this poly.
     * @param {Number} angle the angle of rotation
     * @param {Webgram.Geometry.Point} center the rotation center;
     *  pas <tt>null</tt> or <tt>undefined</tt> to rotate
     *  around the origin
     * @returns {Webgram.Geometry.Poly} the rotated poly
     */
    getRotated: function (angle, center) {
        var newPoints = [];
        for (var i = 0; i < this.points.length; i++) {
            newPoints.push(this.points[i].getRotated(angle, center));
        }
        
        return new Webgram.Geometry.Poly(newPoints);
    },
    
    /**
     * Returns a scaled version of this poly.
     * @param {Number} sx the x scaling factor
     * @param {Number} sy the y scaling factor
     * @returns {Webgram.Geometry.Poly} the scaled poly
     */
    getScaled: function (sx, sy) {
        var newPoints = [];
        for (var i = 0; i < this.points.length; i++) {
            newPoints.push(this.points[i].getScaled(sx, sy));
        }
        
        return new Webgram.Geometry.Poly(newPoints);
    },
    
    /**
     * Computes the smallest rectangle that includes all the points of this poly.
     * @returns {Webgram.Geometry.Rectangle} the bounding rectangle
     */
    getBoundingRectangle: function () {
        if (!this.points.length) {
            return new Webgram.Geometry.Rectangle(0, 0, 0, 0);
        }
        
        var x1 = this.points[0].x;
        var y1 = this.points[0].y;
        var x2 = this.points[0].x;
        var y2 = this.points[0].y;
        
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            if (point.x < x1) {
                x1 = point.x;
            }
            if (point.x > x2) {
                x2 = point.x;
            }
            if (point.y < y1) {
                y1 = point.y;
            }
            if (point.y > y2) {
                y2 = point.y;
            }
        }
        
        return new Webgram.Geometry.Rectangle(x1, y1, x2, y2);
    },
    
    /**
     * Returns a version of this poly with rounded coordinates.
     * @param {Number} roundTo the number to round to, defaults to <tt>1</tt>
     * @returns {Webgram.Geometry.Poly} the poly with rounded coordinates
     */
    round: function (roundTo) {
        var newPoints = [];
        for (var i = 0; i < this.points.length; i++) {
            newPoints.push(this.points[i].round(roundTo));
        }
        
        return new Webgram.Geometry.Poly(newPoints);
    },
    
    /**
     * Creates an identical copy of this poly.
     * @returns {Webgram.Geometry.Poly} the clone of this poly
     */
    clone: function () {
        var newPoints = [];
        for (var i = 0; i < this.points.length; i++) {
            newPoints.push(this.points[i].clone());
        }
        
        return new Webgram.Geometry.Poly(newPoints);
    },
    
    /**
     * Tells whether two polys are equal or not.
     * The comparison is made between this poly and the
     * one given as argument.
     * @param {Webgram.Geometry.Poly} poly the other poly
     * @returns {Boolean} <tt>true</tt> if the two polys are equal, <tt>false</tt> otherwise
     */
    equals: function (poly) {
        if (this.points.length !== poly.points.length) {
            return false;
        }
        
        for (var i = 0; i < this.points.length; i++) {
            if (!this.points[i].equals(poly.points[i])) {
                return false;
            }
        }
        
        return true;
    }
};

Webgram.Class('Webgram.Geometry.Poly');

