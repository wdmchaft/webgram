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
        Webgram.ControlPoint.extend(/** @lends Webgram.ControlPoints.GradientControlPoint.protorotype */ {

    /**
     * A control point that controls a <em>gradient point</em>.
     * @constructs Webgram.ControlPoints.GradientControlPoint
     * @extends Webgram.ControlPoint
     * @param {Number} the index of the gradient point (either 1 or 2)
     * @param {Function} getter the getter function that returns the style whose gradient is controlled
     * by this control point; will be called with the drawing element as <tt>this</tt>
     * @param {Function} setter the setter function that sets the style whose gradient is controlled
     * by this control point; will be called with the drawing element as <tt>this</tt>
     */
    initialize: function GradientControlPoint(index, getter, setter) {
        this.callSuper();
        
        this._index = index;
        this._getter = getter;
        this._setter = setter;
    },

    draw: function () {
        var style = this._getStyle();
        var guidesStyle = this.drawingElement.getGuidesStyle();
        var image;
        
        if (style.hasRadialGradient()) {
            image = this.getImageStore().get('gradient-point');
            if (!image) {
                return;
            }

            this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
            
            var radius = 7;
            this.drawArc(Webgram.Geometry.Point.zero(), radius, radius, 0, 2 * Math.PI);
            
            this.paint(null, Webgram.Styles.createFillStyle({
                'colors': style.colors,
                'gradientPoint1': new Webgram.Geometry.Point(0, 0),
                'gradientRadius1': 0,
                'gradientRadius2': radius
            }));

            radius = 15;
            this.drawLine(new Webgram.Geometry.Point(0, -radius), new Webgram.Geometry.Point(0, radius));
            this.paint(guidesStyle, null);
            this.drawLine(new Webgram.Geometry.Point(-radius, 0), new Webgram.Geometry.Point(radius, 0));
            this.paint(guidesStyle, null);
        }
        else { /* linear gradient */
            image = this.getImageStore().get('gradient-point');
            if (!image) {
                return;
            }

            this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
            
            this.drawArc(Webgram.Geometry.Point.zero(), 7, 7, 0, 2 * Math.PI);
            
            var color = style.colors[this._index - 1];
            this.paint(null, this._fillStyle.replace({colors: [color]}));
        }
    },
    
    getCursor: function () {
        return 'pointer';
    },
    
    computeAnchor: function () {
        var boundingRectangle = this.drawingElement.getBoundingRectangle();
        var width = boundingRectangle.getWidth();
        var height = boundingRectangle.getHeight();
        var style = this._getStyle();
        var point = style['gradientPoint' + this._index];
        var x = point.x;
        var y = point.y;
        
        if (typeof x === 'string' && x[x.length - 1] === '%') {
            x = parseFloat(x) * width / 100;
        }
        
        if (typeof y === 'string' && y[y.length - 1] === '%') {
            y = parseFloat(y) * height / 100;
        }
        
        return new Webgram.Geometry.Point(x, y);
    },
    
    processMove: function (point) {
        var boundingRectangle = this.drawingElement.getBoundingRectangle();
        var width = boundingRectangle.getWidth();
        var height = boundingRectangle.getHeight();
        var style = this._getStyle();
        var gradientPoint = style['gradientPoint' + this._index];
        var x = point.x;
        var y = point.y;
        
        if (typeof gradientPoint.x === 'string' && gradientPoint.x[gradientPoint.x.length - 1] === '%') {
            x = x * 100 / width + '%';
        }
        
        if (typeof gradientPoint.y === 'string' && gradientPoint.y[gradientPoint.y.length - 1] === '%') {
            y = y * 100 / height + '%';
        }
        
        point = new Webgram.Geometry.Point(x, y);
        if (this._index === 1) {
            style = style.replace({gradientPoint1: point});
        }
        else {
            style = style.replace({gradientPoint2: point});
        }
        
        this._setStyle(style);
    },
    
    _getStyle: function () {
        return this._getter.call(this.drawingElement);
    },

    _setStyle: function (style) {
        return this._setter.call(this.drawingElement, style);
    },
});


