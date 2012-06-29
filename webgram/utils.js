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


Webgram.Namespace('Webgram.Utils', {
    /** @lends Webgram.Utils */
    
    /**
     * Calculates the <tt>cursor</tt> CSS property indicating the direction
     * the closest to the given <tt>angle</tt>.
     * @param {Number} angle the angle
     * @returns {String} the <tt>cursor</tt> CSS property 
     */
    getCursorByAngle: function (angle) {
        var cursors = [
            'e-resize',
            'se-resize',
            's-resize',
            'sw-resize',
            'w-resize',
            'nw-resize',
            'n-resize',
            'ne-resize'
        ];
    
        angle = Webgram.Utils.normalizeAngle(angle);
        
        var index = Math.round(4 / Math.PI * angle);
        
        if (index < 0) {
            index = 8 + index;
        }
        if (index > 7) {
            index = index - 8;
        }
        
        return cursors[index];
    },
    
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
        angle = Webgram.Utils.normalizeAngle(angle);
        
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
        
        return Webgram.Utils.normalizeAngle(angle);
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
     * Determines the position (index) of an object in an array.
     * @param {Array} array the array to search
     * @param {Object} value the object to search for
     * @returns {Number} the position of the object inside the array, or <tt>-1</tt> if not found
     */
    indexOf: function (array, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return i;
            }
        }
        
        return -1;
    }
});
