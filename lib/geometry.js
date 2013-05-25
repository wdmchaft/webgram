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
 * A namespace containing basic geometry classes and functions.
 * @namespace
 */
Webgram.Geometry = {
    /**
     * Normalizes an angle by translating it into the range 0..2 PI.
     * @param {Number} angle the angle to normalize
     * @returns {Number} the normalized angle, between 0 and 2 PI
     */
    normalizeAngle: function (angle) {
        /* transform the angle to degrees and then back to radians */
        angle = Math.round(angle * 180 * 10 / Math.PI) / 10;
        
        while (angle < 0) {
            angle = 2 * 180 + angle;
        }
        
        angle = angle % 360;
        angle = angle * Math.PI / 180;
        
        return angle;
    },

    /**
     * Snaps the given angle to multiples of a <tt>snapAngle</tt>.
     * @param {Number} angle the angle to snap
     * @param {Number} snapAngle the angle whose multiples will be used to snap
     * @param {Number} threshold the maximal distance beyond which the angle will not be snapped
     * @returns {Number} the snapped angle, or <tt>null</tt> if no snapping was performed
     */
    getSnappedAngle: function (angle, snapAngle, threshold) {
        angle = Webgram.Geometry.normalizeAngle(angle);
        
        /* transform everything to degrees */
        snapAngle = snapAngle * 180 / Math.PI;
        angle = angle * 180 / Math.PI;
        threshold = threshold * 180 / Math.PI;
        
        var div = Math.floor(angle / snapAngle);
        var mod = angle % snapAngle;
        
        if (mod < threshold / 2) { /* close to the smaller snapping angle */
            angle = snapAngle * div;
        }
        else if (snapAngle - mod < threshold / 2) { /* close to the higher snapping angle */
            angle = snapAngle * (div + 1);
        }
        else {
            return null; /* no snapping has been performed */
        }
        
        /* transform it back to radians */
        angle = angle * Math.PI / 180;
        
        return Webgram.Geometry.normalizeAngle(angle);
    },

    /**
     * Determines whether an angle is a multiple of a value.
     * The comparison is made using a small threshold.
     * @param {Number} angle the angle to test
     * @param {Number} to the value whose multiples are to be considered
     * @returns {Boolean} <tt>true</tt> if the angle is a multiple of the given angle, <tt>false</tt> otherwise
     */
    angleMultipleOf: function (angle, to) {
        var value = angle / to;
        return Math.abs(value - Math.round(value)) < 0.0001;
    },

    /**
     * Determines whether a point is inside (over) a given segment or not.
     * The segment is formed by two points and has a <tt>thickness</tt>.
     * @param {Webgram.Geometry.Point} point point to test
     * @param {Webgram.Geometry.Point} point1 the first point of the segment
     * @param {Webgram.Geometry.Point} point2 the second point of the segment
     * @param {Number} thickness the thickness of the segment
     * @returns {Boolean} <tt>true</tt> if the point is inside the segment, <tt>false</tt> otherwise
     */
    pointInSegment: function (point, point1, point2, thickness) {
        var angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
        var centerX = (point1.x + point2.x) / 2;
        var centerY = (point1.y + point2.y) / 2;
        
        angle = -angle; /* reverse rotation */
        
        var sine = Math.sin(angle);
        var cosine = Math.cos(angle);
        
        var rotatedX = centerX + (point.x - centerX) * cosine - (point.y - centerY) * sine;
        var rotatedY = centerY + (point.y - centerY) * cosine + (point.x - centerX) * sine;
    
        var rotatedX1 = centerX + (point1.x - centerX) * cosine - (point1.y - centerY) * sine;
        var rotatedY1 = centerY + (point1.y - centerY) * cosine + (point1.x - centerX) * sine;
    
        var rotatedX2 = centerX + (point2.x - centerX) * cosine - (point2.y - centerY) * sine;
        
        return (rotatedX >= Math.min(rotatedX1, rotatedX2)) && (rotatedX <= Math.max(rotatedX1, rotatedX2)) && 
            (rotatedY >= rotatedY1 - thickness) && (rotatedY <= rotatedY1 + thickness);
    },
    
    /**
     * Determines whether a point is inside (over) a bezier curve or not.
     * The bezier curve is given by two end points, two control points and
     * a certain <tt>thickness</tt>.
     * @param {Webgram.Geometry.Point} point to test
     * @param {Webgram.Geometry.Point} point1 the first end point of the bezier curve
     * @param {Webgram.Geometry.Point} point2 the second end point of the bezier curve
     * @param {Webgram.Geometry.Point} controlPoint1 the first control point of the bezier curve
     * @param {Webgram.Geometry.Point} controlPoint2 the second control point of the bezier curve
     * @param {Number} thickness the thickness of the bezier curve
     * @returns {Boolean} <tt>true</tt> if the point is inside the bezier curve, <tt>false</tt> otherwise
     */
    pointInBezier: function (point, point1, point2, controlPoint1, controlPoint2, thickness) {
        /* what we actually do here is to follow a bezier path,
         * with a very coarse resolution; for every point so found,
         * we check if the given point is within a small radial area */
        
        var distance = point1.getDistanceTo(point2);
        var step, radius, x, y;
        if (controlPoint2 != null) { /* cubic */
            distance += (point1.getDistanceTo(controlPoint1) + 
                    controlPoint1.getDistanceTo(controlPoint2) +
                    controlPoint2.getDistanceTo(point2)) / 6;

            step = 5 / distance;
            radius = thickness * 2;
            
            for (var t = 0; t < 1; t += step) {
                x = 
                    Math.pow(1 - t, 3) * point1.x +
                    3 * Math.pow(1 - t, 2) * t * controlPoint1.x + 
                    3 * (1 - t) * t * t * controlPoint2.x + 
                    Math.pow(t, 3) * point2.x;
                
                y = 
                    Math.pow(1 - t, 3) * point1.y +
                    3 * Math.pow(1 - t, 2) * t * controlPoint1.y + 
                    3 * (1 - t) * t * t * controlPoint2.y + 
                    Math.pow(t, 3) * point2.y;
                
                if (point.getDistanceTo(new Webgram.Geometry.Point(x, y)) < radius) {
                    return true;
                }
            }
            
            return false;
        }
        else { /* quadratic */
            distance += (point1.getDistanceTo(controlPoint1) + 
                    controlPoint1.getDistanceTo(point2)) / 4;
            
            step = 5 / distance;
            radius = thickness * 2;
            
            for (var t = 0; t < 1; t += step) {
                x = 
                    Math.pow(1 - t, 2) * point1.x +
                    2 * (1 - t) * t * controlPoint1.x + 
                    Math.pow(t, 2) * point2.x;
                
                y = 
                    Math.pow(1 - t, 2) * point1.y +
                    2 * (1 - t) * t * controlPoint1.y + 
                    Math.pow(t, 2) * point2.y;
                
                if (point.getDistanceTo(new Webgram.Geometry.Point(x, y)) < radius) {
                    return true;
                }
            }
            
            return false;
        }
    }
};


