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


Webgram.ControlPoints.GradientControlPoint =
        Webgram.ControlPoints.ProportionalControlPoint.extend(/** @lends Webgram.ControlPoints.GradientControlPoint.protorotype */ {
            
    /**
     * A control point that controls a <em>gradient point</em>.
     * @constructs Webgram.ControlPoints.GradientControlPoint
     * @extends Webgram.ControlPoints.ProportionalControlPoint
     * @param {Webgram.Geometry.Point} point the gradient point
     * @param {Webgram.Geometry.Point} siblingPoint the other gradient point
     * @param {Boolean} isFirst <tt>true</tt> if this controls the first gradient point,
     * <tt>false</tt> otherwise
     * @param {Object} either a fill style or a stroke style whose gradient is to be controlled
     */
    initialize: function GradientControlPoint(point, siblingPoint, isFirst, style) {
        this.callSuper(point);
        
        /**
         * The other gradient point.
         * @type Webgram.Geometry.Point
         */
        this.siblingPoint = siblingPoint;
        
        /**
         * <tt>true</tt> if this controls the first gradient point, <tt>false</tt> otherwise.
         * @type Boolean
         */
        this.isFirst = isFirst;
        
        /**
         * Either a fill style or a stroke style whose gradient is controlled by this control point.
         * @type Object
         */
        this.style = style;
        
        this.setSnapToGridEnabled(true);
    },

    draw: function () {
        var gradientPoint = this.proportionalPoint;
        var image;
        if (gradientPoint._radiusPoint1 != null) { /* radial gradient */
            image = this.getImageStore().get('gradient-point');
            if (!image) {
                return;
            }

            this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
            
            var radius = 7;
            this.drawArc(Webgram.Geometry.Point.zero(), radius, radius, 0, 2 * Math.PI);
            
            this.paint(null, Webgram.Styles.createFillStyle({
                'colors': this.style.colors,
                'gradientPoint1': new Webgram.Geometry.Point(0, 0),
                'gradientRadius1': 0,
                'gradientRadius2': radius
            }));

            radius = 15;
            this.drawLine(new Webgram.Geometry.Point(0, -radius), new Webgram.Geometry.Point(0, radius));
            this.paint(this.drawingElement._guidesStyle, null);
            this.drawLine(new Webgram.Geometry.Point(-radius, 0), new Webgram.Geometry.Point(radius, 0));
            this.paint(this.drawingElement._guidesStyle, null);
        }
        else { /* linear gradient */
            image = this.getImageStore().get('gradient-point');
            if (!image) {
                return;
            }

            this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
            
            this.drawArc(Webgram.Geometry.Point.zero(), 7, 7, 0, 2 * Math.PI);
            
            var color;
            if (this.isFirst) {
                color = this.style.colors[0];
            }
            else {
                color = this.style.colors.slice(-1)[0];
            }
            this.paint(null, this._fillStyle.replace({'colors': [color]}));
        }
    },
    
    processMove: function (point, vanillaPoint) {
        this.drawingElement.beginStyleChange();
        
        this.callSuper(point, vanillaPoint);
        
        var gradientPoint = this.proportionalPoint;
        if (gradientPoint._radiusPoint1 != null) {
            var anchor = this.drawingElement.transformInverse(this.getAnchor());
            var deltaX = point.x - anchor.x;
            var deltaY = point.y - anchor.y;
            
            gradientPoint._radiusPoint1.x += deltaX;
            gradientPoint._radiusPoint1.y += deltaY;
            this.drawingElement.saveProportionalPoint(gradientPoint._radiusPoint1);
    
            gradientPoint._radiusPoint2.x += deltaX;
            gradientPoint._radiusPoint2.y += deltaY;
            this.drawingElement.saveProportionalPoint(gradientPoint._radiusPoint2);
            
            if (gradientPoint._radiusControlPoint1 != null) {
                gradientPoint._radiusControlPoint1.update();
                gradientPoint._radiusControlPoint2.update();
            }
        }
        
        this.drawingElement.onStyleChange.trigger();
    }
});


Webgram.ControlPoints.GradientRadiusControlPoint = 
        Webgram.ControlPoints.ProportionalControlPoint.extend( /** @lends Webgram.ControlPoints.GradientRadiusControlPoint.prototype */ {
            
    /**
     * A control point that controls a <em>gradient radius</em>.
     * @constructs Webgram.ControlPoints.GradientRadiusControlPoint
     * @extends Webgram.ControlPoints.ProportionalControlPoint
     * @param {Webgram.Geometry.Point} point the gradient radius point
     * @param {Webgram.Geometry.Point} siblingPoint the other gradient point
     * @param {Boolean} isFirst <tt>true</tt> if this controls the first gradient point,
     * <tt>false</tt> otherwise
     * @param {Object} either a fill style or a stroke style whose gradient is to be controlled
     */
    initialize: function GradientRadiusControlPoint(point, gradientPoint, isFirst, style) {
        this.callSuper(point);
        
        /**
         * the gradient radius point
         * @type Webgram.Geometry.Point
         */
        this.gradientPoint = gradientPoint;
        
        /**
         * <tt>true</tt> if this controls the first gradient point, <tt>false</tt> otherwise.
         * @type Boolean
         */
        this.isFirst = isFirst;
        
        /**
         * Either a fill style or a stroke style whose gradient is to be controlled
         * @type Object
         */
        this.style = style;
    },

    draw: function () {
        var image = this.getImageStore().get('gradient-point');
        if (!image) {
            return;
        }

        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
        
        this.drawArc(Webgram.Geometry.Point.zero(), 7, 7, 0, 2 * Math.PI);
        
        var color;
        if (this.isFirst) {
            color = this.style.colors[0];
        }
        else {
            color = this.style.colors.slice(-1)[0];
        }
        this.paint(null, this._fillStyle.replace({'colors': [color]}));
    },
    
    snap: function (point) {
        var gradientPoint = this.style.gradientPoint1;
        gradientPoint = this.drawingElement.transformDirect(gradientPoint);
        var distance = gradientPoint.getDistanceTo(point);
        var snapDistance = this.getSetting('snapDistance');
        if (snapDistance == null) {
            return point;
        }
        
        if (distance < 10) {
            return gradientPoint;
        }
        else {
            return point;
        }
    },
    
    processMove: function (point, vanillaPoint) {
        if (this.style instanceof Webgram.Styles.StrokeStyle) {
            this.drawingElement.beginStrokeStyleChange();
        }
        else {
            this.drawingElement.beginFillStyleChange();
        }
        
        this.callSuper(point, vanillaPoint);
        
        this.drawingElement.onStyleChange.trigger();
    }
});
