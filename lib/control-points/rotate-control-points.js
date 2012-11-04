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
 * @class A control point that enables an interactive rotation of drawing elements.
 * @extends Webgram.ControlPoint
 */
Webgram.ControlPoints.RotateControlPoint = function () {
    Webgram.ControlPoint.call(this);
    
    this.radius = 15;
    
    this.onBeginMove.bind(function () {
        this.origin = this.drawingElement.transformDirect(this.drawingElement.rotationCenter);
        
        var angleToCenter = Webgram.Utils.normalizeAngle(this.origin.getAngleTo(this.drawingElement.getCenter()));
        var angleToPoint = Webgram.Utils.normalizeAngle(this.origin.getAngleTo(this.getAnchor()));
        
        this.angleOffset = angleToCenter - angleToPoint + this.drawingElement.getRotationAngle();
        this.initialDistance = this.origin.getDistanceTo(this.drawingElement.getCenter());
        this.initialAngleToPoint = angleToPoint;
        this.initialRotationAngle = this.drawingElement.getRotationAngle();
    });
    
    this.onEndMove.bind(function () {
        this.drawingElement.onEndRotate.trigger();
    });
};

Webgram.ControlPoints.RotateControlPoint.prototype = {
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
        var baseRectangle = this.drawingElement.getBaseRectangle();
        
        var x1 = baseRectangle.x1;
        var x2 = baseRectangle.x2;
        var point = new Webgram.Geometry.Point((x2 + x1) / 2, baseRectangle.y1);
        
        var x = 0;
        var y = -this.drawingElement.getHeight() / 2;
        point = this.drawingElement.transformDirect(new Webgram.Geometry.Point(x, y));
        
        return point;
    },
    
    getOffsets: function () {
        return {x: 0, y: -30};
    },

    processMove: function (point, vanillaPoint) {
        var alpha = this.origin.getAngleTo(vanillaPoint);
        alpha = Webgram.Utils.normalizeAngle(alpha);
        
        var newCenter = this.origin.getPointAt(this.initialDistance, alpha + this.angleOffset - this.initialRotationAngle);
        var center = this.drawingElement.getCenter();
        var deltaX = newCenter.x - center.x;
        var deltaY = newCenter.y - center.y;
        
        this.drawingElement.shape = this.drawingElement.shape.getTranslated(deltaX, deltaY);
        
        var angle = alpha - this.initialAngleToPoint + this.initialRotationAngle;
        this.drawingElement._setRotationAngle(angle);
        
        this.drawingElement.onRotate.trigger(angle);
    }
};

Webgram.Class('Webgram.ControlPoints.RotateControlPoint', Webgram.ControlPoint);


/**
 * @class A control point that enables moving the rotation center
 * when doing an interactive rotation of a drawing element.
 * @extends Webgram.ControlPoint
 */
Webgram.ControlPoints.RotationCenterControlPoint = function () {
    Webgram.ControlPoint.call(this);
    
    this.setSnapToGridEnabled(true);
    this.radius = 12;
    
    this._computedAnchor = null;
};

Webgram.ControlPoints.RotationCenterControlPoint.prototype = {
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
    
    snap: function (point) {
        point = Webgram.ControlPoint.prototype.snap.call(this, point);
        point = this._snapToCenter(point);
        
        return point;
    },
    
    computeAnchor: function () {
        if (!this._computedAnchor) {
            this._computedAnchor = this.drawingElement.transformDirect(this.drawingElement.rotationCenter);
        }
        
        return this._computedAnchor;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformInverse(point);
        
        this.drawingElement.rotationCenter.x = point.x;
        this.drawingElement.rotationCenter.y = point.y;
        
        this._computedAnchor = null;
    },
    
    /**
     * Resets the rotation center of the drawing element to the center.
     */
    reset: function () {
        this.drawingElement.rotationCenter.x = 0;
        this.drawingElement.rotationCenter.y = 0;
        
        this._computedAnchor = null;
    },
    
    _snapToCenter: function (point) {
        /* snap to center */
        var center = this.drawingElement.getCenter();
        if (center.getDistanceTo(point) <= 2 * this.radius) {
            return center;
        }
        
        return point;
    }    
};

Webgram.Class('Webgram.ControlPoints.RotationCenterControlPoint', Webgram.ControlPoint);