Webgram.ControlPoints.GradientRadiusControlPoint = 
        Webgram.ControlPoint.extend( /** @lends Webgram.ControlPoints.GradientRadiusControlPoint.prototype */ {
            
    /**
     * A control point that controls a <em>gradient radius</em>.
     * @constructs Webgram.ControlPoints.GradientRadiusControlPoint
     * @extends Webgram.ControlPoint
     * @param {Number} the index of the gradient radius (either 1 or 2)
     * @param {Function} getter the getter function that returns the style whose gradient is controlled
     * by this control point; will be called with the drawing element as <tt>this</tt>
     * @param {Function} setter the setter function that sets the style whose gradient is controlled
     * by this control point; will be called with the drawing element as <tt>this</tt>
     */
    initialize: function GradientRadiusControlPoint(index, getter, setter) {
        this.callSuper();
        
        this._index = index;
        this._getter = getter;
        this._setter = setter;
    },

    draw: function () {
        var image = this.getImageStore().get('gradient-point');
        if (!image) {
            return;
        }

        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
        
        this.drawArc(Webgram.Geometry.Point.zero(), 7, 7, 0, 2 * Math.PI);
        
        var color = this._getStyle().colors[this._index - 1];
        this.paint(null, this._fillStyle.replace({colors: [color]}));
    },
    
    getCursor: function () {
        return 'pointer';
    },
    
    computeAnchor: function () {
        var boundingRectangle = this.drawingElement.getBoundingRectangle();
        var width = boundingRectangle.getWidth();
        var height = boundingRectangle.getHeight();
        var style = this._getStyle();
        var radius = style['gradientRadius' + this._index];
        var point = style.gradientPoint1;
        var x = point.x;
        var y = point.y;
        
        if (typeof radius === 'string' && radius[radius.length - 1] === '%') {
            radius = parseFloat(radius) * width / 100;
        }
        
        if (typeof x === 'string' && x[x.length - 1] === '%') {
            x = parseFloat(x) * width / 100;
        }
        
        if (typeof y === 'string' && y[y.length - 1] === '%') {
            y = parseFloat(y) * height / 100;
        }
        
        point = new Webgram.Geometry.Point(x, y);
        if (this._index === 1) {
            point = point.getPointAt(radius, 0);
        }
        else { /* this._index === 2 */
            point = point.getPointAt(radius, Math.PI / 2);
        }
        
        return point;
    },
    
    processMove: function (point) {
        var boundingRectangle = this.drawingElement.getBoundingRectangle();
        var width = boundingRectangle.getWidth();
        var height = boundingRectangle.getHeight();
        var style = this._getStyle();
        var gradientPoint = style.gradientPoint1;
        var gradientRadius = style['gradientRadius' + this._index];
        var x = gradientPoint.x;
        var y = gradientPoint.y;
        
        if (typeof gradientPoint.x === 'string' && gradientPoint.x[gradientPoint.x.length - 1] === '%') {
            x = parseFloat(x) * width / 100;
        }
        
        if (typeof gradientPoint.y === 'string' && gradientPoint.y[gradientPoint.y.length - 1] === '%') {
            y = parseFloat(y) * height / 100;
        }
        
        var radius;
        if (this._index === 1) {
            radius = Math.max(0, point.x - x);
        }
        else {
            radius = Math.max(0, point.y - y);
        }
        
        if (typeof gradientRadius === 'string' && gradientRadius[gradientRadius.length - 1] === '%') {
            radius = radius * 100 / width + '%';
        }
        
        if (this._index === 1) {
            style = style.replace({gradientRadius1: radius});
        }
        else {
            style = style.replace({gradientRadius2: radius});
        }
        
        this._setStyle(style);
    },
    
    _getStyle: function () {
        return this._getter.call(this.drawingElement);
    },

    _setStyle: function (style) {
        return this._setter.call(this.drawingElement, style);
    },
});
