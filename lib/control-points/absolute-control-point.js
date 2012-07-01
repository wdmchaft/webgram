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


Webgram.Namespace('Webgram.ControlPoints');

/**
 * @class A control point that controls a simple point.
 * @extends Webgram.ControlPoint
 * @param {Webgram.Geometry.Point} point the point to control
 */
Webgram.ControlPoints.SimpleControlPoint = function (point) {
    /**
     * The point controlled by this control point.
     * @type Webgram.Geometry.Point
     */
    this.point = point;

    Webgram.ControlPoint.call(this);
};

Webgram.ControlPoints.SimpleControlPoint.prototype = {
    getCursor: function () {
        return 'pointer';
    },
    
    computeAnchor: function () {
        return this.point;
    },
    
    processMove: function (point, vanillaPoint) {
        this.point.x = point.x;
        this.point.y = point.y;
    }
};

Webgram.Class('Webgram.ControlPoints.SimpleControlPoint', Webgram.ControlPoint);