Webgram.Geometry.Point = Webgram.Class.extend( /** @lends Webgram.Geometry.Point.prototype */ {
    /**
     * A class representing a point in the two-dimensional space.
     * @constructs Webgram.Geometry.Point
	 * @param {Number} x the x coordinate
	 * @param {Number} y the y coordinate
	 */
	initialize: function Point(x, y) {
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
	},

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
     * @param {Webgram.Geometry.Point} center the rotation center
     *  pass <tt>null</tt> or <tt>undefined</tt> to rotate
     *  around the origin
     * @returns {Webgram.Geometry.Point} the rotated point
     */
    getRotated: function (angle, center) {
        if (angle === 0) {
            return this.clone();
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
},

/** @lends Webgram.Geometry.Point */ {
	/**
	 * Returns a point with both coordinates set to <tt>0</tt>
	 * @returns {Webgram.Geometry.Point} the <em>zero</em> point
	 */
	zero: function () {
		return new Webgram.Geometry.Point(0, 0);
	}
});
	

Webgram.Geometry.Size = Webgram.Class.extend( /** @lends Webgram.Geometry.Size.prototype */ {
    /**
     * A class that represents a size in the 2D space,
     * @constructs Webgram.Geometry.Size
     * by encapsulating a <em>width</em> and a <em>height</em>.
     * @param {Number} width the width of the size object
     * @param {Number} height the height of the size object
     */
    initialize: function Size(width, height) {
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
	},

    /**
     * Returns a rotated version of this size.
     * @param {Number} angle the angle of rotation
     * @param {Webgram.Geometry.Point} center the rotation center
     *  pass <tt>null</tt> or <tt>undefined</tt> to rotate
     *  around the origin
     * @returns {Webgram.Geometry.Point} the rotated size
     */
    getRotated: function (angle, center) {
        if (angle === 0) {
            return this.clone();
        }
        
        if (!center) {
            center = new Webgram.Geometry.Point(0, 0);
        }
        
        var sine = Math.sin(angle);
        var cosine = Math.cos(angle);
        
        var width = center.x + (this.width - center.x) * cosine - (this.height - center.y) * sine;
        var height = center.y + (this.height - center.y) * cosine + (this.width - center.x) * sine;
        
        return new Webgram.Geometry.Size(width, height);
    },
    
    /**
     * Returns a scaled version of this size.
     * @param {Number} sx the x scaling factor
     * @param {Number} sy the y scaling factor
     * @returns {Webgram.Geometry.Size} the scaled size
     */
    getScaled: function (sx, sy) {
        return new Webgram.Geometry.Size(this.width * sx, this.height * sy);
    },
    
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
});


Webgram.Geometry.Line = Webgram.Class.extend( /** @lends Webgram.Geometry.Line.prototype */ {
    /**
     * A class representing a line in the two-dimensional space.
     * @constructs Webgram.Geometry.Line
     * @param {Number} slope the slope of the line, set to <tt>Infinity</tt>
     * for a vertical line
     * @param {Number} intercept the vertical intercept of the line, or the
     * horizontal intercept for a vertical line
     */
    initialize: function Line(slope, intercept) {
	    /**
	     * The slope of the line; for a vertical line,
	     * this is set to <tt>Infinity</tt>.
	     * @type Number
	     */
	    this.slope = slope;
	
	    /**
	     * The vertical intercept of the line; for a vertical line,
	     * this represents the horizontal intercept.
	     * @type Number
	     */
	    this.intercept = intercept;
	},

    /**
     * Returns a translated version of this line. 
     * @param {Number} dx the amount to translate on the x axis
     * @param {Number} dy the amount to translate on the y axis
     * @returns {Webgram.Geometry.Line} the translated line
     */
    getTranslated: function (dx, dy) {
        if (isFinite(this.slope)) {
            return new Webgram.Geometry.Line(
                    this.slope,
                    this.intercept + dy - dx * this.slope);
        }
        else { /* vertical line */
            return new Webgram.Geometry.Line(
                    this.slope,
                    this.intercept + dx);
        }
    },
    
    /**
     * Returns a rotated version of this line.
     * @param {Number} angle the angle of rotation
     * @param {Webgram.Geometry.Point} center the rotation center
     *  pass <tt>null</tt> or <tt>undefined</tt> to rotate
     *  around the origin
     * @returns {Webgram.Geometry.Line} the rotated line
     */
    getRotated: function (angle, center) {
        if (angle === 0) {
            return this.clone();
        }
        
        if (!center) {
            center = new Webgram.Geometry.Point(0, 0);
        }
        
        /* make the center the origin */
        var line = this.getTranslated(-center.x, -center.y);

        /* compute the gamma and the normal distance
         * of the original line */
        var thisGamma, dist;
        if (!isFinite(line.slope)) {
            if (line.intercept >= 0) {
                thisGamma = 0;
            }
            else {
                thisGamma = Math.PI;
            }
            
            dist = Math.abs(line.intercept);
        }
        else { /* oblique line */
            var thisAlpha = Math.atan(line.slope);
            if (line.slope * line.intercept >= 0) {
                thisGamma = thisAlpha + Math.PI / 2;
            }
            else {
                thisGamma = thisAlpha - Math.PI / 2;
            }
            
            dist = line.intercept * Math.sin(thisGamma);
        }
        
        var gamma = Webgram.Geometry.normalizeAngle(thisGamma + angle);
        var intercept, slope;
        
        if (gamma === 0) {
            /* vertical line, positive horizontal intercept */
            intercept = dist;
            slope = Infinity;
        }
        else if (Math.abs(gamma) === Math.PI) {
            /* vertical line, negative horizontal intercept */
            intercept = -dist;
            slope = Infinity;
        }
        else {
            /* oblique line */
            intercept = dist / Math.sin(gamma);
            var alpha;
            if ((intercept >= 0) === (gamma <= Math.PI)) {
                alpha = gamma - Math.PI / 2;
            }
            else {
                alpha = gamma + Math.PI / 2;
            }
            
            slope = Math.tan(alpha);
        }
        
        /* create the rotated line */
        line = new Webgram.Geometry.Line(slope, intercept);
        
        /* restore the origin */
        line = line.getTranslated(center.x, center.y);
        
        return line;
    },
    
    /**
     * Returns a scaled version of this line.
     * @param {Number} sx the x scaling factor
     * @param {Number} sy the y scaling factor
     * @returns {Webgram.Geometry.Line} the scaled line
     */
    getScaled: function (sx, sy) {
        if (isFinite(this.slope)) {
            return new Webgram.Geometry.Line(
                    this.slope * sy / sx,
                    this.intercept * sy);
        }
        else { /* vertical line */
            return new Webgram.Geometry.Line(
                this.slope,
                this.intercept * sx);
        }
    },
    
    /**
     * Tells whether the line is a vertical line or not.
     * A vertical line has an infinite <tt>slope</tt> and
     * the <tt>intercept</tt> represents the horizontal offset.
     * @returns {Boolean} <tt>true</tt> if the line is vertical,
     * <tt>false</tt> otherwise
     */
    isVertical: function () {
        return !isFinite(this.slope);
    },
    
    /**
     * Tells whether the line is a horizontal line or not.
     * A horizontal line has <tt>slope</tt> of <tt>0</tt> and
     * the <tt>intercept</tt> represents the vertical offset.
     * @returns {Boolean} <tt>true</tt> if the line is horizontal,
     * <tt>false</tt> otherwise
     */
    isHorizontal: function () {
        return this.slope === 0;
    },
    
    /**
     * Computes the <tt>x</tt> coordinate of the point that is on the line
     * and has the given <tt>y</tt> coordinate. For a horizontal line,
     * the returned value is <tt>NaN</tt>.
     * @param {Number} y the y coordinate of the point
     * @returns {Number} the x coordinate of the point
     */
    getX: function (y) {
        if (isFinite(this.slope)) {
            if (this.slope === 0) {
                return NaN;
            }
            else {
                return (y - this.intercept) / this.slope;
            }
        }
        else { /* vertical line */
            return this.intercept;
        }
    },
    
    /**
     * Computes the <tt>y</tt> coordinate of the point that is on the line
     * and has the given <tt>x</tt> coordinate. For a vertical line,
     * the returned value is <tt>NaN</tt>.
     * @param {Number} x the x coordinate of the point
     * @returns {Number} the y coordinate of the point
     */
    getY: function (x) {
        if (isFinite(this.slope)) {
            return this.slope * x + this.intercept;
        }
        else { /* vertical line */
            return NaN;
        }
    },
    
    // TODO jsdoc
    getPointByX: function (x) {
        var y = this.getY(x);
        if (isNaN(y)) {
            return null;
        }
        
        return new Webgram.Geometry.Point(x, y);
    },
    
    // TODO jsdoc
    getPointByY: function (y) {
        var x = this.getX(y);
        if (isNaN(x)) {
            return null;
        }
        
        return new Webgram.Geometry.Point(x, y);
    },
    
    /**
     * Computes the projection of a point on this line.
     * @param {Webgram.Geometry.Point} point the point to project
     * @returns {Webgram.Geometry.Point} the point's projection
     */
    projectPoint: function (point) {
        var x, y;
        if (this.isHorizontal()) {
            y = this.intercept;
            x = point.x;
        }
        else if (this.isVertical()) {
            x = this.intercept;
            y = point.y;
        }
        else {
            x = (point.y - this.intercept + point.x / this.slope ) / (this.slope + 1 / this.slope);
            y = this.intercept + this.slope * x;
        }
        
        return new Webgram.Geometry.Point(x, y);
    },
    
    /**
     * Computes the intersection point of this line with another line.
     * @param {Webgram.Geometry.Line} line the line to intersect with
     * @returns {Webgram.Geometry.Point} the intersection point
     * or <tt>null</tt> if the lines do not intersect (in a single point)
     */
    intersectLine: function (line) {
        if (this.equals(line)) {
            /* two equal lines don't intersect in a point */
            
            return null;
        }
        
        if (this.isVertical()) {
            if (line.isVertical()) {
                /* both lines are vertical, no intersection */
                
                return null;
            }
            else if (line.isHorizontal()) {
                /* vertical and horizontal */
                
                return new Webgram.Geometry.Point(this.intercept, line.intercept);
            }
            else {
                /* vertical and oblique */
                
                return new Webgram.Geometry.Point(this.intercept, line.getY(this.intercept));
            }
        }
        else if (this.isHorizontal()) {
            if (line.isVertical()) {
                /* horizontal and vertical */
                
                return new Webgram.Geometry.Point(line.intercept, this.intercept);
            }
            else if (line.isHorizontal()) {
                /* both lines are horizontal, no intersection */
                
                return null;
            }
            else {
                /* horizontal and oblique */
                
                return new Webgram.Geometry.Point(line.getX(this.intercept), this.intercept);
            }
        }
        else {
            /* both lines are oblique */
            
            var x = (this.intercept - line.intercept) / (line.slope - this.slope);
            var y = this.slope * x + this.intercept;
            
            return new Webgram.Geometry.Point(x, y);
        }
    },
    
    /**
     * Returns a version of this line with rounded coordinates.
     * @param {Number} roundTo the number to round to, defaults to <tt>1</tt>
     * @returns {Webgram.Geometry.Line} the line with rounded coordinates
     */
    round: function (roundTo) {
        if (!roundTo) {
            roundTo = 1;
        }
        
        return new Webgram.Geometry.Line(Math.round(this.slope / roundTo) * roundTo, Math.round(this.intercept / roundTo) * roundTo);
    },
    
    /**
     * Creates an identical copy of this line.
     * @returns {Webgram.Geometry.Line} the clone of this line
     */
    clone: function () {
        return new Webgram.Geometry.Line(this.slope, this.intercept);
    },

    /**
     * Tells whether two lines are equal or not.
     * The comparison is made between this line and the
     * one given as argument.
     * @param {Webgram.Geometry.Line} line the other line
     * @returns {Boolean} <tt>true</tt> if the two lines are equal, <tt>false</tt> otherwise
     */
    equals: function (line) {
        if (line == null) {
            return false;
        }
        
        return (line.slope === this.slope && line.intercept === this.intercept);
    }
},

/** @lends Webgram.Geometry.Line */ {
    /**
     * Constructs a line from two points.
     * @param {Webgram.Geometry.Point} point1 the first point that forms the line
     * @param {Webgram.Geometry.Point} point2 the second point that forms the line
     * @returns Webgram.Geometry.Line the line formed by the two points 
     */
    fromPoints: function (point1, point2) {
        if (point1.x === point2.x) { /* vertical line */
            return new Webgram.Geometry.Line(Infinity, point1.x);
        }
        else if (point1.y === point2.y) { /* horizontal line */
            return new Webgram.Geometry.Line(Infinity, point1.y);
        }
        else {
            var slope = (point2.y - point1.y) / (point2.x - point1.x);
            var intercept = point1.y - point1.x * slope;
            
            return new Webgram.Geometry.Line(slope, intercept);
        }
    }
});
	

Webgram.Geometry.Rectangle = Webgram.Class.extend( /** @lends Webgram.Geometry.Rectangle.prototype */ {
    /**
     * A class that represents a rectangular region.
     * @constructs Webgram.Geometry.Rectangle
     * @param {Number} x1 the left coordinate of the rectangle
     * @param {Number} y1 the top coordinate of the rectangle
     * @param {Number} x2 the right coordinate of the rectangle
     * @param {Number} y2 the bottom coordinate of the rectangle
     */
    initialize: function Rectangle(x1, y1, x2, y2) {
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
	},
	
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
     * Returns the <em>top-center</em> point of this rectangle.
     * @returns {Webgram.Geometry.Point} the top-center point of this rectangle
     */
    getTop: function () {
        return new Webgram.Geometry.Point((this.x1 + this.x2) / 2, this.y1);
    },

    /**
     * Returns the <em>bottom-center</em> point of this rectangle.
     * @returns {Webgram.Geometry.Point} the bottom-center point of this rectangle
     */
    getBottom: function () {
        return new Webgram.Geometry.Point((this.x1 + this.x2) / 2, this.y2);
    },

    /**
     * Returns the <em>center-left</em> point of this rectangle.
     * @returns {Webgram.Geometry.Point} the center-left point of this rectangle
     */
    getLeft: function () {
        return new Webgram.Geometry.Point(this.x1, (this.y1 + this.y2) / 2);
    },

    /**
     * Returns the <em>center-right</em> point of this rectangle.
     * @returns {Webgram.Geometry.Point} the center-right point of this rectangle
     */
    getRight: function () {
        return new Webgram.Geometry.Point(this.x2, (this.y1 + this.y2) / 2);
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
     * Returns a shrunk (or enlarged) version of this rectangle.
     * @param {Number} thickness the amount to shrink; pass a negative number
     * to enlarge instead of shrinking
     * @returns {Webgram.Geometry.Rectangle} the shrunk rectangle
     */
    getShrunk: function (thickness) {
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
});


Webgram.Geometry.Poly = Webgram.Class.extend( /** @lends Webgram.Geometry.Poly.prototype */ {
    /**
     * A class that represents a polygonal geometric object.
     * @constructs Webgram.Geometry.Poly
     * @param {Array} points a list of points that this poly will be made of
     */
    initialize: function Poly(points) {
        /**
         * The points that this poly is made of.
         * @type Array
         */
        this.points = [];
        
        if (points) {
            this.points = points;
        }
    },	    
    
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
     * @param {Webgram.Geometry.Point} center the rotation center
     *  pass <tt>null</tt> or <tt>undefined</tt> to rotate
     *  around the origin
     * @returns {Webgram.Geometry.Poly} the rotated poly
     */
    getRotated: function (angle, center) {
        if (angle === 0) {
            return this.clone();
        }
        
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
});
