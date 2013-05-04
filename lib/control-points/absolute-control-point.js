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
 * Contains common control point classes.
 * @namespace
 */
Webgram.ControlPoints = {
};


Webgram.ControlPoints.SimpleControlPoint = Webgram.ControlPoint.extend( /** @lends Webgram.ControlPoints.SimpleControlPoint.prototype */ {
    /**
     * A control point that controls a simple point with absolute coordinates.
     * @constructs Webgram.ControlPoints.SimpleControlPoint
     * @extends Webgram.ControlPoint
     * @param {Webgram.Geometry.Point} point the point to control
     */
    initialize: function SimpleControlPoint(point) {
        /**
         * The point controlled by this control point.
         * @type Webgram.Geometry.Point
         */
        this.point = point;

        this.super();
    },

    getCursor: function () {
        return 'pointer';
    },
    
    computeAnchor: function () {
        return this.drawingElement.transformInverse(this.point);
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
        
        this.point.x = point.x;
        this.point.y = point.y;
    }
});
