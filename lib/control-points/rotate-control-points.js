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


Webgram.ControlPoints.RotateControlPoint = Webgram.ControlPoint.extend( /** @lends Webgram.ControlPoints.RotateControlPoint.prototype */ {
    /**
     * A control point that enables an interactive rotation of drawing elements.
     * @constructs Webgram.ControlPoints.RotateControlPoint
     * @extends Webgram.ControlPoint
     */
    initialize: function RotateControlPoint() {
        this.callSuper();
        
        this.onBeginMove.bind(function () {
            this.origin = this.drawingElement.transformDirect(this.drawingElement.getRotationCenter());
            
            var angleToLocation = Webgram.Geometry.normalizeAngle(this.origin.getAngleTo(this.drawingElement.getLocation()));
            var angleToPoint = Webgram.Geometry.normalizeAngle(this.origin.getAngleTo(this.getAnchor()));
            
            this.angleOffset = angleToLocation - angleToPoint + this.drawingElement.getRotationAngle();
            this.initialDistance = this.origin.getDistanceTo(this.drawingElement.getLocation());
            this.initialAngleToPoint = angleToPoint;
            this.initialRotationAngle = this.drawingElement.getRotationAngle();
        });
    },

    draw: function () {
        var image = this.getImageStore().get('rotate');

        if (!image) {
            return;
        }
        
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
    },

    getCursor: function () {
        return 'pointer';
    },

    computeAnchor: function () {
        var de = this.drawingElement;
        var rect = de.getBoundingRectangle();
        var anchor = rect.getTop();
        if (this.drawingElement.isFlippedVertically()) {
            anchor = anchor.getScaled(1, -1);
        }
        
        return anchor;
    },
    
    getOffsets: function () {
        if (this.drawingElement.isFlippedVertically()) {
            return {x: 0, y: 30};
        }
        else {
            return {x: 0, y: -30};
        }
    },

    processMove: function (point, vanillaPoint) {
        var alpha = this.origin.getAngleTo(vanillaPoint);
        alpha = Webgram.Geometry.normalizeAngle(alpha);
        
        var newLocation = this.origin.getPointAt(this.initialDistance, alpha + this.angleOffset - this.initialRotationAngle);
        var location = this.drawingElement.getLocation();
        var deltaX = newLocation.x - location.x;
        var deltaY = newLocation.y - location.y;
        
        this.drawingElement._setLocation(this.drawingElement.getLocation().getTranslated(deltaX, deltaY), false);
        
        var angle = alpha - this.initialAngleToPoint + this.initialRotationAngle;
        this.drawingElement._setRotationAngle(angle, true);
    }
});


Webgram.ControlPoints.RotationCenterControlPoint = Webgram.ControlPoint.extend( /** @lends Webgram.ControlPoints.RotationCenterControlPoint.prototype */ {
    /**
     * A control point that enables moving the <em>rotation center</em>
     * when doing an interactive rotation of a drawing element.
     * @constructs Webgram.ControlPoints.RotationCenterControlPoint
     * @extends Webgram.ControlPoint
     */
    initialize: function RotationCenterControlPoint() {
        this.callSuper();
        
        this.radius = 15;
    },

    draw: function () {
        var image = this.getImageStore().get('rotation-center');
        if (!image) {
            return;
        }
        
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
        
    },
    
    getCursor: function () {
        return 'pointer';
    },
    
    computeAnchor: function () {
        return this.drawingElement.getRotationCenter();
    },
    
    processMove: function (point) {
        this.drawingElement._setRotationCenter(point, true);
    }
});
