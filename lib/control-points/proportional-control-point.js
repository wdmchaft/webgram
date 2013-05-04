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


Webgram.ControlPoints.ProportionalControlPoint = Webgram.ControlPoint.extend( /** @lends Webgram.ControlPoints.ProportionalControlPoint.prototype */ {
    /**
     * A control point that controls a <em>proportional point</em>.
     * A proportional point is a point that preserves its relative position
     * when the drawing element changes its size. Proportional points are added
     * with {@link Webgram.DrawingElement#addProportionalPoint}.
     * @constructs Webgram.ControlPoints.ProportionalControlPoint
     * @extends Webgram.ControlPoint
     * @param {Webgram.Geometry.Point} point the proportional point to be controlled
     */
    initialize: function ProportionalControlPoint(point) {
        /**
         * The point controlled by this control point.
         * @type Webgram.Geometry.Point
         */
        this.point = point;

        this.callSuper();
    },

    getCursor: function () {
        return 'pointer';
    },
    
    computeAnchor: function () {
        return this.point;
    },
    
    processMove: function (point, vanillaPoint) {
        var index = this.drawingElement._getProportionalPointIndex(this.point);
        var proportionalPoint = this.drawingElement._proportionalPoints[index];
        
        this.point.x = point.x;
        this.point.y = point.y;
        
        this.drawingElement.saveProportionalPoint(this.point);
        
        if (proportionalPoint.onChange != null) {
            proportionalPoint.onChange.call(this.drawingElement, this.point);
        }
    }
});
