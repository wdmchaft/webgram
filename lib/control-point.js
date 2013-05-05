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


Webgram.ControlPoint = Webgram.Class.extend( /** @lends Webgram.ControlPoint.prototype */ {
    /**
     * The abstract base class for all control points.
     * A control point is a zoom-independent element on the canvas
     * that allows the user to easily interact with a drawing element.
     * Each control point instance belongs to a drawing element.
     * @constructs Webgram.ControlPoint
     */
    initialize: function ControlPoint() {
        /**
         * This is a reference to the element that the control point belongs to.
         * Its value is <tt>null</tt> until the control point is added to the drawing element
         * using {@link Webgram.DrawingElement#addControlPoint}.
         * @type Webgram.DrawingElement
         */
        this.drawingElement = null;

        /**
         * Determines whether the control point is drawn rotated according to the
         * rotation angle of the drawing element it belongs to, or not.
         * @type Boolean
         * @default false
         */
        this.drawnRotated = false;
        
        /**
         * The radius of this control point.
         * @type Number
         * @default 9
         */
        this.radius = 9;
        
        this._anchor = null;
        this._focusType = Webgram.ControlPoint.FOCUS_NONE;
        this._strokeStyle = Webgram.Styles.getStrokeStyle('default');
        this._fillStyle = Webgram.Styles.getFillStyle('default');


        /* events */

        /**
         * An event that is triggered when the control point begins to move.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onBeginMove = new Webgram.Event('begin move', this); /* () */
        
        /**
         * An event that is triggered when the control point moving ends.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onEndMove = new Webgram.Event('end move', this); /* () */

        /**
         * An event that is triggered whenever the control point is moved.<br>
         * Handlers receive the following arguments: <tt>(point)</tt> 
         * @type Webgram.Event
         */
        this.onMove = new Webgram.Event('move', this); /* (point) */

        /**
         * An event that is triggered when the control point is updated.<br>
         * Handlers receive no arguments.
         * @see Webgram.ControlPoint#update 
         * @type Webgram.Event
         */
        this.onUpdate = new Webgram.Event('update', this); /* () */
        
        /**
         * An event that is triggered whenever the mouse enters the area of this control point.
         * {@link Webgram.ControlPoint#pointInside} method is used to evaluate this condition.<br>
         * This is the equivalent of <tt>onMouseOver</tt> JavaScript event.<br>
         * Handlers receive the following arguments: <tt>(point, modifiers)</tt>. 
         * @type Webgram.Event
         */
        this.onMouseEnter = new Webgram.Event('mouse enter', this); /* (point, modifiers) */

        /**
         * An event that is triggered whenever the mouse leaves the area of this control point.
         * {@link Webgram.ControlPoint#pointInside} method is used to evaluate this condition.<br>
         * This is the equivalent of <tt>onMouseOut</tt> JavaScript event.<br>
         * Handlers receive the following arguments: <tt>(modifiers)</tt>. 
         * @type Webgram.Event
         */
        this.onMouseLeave = new Webgram.Event('mouse leave', this); /* (modifiers) */
        
        /**
         * An event that is triggered when the control point is added to a drawing element,
         * using {@link Webgram.DrawingElement#addControlPoint}.<br>
         * Handlers receive the following arguments: <tt>(drawingElement)</tt>.
         * @type Webgram.Event
         */
        this.onAdd = new Webgram.Event('add', this); /* (drawingElement) */

        /**
         * An event that is triggered when the control point is removed from a drawing element,
         * using {@link Webgram.DrawingElement.remControlPoint}.<br>
         * Handlers receive the following arguments: <tt>(drawingElement)</tt>. 
         * @type Webgram.Event
         */
        this.onRemove = new Webgram.Event('remove', this); /* (drawingElement) */

        /**
         * An event that is triggered when the control points's focus type is changed,
         * by a call to {@link Webgram.ControlPoint#setFocusType}.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onChangeFocus = new Webgram.Event('change focus', this); /* () */
    },

    /**
     * Returns the current focus type of this control point.
     * @returns {Number} one of the Webgram.ControlPoint.FOCUS_* values
     */
    getFocusType: function () {
        return this._focusType;
    },
    
    /**
     * Sets the focus type of this control point.
     * @param focusType {Number} one of the Webgram.ControlPoint.FOCUS_* values
     */
    setFocusType: function (focusType) {
        var changed = false;
        if (this._focusType !== focusType) {
            changed = true;
        }
        
        this._focusType = focusType;
        
        if (changed) {
            this.onChangeFocus.trigger();
        }
    },
    
    /**
     * Returns the <tt>cursor</tt> CSS property to set when the mouse is over this control point.<br><br>
     * <em>(should be overridden)</em>
     * @returns {String} the <tt>cursor</tt> CSS property
     */
    getCursor: function () {
        return 'default';
    },
    
    /**
     * This tells Webgram that something about this control point has changed
     * and that an update should be issued as soon as possible.<br><br>
     * <em>(should not be overridden)</em>
     */
    invalidateAnchor: function () {
        this._anchor = null;
    },
    
    
    /* drawing methods & primitives */
    
    /**
     * This method is responsible for the way the control point looks on the canvas.
     * Concrete drawing elements should implement this method by calling the various
     * available drawing primitives (draw* methods), followed by a call to <tt>paint</tt>.<br>
     * Figures drawn by a control point are not affected by the zoom.<br><br> 
     * <em>(should be overridden)</em>
     */
    draw: function () {
    },
    
    /**
     * Draws a straight line between <tt>point1</tt> and <tt>point2</tt>. All coordinates are relative to the control point.
     * If the last drawn point differs from <tt>point1</tt>, a straight line is drawn to join them.<br>
     * This is a path-related drawing primitive.
     * Set <tt>point2</tt> to <tt>null</tt> or <tt>undefined</tt> to obtain a "lineTo" effect.
     * @param {Webgram.Geometry.Point} point1 the starting point of the line
     * @param {Webgram.Geometry.Point} point2 the ending point of the line
     */
    drawLine: function (point1, point2) {
        var anchor = this.getAnchor();
        
        point1 = this._scaleDownToZoomFactor(point1);
        point2 = point2 && this._scaleDownToZoomFactor(point2);
        
        if (this.drawnRotated) {
            var rotationAngle = this.drawingElement.getRotationAngle();
            
            point1 = point1.getRotated(rotationAngle);
            point2 = point2 && point2.getRotated(rotationAngle);
        }
        
        point1 = point1.getTranslated(anchor.x, anchor.y);
        point2 = point2 && point2.getTranslated(anchor.x, anchor.y);
        
        this.drawingElement._parent.drawLine(point1, point2);
    },
    
    /**
     * Draws a rectangle. All coordinates are relative to the control point.
     * If the last drawn point differs from <tt>rectangle</tt>'s top-left point, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Rectangle} rectangle the rectangle to draw
     */
    drawRect: function (rectangle) {
        this.drawPoly(rectangle.getPoly(), true);
    },
    
    /**
     * Draws a polygonal line. All coordinates are relative to the control point.
     * If the last drawn point differs from the first point of <tt>poly</tt>, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Poly} poly the poly to draw
     * @param {Boolean} closed set to <tt>true</tt> to join the first and the last points of the poly, <tt>false</tt> otherwise
     */
    drawPoly: function (poly, closed) {
        var anchor = this.getAnchor();
        var rotationAngle = this.drawingElement.getRotationAngle();
        
        var newPoints = [];
        for (var i = 0; i < poly.points.length; i++) {
            var point = poly.points[i];
            
            point = this._scaleDownToZoomFactor(point);
            if (this.drawnRotated) {
                point = point.getRotated(rotationAngle);
            }
            point = point.getTranslated(anchor.x, anchor.y);
            
            newPoints.push(point);
        }
        
        poly = new Webgram.Geometry.Poly(newPoints);
        
        this.drawingElement._parent.drawPoly(poly, closed);
    },
    
    /**
     * Draws an ellipsoidal arc. All coordinates are relative to the control point.
     * If the last drawn point differs from the staring point of the arc, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Point} center the central point of the ellipsoid that the arc is based upon
     * @param {Number} radiusX the X radius of the ellipsoid that the arc is based upon 
     * @param {Number} radiusY the Y radius of the ellipsoid that the arc is based upon
     * @param {Number} startAngle the starting angle of the arc
     * @param {Number} startAngle the ending angle of the arc
     */
    drawArc: function (center, radiusX, radiusY, startAngle, endAngle, anti) {
        var anchor = this.getAnchor();
        
        if (this.drawnRotated) {
            var rotationAngle = this.drawingElement.getRotationAngle();
            
            startAngle += rotationAngle;
            endAngle += rotationAngle;
        }
        
        center = center.getTranslated(anchor.x, anchor.y);
        
        this.drawingElement._parent.drawArc(center, radiusX, radiusY, startAngle, endAngle, anti);
    },
    
    /**
     * Draws a quadratic or a cubic Bezier curve. All coordinates are relative to the control point.
     * If the last drawn point differs from the staring point of the curve, a straight line is drawn to join them.
     * Set <tt>controlPoint2</tt> to <tt>null</tt> or <tt>undefined</tt> to draw a quadratic curve; a cubic one is drawn, otherwise.<br>
     * This is a drawing primitive that creates or continues a path. 
     * @param {Webgram.Geometry.Point} point1 the starting point of the curve
     * @param {Webgram.Geometry.Point} point2 the starting point of the curve 
     * @param {Webgram.Geometry.Point} controlPoint1 the first control point of the curve
     * @param {Webgram.Geometry.Point} controlPoint2 the second control point of the curve, in case of a cubic Bezier curve
     */
    drawBezier: function (point1, point2, controlPoint1, controlPoint2) {
        var anchor = this.getAnchor();
        
        if (this.drawnRotated) {
            var rotationAngle = this.drawingElement.getRotationAngle();
            
            point1 = point1.getRotated(rotationAngle);
            point2 = point2.getRotated(rotationAngle);
            controlPoint1 = controlPoint1.getRotated(rotationAngle);
            controlPoint2 = controlPoint2.getRotated(rotationAngle);
        }
        
        point1 = point1.getTranslated(anchor.x, anchor.y);
        point2 = point2.getTranslated(anchor.x, anchor.y);
        controlPoint1 = controlPoint1.getTranslated(anchor.x, anchor.y);
        controlPoint2 = controlPoint2.getTranslated(anchor.x, anchor.y);
        
        this.drawingElement._parent.drawBezier(point1, point2, controlPoint1, controlPoint2);
    },
    
    /**
     * Draws a scalar image. All coordinates are relative to the control point.
     * @param {Image} image the JavaScript image object with a loaded image
     * @param {Webgram.Geometry.Point} center the central point of the drawn image
     * @param {Webgram.Geometry.Size} size the size of the drawn image;
     *  use <tt>image.width</tt> and <tt>image.height</tt> to draw the image unscaled
     * @param {Number} rotationAngle the at which the image is rotated when drawn
     * @param {Number} alpha alpha (transparency) value to use when drawing the image (between 0 and 1)
     */
    drawImage: function (image, center, size, rotationAngle, alpha) {
        var anchor = this.getAnchor();
        
        center = center.getTranslated(anchor.x, anchor.y);
        if (this.drawnRotated) {
            rotationAngle += this.drawingElement.getRotationAngle();
        }
        
        this.drawingElement._parent.drawImage(image, center, size, rotationAngle, alpha);
    },
    
    /**
     * Draws a piece of text. All coordinates are relative to the control point.
     * @param {String} text the textual content to draw
     * @param {Webgram.Geometry.Rectangle} box the bounding box of the drawn text
     * @param {Webgram.Styles.TextStyle} textStyle the style to use when drawing the text
     */
    drawText: function (text, box, textStyle) {
        if (box == null) {
            box = this.getBaseRectangle();
        }
        
        var anchor = this.getAnchor();
        
        box = box.getTranslated(anchor.x, anchor.y);
        
        this.drawingElement._parent.drawText(text, box, textStyle);
    },
    
    /**
     * This method must be called after using one or more path-related drawing primitives.
     * It actually commits the path-drawing operations that were previously queued.
     * No path operations should remain "unpainted" (i.e. with no call to <tt>paint</tt> after them).   
     * If <tt>strokeStyle</tt> is specified, a stroke is drawn along the path, using the given style.
     * If <tt>strokeStyle</tt> is undefined, the control points's stroke style is used ({@link Webgram.ControlPoint#getStrokeStyle}).
     * If <tt>strokeStyle</tt> is null, no stroke is drawn along the path at all.
     * The same algorithm is used for filling the path, using the <tt>fillStyle</tt> argument.
     * @param {Webgram.Styles.StrokeStyle} strokeStyle the stroke style to use when painting the primitives
     * @param {Webgram.Styles.FillStyle} fillStyle the fill style to use when painting the primitives
     */
    paint: function (strokeStyle, fillStyle) {
        if (strokeStyle === undefined) {
            strokeStyle = this._strokeStyle;
        }
        if (fillStyle === undefined) {
            fillStyle = this._fillStyle;
        }
        
        if (strokeStyle) {
            strokeStyle = strokeStyle.clone();
        }
        if (fillStyle) {
            fillStyle = fillStyle.clone();
        }
        
        var anchor = this.getAnchor();
        
        var styles = [strokeStyle, fillStyle];
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            if (!style) {
                continue;
            }
            
            if (style.gradientPoint1) {
                style.gradientPoint1 = this._scaleDownToZoomFactor(style.gradientPoint1);
                style.gradientPoint1 = style.gradientPoint1.getTranslated(anchor.x, anchor.y);
            }
            if (style.gradientPoint2) {
                style.gradientPoint2 = this._scaleDownToZoomFactor(style.gradientPoint2);
                style.gradientPoint2 = style.gradientPoint1.getTranslated(anchor.x, anchor.y);
            }
        }
        
        this.drawingElement._parent.paint(strokeStyle, fillStyle);
    },
    
    /**
     * Returns the current zoom factor of the Webgram. The control point must be added to a drawing element
     * which in turn must be added to a Webgram when calling this method.
     * @returns {Number} the current zoom factor of the Webgram
     */
    getZoomFactor: function () {
        return this.drawingElement.webgram.rootContainer._zoomFactor;
    },
    
    /**
     * Returns the image store of the Webgram that this
     * control point is added to. If the control point is not 
     * part of a Webgram, this method returns <tt>null</tt>.
     * @returns {Webgram.ImageStore} the image store, or <tt>null</tt> if none available
     */
    getImageStore: function () {
        if (!this.drawingElement || !this.drawingElement.webgram) { /* not added yet */
            return null;
        }
        
        return this.drawingElement.webgram.getImageStore();
    },

    
    /* styles */
    
    /**
     * Returns the default stroke style used by this control point.
     * @returns {Webgram.Styles.StrokeStyle} the default stroke style of this control point
     */
    getStrokeStyle: function () {
        return this._strokeStyle;
    },

    /**
     * Sets the default stroke style used by this control point.
     * @param {Webgram.Styles.StrokeStyle} strokeStyle the default stroke style to be used by this control point
     */
    setStrokeStyle: function (strokeStyle) {
        this._strokeStyle = strokeStyle;
    },

    /**
     * Returns the default fill style used by this control point.
     * @returns {Webgram.Styles.FillStyle} the default fill style of this control point
     */
    getFillStyle: function () {
        return this._fillStyle;
    },

    /**
     * Sets the default fill style used by this control point.
     * @param {Webgram.Styles.FillStyle} fillStyle the default fill style to be used by this control point
     */
    setFillStyle: function (fillStyle) {
        this._fillStyle = fillStyle;
    },
    
    
    /**
     * Determines if a given <tt>point</tt> (relative to the element's parent)
     * is inside this control point or not.<br><br>
     * <em>(could be overridden)</em> 
     * @param {Webgram.Geometry.Point} point the point to test, relative to the element
     * @returns {Boolean} <tt>true</tt> if the point is inside this control point, <tt>false</tt> otherwise
     */
    pointInside: function (point) {
        var radius = this.radius / this.getZoomFactor();
        
        var anchor = this.getAnchor();
        var rect = new Webgram.Geometry.Rectangle(anchor.x - radius, anchor.y - radius, anchor.x + radius, anchor.y + radius);

        return rect.pointInside(point);
    },
    

    /* anchor related */
    
    /**
     * Returns the <em>anchor</em> of this control point. The anchor represents
     * the point where the control point is pinned onto its drawing element.
     * The coordinates of this anchor are relative to the element's parent.
     * In case the anchor is <tt>null</tt> (read: invalid), this method calls
     * {@link Webgram.ControlPoint#update} which in turn makes a call to
     * {@link Webgram.ControlPoint#computeAnchor} to obtain the value of the anchor.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Point} the value of the anchor
     */
    getAnchor: function () {
        if (!this._anchor) {
            this.update(false);
        }
        
        return this._anchor;
    },
    
    /**
     * A control point can have an <em>offset</em> from its actual anchor.
     * This offset is made of two numbers, one value for the <tt>x</tt> axis, and one for the <tt>y</tt> one.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} an object with:<ul>
     *  <li><tt>x</tt>: the x offset</li>
     *  <li><tt>y</tt>: the y offset</li>
     * </ul>
     */
    getOffsets: function () {
        return {x: 0, y: 0};
    },
    
    /**
     * This method is responsible for the actual computing of the anchor.
     * Implement this method in concrete control point classes and make it
     * return the anchor point, relative to this control point's element.<br><br>
     * <em>(must be overridden)</em>
     */
    computeAnchor: function () {
        /* must be overridden */
    },

    /**
     * This method is responsible for the effect generated by moving this control point.
     * Implement this method in concrete control point classes and change the
     * corresponding fields of the drawing element based on the <tt>point</tt> argument.<br><br>
     * <em>(must be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the the control point was dragged with the mouse;
     * its value is relative to the element and the offsets are already taken into account
     * @param {Webgram.Geometry.Point} point the point where the the control point was dragged with the mouse;
     * its value is relative to the parent, unaffected by the offsets
     */
    processMove: function (point, vanillaPoint) {
        /* must be overridden */
    },
    
    /**
     * Moves the control point to the given <tt>point</tt>.
     * This method is called by the active {@link Webgram.DrawingControl} as a consequence
     * of dragging the control point with the mouse.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point that this control point will be moved to
     */
    move: function (point) {
        var offsets = this._getOffsets();
        var vanillaPoint = point;
        point = this.drawingElement.transformInverse(point);
        point = point.getTranslated(-offsets.x, -offsets.y);
        
        this.processMove(point, vanillaPoint);
        this.onMove.trigger(point);
        this.update();
    },
    
    /**
     * Recomputes the anchor of this element. If the anchor has changed,
     * that is the control point was moved, an <tt>onUpdate</tt> event is triggered.
     * This method is automatically called by the library when the control points
     * are invalidated, but can be called by the user as well.<br><br>
     * <em>(should not be overridden)</em>
     */
    update: function () {
        var anchor = this.computeAnchor();
        var offsets = this._getOffsets();
        var oldAnchor = this._anchor;
        
        anchor = anchor.getTranslated(offsets.x, offsets.y);
        anchor = this.drawingElement.transformDirect(anchor);
        this._anchor = anchor;
        
        if (oldAnchor == null || this._anchor.x !== oldAnchor.x || this._anchor.y !== oldAnchor.y) {
            this.onUpdate.trigger();
        }
    },
    
    
    /* settings */
    
    /**
     * Returns a Webgram setting. These settings are global and are available to each
     * element added to the Webgram instance.<br><br>
     * <em>(should not be overridden)</em>
     * @param {String} setting the full name of the setting
     * @param {any} def the default value to return if the setting is not present
     * @returns {any} the value of the setting, or <tt>def</tt> if it is not present
     */
    getSetting: function (setting, def) {
        if (!this.drawingElement) { /* not added yet */
            return null;
        }
        
        return this.drawingElement.getSetting(setting, def);
    },
    

    /* private methods */
    
    _getOffsets: function () {
        var zoomFactor = this.getZoomFactor();
        var strokeStyle = this.drawingElement.getStrokeStyle();
        var thickness = Math.round(strokeStyle ? strokeStyle.lineWidth / 2 : 0);
        var offsets = this.getOffsets();
        var x = offsets.x / zoomFactor;
        var y = offsets.y / zoomFactor;
        
        if (offsets.x > 0) {
            x += thickness;
        }
        else if (offsets.x < 0) {
            x -= thickness;
        }
        
        if (offsets.y > 0) {
            y += thickness;
        }
        else if (offsets.y < 0) {
            y -= thickness;
        }
        
        return {x : x, y : y};
    },
    
    _scaleDownToZoomFactor: function (point) {
        var angle = Webgram.Geometry.Point.zero().getAngleTo(point);
        var distance = Webgram.Geometry.Point.zero().getDistanceTo(point);
        
        return Webgram.Geometry.Point.zero().getPointAt(distance / this.getZoomFactor(), angle);
    }
},

/** @lends Webgram.ControlPoint */ {
    /** Represents the normal focus type of a control point, when it's neither hovered, nor selected. */
    FOCUS_NONE: 0,
    
    /** Represents the hovered focus type of a control point. */
    FOCUS_HOVERED: 1
});
