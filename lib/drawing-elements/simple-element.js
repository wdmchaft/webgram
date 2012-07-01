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
 * @namespace Contains concrete base classes for the common types of drawing elements.
 */
Webgram.DrawingElements = Webgram.Namespace('Webgram.DrawingElements');

/**
 * @class A concrete base class for elements that are formed around a central point.
 * @extends Webgram.DrawingElement
 * @param {String} id a given identifier, can be <tt>null</tt>
 * @param {Webgram.Geometry.Point} center the central point of the element
 */
Webgram.DrawingElements.SimpleElement = function (id, center) {
    if (center == null) {
        center = Webgram.Geometry.Point.zero();
    }
    
    Webgram.DrawingElement.call(this, id, center);
};

Webgram.DrawingElements.SimpleElement.prototype = {
    getDecorationRectangle: function () {
        /* could be overridden */
        
        return new Webgram.Geometry.Poly(this.getPoints()).getBoundingRectangle();
    },

    getBoundingRectangle: function () {
        /* could be overridden */
        
        return this.transformDirect(new Webgram.Geometry.Poly(this.getPoints())).getBoundingRectangle();
    },
    
    getWidth: function () {
        /* could be overridden */
        
        return new Webgram.Geometry.Poly(this.getPoints()).getBoundingRectangle().getWidth();
    },
    
    getHeight: function () {
        /* could be overridden */
        
        return new Webgram.Geometry.Poly(this.getPoints()).getBoundingRectangle().getHeight();
    },
    
    getSnappingPoints: function () {
        /* could be overridden */
        
        var points = new Webgram.Geometry.Poly(this.getPoints().concat(Webgram.Geometry.Point.zero()));
        
        return this.transformDirect(points).points;
    },
    
    pointInside: function (point) {
        /* could be overridden */
        
        return this.transformDirect(new Webgram.Geometry.Poly(this.getPoints())).pointInside(point);
    },
    
    beginCreate: function (point) {
        this.setCenter(point);

        return true; /* accept creation */
    },
    
    continueCreate: function (point, size, mouseDown, click) {
        return false; /* stop */
    },
    
    endCreate: function () {
        return true; /* succeeded */
    },
    
    shapeToJson: function () {
        var center = this.getCenter();
        
        return {
            x: center.x,
            y: center.y
        };
    },

    shapeFromJson: function (json) {
        var point = new Webgram.Geometry.Point(json.x, json.y);
        
        this.setCenter(point);
        this.invalidateBaseRectangle();
    },
    
    /**
     * Moves the center of the element a given point.
     * @param {Webgram.Geometry.Point} center the new center
     */
    setCenter: function (center) {
        this.setRotatedShapePoint(0, center);
        
        if (this.rotationCenterControlPoint) {
            this.rotationCenterControlPoint.reset();
        }
    },
    
    /**
     * Returns the current center of the element.
     * @return {Webgram.Geometry.Point} the current center of the element
     */
    getCenter: function () {
        return this.shape.points[0];
    },
    
    /**
     * Returns a list of points that make up the effective shape of this element.
     * The points are relative to this element.<br><br>
     * <em>(should be overridden)</em>
     * @returns {Array} a list of {Webgram.Geometry.Point}
     */
    getPoints: function () {
        /* should be overridden */
        
        return [Webgram.Geometry.Point.zero()];
    }
}; 

Webgram.Class('Webgram.DrawingElements.SimpleElement', Webgram.DrawingElement);
