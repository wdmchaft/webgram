/*
` * Copyright (c) 2012 Calin Crisan <ccrisan@gmail.com>
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
 * @class The abstract base class for all drawing elements.
 * @param {String} id a given identifier, can be <tt>null</tt>
 * @param {Array} points a list of {@link Webgram.Geometry.Point} objects
 */
Webgram.DrawingElement = function (id, points) {
    if (points == null) {
        points = [];
    }

    /**
     * A reference to the main webgram object, or null if this hasn't been added to a webgram yet.
     * @type Webgram
     */
    this.webgram = null;
    
    /**
     * Each drawing element has a set of one or more points that serve as anchors and often give its exact shape.
     * We call the polygon made up by these points the shape.<br>
     * Shape points are relative to the parent and are not affected by the element's rotation angle.
     * 
     * In most cases you don't really have to access this field, but rather use methods like<br> 
     * {@link Webgram.DrawingElement#setRotatedShapePoint},<br>
     * {@link Webgram.DrawingElement#getBoundingRectangle},<br>
     * {@link Webgram.DrawingElement#getCenter}, <br>
     * {@link Webgram.DrawingElement#getWidth} or<br>
     * {@link Webgram.DrawingElement#getHeight}
     * @type Webgram.Geometry.Poly
     */
    this.shape = new Webgram.Geometry.Poly(points);
    
    /**
     * If rotation is enabled for the drawing element, this represents the rotation center,
     * relative to the element's center.<br>
     * This point is usually managed by an associated {@link Webgram.ControlPoints.RotationCenterControlPoint}.
     * @type Webgram.Geometry.Point
     */
    this.rotationCenter = new Webgram.Geometry.Point(0, 0);
    
    /**
     * This field indicates the drawing order among elements of having the same parent.
     * It works just like the <tt>z-index</tt> CSS property. <br>
     * You should only set this field when constructing the object.
     * @type Number
     * @default 0
     */
    this.zIndex = 0;
    
    /**
     * This field specifies the minimum number of shape points that this drawing element needs
     * in order to be consistent, i.e. to function properly. 
     * You should only set this field when constructing the object. Set it to a value greater than 0.
     * @type Number
     * @default 1
     */
    this.minPointCount = 1;
    

    /* events */
    
    /**
     * An event that is triggered whenever a key is pressed while this element is focused.
     * This is the equivalent of <tt>onKeyPress</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(key, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onKeyPress = new Webgram.Event('key press', this); /* (key, modifiers) */

    /**
     * An event that is triggered whenever a key is pressed while this element is focused.<br>
     * This is the equivalent of <tt>onKeyDown</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(key, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onKeyDown = new Webgram.Event('key down', this); /* (key, modifiers) */

    /**
     * An event that is triggered whenever a key is released while this element is focused.<br>
     * This is the equivalent of <tt>onKeyUp</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(key, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onKeyUp = new Webgram.Event('key up', this); /* (key, modifiers) */
    
    /**
     * An event that is triggered whenever a mouse button is pressed on this element.<br>
     * This is the equivalent of <tt>onMouseDown</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, button, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseDown = new Webgram.Event('mouse down', this); /* (point, button, modifiers) */
    
    /**
     * An event that is triggered whenever a mouse button is released on this element.<br>
     * This is the equivalent of <tt>onMouseUp</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, button, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseUp = new Webgram.Event('mouse up', this); /* (point, button, modifiers) */

    /**
     * An event that is triggered whenever the mouse is moved over this element.<br>
     * This is the equivalent of <tt>onMouseMove</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseMove = new Webgram.Event('mouse move', this); /* (point, modifiers) */

    /**
     * An event that is triggered whenever the mouse whell is turned while on this element.<br>
     * Handlers receive the following arguments: <tt>(point, up, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseScroll = new Webgram.Event('mouse scroll', this); /* (point, up, modifiers) */

    /**
     * An event that is triggered whenever the mouse enters the area of this element.
     * {@link Webgram.DrawingElement#pointInside} method is used to evaluate this condition.<br>
     * This is the equivalent of <tt>onMouseOver</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseEnter = new Webgram.Event('mouse enter', this); /* (point, modifiers) */

    /**
     * An event that is triggered whenever the mouse leaves the area of this element.
     * {@link Webgram.DrawingElement#pointInside} method is used to evaluate this condition.<br>
     * This is the equivalent of <tt>onMouseOut</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseLeave = new Webgram.Event('mouse leave', this); /* (point, modifiers) */
    
    /**
     * An event that is triggered when the user begins the rotation of this element.
     * This event only occurs when the element is rotated using {@link Webgram.ControlPoints.RotateControlPoint}.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onBeginRotate = new Webgram.Event('begin rotate', this); /* () */

    /**
     * An event that is triggered whenever the rotation angle of this element changes.<br>
     * Handlers receive the following arguments: <tt>(angle)</tt>. 
     * @type Webgram.Event
     */
    this.onRotate = new Webgram.Event('rotate', this); /* (angle) */

    /**
     * An event that is triggered when the user finishes the rotation of this element.
     * This event only occurs when the element is rotated using {@link Webgram.ControlPoints.RotateControlPoint}.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onEndRotate = new Webgram.Event('end rotate', this); /* () */

    /**
     * An event that is triggered when the element is flipped horizontally,
     * using {@link Webgram.DrawingElement#flipHorizontally}.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onFlipHorizontally = new Webgram.Event('flip horizontally', this); /* () */

    /**
     * An event that is triggered when the element is flipped vertically,
     * using {@link Webgram.DrawingElement#flipVertically}.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onFlipVertically = new Webgram.Event('flip vertically', this); /* () */

    /**
     * An event that is triggered when the element is added to a {@link Webgram.DrawingElements.ContainerElement}.<br>
     * Handlers receive the following arguments: <tt>(containerElement)</tt>. 
     * @type Webgram.Event
     */
    this.onAdd = new Webgram.Event('add', this); /* (containerElement) */

    /**
     * An event that is triggered when the element is removed from a {@link Webgram.DrawingElements.ContainerElement}.<br>
     * Handlers receive the following arguments: <tt>(containerElement)</tt>. 
     * @type Webgram.Event
     */
    this.onRemove = new Webgram.Event('remove', this); /* (containerElement) */

    /**
     * An event that is triggered when the element is selected by the active {@link Webgram.DrawingControl}.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onSelect = new Webgram.Event('select', this); /* () */

    /**
     * An event that is triggered when the element is unselected by the active {@link Webgram.DrawingControl}.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onUnselect = new Webgram.Event('unselect', this); /* () */

    /**
     * An event that is triggered when the element's position (index) inside its parent changes.<br>
     * Handlers receive the following arguments: <tt>(index)</tt>. 
     * @type Webgram.Event
     */
    this.onIndexChange = new Webgram.Event('index change', this); /* (index) */
    
    /**
     * An event that is triggered when the element is moved, either by the user,
     * or by explicitly calling {@link Webgram.DrawingElement#moveTo}.
     * This event is not triggered when the shape is changed,
     * since such a change is considered a change in shape rather than a move.<br>
     * Handlers receive the following arguments: <tt>(deltaX, deltaY)</tt>. 
     * @type Webgram.Event
     */
    this.onMove = new Webgram.Event('move', this); /* (deltaX, deltaY) */

    /**
     * An event that is triggered when the element's focus type is changed,
     * by a call to {@link Webgram.DrawingElement#setFocusType}.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onChangeFocus = new Webgram.Event('change focus', this); /* () */
    
    /**
     * An event that is triggered when the shape starts to change.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onShapeBeginChange = new Webgram.Event('shape begin change', this); /* () */

    /**
     * An event that is triggered when the shape finishes to change.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onShapeEndChange = new Webgram.Event('shape end change', this); /* () */

    /**
     * An event that is triggered whenever the shape changes.<br>
     * Handlers receive no arguments.
     * @type Webgram.Event
     */
    this.onShapeChange = new Webgram.Event('shape change', this); /* () */

    /**
     * An event that is triggered whenever an attribute of this
     * drawing element is modified. This event is linked with the
     * more general {@link Webgram#onDrawingElementChange} event<br>
     * Handlers receive no arguments.
     * @type Webgram.Event
     */
    this.onChange = new Webgram.Event('change', this); /* () */
    
    /* link the onChange event to the webgram's onDrawingElementChange event */
    this.onChange.bind(function () {
        if (this.webgram != null) {
            this.webgram.onDrawingElementChange.trigger(this);
        }
    });
    
    /* styles */
    this._strokeStyle = Webgram.Styles.getStrokeStyle('default');
    this._fillStyle = Webgram.Styles.getFillStyle('default');
    this._textStyle = Webgram.Styles.getTextStyle('default');
    this._guidesStyle = Webgram.Styles.getStrokeStyle('default-guides');
    this._hoveredDecorationStyle = Webgram.Styles.getStrokeStyle('default-hovered-decoration');
    this._selectedDecorationStyle = Webgram.Styles.getStrokeStyle('default-selected-decoration');
    
    this._rotationAngle = 0;
    this._flippedHorizontally = false;
    this._flippedVertically = false;
    this._parent = null;
    this._id = id;
    this._mouseDownPoint = null;
    this._creating = false;
    this._cachedBaseRectangle = null;
    this._shapeChanged = false;
    this._updatePoints = false;
    this._focusType = Webgram.DrawingElement.FOCUS_NONE;
    this._jsonFields = [];
    this._jsonFuncs = [];
    this._shiftBehaviors = [];
    
    this._hoveredControlPointsEnabled = false;
    this._selectEnabled = true;
    this._moveEnabled = true;
    this._snapToAngleEnabled = false;
    this._snapInternallyEnabled = false;
    this._snapExternallyEnabled = false;
    this._snapToGridEnabled = true;
    this._rotateEnabled = false;
    this._flipEnabled = true;
    this._gradientEditEnabled = false;
    this._shiftEnabled = false;
    
    this._controlPoints = [];
    this._proportionalPoints = [];
    this._sockets = [];
    this._actionMenuItems = [];
    this._parentRelativePositions = [];
    this._parentRelativePositions = [];
    
    /* compute the base rectangle, to avoid an initial onShapeChange event */
    this._cachedBaseRectangle = this._computeBaseRectangle();

    /* initial settings */
    this.setRotateEnabled(false);
};

/** Represents the normal focus type of a drawing element, when it's neither hovered, nor selected. */
Webgram.DrawingElement.FOCUS_NONE = 0; 
/** Represents the hovered focus type of a drawing element. */
Webgram.DrawingElement.FOCUS_HOVERED = 1;
/** Represents the selected focus type of a drawing element. */
Webgram.DrawingElement.FOCUS_SELECTED = 2; 
/** Represents the multiple-selected focus type of a drawing element. */
Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE = 3;
/* any greater values are user specific */

Webgram.DrawingElement.prototype = {
    /**
     * Returns the given identifier of this element.
     * @returns {String} the given identifier of this element.
     */
    getId: function () {
        return this._id;
    },

    /**
     * Sets the given identifier of this element.
     * @param {String} id the new given identifier
     */
    setId: function (id) {
        this._id = id;
    },
    
    /**
     * Returns the current focus type of this element.
     * @returns {Number} one of the Webgram.DrawingElement.FOCUS_* values or a greater, user-defined value
     */
    getFocusType: function () {
        return this._focusType;
    },

    /**
     * Sets the focus type of this element.
     * @param focusType {Number} one of the Webgram.DrawingElement.FOCUS_* values or a greater, user-defined value
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
        
        if (focusType == Webgram.DrawingElement.FOCUS_SELECTED && this._parent) {
            this._parent.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
        }
    },
    
    /**
     * Returns a string representation of this element.
     * The default implementation returns the given identifier enclosed in parentheses.<br><br>
     * <em>(could be overridden)</em>
     * @returns {String} the string representation of this element
     */
    toString: function () {
        var text = this.constructor.toString();
        if (this._id === undefined) {
            text += '(undefined)';
        }
        else if (this._id === null) {
            text += '(null)';
        }
        else if (this._id !== undefined) {
            text += '("' + this._id + '")';
        }
        
        return text;
    },
    
    /**
     * Returns the <tt>cursor</tt> CSS property to set when the mouse is over this element.<br><br>
     * <em>(could be overridden)</em>
     * @returns {String} the <tt>cursor</tt> CSS property
     */
    getCursor: function () {
        if (this.isMoveEnabled()) {
            return 'move';
        }
        else {
            return 'default';
        }
    },
    
    
    /* drawing methods */
    
    /**
     * This method is responsible for the way the element looks on the canvas.
     * Concrete drawing elements should implement this method by calling the various
     * available drawing primitives (draw* methods), followed by a call to <tt>paint</tt>.<br>
     * Figures drawn inside this method are affected by the zoom.<br><br> 
     * <em>(should be overridden)</em>
     */
    draw: function () {
    },

    /**
     * This method behaves just like the {@link Webgram.DrawingElement#draw} method,
     * except for the fact that everything drawn here appears on top of the other elements.<br><br> 
     * <em>(could be overridden)</em>
     */
    drawTop: function () {
    },

    /**
     * This method behaves just like the {@link Webgram.DrawingElement#draw} method,
     * except for the fact that the figures drawn inside this function are zoom-independent.<br><br> 
     * <em>(could be overridden)</em>
     */
    drawNoZoom: function () {
    },

    /**
     * This method combines the {@link Webgram.DrawingElement#drawTop} method,
     * with the {@link Webgram.DrawingElement#drawNoZoom} method, resulting in
     * figures that are on top of the other elements, as well as zoom-independent.<br>
     * The default implementation draws the decoration and the guides.<br><br> 
     * <em>(could be overridden)</em>
     */
    drawNoZoomTop: function() {
        this.drawDecoration();
        
        if (this.getFocusType() === Webgram.DrawingElement.FOCUS_SELECTED || this.getFocusType() === Webgram.DrawingElement.FOCUS_HOVERED) {
            this.drawGuides();
        }
    },
    
    /**
     * This method draws a decoration around the element.
     * It's called by the {@link Webgram.DrawingElement#drawNoZoomTop} method,
     * since we want decorations to be on top and zoom-independent.<br>
     * The default implementation uses the hovered and selected decoration styles
     * to draw the decoration, when the element is focused or respectively selected.<br><br> 
     * <em>(could be overridden)</em>
     */
    drawDecoration: function () {
        switch (this.getFocusType()) {
            case Webgram.DrawingElement.FOCUS_NONE:
                break;
            
            case Webgram.DrawingElement.FOCUS_HOVERED:
                if (this._hoveredDecorationStyle) {
                    this.drawPoly(this.getDecorationPoly(), true);
                    this.paint(this._hoveredDecorationStyle, null);
                }
                
                break;
            
            case Webgram.DrawingElement.FOCUS_SELECTED:
                if (this._selectedDecorationStyle) {
                    this.drawPoly(this.getDecorationPoly(), true);
                    this.paint(this._selectedDecorationStyle, null);
                }
                
                break;
        }
    },

    /**
     * This method draws the various guides that enhance the editing of the element.
     * It's called by the {@link Webgram.DrawingElement#drawNoZoomTop} method,
     * since we want guides to be on top and zoom-independent.<br>
     * The default implementation uses the guides style to draw the rotation center link line,
     * as well as the gradient link lines when gradient editing is enabled.<br><br> 
     * <em>(could be overridden)</em>
     */
    drawGuides: function () {
        if (this.isGradientEditEnabled()) {
            this.drawGradientLines(this._fillStyle);
            this.drawGradientLines(this._strokeStyle);
        }
        
        this.drawRotationCenterLine();
    },

    /**
     * This method is responsible for the drawing of the rotation center link line.
     * It's called by the {@link Webgram.DrawingElement#drawGuides} method.<br><br>
     * <em>(should not be overridden)</em>
     */
    drawRotationCenterLine: function () {
        this.drawLine(Webgram.Geometry.Point.zero(), this.rotationCenter);
        this.paint(this._guidesStyle, null);
    },

    /**
     * This method is responsible for the drawing of the gradient link lines.
     * It's called by the {@link Webgram.DrawingElement#drawGuides} method.<br><br>
     * <em>(should not be overridden)</em>
     */
    drawGradientLines: function (style) {
        if (this.getFocusType() !== Webgram.DrawingElement.FOCUS_SELECTED) {
            return;
        }
        
        if (style == null) {
            return;
        }
        
        if (style.gradientPoint1 != null) { /* any kind of gradient form enabled */
            if (style.gradientPoint1._radiusPoint1) { /* radial gradient */
                /* draw a line between the gradient point and its radius point */
                
                this.drawLine(style.gradientPoint1, style.gradientPoint1._radiusPoint1);
                this.drawLine(style.gradientPoint1, style.gradientPoint1._radiusPoint2);
                this.paint(this._guidesStyle, null);
            }
            else { /* linear gradient */
                /* draw a line between the gradient points */
                
                this.drawLine(style.gradientPoint1, style.gradientPoint2);
                this.paint(this._guidesStyle, null);
            }
        }
    },

    /**
     * This method is responsible for the drawing all the control points of this element.<br><br>
     * <em>(should not be overridden)</em>
     * @see Webgram.ControlPoint
     */
    drawControlPoints: function () {
        if ((this._focusType === Webgram.DrawingElement.FOCUS_HOVERED && this.isHoveredControlPointsEnabled()) ||
                this._focusType === Webgram.DrawingElement.FOCUS_SELECTED) {
            
            for (var i = 0; i < this._controlPoints.length; i++) {
                var controlPoint = this._controlPoints[i];
                controlPoint.draw();
            }
        }
    },

    /**
     * This method is responsible for the drawing all the sockets of this element.<br><br>
     * <em>(should not be overridden)</em>
     * @see Webgram.Connectors.Socket
     */
    drawSockets: function () {
        for (var i = 0; i < this._sockets.length; i++) {
            var socket = this._sockets[i];
            socket.draw();
        }
    },

    /**
     * This method is responsible for the drawing all the action menu items of this element.
     * @see Webgram.ActionMenuItem
     * <em>(should not be overridden)</em>
     */
    drawActionMenuItems: function () {
        if (this._focusType === Webgram.DrawingElement.FOCUS_SELECTED) {
            
            for (var i = 0; i < this._actionMenuItems.length; i++) {
                var actionMenuItem = this._actionMenuItems[i];
                actionMenuItem.draw();
            }
        }
    },

    /**
     * This tells webgram that something about this element has changed
     * and that a redraw should be issued as soon as possible.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Boolean} mini set to <tt>true</tt> if the mini webgram should
     *  also be redrawn.
     */
    invalidate: function (mini) {
        if (this.webgram) {
            this.webgram.invalidate();
            if (mini) {
                this.webgram.invalidateMini();
            }
        }
    },
    
    /**
     * The decoration offset is the distance between the border of the element's shape
     * and the decoration drawn around it. The default implementation returns the webgram
     * <tt>decorationOffset</tt> setting.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Number} the decoration offset for this element
     */
    getDecorationOffset: function () {
        return this.getSetting('decorationOffset');
    },
    
    
    /* drawing primitives */
    
    /**
     * Draws a straight line between <tt>point1</tt> and <tt>point2</tt>. All coordinates are relative to the element.
     * If the last drawn point differs from <tt>point1</tt>, a straight line is drawn to join them.<br>
     * This is a path-related drawing primitive.
     * Set <tt>point2</tt> to <tt>null</tt> or <tt>undefined</tt> to obtain a "lineTo" effect.
     * @param {Webgram.Geometry.Point} point1 the starting point of the line
     * @param {Webgram.Geometry.Point} point2 the ending point of the line
     */
    drawLine: function (point1, point2) {
        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides and decoration  */
            point1 = this.transformDirect(point1);
            point2 = point2 && this.transformDirect(point2);
        }

        this._parent.drawLine(point1, point2);
    },

    /**
     * Draws a rectangle. All coordinates are relative to the element.
     * If the last drawn point differs from <tt>rectangle</tt>'s top-left point, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Rectangle} rectangle the rectangle to draw
     */
    drawRect: function (rectangle) {
        var poly = rectangle.getPoly();
        
        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides and decoration  */
            poly = this.transformDirect(poly);
        }

        this._parent.drawPoly(poly, true);
    },

    /**
     * Draws a polygonal line. All coordinates are relative to the element.
     * If the last drawn point differs from the first point of <tt>poly</tt>, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Poly} poly the poly to draw
     * @param {Boolean} closed set to <tt>true</tt> to join the first and the last points of the poly, <tt>false</tt> otherwise
     */
    drawPoly: function (poly, closed) {
        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides and decoration  */
            poly = this.transformDirect(poly);
        }

        this._parent.drawPoly(poly, closed);
    },

    /**
     * Draws an ellipsoidal arc. All coordinates are relative to the element.
     * If the last drawn point differs from the staring point of the arc, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Point} center the central point of the ellipsoid that the arc is based upon
     * @param {Number} radiusX the X radius of the ellipsoid that the arc is based upon 
     * @param {Number} radiusY the Y radius of the ellipsoid that the arc is based upon
     * @param {Number} startAngle the starting angle of the arc
     * @param {Number} startAngle the ending angle of the arc
     */
    drawArc: function (center, radiusX, radiusY, startAngle, endAngle) {
        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides and decoration  */
            center = this.transformDirect(center);
             startAngle += this.getRotationAngle();
             endAngle += this.getRotationAngle();
        }

        this._parent.drawArc(center, radiusX, radiusY, startAngle, endAngle);
    },

    /**
     * Draws a quadratic or a cubic Bezier curve. All coordinates are relative to the element.
     * If the last drawn point differs from the staring point of the curve, a straight line is drawn to join them.
     * Set <tt>controlPoint2</tt> to <tt>null</tt> or <tt>undefined</tt> to draw a quadratic curve; a cubic one is drawn, otherwise.<br>
     * This is a drawing primitive that creates or continues a path. 
     * @param {Webgram.Geometry.Point} point1 the starting point of the curve
     * @param {Webgram.Geometry.Point} point2 the starting point of the curve 
     * @param {Webgram.Geometry.Point} controlPoint1 the first control point of the curve
     * @param {Webgram.Geometry.Point} controlPoint2 the second control point of the curve, in case of a cubic Bezier curve
     */
    drawBezier: function (point1, point2, controlPoint1, controlPoint2) {
        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides */
            point1 = this.transformDirect(point1);
            point2 = this.transformDirect(point2);
            controlPoint1 = this.transformDirect(controlPoint1);
            controlPoint2 = this.transformDirect(controlPoint2);
        }

        this._parent.drawBezier(point1, point2, controlPoint1, controlPoint2);
    },

    /**
     * Draws a scalar image. All coordinates are relative to the element.
     * @param {Image} image the JavaScript image object with a loaded image
     * @param {Webgram.Geometry.Point} center the central point of the drawn image
     * @param {Webgram.Geometry.Size} size the size of the drawn image;
     *  use <tt>image.width</tt> and <tt>image.height</tt> to draw the image unscaled
     * @param {Number} rotationAngle the at which the image is rotated when drawn
     * @param {Number} alpha alpha (transparency) value to use when drawing the image (between 0 and 1)
     */
    drawImage: function (image, center, size, rotationAngle, alpha) {
        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides */
            center = this.transformDirect(center);
        }

        var transformSet = null;
        if (!this.webgram.rootContainer._noZoom) {
            transformSet = this._getTransformSet();
        }
        
        this._parent.drawImage(image, center, size, rotationAngle, alpha, transformSet);
    },
    
    /**
     * Draws a piece of text. All coordinates are relative to the element.
     * @param {String} text the textual content to draw
     * @param {Webgram.Geometry.Rectangle} box the bounding box of the drawn text
     * @param {Webgram.Styles.TextStyle} textStyle the style to use when drawing the text
     */
    drawText: function (text, box, textStyle) {
        if (box == null) {
            box = this.translateInverse(this.getBaseRectangle());
        }
        
        if (textStyle == null) {
            textStyle = this._textStyle;
        }

        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides */
            box = this.translateDirect(box);
        }
        
        var transformSet = null;
        if (!this.webgram.rootContainer._noZoom) {
            transformSet = this._getTransformSet();
        }
        
        this._parent.drawText(text, box, textStyle, transformSet);
    },
    
    /**
     * Measures the size that a given piece of text would have.
     * @param {String} text the textual content to evaluate
     * @param {Webgram.Styles.TextStyle} the style to use when measuring the text
     * @returns {Webgram.Geometry.Size} the size occupied by the given text
     */
    getTextSize: function (text, textStyle) {
        if (textStyle == null) {
            textStyle = this.getTextStyle();
        }

        if (this.webgram == null) {
            return null;
        }
        
        return this.webgram.canvas.getTextSize(text, textStyle);
    },
    
    /**
     * Performs a text layout within a given box.
     * It does this by wrapping the text when/if necessary and aligns it as indicated by the style.
     * @param {String} text the textual content to layout
     * @param {Webgram.Geometry.Rectangle} box the bounding box of the text
     * @param {Webgram.Styles.TextStyle} textStyle the style to use when layouting the text
     * @returns {Object} an object with:<ul>
     *  <li><tt>lines</tt> - an array of objects with:<ul>
     *   <li><tt>text</tt> - the textual content of the line</li>
     *   <li><tt>x</tt> and <tt>y</tt> - the coordinates where the text has to be drawn</li>
     *   <li><tt>top</tt>, <tt>right</tt>, <tt>bottom</tt> and <tt>left</tt> - the boundaries of the line</li>
     *  </ul>
     *  <li><tt>text</tt> - the adjusted (with newlines) text that should be used instead of the original one</li>
     * </ul>
     */
    layoutText: function (text, box, textStyle) {
        if (box == null) {
            box = this.translateInverse(this.getBaseRectangle());
        }
        
        if (textStyle == null) {
            textStyle = this.getTextStyle();
        }
        
        if (this.webgram == null) {
            return null;
        }
        
        return this.webgram.canvas.layoutText(text, box, textStyle);
    },
    
    /**
     * This method must be called after using one or more path-related drawing primitives.
     * It actually commits the path-drawing operations that were previously queued.
     * No path operations should remain "unpainted" (i.e. with no call to <tt>paint</tt> after them).   
     * If <tt>strokeStyle</tt> is specified, a stroke is drawn along the path, using the given style.
     * If <tt>strokeStyle</tt> is undefined, the element's stroke style is used ({@link Webgram.DrawingElement#getStrokeStyle}).
     * If <tt>strokeStyle</tt> is null, no stroke is drawn along the path at all.
     * The same algorithm is used for filling the path, using the <tt>fillStyle</tt> argument.
     * @param {Webgram.Styles.StrokeStyle} strokeStyle the stroke style to use when painting the primitives
     * @param {Webgram.Styles.FillStyle} fillStyle the fill style to use when painting the primitives
     */
    paint: function (strokeStyle, fillStyle) {
        var transformSet = null;
        if (!this.webgram.rootContainer._noZoom) { /* used for drawing guides and decoration */
            transformSet = this._getTransformSet();
        }
        
        if (strokeStyle === undefined) {
            strokeStyle = this.getStrokeStyle();
        }
        if (fillStyle === undefined) {
            fillStyle = this.getFillStyle();
        }
        
        this._parent.paint(strokeStyle, fillStyle, transformSet);
    },

    
    /* drawing helpers */

    /**
     * This is a "rounded" version of the {@link Webgram.DrawingElement#getWidth} method.
     * Use this if you want to draw something at coordinates that depend on a round (integer) value of the width.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Number} this element's rounded width
     */
    getDrawingWidth: function () {
        return Math.round(this.getWidth());
    },

    /**
     * This is a "rounded" version of the {@link Webgram.DrawingElement#getHeight} method.
     * Use this if you want to draw something at coordinates that depend on a round (integer) value of the height.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Number} this element's rounded height
     */
    getDrawingHeight: function () {
        return Math.round(this.getHeight());
    },

    /**
     * This method encapsulated the values returned by the {@link Webgram.DrawingElement#getDrawingWidth} and
     * {@link Webgram.DrawingElement#getDrawingHeight} methods into a size object.
     * @returns {Webgram.Geometry.Size} this element's rounded size
     */
    getDrawingSize: function () {
        return new Webgram.Geometry.Size(this.getDrawingWidth(), this.getDrawingHeight());
    },

    /**
     * Returns a bounding rectangle, suitable to be drawn as a border.
     * The rectalgne is relative to this element, and has the size dictated by the
     * {@link Webgram.DrawingElement#getDrawingWidth} and {@link Webgram.DrawingElement#getDrawingHeight} methods.
     * @returns {Webgram.Geometry.Rectangle} a rectangle suitable to be used directly by the {@link Webgram.DrawingElement#drawRect} method
     */
    getDrawingRectangle: function () {
        var width = this.getDrawingWidth();
        var height = this.getDrawingHeight();
        
        return new Webgram.Geometry.Rectangle(-width / 2 + 0.5, -height / 2 + 0.5, width / 2 - 0.5, height / 2 - 0.5);
    },

    /**
     * Returns a bounding polygon, suitable to be drawn as a border.
     * The coordinates are relative to this element.
     * @returns {Webgram.Geometry.Poly} a poly suitable to be used directly by the {@link Webgram.DrawingElement#drawPoly} method
     */
    getDrawingPoly: function () {
        return this.translateInverse(this.shape);
    },

    /**
     * Determines the rectangle to be drawn as decoration, relative to this drawing element.
     * This method does not take into account the decoration offset. The rectangle returned by this method
     * is automatically enlarged (or shrinked) according to the {@link Webgram.DrawingElement#getDecorationOffset} method.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Webgram.Geometry.Rectangle} the rectangle to be drawn as decoration
     */
    getDecorationRectangle: function () {
        return this.getDrawingRectangle();
    },

    /**
     * This method is responsible for returning the actual, final polygon that will be drawn as decoration.
     * It takes into account the decoration offset ({@link Webgram.DrawingElement#getDecorationOffset}),
     * the zoom factor ({@link Webgram.DrawingElement#getZoomFactor}),
     * as well as the line width (thickness) of the default stroke style of this element.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Poly} the actual poly to be drawn as decoration
     */
    getDecorationPoly: function () {
        var decorationRect = this.getDecorationRectangle();
        var strokeStyle = this.getStrokeStyle();
        var zoomFactor = this.getZoomFactor();
        var thickness = strokeStyle ? strokeStyle.lineWidth / 2 : 0;
        var offset = this.getDecorationOffset() / zoomFactor;
        
        decorationRect = decorationRect.getShrinked(-(thickness + offset));
        
        return decorationRect.getPoly();
    },
    
    /**
     * Returns the current zoom factor of the webgram. The element must be added to a webgram when calling this method.
     * @returns {Number} the current zoom factor of the webgram
     */
    getZoomFactor: function () {
        return this.webgram.rootContainer._zoomFactor;
    },

    /**
     * Returns the image store of the webgram that this
     * drawing element is added to. If the element is not added
     * to a webgram, this method returns <tt>null</tt>.
     * @returns {Webgram.ImageStore} the image store, or <tt>null</tt> if none available
     */
    getImageStore: function () {
        if (!this.webgram) { /* not added yet */
            return null;
        }
        
        return this.webgram.getImageStore();
    },


    /* styles */
    
    /**
     * Returns the default stroke style used by this element.
     * @returns {Webgram.Styles.StrokeStyle} the default stroke style of this element
     */
    getStrokeStyle: function () {
        return this._strokeStyle;
    },

    /**
     * Sets the default stroke style used by this element.
     * The previous stroke style is not wiped out right away; instead, for each property of the new style
     * that is <tt>undefined</tt>, this method uses the respective property from the previous style.
     * @param {Webgram.Styles.StrokeStyle} strokeStyle the default stroke style to be used by this element
     */
    setStrokeStyle: function (strokeStyle) {
        var gradientEditEnabled = this.isGradientEditEnabled();
        
        if (gradientEditEnabled) {
            this.setGradientEditEnabled(false);
        }

        this._clearGradientProportionalPoints(this._strokeStyle);
        
        if (strokeStyle != null) { /* stroke style wanted */
            if (this._strokeStyle == null) {
                /* had no strok style before, creating a new default one */
                this._strokeStyle = Webgram.Styles.getStrokeStyle('default');
            }
            
            var widthHalf = (this.getWidth() - 1) / 2;
            var heightHalf = (this.getHeight() - 1) / 2;
            
            if (strokeStyle.lineWidth !== undefined) { /* line width changed */
                this._strokeStyle.lineWidth = strokeStyle.lineWidth;
            }
            
            if (strokeStyle.lineCap !== undefined) { /* line cap changed */
                this._strokeStyle.lineCap = strokeStyle.lineCap;
            }
            
            if (strokeStyle.lineJoin !== undefined) { /* line join changed */
                this._strokeStyle.lineJoin = strokeStyle.lineJoin;
            }
            
            if (strokeStyle.miterLimit !== undefined) { /* miter limit changed */
                this._strokeStyle.miterLimit = strokeStyle.miterLimit;
            }
            
            if (strokeStyle.pattern !== undefined) { /* pattern changed */
                this._strokeStyle.pattern = Webgram.Utils.clone(strokeStyle.pattern);
            }
            
            if (strokeStyle.colors !== undefined) { /* colors changed */
                this._strokeStyle.colors = Webgram.Utils.clone(strokeStyle.colors);
            }
            
            if (strokeStyle.gradientPoint1 !== null) { /* gradient point 1 wanted */
                if (strokeStyle.gradientPoint1 !== undefined) { /* gradient point 1 changed */
                    this._strokeStyle.gradientPoint1 = strokeStyle.gradientPoint1;
                }
                else if (this._strokeStyle.gradientPoint1 == null || 
                        ((strokeStyle.gradientRadius1 === null) !== (this._strokeStyle.gradientRadius1 === null))) {
                    /* if either this gradient point 1 is not set, or the gradient type has changed,
                     * create a default gradient point 1 */

                    if (strokeStyle.gradientRadius1 !== null) { /* radial gradient */
                        this._strokeStyle.gradientPoint1 = Webgram.Geometry.Point.zero();
                    }
                    else { /* linear gradient */
                        this._strokeStyle.gradientPoint1 = new Webgram.Geometry.Point(-widthHalf, -heightHalf);
                    }
                }
            }
            else { /* gradient point 1 not wanted */
                this._strokeStyle.gradientPoint1 = null;
            }
            
            if (strokeStyle.gradientPoint2 !== null) { /* gradient point 2 wanted */
                if (strokeStyle.gradientPoint2 !== undefined) { /* gradient point 2 changed */
                    this._strokeStyle.gradientPoint2 = strokeStyle.gradientPoint2;
                }
                else if (this._strokeStyle.gradientPoint2 == null) { /* create a default gradient point 2 */
                    this._strokeStyle.gradientPoint2 = new Webgram.Geometry.Point(widthHalf, heightHalf);
                }
            }
            else { /* gradient point 2 not wanted */
                this._strokeStyle.gradientPoint2 = null;
            }
            
            if (strokeStyle.gradientRadius1 !== null) { /* gradient radius 1 wanted */
                if (strokeStyle.gradientRadius1 !== undefined) { /* gradient radius 1 changed */
                    this._strokeStyle.gradientRadius1 = strokeStyle.gradientRadius1;
                }
                else if (this._strokeStyle.gradientRadius1 == null) { /* create a default radius 1 */
                    this._strokeStyle.gradientRadius1 = 0;
                }
            }
            else { /* gradient radius 1 not wanted */
                this._strokeStyle.gradientRadius1 = null;
            }
            
            if (strokeStyle.gradientRadius2 !== null) { /* gradient radius 2 wanted */
                if (strokeStyle.gradientRadius2 !== undefined) { /* gradient radius 2 changed */
                    this._strokeStyle.gradientRadius2 = strokeStyle.gradientRadius2;
                }
                else if (this._strokeStyle.gradientRadius2 == null) { /* create a default radius 2 */
                    this._strokeStyle.gradientRadius2 = Math.min(widthHalf, heightHalf);
                }
            }
            else { /* gradient radius 2 not wanted */
                this._strokeStyle.gradientRadius2 = null;
            }        
            
            this._setGradientProportionalPoints(this._strokeStyle);
            
            if (gradientEditEnabled) {
                this.setGradientEditEnabled(true);
            }
        }
        else {
            this._strokeStyle = null;
        }
        
        this.invalidatePoints();
        this.invalidate(true);
        
        this.onChange.trigger();
    },

    /**
     * Returns the default fill style used by this element.
     * @returns {Webgram.Styles.FillStyle} the default fill style of this element
     */
    getFillStyle: function () {
        return this._fillStyle;
    },

    /**
     * Sets the default fill style used by this element.
     * The previous fill style is not wiped out right away; instead, for each property of the new style
     * that is <tt>undefined</tt>, this method uses the respective property from the previous style.
     * @param {Webgram.Styles.FillStyle} fillStyle the default fill style to be used by this element
     */
    setFillStyle: function (fillStyle) {
        var gradientEditEnabled = this.isGradientEditEnabled();
        
        if (gradientEditEnabled) {
            this.setGradientEditEnabled(false);
        }
        
        this._clearGradientProportionalPoints(this._fillStyle);
        
        if (fillStyle != null) { /* fill style wanted */
            if (this._fillStyle == null) {
                /* had no fill style before, creating a new default one */
                this._fillStyle = Webgram.Styles.getFillStyle('default');
            }
            
            var widthHalf = (this.getWidth() - 1) / 2;
            var heightHalf = (this.getHeight() - 1) / 2;
            
            if (fillStyle.colors !== undefined) { /* colors changed */
                this._fillStyle.colors = Webgram.Utils.clone(fillStyle.colors);
            }
            
            if (fillStyle.gradientPoint1 !== null) { /* gradient point 1 wanted */
                if (fillStyle.gradientPoint1 !== undefined) { /* gradient point 1 changed */
                    this._fillStyle.gradientPoint1 = fillStyle.gradientPoint1;
                }
                else if (this._fillStyle.gradientPoint1 == null || 
                        ((fillStyle.gradientRadius1 === null) !== (this._fillStyle.gradientRadius1 === null))) {
                    /* if either this gradient point 1 is not set, or the gradient type has changed,
                     * create a default gradient point 1 */

                    if (fillStyle.gradientRadius1 !== null) { /* radial gradient */
                        this._fillStyle.gradientPoint1 = Webgram.Geometry.Point.zero();
                    }
                    else { /* linear gradient */
                        this._fillStyle.gradientPoint1 = new Webgram.Geometry.Point(-widthHalf, -heightHalf);
                    }
                }
            }
            else { /* gradient point 1 not wanted */
                this._fillStyle.gradientPoint1 = null;
            }
            
            if (fillStyle.gradientPoint2 !== null) { /* gradient point 2 wanted */
                if (fillStyle.gradientPoint2 !== undefined) { /* gradient point 2 changed */
                    this._fillStyle.gradientPoint2 = fillStyle.gradientPoint2;
                }
                else if (this._fillStyle.gradientPoint2 == null) { /* create a default gradient point 2 */
                    this._fillStyle.gradientPoint2 = new Webgram.Geometry.Point(widthHalf, heightHalf);
                }
            }
            else { /* gradient point 2 not wanted */
                this._fillStyle.gradientPoint2 = null;
            }
            
            if (fillStyle.gradientRadius1 !== null) { /* gradient radius 1 wanted */
                if (fillStyle.gradientRadius1 !== undefined) { /* gradient radius 1 changed */
                    this._fillStyle.gradientRadius1 = fillStyle.gradientRadius1;
                }
                else if (this._fillStyle.gradientRadius1 == null) { /* create a default radius 1 */
                    this._fillStyle.gradientRadius1 = 0;
                }
            }
            else { /* gradient radius 1 not wanted */
                this._fillStyle.gradientRadius1 = null;
            }
            
            if (fillStyle.gradientRadius2 !== null) { /* gradient radius 2 wanted */
                if (fillStyle.gradientRadius2 !== undefined) { /* gradient radius 2 changed */
                    this._fillStyle.gradientRadius2 = fillStyle.gradientRadius2;
                }
                else if (this._fillStyle.gradientRadius2 == null) { /* create a default radius 2 */
                    this._fillStyle.gradientRadius2 = Math.min(widthHalf, heightHalf);
                }
            }
            else { /* gradient radius 2 not wanted */
                this._fillStyle.gradientRadius2 = null;
            }
            
            this._setGradientProportionalPoints(this._fillStyle);
            
            if (gradientEditEnabled) {
                this.setGradientEditEnabled(true);
            }
        }
        else {
            this._fillStyle = null;
        }
        
        this.invalidate(true);
        
        this.onChange.trigger();
    },

    /**
     * Returns the default text style used by this element.
     * @returns {Webgram.Styles.TextStyle} the default text style of this element
     */
    getTextStyle: function () {
        return this._textStyle;
    },

    /**
     * Sets the default text style used by this element.
     * The previous text style is not wiped out right away; instead, for each property of the new style
     * that is <tt>undefined</tt>, this method uses the respective property from the previous style.
     * @param {Webgram.Styles.TextStyle} textStyle the default text style to be used by this element
     */
    setTextStyle: function (textStyle) {
        if (textStyle != null) {
            if (this._textStyle == null) {
                /* had no text style before, creating a new default one */
                this._textStyle = Webgram.Styles.getTextStyle('default');
            }
            
            if (textStyle.color !== undefined) { /* color changed */
                this._textStyle.color = textStyle.color;
            }

            if (textStyle.font !== undefined) { /* font changed */
                this._textStyle.font = textStyle.font;
            }

            if (textStyle.size !== undefined) { /* size changed */
                this._textStyle.size = textStyle.size;
            }

            if (textStyle.bold !== undefined) { /* bold changed */
                this._textStyle.bold = textStyle.bold;
            }

            if (textStyle.italic !== undefined) { /* italic changed */
                this._textStyle.italic = textStyle.italic;
            }

            if (textStyle.justify !== undefined) { /* justify changed */
                this._textStyle.justify = textStyle.justify;
            }

        }
        else {
            this._textStyle = null;
        }
        
        this.invalidate(true);
        
        this.onChange.trigger();
    },

    /**
     * Returns the stroke style used to draw the guides of this element.
     * @returns {Webgram.Style.StrokeStyle} the style used to draw the guides
     */
    getGuidesStyle: function () {
        return this._guidesStyle;
    },

    /**
     * Sets the stroke style used to draw the guides of this element.
     * @param {Webgram.Style.StrokeStyle} strokeStyle the style to be used to draw the guides
     */
    setGuidesStyle: function (strokeStyle) {
        this._guidesStyle = strokeStyle;
        
        this.invalidate();
    },

    /**
     * Returns the stroke style used to draw the decoration of this element.
     * @returns {Webgram.Style.StrokeStyle} the style used to draw the decoration
     */
    getDecorationStyle: function (hovered) {
        if (hovered) {
            return this._hoveredDecorationStyle;
        }
        else {
            return this._selectedDecorationStyle;
        }
    },

    /**
     * Sets the stroke style used to draw the decoration of this element.
     * @param {Webgram.Style.StrokeStyle} strokeStyle the style to be used to draw the decoration
     */
    setDecorationStyle: function (strokeStyle, hovered) {
        if (hovered) {
            this._hoveredDecorationStyle = strokeStyle;
        }
        else {
            this._selectedDecorationStyle = strokeStyle;
        }
        
        this.invalidate();
    },


    /* transform shortcuts */

    /**
     * Takes the coordinates of a geometric object relative to this element and makes them
     * relative to its parent's coordinate system. This method does not affect the original object.
     * The applied transforms are in fact a <em>translation<em> followed by a <em>rotation</em>.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to transform
     * @returns {Object} the geometric object relative to the parent 
     */
    transformDirect: function (geometry) {
        var center = this.getBaseRectangle().getCenter();
        
        return geometry.
            getTranslated(center.x, center.y).
            getRotated(this.getRotationAngle(), center);
    },

    /**
     * Takes the coordinates of a geometric object relative to this element's parent and makes them
     * relative to this element's coordinate system. This method does not affect the original object.
     * The applied transforms are in fact a <em>rotation<em> followed by a <em>translation</em>.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to transform
     * @returns {Object} the geometric object relative to this element 
     */
    transformInverse: function (geometry) {
        var center = this.getBaseRectangle().getCenter();
        
        return geometry.
            getRotated(-this.getRotationAngle(), center).
            getTranslated(-center.x, -center.y);
    },

    /**
     * Takes the coordinates of a geometric object relative to this element and translates them
     * into its parent's coordinate system. This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to translate
     * @returns {Object} the geometric object relative to the parent 
     */
    translateDirect: function (geometry) {
        var center = this.getBaseRectangle().getCenter();
        
        return geometry.getTranslated(center.x, center.y);
    },

    /**
     * Takes the coordinates of a geometric object relative to this element's parent and translates them
     * into this element's coordinate system. This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to translate
     * @returns {Object} the geometric object relative to this element 
     */
    translateInverse: function (geometry) {
        var center = this.getBaseRectangle().getCenter();
        
        return geometry.getTranslated(-center.x, -center.y);
    },

    /**
     * Rotates the geometric object using the rotation angle of this element,
     * thus making its rotation relative to the parent's coordinate system.
     * This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to rotate
     * @returns {Object} the geometric object relative to the parent 
     */
    rotateDirect: function (geometry) {
        var center = this.getBaseRectangle().getCenter();
        
        return geometry.getRotated(this.getRotationAngle(), center);
    },

    /**
     * Rotates geometric object using the negative of the rotation angle of this element,
     * this making its rotation relative to this element.
     * This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to rotate
     * @returns {Object} the geometric object relative to this element 
     */
    rotateInverse: function (geometry) {
        var center = this.getBaseRectangle().getCenter();
        
        return geometry.getRotated(-this.getRotationAngle(), center);
    },


    /* shape-related methods */
    
    /**
     * This method returns the <em>base rectangle</em> of this element.
     * The base rectangle is defined as the smallest rectangle,
     * relative to the parent, that includes all the <em>unrotated</em> shape points.
     * The rotation angle never affects the base rectangle,
     * therefore its center is always the center of the element.
     * @returns {Webgram.Geometry.Rectangle} the base rectangle
     */
    getBaseRectangle: function () {
        if (!this._cachedBaseRectangle) {
            this._cachedBaseRectangle = this._computeBaseRectangle();
            this.restoreProportionalPoints();

            if (!this._shapeChanged) {
                this._shapeChanged = true;
                this.onShapeBeginChange.trigger();
            }
            
            this.onShapeChange.trigger();
        }
        
        return this._cachedBaseRectangle;
    },

    /**
     * Marks the previously computed base rectangle as invalid,
     * forcing a recalculation the next time it's requested.
     * This method also invalidates the points ({@link Webgram.DrawingElement#invalidatePoints}),
     * and requests a redraw ({@link Webgram.DrawingElement#invalidate}).<br>
     * Call this method whenever the shape of this element suffers a change.
     */
    invalidateBaseRectangle: function () {
        this._cachedBaseRectangle = null;
        this.invalidatePoints();
        this.invalidate();
    },

    /**
     * A drawing element uses three events to signal that
     * the shape has been changed:
     * {@link Webgram.DrawingElement#onShapeBeginChange},
     * {@link Webgram.DrawingElement#onShapeChange} and 
     * {@link Webgram.DrawingElement#onShapeEndChange}.
     * This method assures a successive and uniform triggering
     * of the three events. It's automatically invoked when
     * one of the shape points is modified via the library-provided
     * methods. However if you add any extra fields that contribute
     * to the definition of the shape, you should add specific <em>getters</em>
     * and <em>setters</em> and call this method with <tt>force</tt> set to <tt>true</tt>
     * at the end of these setters.
     * @param {Boolean} force set to <tt>true</tt> to force the triggering of the events,
     *  regardless of the fact that the shape points were actually changed or not.
     */
    triggerShapeChange: function (force) {
        if (force) {
            this.invalidateBaseRectangle();
        }
        this.getBaseRectangle();
        
        if (this._shapeChanged) {
            if (this.webgram) {
                this.invalidate(true);
                this.onChange.trigger();
            }
            this._shapeChanged = false;
            this.onShapeEndChange.trigger();
        }
    },
    
    /**
     * Returns the <em>bounding rectangle</em> of this element.
     * The bounding rectangle is defined as the smallest rectangle,
     * relative to the parent, that includes all the <em>rotated</em> shape points.
     * As opposed to the <em>base rectangle</em>, the bounding rectangle is affected by
     * the rotation angle of the element.
     * @returns {Webgram.Geometry.Rectangle} the bounding rectangle
     */
    getBoundingRectangle: function () {
        return this.shape.getRotated(this.getRotationAngle(), this.getCenter()).getBoundingRectangle();
    },

    /**
     * Builds and object with the boundaries of this element, relative to the parent.
     * The eight boundaries are instances of {@link Webgram.Geometry.Point}.
     * @returns {Object} an object with:<ul>
     *  <li><tt>topLeft</tt> 
     *  <li><tt>topRight</tt>
     *  <li><tt>bottomLeft</tt>
     *  <li><tt>bottomRight</tt>
     *  <li><tt>top</tt>
     *  <li><tt>right</tt>
     *  <li><tt>bottom</tt>
     *  <li><tt>left</tt>
     * </ul>
     */
    getBounds: function () {
        var baseRectangle = this.getBaseRectangle();
        var boundingPoly = baseRectangle.getPoly().getRotated(this.getRotationAngle(), baseRectangle.getCenter());
        
        return {
            topLeft: boundingPoly.points[0],
            top: boundingPoly.points[0].getCenterTo(boundingPoly.points[1]),
            topRight: boundingPoly.points[1],
            right: boundingPoly.points[1].getCenterTo(boundingPoly.points[2]),
            bottomRight: boundingPoly.points[2],
            bottom: boundingPoly.points[2].getCenterTo(boundingPoly.points[3]),
            bottomLeft: boundingPoly.points[3],
            left: boundingPoly.points[3].getCenterTo(boundingPoly.points[0])
        };
    },

    /**
     * Returns the center of this element, relative to the parent.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Point} the center of this element
     */
    getCenter: function () {
        return this.getBaseRectangle().getCenter();
    },

    /**
     * Returns the width of this element. The width of an element
     * does not depend on the rotation angle.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} this element's width
     */
    getWidth: function () {
        return this.getBaseRectangle().getWidth();
    },

    /**
     * Returns the height of this element. The height of an element
     * does not depend on the rotation angle.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} this element's height
     */
    getHeight: function () {
        return this.getBaseRectangle().getHeight();
    },

    /**
     * Determines if a given <tt>point</tt> (relative to the parent)
     * is inside this element or not.<br><br>
     * <em>(could be overridden)</em> 
     * @param {Webgram.Geometry.Point} point the point to test, relative to parent
     * @returns {Boolean} <tt>true</tt> if the point is inside this element, <tt>false</tt> otherwise
     */
    pointInside: function (point) {
        return this.rotateDirect(this.getBaseRectangle().getPoly()).pointInside(point);
    },

    
    /* shape manipulation & snapping */
    
    /**
     * Modifies the <tt>index</tt>-th point of the shape so that when applying the rotation,
     * the final point will have the coordinates specifined by <tt>point</tt>, relative to the parent.<br>
     * The other points of the shape will be recalculated in such a way that when rotated,
     * they will keep their effective position on the parent.<br>
     * This method does not apply any kind of snapping.<br><br>
     * <em>(should not be overridden)</em>
     * @param index {Number} the index of the point in the shape to be modified
     * @param point {Webgram.Geometry.Point} the desired position of the point
     */
    setRotatedShapePoint: function (index, point) {
        this._setRotatedShapePoint(index, point, true);
        this.triggerShapeChange();
    },

    /**
     * Snaps the whole element, or just a single point,
     * using the <em>external</em> and <em>grid</em> snapping methods.
     * @param {Number} index the index of a point in the shape,
     *  or <tt>null</tt>/<tt>undefined</tt> to snap the whole element
     */
    snap: function (index) {
        if (index == null) { /* snap the whole element */
            /* find the best point to snap and move the whole shape accordingly */
            var i, deltaX, deltaY;
            var result, point;
            var minDeltaX = Infinity;
            var minDeltaY = Infinity;
            var minSnapX = null;
            var minSnapY = null;
            var snapVisualFeedback = {type: null, x: null, y: null, angle: null};

            var center = this.getCenter();
            var snappingPoints = this.getSnappingPoints();

            /* first try to snap externally (to siblings) */
            if (this.isSnapExternallyEnabled()) {
                for (i = 0; i < snappingPoints.length; i++) {
                    var fixedPoints = snappingPoints.slice(0, i).concat(snappingPoints.slice(i + 1));
                    point = snappingPoints[i];
                    result = this.snapExternally(i, point, fixedPoints, 0, center);
                    
                    /* if point didn`t snap, try the next one */
                    if (result == null) {
                        continue;
                    }
                    
                    if (result.x != null) {
                        deltaX = result.x - point.x;
                        if (Math.abs(deltaX) < Math.abs(minDeltaX)) {
                            minDeltaX = deltaX;
                            minSnapX = result.x;
                            snapVisualFeedback.x = result.x;
                            snapVisualFeedback.type = 'linear';
                        }
                    }
                    if (result.y != null) {
                        deltaY = result.y - point.y;
                        if (Math.abs(deltaY) < Math.abs(minDeltaY)) {
                            minDeltaY = deltaY;
                            minSnapY = result.y;
                            snapVisualFeedback.y = result.y;
                            snapVisualFeedback.type = 'linear';
                        }
                    }
                }
            }
            
            var xSnapped = minSnapX != null;
            var ySnapped = minSnapY != null;
            
            /* if at least one of the two axes didn`t snap, snap it to grid */
            if (this.isSnapToGridEnabled() && (minSnapX == null || minSnapY == null)) {
                for (i = 0; i < snappingPoints.length; i++) {
                    point = snappingPoints[i];
//                    /* avoid snapping the center point to grid */
//                    if (point.x === center.x && point.y === center.y) {
//                        continue;
//                    }
                    
                    result = this.snapToGrid(point, 0, center);
                    
                    /* if point didn`t snap, try the next one */
                    if (result == null) {
                        continue;
                    }
                    
                    if (result.x != null && !xSnapped) {
                        deltaX = result.x - point.x;
                        if (Math.abs(deltaX) < Math.abs(minDeltaX)) {
                            minDeltaX = deltaX;
                            minSnapX = result.x;
                        }
                    }
                    if (result.y != null && !ySnapped) {
                        deltaY = result.y - point.y;
                        if (Math.abs(deltaY) < Math.abs(minDeltaY)) {
                            minDeltaY = deltaY;
                            minSnapY = result.y;
                        }
                    }
                }
            }
            
            if (minDeltaX < Infinity) {
                this.shape= this.shape.getTranslated(minDeltaX, 0);
                this.invalidateBaseRectangle();
            }
            if (minDeltaY < Infinity) {
                this.shape= this.shape.getTranslated(0, minDeltaY);
                this.invalidateBaseRectangle();
            }
            
            if (snapVisualFeedback.type == null) {
                snapVisualFeedback = null;
            }
            
            this.setSnapVisualFeedback(snapVisualFeedback);
        }
        else { /* snap just the specified point */
            var rotatedShape = this.rotateDirect(this.shape);
            this._setRotatedShapePoint(index, rotatedShape.points[index], true);
        }
    },

    /**
     * Snaps the given point <em>externally</em>. By default, the external snapping
     * consists of simply snapping to the siblings.<br><br>
     * <em>(could be overridden)</em>
     * @param {Number} index the index of the point in the shape
     * @param {Webgram.Geometry.Point} point the point to snap
     * @param {Array} fixedPoints the rest of the points
     * @param {Number} rotationAngle the actual rotation angle of this element
     * @param {Wegram.Geometry.Point} center the current center of this element
     * @returns {Webgram.Geometry.Point} the snapped point 
     */
    snapExternally: function (index, point, fixedPoints, rotationAngle, center) {
        if (this.getSetting('snapDistance')) {
            return this._snapToSiblings(point, rotationAngle, center);
        }
    },
    
    /**
     * Snaps the given point <em>internally</em> (i.e. against other points of the shape).<br><br>
     * <em>(could be overridden)</em>
     * @param {Number} index the index of the point in the shape
     * @param {Wegram.Geometry.Point} point the point to snap
     * @param {Array} fixedPoints the rest of the points
     * @param {Number} rotationAngle the current rotation angle of this drawing element
     * @param {Wegram.Geometry.Point} center the current center of this drawing element
     * @returns {Object} the snapping results with:<ul>
     *  <li><tt>x</tt> - Number|Function, the x snapped value or equation</li>
     *  <li><tt>y</tt> - Number|Function, the y snapped value or equation</li>
     *  <li><tt>preferredPoint</tt> - {@link Wegram.Geometry.Point}, a suggested point (can be <tt>null</tt>),
     *   used only if both <tt>x</tt> and <tt>y</tt> are given as functions and no other snapping results are available</li>
     *  <li><tt>snapVisualFeedback</tt> - Array|Object, the visual snapping feedback details</li>
     * </ul>
     */
    snapInternally: function (index, point, fixedPoints, rotationAngle, center) {
    },

    /**
     * Snaps the given point to the <em>grid</em>.
     * @param {Webgram.Geometry.Point} point the point to snap
     * @param {Number} rotationAngle the current rotation angle of this element
     * @param {Wegram.Geometry.Point} center the current center of this element
     * @returns {Webgram.Geometry.Point} the snapped point
     */
    snapToGrid: function (point, rotationAngle, center) {
        var snapGrid = this.getSetting('snapGrid');
        if (snapGrid == null) {
            return;
        }

        /* snap the point */
        point = new Webgram.Geometry.Point(
                Math.round(point.x / snapGrid.sizeX) * snapGrid.sizeX,
                Math.round(point.y / snapGrid.sizeY) * snapGrid.sizeY);

        return point;
    },
    
    /**
     * Returns a list of {@link Webgram.Geometry.Point} to be used for <em>external</em> snapping.
     * @returns {Array} the list of snapping points
     */
    getSnappingPoints: function () {
        var points = Webgram.Utils.clone(this.rotateDirect(this.shape).points);
        points.push(this.getCenter());
        
        return points;
    },

    /**
     * Applies the constraints on the given shape point. This method
     * does not modify the shape point in place, but rather returns the
     * constrained point. The default implementation leaves the point unchanged.<br><br>
     * <em>(could be overridden)</em>
     * @param {Number} index the index of the point in the shape
     * @param {Webgram.Geometry.Point} point the point to apply the constraints to
     * @param {Array} fixedPoints the rest of the points
     * @param {Number} rotationAngle the current rotation angle of this drawing element
     * @param {Webgram.Geometry.Point} center the current center of this element
     * @returns
     */
    applyShapePointConstraints: function (index, point, fixedPoints, rotationAngle, center) {
        return point;
    },
    
    /**
     * Sets the <em>snap visual feedback</em> to display.
     * The snap visual feedback is the mechanism used
     * to display a feedback to the user so that she knows
     * that a snapping occurred. The snapping can be either <em>linear</em>
     * or <em>radial</em>.
     * This call determines the canvas do display the snapping feedback guides,
     * for a relatively short period of time.
     * @param {Object} snapVisualFeedback an object or an array of objects with<ul>
     *  <li><tt>type</tt></li> - <tt>'linear'</tt> or <tt>'radial'</tt>
     *  <li><tt>x</tt></li> - the x coordinate of the snapping center, or <tt>null</tt>
     *  <li><tt>y</tt></li> - the y coordinate of the snapping center, or <tt>null</tt>
     *  <li><tt>angle</tt></li> - the snapping angle, in case of a radial snapping 
     * </ul>
     */
    setSnapVisualFeedback: function (snapVisualFeedback) {
        if (this._parent != null) {
            this._parent.setSnapVisualFeedback(snapVisualFeedback);
        }
    },
    

    /* moving, rotating & flipping */
    
    /**
     * Moves the element's center to the given <tt>point</tt>.
     * @param point {Webgram.Geometry.Point} the new center, relative to parent
     */
    moveTo: function (point) {
        var originalCenter = this.getCenter();
        var deltaX = point.x - originalCenter.x;
        var deltaY = point.y - originalCenter.y;
        
        this.shape= this.shape.getTranslated(deltaX, deltaY);
        this.invalidateBaseRectangle();
        
        this.snap();
        
        this.invalidateBaseRectangle();
        this.saveParentRelativePosition();
        
        if (this.isRotationCenterEnabled()) {
            this.rotationCenterControlPoint.reset();
            this.setRotationCenterEnabled(false);
        }

        this.invalidatePoints();
        
        /* recompute the deltaX and deltaY, so that the onMove event
         * gets triggered with the actual coordinates difference */
        deltaX = this.getCenter().x - originalCenter.x;
        deltaY = this.getCenter().y - originalCenter.y;
        
        if (deltaX !== 0 || deltaY !== 0) {            
            this.onMove.trigger(deltaX, deltaY);
        }

        if (!this._mouseDownPoint) { /* programmatically moved */
            this.triggerShapeChange();
        }
        
        this.invalidate();
    },

    /**
     * Returns the rotation angle of this element.
     * @returns {Number} the rotation angle of this element
     */
    getRotationAngle: function () {
        return Webgram.Utils.normalizeAngle(this._rotationAngle);
    },

    /**
     * Sets the rotation angle of this element.
     * @param {Number} angle the new rotation angle
     */
    setRotationAngle: function (angle) {
        this.onBeginRotate.trigger();
        this._setRotationAngle(angle);
        this.onRotate.trigger(angle);
        this.onEndRotate.trigger();
        this.invalidate(true);
        
        this.onChange.trigger();
    },
    
    /**
     * Tells whether the element is flipped horizontally or not.
     * @returns {Boolean} <tt>true</tt> if the element is flipped horizontally, <tt>false</tt> otherwise
     */
    isFlippedHorizontally: function () {
        return this._flippedHorizontally;
    },

    /**
     * Flips this element horizontally.<br><br>
     * <em>(should not be overridden)</em>
     */
    flipHorizontally: function () {
        if (!this.isFlipEnabled()) {
            return;
        }
        
        if (this.isRotateEnabled()) {
            this.setRotationAngle(-this.getRotationAngle());
        }
        
        this._flipGradientProportionalPoints(this._fillStyle, true);
        this._flipGradientProportionalPoints(this._strokeStyle, true);
        this.flipShapeHorizontally();
        
        this._flippedHorizontally = !this._flippedHorizontally;
        this.onFlipHorizontally.trigger();
    },
    
    /**
     * Performs a horizontal flip on the shape.<br><br>
     * <em>(could be overridden)</em>
     */
    flipShapeHorizontally: function () {
        var points = [];
        var center = this.getCenter();
        for (var i = 0; i < this.shape.points.length; i++) {
            var point = new Webgram.Geometry.Point(2 * center.x - this.shape.points[i].x, this.shape.points[i].y);
            points.push(point);
        }
        
        this.shape= new Webgram.Geometry.Poly(points);
        this.invalidateBaseRectangle();
        this.invalidate(true);
    },

    /**
     * Tells whether the element is flipped vertically or not.
     * @returns {Boolean} <tt>true</tt> if the element is flipped vertically, <tt>false</tt> otherwise
     */
    isFlippedVertically: function () {
        return this._flippedVertically;
    },
    
    /**
     * Flips this element vertically.<br><br>
     * <em>(should not be overridden)</em>
     */
    flipVertically: function () {
        if (!this.isFlipEnabled()) {
            return false;
        }
        
        this._flipGradientProportionalPoints(this._fillStyle, this.isRotateEnabled());
        this._flipGradientProportionalPoints(this._strokeStyle, this.isRotateEnabled());
        
        if (this.isRotateEnabled()) {
            /* a vertical flip is equivalent to a rotation by PI - angle,
             * plus a horizontal flip */
            this.setRotationAngle(Math.PI - this.getRotationAngle());
            this.flipShapeHorizontally();
        }
        else {
            this.flipShapeVertically();
        }

        this._flippedVertically = !this._flippedVertically;
        this.onFlipVertically.trigger();
    },

    /**
     * Performs a vertical flip on the shape.<br><br>
     * <em>(could be overridden)</em>
     */
    flipShapeVertically: function () {
        var points = [];
        var center = this.getCenter();
        
        for (var i = 0; i < this.shape.points.length; i++) {
            var point = new Webgram.Geometry.Point(this.shape.points[i].x, 2 * center.y - this.shape.points[i].y);
            points.push(point);
        }
        
        this.shape= new Webgram.Geometry.Poly(points);
        this.invalidateBaseRectangle();
        this.invalidate(true);
    },


    /* parent-related methods */

    /**
     * Stores the element's position and shape relative to the parent internally,
     * so that it can be later restored using {@link Webgram.DrawingElement#restoreParentRelativePosition}.
     */
    saveParentRelativePosition: function () {
        var parentWidth = this._parent.getWidth();
        var parentHeight = this._parent.getHeight();
        
        this._parentRelativePositions = [];
        for (var i = 0; i < this.shape.points.length; i++) {
            var point = this.shape.points[i];
            point = this.rotateDirect(point);
            
            this._parentRelativePositions.push({
                x: point.x / (parentWidth - 1),
                y: point.y / (parentHeight - 1)
            });
        }
    },

    /**
     * Restores the position and shape relative the parent, previously saved with
     * {@link Webgram.DrawingElement#saveParentRelativePosition}.
     */
    restoreParentRelativePosition: function () {
        var parentWidth = this._parent.getWidth();
        var parentHeight = this._parent.getHeight();
        
        /* update shape points */
        for (var i = 0; i < this._parentRelativePositions.length; i++) {
            var percents = this._parentRelativePositions[i];
            
            var point = new Webgram.Geometry.Point(
                percents.x * (parentWidth - 1),
                percents.y * (parentHeight - 1)
            );
            
            this.shape.points[i] = point;
        }
        
        var newCenter = this.shape.getBoundingRectangle().getCenter();
        this.shape= this.shape.getRotated(-this.getRotationAngle(), newCenter);

        this.invalidateBaseRectangle();
    },

    /**
     * Makes this element the child of <tt>containerElement</tt>. If this element
     * is already a child of another parent, it is firstly removed from that parent's children list.
     * The absolute coordinates and rotation angle of this element are preserved.
     * @param {Webgram.DrawingElements.ContainerElement} containerElement the new parent of this element
     */
    enterContainerElement: function (containerElement) {
        this._enterContainerElement(containerElement, true);
    },

    /**
     * Makes this element the child of it's parent's parent.
     * The absolute coordinates and rotation angle of this element are preserved.
     */
    leaveContainerElement: function () {
        this._leaveContainerElement(true);
    },

    /**
     * Returns the parent of this element, or <tt>null</tt> if it has not been added to a container yet.
     * @returns {Webgram.DrawingElements.ContainerElement} the parent of this element
     */
    getParent: function () {
        if (this._parent instanceof Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer) {
            return this._parent._parent;
        }
        else {
            return this._parent;
        }
    },

    /**
     * Tells whether this element is enclosed into another {@link Webgram.DrawingElements.ContainerElement} or
     * is a direct child of the root container.
     * @returns {Boolean} <tt>true</tt> if the element is enclosed, <tt>false</tt> otherwise
     */
    isEnclosed: function () {
        return this._parent && this._parent._parent;
    },


    /* proportional points, control points, sockets & action menu items */

    /**
     * Effectively updates all the points of this element (<tt>sockets</tt>, <tt>control points</tt> and <tt>action menu items</tt>),
     * by calling their <tt>update</tt> methods.
     */
    updatePoints: function () {
        var i;
        
        for (i = 0; i < this._sockets.length; i++) {
            var socket = this._sockets[i];
            socket.update();
        }

        for (i = 0; i < this._controlPoints.length; i++) {
            var controlPoint = this._controlPoints[i];
            controlPoint.update();
        }

        for (i = 0; i < this._actionMenuItems.length; i++) {
            var actionMenuItem = this._actionMenuItems[i];
            actionMenuItem.update();
        }
    },

    /**
     * Marks the points of this element (<tt>sockets</tt>, <tt>control points</tt> and <tt>action menu items</tt>)
     * as invalid, forcing a future call to {@link Webgram.DrawingElement#updatePoints}.
     */
    invalidatePoints: function () {
        this._updatePoints = true;
        if (this._parent) {
            this._parent.invalidatePoints();
        }
    },
    
    /**
     * Adds a <em>proportional</em> to this element. A proportional point is practically an instance of
     * {@link Webgram.Geometry.Point} which is automatically adjusted to maintain its relative position to the element.
     * @param {Webgram.Geometry.Point} point the proportional point to add
     * @param {Function} onChange a function to be called whenever the point is changed due to proportionality constraints
     */
    addProportionalPoint: function (point, onChange) {
        if (!this.getBaseRectangle()) {
            return;
        }
        
        this._proportionalPoints.push(point);
        this.saveProportionalPoint(point);
        
        point._onChange = onChange;
    },

    /**
     * Removes the given <tt>point</tt> from the list of proportional points.
     * @param {Webgram.Geometry.Point} the proportional point to remove
     */
    remProportionalPoint: function (point) {
        this._proportionalPoints.splice(Webgram.Utils.indexOf(this._proportionalPoints, point), 1);
        
        delete point._relativePosition;
        delete point._onChange;
    },

    /**
     * Updates the relative position of an existing proportional point.
     * @param {Webgram.Geometry.Point} the proportional point to update
     */
    saveProportionalPoint: function (point) {
        var width = this.getWidth();
        var height = this.getHeight();
        var x, y;
        
        if (width === 1) {
            x = 0;
        }
        else {
            x = point.x / (width - 1);
        }
        
        if (height === 1) {
            y = 0;
        }
        else {
            y = point.y / (height - 1);
        }
        
        point._relativePosition = {x: x, y: y};
    },

    /**
     * Restores the relative positions of all the proportional points,
     * according to the new size of the element.
     */
    restoreProportionalPoints: function () {
        var width = this.getWidth();
        var height = this.getHeight();
        
        for (var i = 0; i < this._proportionalPoints.length; i++) {
            var point = this._proportionalPoints[i];
            
            point.x = (width - 1) * point._relativePosition.x;
            point.y = (height - 1) * point._relativePosition.y;
            
            if (point._onChange != null) {
                point._onChange.call(this, point);
            }
        }
    },

    /**
     * Adds a {@link Webgram.ControlPoint} to the element.
     * @param {Webgram.ControlPoint} controlPoint the control point to add
     */
    addControlPoint: function (controlPoint) {
        controlPoint.drawingElement = this;
        this._controlPoints.push(controlPoint);
        this.invalidate();
        
        controlPoint.onAdd.trigger(this);
    },

    /**
     * Removes a {@link Webgram.ControlPoint} from the element.
     * @param {Webgram.ControlPoint} controlPoint the control point to remove
     */
    remControlPoint: function (controlPoint) {
        controlPoint.onRemove.trigger(this);
        
        controlPoint.drawingElement = null;
        this._controlPoints.splice(Webgram.Utils.indexOf(this._controlPoints, controlPoint), 1);
        this.invalidate();
    },

    /**
     * Determines whether a <tt>point</tt> is inside of one of this element's control points area or not.
     * @param {Webgram.Geometry.Point} point the point to test
     * @returns {Webgram.ControlPoint} the control point over which the given point is,
     *  or <tt>null</tt> if there's no such control point
     */
    pointInsideControlPoint: function (point) {
        for (var i = this._controlPoints.length - 1; i >= 0; i--) {
            var controlPoint = this._controlPoints[i];
            if (controlPoint.pointInside(point)) {
                return controlPoint;
            }
        }

        return null;
    },

    /**
     * Returns a list of all the control points that are instances of a given class.
     * @param {Function} controlPointClass the class of control points, or <tt>null</tt> if you want all the control points returned
     * @returns {Array} the list of control points
     */
    getControlPoints: function (controlPointClass) {
        var controlPoints = [];
        for (var i = 0; i < this._controlPoints.length; i++) {
            var controlPoint = this._controlPoints[i];
            if (!controlPointClass || controlPoint instanceof controlPointClass) {
                controlPoints.push(controlPoint);
            }
        }
        
        return controlPoints;
    },

    /**
     * Adds a {@link Webgram.Connectors.Socket} to the element.
     * @param {Webgram.Connectors.Socket} socket the socket to add
     */
    addSocket: function (socket) {
        socket.drawingElement = this;
        this._sockets.push(socket);
        this.invalidate();
    },

    /**
     * Removes a {@link Webgram.Connectors.Socket} from the element.
     * @param {Webgram.Connectors.Socket} socket the socket to remove
     */
    remSocket: function (socket) {
        socket.drawingElement = null;
        this._sockets.splice(Webgram.Utils.indexOf(this._sockets, socket), 1);
        this.invalidate();
    },

    /**
     * Returns a list of all the sockets of this element.
     * @returns {Array} the list of sockets
     */
    getSockets: function () {
        return this._sockets.slice();
    },

    /**
     * Determines whether a <tt>point</tt> is inside of one of this element's sockets area or not.
     * @param {Webgram.Geometry.Point} point the point to test
     * @returns {Webgram.Connectors.Socket} the socket over which the given point is,
     *  or <tt>null</tt> if there's no such socket
     */
    pointInsideSocket: function (point) {
        for (var i = 0; i < this._sockets.length; i++) {
            var socket = this._sockets[i];
            if (socket.pointInside(point)) {
                return socket;
            }
        }

        return null;
    },

    /**
     * Adds a {@link Webgram.ActionMenuItem} to the element.
     * @param {Webgram.ActionMenuItem} actionMenuItem the action menu item to add
     */
    addActionMenuItem: function (actionMenuItem) {
        actionMenuItem.drawingElement = this;
        this._actionMenuItems.push(actionMenuItem);
        this.invalidate();
        
        actionMenuItem.onAdd.trigger(this);
    },

    /**
     * Removes a {@link Webgram.ActionMenuItem} from the element.
     * @param {Webgram.ActionMenuItem} actionMenuItem the action menu item to remove
     */
    remActionMenuItem: function (actionMenuItem) {
        actionMenuItem.onRemove.trigger(this);
        
        actionMenuItem.drawingElement = null;
        this._actionMenuItems.splice(Webgram.Utils.indexOf(this._actionMenuItems, actionMenuItem), 1);
        this.invalidate();
    },

    /**
     * Returns a list of all the action menu items of this element.
     * @returns {Array} the list of action menu items
     */
    getActionMenuItems: function () {
        return this._actionMenuItems.slice();
    },

    /**
     * Determines whether a <tt>point</tt> is inside of one of this element's action menu items area or not.
     * @param {Webgram.Geometry.Point} point the point to test
     * @returns {Webgram.ActionMenuItem} the action menu item over which the given point is,
     *  or <tt>null</tt> if there's no such action menu item
     */
    pointInsideActionMenuItem: function (point) {
        for (var i = 0; i < this._actionMenuItems.length; i++) {
            var actionMenuItem = this._actionMenuItems[i];
            if (actionMenuItem.pointInside(point)) {
                return actionMenuItem;
            }
        }

        return null;
    },


    /* settings */

    /**
     * Tells whether the <em>hovered control points</em> feature is enabled for this element or not.
     * @returns {Boolean} <tt>true></tt> if the hovered control points feature is enabled, <tt>false</tt> otherwise
     */
    isHoveredControlPointsEnabled: function () {
        return this._hoveredControlPointsEnabled;
    },

    /**
     * Enables or disables the <em>hovered control points</em> feature for this element.
     * When this feature is enabled, the element becomes hovered if the mouse is over one of its control points.
     * @param {Boolean} enabled <tt>true</tt> to enable the feature, <tt>false</tt> to disable it
     */
    setHoveredControlPointsEnabled: function (enabled) {
        this._hoveredControlPointsEnabled = enabled;
    },

    /**
     * Tells whether the element is selectable or not.
     * @returns {Boolean} <tt>true></tt> if the element is selectable, <tt>false</tt> otherwise
     */
    isSelectEnabled: function () {
        return this._selectEnabled;
    },

    /**
     * Makes the element selectable or non-selectable.
     * @param {Boolean} enabled <tt>true</tt> to enable selection, <tt>false</tt> to disable it
     */
    setSelectEnabled: function (enabled) {
        this._selectEnabled = enabled;
    },

    /**
     * Tells whether the element is movable or not.
     * @returns {Boolean} <tt>true></tt> if the element is movable, <tt>false</tt> otherwise
     */
    isMoveEnabled: function () {
        return this._moveEnabled;
    },

    /**
     * Makes the element movable or non-movable.
     * @param {Boolean} enabled <tt>true</tt> to enable moving, <tt>false</tt> to disable it
     */
    setMoveEnabled: function (enabled) {
        this._moveEnabled = enabled;
    },
    
    /**
     * Tells whether the element is rotatable or not.
     * @returns {Boolean} <tt>true></tt> if the element is rotatable, <tt>false</tt> otherwise
     */
    isRotateEnabled: function () {
        return this._rotateEnabled;
    },

    /**
     * Makes the element rotatable or non-rotatable.
     * @param {Boolean} enabled <tt>true</tt> to enable rotation, <tt>false</tt> to disable it
     */
    setRotateEnabled: function (enabled) {
        if (enabled) {
            if (this._rotateEnabled) { /* already enabled, disable it first */
                return;
            }
            
            this.rotateControlPoint = new Webgram.ControlPoints.RotateControlPoint();
            this.addControlPoint(this.rotateControlPoint);
    
            this._rotateEnabled = true;
        }
        else {
            if (!this._rotateEnabled) { /* not enabled */
                return;
            }
            
            this.remControlPoint(this.rotateControlPoint);
            this.rotateControlPoint = null;
            
            /* if the rotation center is also enabled, disable it */
            if (this.rotationCenterControlPoint) {
                this.setRotationCenterEnabled(false);
            }
            
            this._rotateEnabled = false;
        }
    },
    
    /**
     * Tells whether the element's rotation center can be changed or not.
     * @returns {Boolean} <tt>true></tt> if the element is rotatable, <tt>false</tt> otherwise
     */
    isRotationCenterEnabled: function () {
        return this.rotationCenterControlPoint != null;
    },
    
    /**
     * Tells whether the element's rotation center has been changed or not
     * (i.e. whether it differs from the default value, which is the center of the element).
     * @returns {Boolean} <tt>true></tt> if the rotation center was changed, <tt>false</tt> otherwise
     */
    isRotationCenterMoved: function () {
        return (this.rotationCenter != null) && ((this.rotationCenter.x !== 0) || (this.rotationCenter.y !== 0));
    },
    
    /**
     * Enables or disables changing of the rotation center of the element.
     * Changing is done using a special control point. This control point will
     * only be present in the element when this feature is enabled.
     * @see Webgram.ControlPoints.RotationCenterControlPoint
     * @param {Boolean} enabled <tt>true></tt> if the rotation center can be changed, <tt>false</tt> otherwise
     */
    setRotationCenterEnabled: function(enabled) {
        if (enabled) {
            if (!this._rotateEnabled) { /* rotation center requires rotating to be enabled */
                return;
            }
            
            if (this.rotationCenterControlPoint) { /* already enabled */
                return;
            }
            
            this.rotationCenterControlPoint = new Webgram.ControlPoints.RotationCenterControlPoint();
            this.addControlPoint(this.rotationCenterControlPoint);
        }
        else {
            if (!this._rotateEnabled) { /* rotation center requires rotating to be enabled */
                return;
            }
            
            if (!this.rotationCenterControlPoint) { /* not enabled */
                return;
            }
            
            this.remControlPoint(this.rotationCenterControlPoint);
            this.rotationCenterControlPoint = null;
        }
    },
    
    /**
     * Tells whether flipping is enabled or not.
     * @returns {Boolean} <tt>true></tt> if flipping is enabled, <tt>false</tt> otherwise
     */
    isFlipEnabled: function () {
        return this._flipEnabled;
    },

    /**
     * Enables or disables flipping for this element.
     * @param {Boolean} enabled <tt>true</tt> to enable flipping, <tt>false</tt> to disable it
     */
    setFlipEnabled: function(enabled) {
        this._flipEnabled = enabled;
    },
    
    /**
     * Tells whether the gradients of this element are editable or not.
     * @returns {Boolean} <tt>true></tt> if gradient editing is enabled, <tt>false</tt> otherwise
     */
    isGradientEditEnabled: function () {
        return this._gradientEditEnabled;
    },
    
    /**
     * Enables or disables the editing of the gradients of this element.
     * Editing is done using a couple of control points. These control points are present in the element
     * only when the feature is enabled.
     * @see Webgram.ControlPoints.GradientControlPoint
     * @see Webgram.ControlPoints.GradientRadiusControlPoint
     * @param {Boolean} enabled <tt>true</tt> to enable gradient editing, <tt>false</tt> to disable it
     */
    setGradientEditEnabled: function(enabled) {
        if (enabled) {
            if (this._gradientEditEnabled) { /* already enabled */
                return;
            }
            
            this._setGradientControlPoints(this._fillStyle);
            this._setGradientControlPoints(this._strokeStyle);
            
            this._gradientEditEnabled = true;
            this.invalidate();
        }
        else {
            if (!this._gradientEditEnabled) { /* already disabled */
                return;
            }
            
            this._clearGradientControlPoints(this._fillStyle);
            this._clearGradientControlPoints(this._strokeStyle);
            
            this._gradientEditEnabled = false;
            this.invalidate();
        }
    },
    
    /**
     * Tells whether snapping to angle is enabled for this element or not.
     * @returns {Boolean} <tt>true></tt> if snapping to angle is enabled, <tt>false</tt> otherwise
     */
    isSnapToAngleEnabled: function () {
        return this._snapToAngleEnabled;
    },

    /**
     * Enables or disables snapping to angle for this element.
     * When snapping to angle is enabled, {@link Webgram.DrawingElement#setRotationAngle}
     * will snap the rotation angle to a multiple of the setting <tt>snapAngle</tt>.
     * @param {Boolean} enabled <tt>true</tt> to enable snapping to angle, <tt>false</tt> to disable it
     */
    setSnapToAngleEnabled: function (enabled) {
        this._snapToAngleEnabled = enabled;
    },

    /**
     * Tells whether internal snapping is enabled for this element or not.
     * @returns {Boolean} <tt>true></tt> if internal snapping is enabled, <tt>false</tt> otherwise
     */
    isSnapInternallyEnabled: function () {
        return this._snapInternallyEnabled;
    },

    /**
     * Enables or disables internal snapping for this element.
     * When internal snapping is enabled, changes to the shape will
     * be followed by a call to {@link Webgram.DrawingElement#snapInternally}.
     * @param {Boolean} enabled <tt>true</tt> to enable internal snapping, <tt>false</tt> to disable it
     */
    setSnapInternallyEnabled: function (enabled) {
        this._snapInternallyEnabled = enabled;
    },

    /**
     * Tells whether external snapping is enabled for this element or not.
     * @returns {Boolean} <tt>true></tt> if external snapping is enabled, <tt>false</tt> otherwise
     */
    isSnapExternallyEnabled: function () {
        return this._snapExternallyEnabled;
    },

    /**
     * Enables or disables external snapping for this element.
     * When external snapping is enabled, moves or changes to the shape will
     * be followed by a call to {@link Webgram.DrawingElement#snapExternally}.
     * @param {Boolean} enabled <tt>true</tt> to enable external snapping, <tt>false</tt> to disable it
     */
    setSnapExternallyEnabled: function (enabled) {
        this._snapExternallyEnabled = enabled;
    },

    /**
     * Tells whether snapping to grid is enabled for this element or not.
     * @returns {Boolean} <tt>true></tt> if snapping to grid is enabled, <tt>false</tt> otherwise
     */
    isSnapToGridEnabled: function () {
        return this._snapToGridEnabled;
    },
    
    /**
     * Enables or disables snapping to grid for this element.
     * When snapping to grid is enabled, moves or changes to the shape will
     * be followed by a call to {@link Webgram.DrawingElement#snapToGrid}.
     * @param {Boolean} enabled <tt>true</tt> to enable snapping to grid, <tt>false</tt> to disable it
     */
    setSnapToGridEnabled: function (enabled) {
        this._snapToGridEnabled = enabled;
    },
    
    /**
     * Defines how the element behaves when the <em>shift</em> key is pressed.
     * The behavior is defined by a pair of <em>test</em> and <em>control</em> functions.
     * These are usually pairs of <tt>is[Feature]Enabled</tt> and <tt>set[Feature]Enabled</tt> methods.
     * Multiple behaviors can be added by calling this method multiple times with different pairs of functions.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Function} controlFunc a function that takes a Boolean <tt>enable</tt> argument - used to enable or disable the behavior
     * @param {Function} testFunc a function that takes no argument and tells whether the feature is enabled or not
     * @param {Boolean} reverse <tt>true</tt> to enable the feature when the <em>shift</em> key is released and disable it when it's pressed,
     *  <tt>false</tt> or <tt>undefined</tt> otherwise
     */
    addShiftBehavior: function (controlFunc, testFunc, reverse) {
        if (reverse == null) {
            reverse = false;
        }
        
        if (testFunc && testFunc.call(this) !== reverse) {
            /* refuse to add this behavior if its current state
             * is the one that`s supposed to be when shift is enabled */
            
            return;
        }
            
        this._shiftBehaviors.push({
            controlFunc: controlFunc,
            testFunc: testFunc,
            enabled: reverse,
            reverse: reverse
        });
    },

    /**
     * Enables all the behaviors added with {@link Webgram.DrawingElement#addShiftBehavior}.
     * This method is mainly used internally when the <em>shift</em> key is pressed.<br><br>
     * <em>(should not be overridden)</em>
     */
    enableShift: function () {
        if (this._shiftEnabled) {
            return;
        }
        
        for (var i = 0; i < this._shiftBehaviors.length; i++) {
            var behavior = this._shiftBehaviors[i];
            if (behavior.testFunc != null) {
                if (behavior.testFunc.call(this) !== behavior.reverse) {
                    continue;
                }
            }
            
            behavior.controlFunc.call(this, !behavior.reverse);
            behavior.enabled = !behavior.reverse;
        }
        
        this._shiftEnabled = true;
    },

    /**
     * Disables all the behaviors added with {@link Webgram.DrawingElement#addShiftBehavior}.
     * This method is mainly used internally when the <em>shift</em> key is released.<br><br>
     * <em>(should not be overridden)</em>
     */
    disableShift: function () {
        if (!this._shiftEnabled) {
            return;
        }
        
        for (var i = 0; i < this._shiftBehaviors.length; i++) {
            var behavior = this._shiftBehaviors[i];
            if (behavior.testFunc != null) {
                if (behavior.testFunc.call(this) === behavior.reverse) {
                    continue;
                }
            }
            
            behavior.controlFunc.call(this, behavior.reverse);
            behavior.enabled = behavior.reverse;
        }
        
        this._shiftEnabled = false;
    },
    
    /**
     * Tells whether the shift behaviors are enabled or not.
     * @returns {Boolean} <tt>true</tt> if the shift behaviors are enabled, <tt>false</tt> otherwise
     */
    isShiftEnabled: function () {
        return this._shiftEnabled;
    },

    /**
     * Returns a webgram setting. These settings are global and are available to each
     * element added to the webgram instance.<br><br>
     * <em>(should not be overridden)</em>
     * @param {String} setting the full name of the setting
     * @param {any} def the default value to return if the setting is not present
     * @returns {any} the value of the setting, or <tt>def</tt> if it is not present
     */
    getSetting: function (setting, def) {
        if (!this.webgram) { /* not added yet */
            return null;
        }
        
        return this.webgram.getSetting(setting, def);
    },
    

    /* creation */
    
    /**
     * Tells whether the element is in the process of being created
     * by the {@link Webgram.DrawingControls.CreateDrawingControl} or not.
     * @returns {Boolean} <tt>true</tt> if the element is being created, <tt>false</tt> otherwise
     */
    isCreating: function () {
        return this._creating;
    },
    
    /**
     * Defines the way an element of this class is initially created.
     * This method is called by the {@link Webgram.DrawingControl.CreateDrawingControl}
     * with the first click of the user when creating an element of this class.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point of the initial click
     * @returns {Boolean} <tt>true</tt> if the creation process should continue, <tt>false</tt> if the creation is done
     */
    beginCreate: function (point) {
        return false;
    },

    /**
     * Defines the way an element of this class is further created.
     * This method is called by the {@link Webgram.DrawingControl.CreateDrawingControl}
     * with every mouse move or click when creating an element of this class.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.Geometry.Point} point the current point of the mouse
     * @param {Webgram.Geometry.Size} size the size of the element, obtained as a difference between the first creation point and the current point
     * @param {Boolean} mouseDown <tt>true</tt> if one of the mouse buttons is down, <tt>false</tt> otherwise
     * @param {Boolean} click <tt>true</tt> if the user just pressed the mouse button, <tt>false</tt> otherwise
     * @returns {Boolean} <tt>true</tt> if the creation process should continue, <tt>false</tt> if the creation is done
     */
    continueCreate: function (point, size, mouseDown, click) {
        return true;
    },

    /**
     * Defines the way an element finishes and cleans up after it has been created.
     * This method is called by the {@link Webgram.DrawingControl.CreateDrawingControl}
     * when the creation process ends.<br><br>
     * <em>(should be overridden)</em>
     * @returns {Boolean} <tt>true</tt> if the creation process was successful and the element should be kept,
     *  <tt>false</tt> if the creation was unsuccessful and the element should be removed immediately
     */
    endCreate: function () {
        return true;
    },

    
    /* json */
    
    /**
     * Prepares a json object with the components that make up the shape of this element
     * (usually the points of the <tt>shape</tt> field).<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} the json with the shape information
     */
    shapeToJson: function () {
        var i, shape, points = [];
        
        if (this._parent && (this._parent instanceof Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer)) {
            /* hack to make the element report coordinates relative to its actual parent,
             * rather than relative to the MS CE it belongs to right now */
            
            var msceParent = this._parent;
            var msceCenter = msceParent.getCenter();
            
            if (msceParent.getRotationAngle() !== 0) {
                var center = this.getCenter();
                var rotatedCenter = center.getRotated(msceParent.getRotationAngle());
                var deltaX = msceCenter.x + rotatedCenter.x - center.x;
                var deltaY = msceCenter.y + rotatedCenter.y - center.y;
                
                shape = this.shape.getTranslated(deltaX, deltaY);
            }
            else {
                shape = this.shape.getTranslated(msceCenter.x, msceCenter.y);
            }
        }
        else {
            shape = this.shape;
        }
        
        for (i = 0; i < shape.points.length; i++) {
            points.push({x: shape.points[i].x, y: shape.points[i].y});
        }
        
        return points;
    },
    
    /**
     * Restores the components of this element that make up the shape,
     * from a json object.<br><br>
     * <em>(could be overridden)</em>
     * @param {Object} json the json object contanining the shape information
     */
    shapeFromJson: function (json) {
        var i, points = [];
        for (i = 0; i < json.length; i++) {
            var point = json[i];
            points.push(new Webgram.Geometry.Point(point.x, point.y));
        }
        
        this.shape= new Webgram.Geometry.Poly(points);
        
        /* apply the shape constraints */
        var rotationAngle = this.getRotationAngle();
        var center = this.getCenter();
        for (i = 0; i < this.shape.points.length; i++) {
            var fixedPoints = this.shape.points.slice(0, i).concat(this.shape.points.slice(i + 1));
            this.shape.points[i] = this._applyShapePointConstraints(i, this.shape.points[i], fixedPoints, rotationAngle, center);
        }
        
        this.invalidateBaseRectangle();
    },
    
    /**
     * Prepares a json object with the rotation angle of this element.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} the json object with the rotation angle
     */
    rotationAngleToJson: function () {
        var rotationAngle;
        
        if (this._parent && (this._parent instanceof Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer)) {
            /* hack to make the element report an angle relative to its actual parent,
             * rather than relative to the MS CE it belongs to right now */
            
            var msceParent = this._parent;
            
            if (msceParent.getRotationAngle() !== 0) {
                rotationAngle = this.getRotationAngle() + msceParent.getRotationAngle();
            }
            else {
                rotationAngle = this.getRotationAngle();
            }
        }
        else {
            rotationAngle = this.getRotationAngle();
        }
        
        return rotationAngle;
    },
    
    /**
     * Restores the rotation angle of this element from a json object.<br><br>
     * <em>(could be overridden)</em>
     * @param {Object} json the json object with the rotation angle
     */
    rotationAngleFromJson: function (json) {
        this._rotationAngle = json;
        
        if (this.rotationCenterControlPoint) {
            this.rotationCenterControlPoint.reset();
        }
    },
    
    /**
     * Prepares a json object with the stroke style of this element.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} the json object with the stroke style
     */
    strokeStyleToJson: function () {
        var strokeStyle = this.getStrokeStyle();
        
        if (strokeStyle != null) {
            return strokeStyle.toJson();
        }
        else {
            return null;
        }
    },
    
    /**
     * Restores the stroke style of this element from a json object.<br><br>
     * <em>(could be overridden)</em>
     * @param {Object} json the json object with the stroke style
     */
    strokeStyleFromJson: function (json) {
        if (json !== null) {
            var strokeStyle = this.getStrokeStyle();
            if (strokeStyle == null) {
                strokeStyle = Webgram.Styles.getStrokeStyle('default');
            }
            
            strokeStyle.fromJson(json);
            
            this.setStrokeStyle(strokeStyle);
        }
        else {
            this.setStrokeStyle(null);
        }
    },
    
    /**
     * Prepares a json object with the fill style of this element.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} the json object with the fill style
     */
    fillStyleToJson: function () {
        var fillStyle = this.getFillStyle();
        
        if (fillStyle != null) {
            return fillStyle.toJson();
        }
        else {
            return null;
        }
    },
    
    /**
     * Restores the fill style of this element from a json object.<br><br>
     * <em>(could be overridden)</em>
     * @param {Object} json the json object with the fill style
     */
    fillStyleFromJson: function (json) {
        if (json !== null) {
            var fillStyle = this.getFillStyle();
            if (fillStyle == null) {
                fillStyle = Webgram.Styles.getFillStyle('default');
            }
            
            fillStyle.fromJson(json);
            
            this.setFillStyle(fillStyle);
        }
        else {
            this.setFillStyle(null);
        }
    },
    
    /**
     * Prepares a json object with the fill text of this element.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} the json object with the text style
     */
    textStyleToJson: function () {
        var textStyle = this.getTextStyle();
        
        if (textStyle != null) {
            return textStyle.toJson();
        }
        else {
            return null;
        }
    },
    
    /**
     * Restores the text style of this element from a json object.<br><br>
     * <em>(could be overridden)</em>
     * @param {Object} json the json object with the text style
     */
    textStyleFromJson: function (json) {
        if (json !== null) {
            var textStyle = this.getTextStyle();
            if (textStyle == null) {
                textStyle = Webgram.Styles.getTextStyle('default');
            }
            
            textStyle.fromJson(json);
            
            this.setTextStyle(textStyle);
        }
        else {
            this.setTextStyle(null);
        }
    },
    
    /**
     * Prepares a json object with various settings of this element
     * (not to be confused with the global webgram settings).<br><br>
     * <em>(should be overridden)</em>
     * @returns {Object} the json object with the settings
     */
    settingsToJson: function () {
        return {
            'moveEnabled': this._moveEnabled,
            'rotateEnabled': this._rotateEnabled,
            'selectEnabled': this._selectEnabled,
            'snapToAngleEnabled': this._snapToAngleEnabled,
            'snapExternallyEnabled': this._snapExternallyEnabled,
            'snapToGridEnabled': this._snapToGridEnabled
        };
    },
    
    /**
     * Restores various settings of this element from a json object.<br><br>
     * <em>(should be overridden)</em>
     * @param {Object} json the json object with the settings
     */
    settingsFromJson: function (json) {
        if (json.moveEnabled !== undefined && json.moveEnabled !== this._moveEnabled) {
            this.setMoveEnabled(json.moveEnabled);
        }

        if (json.rotateEnabled !== undefined && json.rotateEnabled !== this._rotateEnabled) {
            this.setRotateEnabled(json.rotateEnabled);
        }

        if (json.selectEnabled !== undefined && json.selectEnabled !== this._selectEnabled) {
            this.setSelectEnabled(json.selectEnabled);
        }

        if (json.snapToAngleEnabled !== undefined && json.snapToAngleEnabled !== this._snapToAngleEnabled) {
            this.setSnapToAngleEnabled(json.snapToAngle);
        }

        if (json.snapExternallyEnabled !== undefined && json.snapExternallyEnabled !== this._snapExternallyEnabled) {
            this.setSnapExternallyEnabled(json.snapExternallyEnabled);
        }

        if (json.snapToGridEnabled !== undefined && json.snapToGridEnabled !== this._snapToGridEnabled) {
            this.setSnapToGridEnabledEnabled(json.snapToGridEnabled);
        }
    },
    
    /**
     * Includes additional fields when creating and restoring from the json object that completely
     * characterizes this element.
     * @param {String} field the name of the field to include in the json object
     */
    addJsonField: function (field) {
        this._jsonFields.push(field);
    },
    
    /**
     * Includes additional information when creating and restoring from the json object that completely
     * characterizes this element. The information extracted/restored using two function calls.
     * @param {String} name the name to give to the json field
     * @param {Function} toFunc a function to be called to extract the additional information; it will receive the element as <tt>this</tt>
     * @param {Function} fromFunc a function to be called to restore the additional information; it will receive the element as <tt>this</tt>,
     * and the information as a first argument
     */
    addJsonFuncs: function (name, toFunc, fromFunc) {
        this._jsonFuncs.push({name: name, toFunc: toFunc, fromFunc: fromFunc});
    },
    
    /**
     * Generates a json object that completely characterizes this element.
     * The result should be enough to restore the element using
     * {@link Webgram.DrawingElement#fromJson}.
     * @returns {Object} the json object
     */
    toJson: function () {
        /* could be overridden */
        
        var json = {
            'id': this.getId(),
            'className': this.constructor.toString(),
            'shape': this.shapeToJson(),
            'rotationAngle': this.rotationAngleToJson(),
            'strokeStyle': this.strokeStyleToJson(),
            'fillStyle': this.fillStyleToJson(),
            'textStyle': this.textStyleToJson()
        };
        
        var fields = this._fieldsToJson();
        for (var key in fields) {
            json[key] = fields[key];
        }
        
        fields = this._funcsToJson();
        for (var key in fields) {
            json[key] = fields[key];
        }
        
        return json;
    },
    
    /**
     * Restores the element from a json object. This method is the opposite
     * of {@link Webgram.DrawingElement#toJson}.
     * @param {Object} json the json object to restore the element from
     */
    fromJson: function(json) {
        /* should be overridden */
        
        if (json.id !== undefined) {
            this.setId(json.id);
        }
        if (json.shape!== undefined) {
            this.shapeFromJson(json.shape);
        }
        if (json.rotationAngle !== undefined) {
            this.rotationAngleFromJson(json.rotationAngle);
        }
        if (json.strokeStyle !== undefined) {
            this.strokeStyleFromJson(json.strokeStyle);
        }
        if (json.fillStyle !== undefined) {
            this.fillStyleFromJson(json.fillStyle);
        }
        if (json.textStyle !== undefined) {
            this.textStyleFromJson(json.textStyle);
        }
        
        this._fieldsFromJson(json);
        this._funcsFromJson(json);
    },

    
    /* private methods */
    
    _getTransformSet: function (transformSet) {
        var baseRectangle = this.getBaseRectangle();
        var center = baseRectangle.getCenter();
        
        if (transformSet) {
            transformSet.addRotation(this.getRotationAngle());
            transformSet.addTranslation(center.x, center.y);
            
            return transformSet;
        }
        else {
            transformSet = new Webgram.Canvas.TransformSet();
            
            transformSet.addRotation(this.getRotationAngle());
            transformSet.addTranslation(center.x, center.y);
            
            return transformSet;
        }
    },

    _setRotatedShapePoint: function (index, point, noSnapFeedback) {
        var oldCenter = this.getCenter();
        var rotationAngle = this.getRotationAngle();
        
        /* gather fixed points */
        var nrFixedPoints = [];
        var fixedPoints = [];
        for (var i = 0; i < this.shape.points.length; i++) {
            if (i !== index) {
                nrFixedPoints.push(this.shape.points[i]); 
                fixedPoints.push(this.shape.points[i].getRotated(rotationAngle, oldCenter));
            }
        }
        
        var nrPoint = point.getRotated(-rotationAngle, oldCenter);
        var snapDetails = this._snapShapePoint(index, nrPoint, nrFixedPoints, rotationAngle, oldCenter);
        nrPoint = snapDetails.point;
        nrPoint = this._applyShapePointConstraints(index, nrPoint, nrFixedPoints, rotationAngle, oldCenter);
        
        point = nrPoint.getRotated(rotationAngle, oldCenter);
        
        /* compute the new center */
        var poly = new Webgram.Geometry.Poly(fixedPoints.concat(point));
        poly = poly.getRotated(-rotationAngle);
        var newCenter = poly.getBoundingRectangle().getCenter().getRotated(rotationAngle);
        
        nrFixedPoints = new Webgram.Geometry.Poly(fixedPoints).getRotated(-rotationAngle, newCenter).points;
        nrPoint = point.getRotated(-rotationAngle, newCenter);
        
        /* restore all shape points */
        nrFixedPoints.splice(index, 0, nrPoint);
        this.shape= new Webgram.Geometry.Poly(nrFixedPoints);
        
        this.invalidateBaseRectangle();
        
        if (!noSnapFeedback) {
            this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
        }
    },
    
    /**
     * Snaps the given shape point, using all the snapping methods in order.
     * @param {Number} index the index of the point in the shape
     * @param {Webgram.Geometry.Point} point the point to snap
     * @param {Array} fixedPoints the rest of the shape points
     * @param {Number} rotationAngle the actual rotation angle of this DE
     * @param {Webgram.Geometry.Point} center the actual center of this DE
     * @returns {Object} an object with:
     *     {Webgram.Geometry.Point} point the snapped point
     *     {Object} snapVisualFeedback the snapping details to display:
     *         {String} type: 'linear' or 'radial'
     *         {Number} x the x coordinate of the snapping center
     *         {Number} y the y coordinate of the snapping center
     *         {Number} angle the snapping angle, in case of a radial snapping
     *     {Boolean} xSnapped whether the x coordinate snapped (externally or internally) or not
     *     {Boolean} ySnapped whether the y coordinate snapped (externally or internally) or not
     */
    _snapShapePoint: function (index, point, fixedPoints, rotationAngle, center) {
        var result;
        var snappedPoint;
        var snappedX = null, snappedY = null;
        var xSnapped = false, ySnapped = false;
        var funcX = null, funcY = null;
        var preferredPoint = null;
        var snapVisualFeedback = null;

        /* try to snap the point internally first */
        if (this.isSnapInternallyEnabled()) {
            result = this.snapInternally(index, point, fixedPoints, rotationAngle, center);
            if (result != null) {
                if (rotationAngle !== 0) {
                    /* if the element is rotated, we cannot combine the internal snapping with the external one,
                     * and therefore if we have an internal snapping result, we return it right away */
                    
                    if (result.x != null) {
                        if (result.y != null) {
                            /* the both coordinates were returned */
                            if (result.x instanceof Function) {
                                if (result.y instanceof Function) {
                                    /* the both coordinates are given as functions;
                                     * we have no other choice than using the preferred point */
                                    
                                    if (result.preferredPoint != null) {
                                        /* if a preferred point was given, use it */
                                        snappedX = result.preferredPoint.x;
                                        snappedY = result.preferredPoint.y;
                                    }
                                    else {
                                        /* if no preferred point was given, we have no choice
                                         * but to use the original point */
                                        snappedX = point.x;
                                        snappedY = point.y;
                                    }
                                }
                                else {
                                    /* the x coordinate is given as function, the y coordinate is a number */
                                    /* this case shouldn`t occur */
                                    
                                    snappedX = result.x(result.y);
                                    snappedY = result.y;
                                    // ySnapped = true;
                                }
                            }
                            else {
                                if (result.y instanceof Function) {
                                    /* the x coordinate is a number, the y coordinate is given as function */
                                    /* this case shouldn`t occur */
                                    snappedX = result.x;
                                    snappedY = result.y(result.x);
                                    // xSnapped = true;
                                }
                                else {
                                    /* the both coordinates are numbers */
                                    snappedX = result.x;
                                    snappedY = result.y;
                                    // xSnapped = true;
                                    // ySnapped = true;
                                }
                            }
                        }
                        else {
                            /* only the x coordinate was returned */
                            if (result.x instanceof Function) {
                                /* the x coordinate is given as a function */
                                snappedX = result.x(point.y);
                                snappedY = point.y;
                            }
                            else {
                                /* the x coordinate is given as a number */
                                snappedX = result.x;
                                snappedY = point.y;
                                // xSnapped = true;
                            }
                        }
                    }
                    else {
                        if (result.y != null) {
                            /* only the y coordinate was returned */
                            if (result.y instanceof Function) {
                                /* the y coordinate is given as a function */
                                snappedX = point.x;
                                snappedY = result.y(point.x);
                            }
                            else {
                                /* the y coordinate is given as a number */
                                snappedX = point.x;
                                snappedY = result.y;
                                // ySnapped = true;
                            }
                        }
                        else {
                            /* none of the coordinates was returned */
                            
                            /* this case shouldn`t actually occur - the internal snapping function
                             * should rather return null or undefined */
                            snappedX = point.x;
                            snappedY = point.y;
                        }
                    }
                    
                    if (result.snapVisualFeedback != null) {
                        if (!(result.snapVisualFeedback instanceof Array)) {
                            result.snapVisualFeedback = [result.snapVisualFeedback];
                        }
                        
                        snapVisualFeedback = [];
                        
                        for (var i = 0; i < result.snapVisualFeedback.length; i++) {
                            var svf = result.snapVisualFeedback[i];
                            
                            /* while the snapped point should be returned unrotated,
                             * the display snap info coordinates must be returned rotated */
                            snapCenter = new Webgram.Geometry.Point(svf.x, svf.y);
                            snapCenter = snapCenter.getRotated(rotationAngle, center);
                            
                            if (svf.type === 'linear') {
                                snapVisualFeedback.push({
                                    type: 'linear',
                                    x: snapCenter.x,
                                    y: snapCenter.y
                                });
                            }
                            else {
                                snapVisualFeedback.push({
                                    type: 'radial',
                                    x: snapCenter.x,
                                    y: snapCenter.y,
                                    angle: svf.angle + rotationAngle
                                });
                            }
                        }
                    }
                    
                    /* return the snapped point right away */
                    snappedPoint = new Webgram.Geometry.Point(snappedX, snappedY);
                    
                    return {
                        point: snappedPoint,
                        snapVisualFeedback: snapVisualFeedback,
                        xSnapped: xSnapped,
                        ySnapped: ySnapped
                    };
                }
                else { /* rotationAngle === 0 */
                    /* if the element is not rotated, we try to combine the results of the internal snapping
                     * with the one returned by the external snapping or the one returned by the grid snapping */
                    
                    if (result.x != null) {
                        if (result.y != null) {
                            /* the both coordinates were returned */
                            if (result.x instanceof Function) {
                                if (result.y instanceof Function) {
                                    /* the both coordinates are given as functions */
                                    funcX = result.x;
                                    funcY = result.y;
                                    
                                    if (result.preferredPoint != null) {
                                        /* if a preferred point was given, use it */
                                        preferredPoint = result.preferredPoint;
                                    }
                                }
                                else {
                                    /* the x coordinate is given as function, the y coordinate is a number */
                                    /* this case shouldn`t occur */
                                    
                                    snappedX = result.x(result.y);
                                    snappedY = result.y;
                                    ySnapped = true;
                                }
                            }
                            else {
                                if (result.y instanceof Function) {
                                    /* the x coordinate is a number, the y coordinate is given as function */
                                    /* this case shouldn`t occur */
                                    snappedX = result.x;
                                    snappedY = result.y(result.x);
                                    xSnapped = true;
                                }
                                else {
                                    /* the both coordinates are numbers */
                                    snappedX = result.x;
                                    snappedY = result.y;
                                    xSnapped = true;
                                    ySnapped = true;
                                }
                            }
                        }
                        else {
                            /* only the x coordinate was returned */
                            if (result.x instanceof Function) {
                                /* the x coordinate is given as a function */
                                funcX = result.x;
                            }
                            else {
                                /* the x coordinate is given as a number */
                                snappedX = result.x;
                                xSnapped = true;
                            }
                        }
                    }
                    else {
                        if (result.y != null) {
                            /* only the y coordinate was returned */
                            if (result.y instanceof Function) {
                                /* the y coordinate is given as a function */
                                funcY = result.y;
                            }
                            else {
                                /* the y coordinate is given as a number */
                                snappedY = result.y;
                                ySnapped = true;
                            }
                        }
                        else {
                            /* none of the coordinates was returned */
                            
                            /* this case shouldn`t actually occur - the internal snapping function
                             * should rather return null or undefined */
                        }
                    }
                    
                    if (result.snapVisualFeedback != null) {
                        if (!(result.snapVisualFeedback instanceof Array)) {
                            result.snapVisualFeedback = [result.snapVisualFeedback];
                        }
                        
                        snapVisualFeedback = [];
                        
                        /* we need to prepare this snapped point in order to compute
                         * the radius to use with the radial snap visual feedback */
                        snappedPoint = new Webgram.Geometry.Point(snappedX, snappedY);
                        if (snappedPoint.x == null) {
                            snappedPoint.x = point.x;
                        }
                        if (snappedPoint.y == null) {
                            snappedPoint.y = point.y;
                        }
                        
                        for (var i = 0; i < result.snapVisualFeedback.length; i++) {
                            var svf = result.snapVisualFeedback[i];
                            
                            /* while the snapped point should be returned unrotated,
                             * the display snap info coordinates must be returned rotated */
                            snapCenter = new Webgram.Geometry.Point(svf.x, svf.y);
                            snapCenter = snapCenter.getRotated(rotationAngle, center);
                            
                            if (svf.type === 'linear') {
                                snapVisualFeedback.push({
                                    type: 'linear',
                                    x: snapCenter.x,
                                    y: snapCenter.y
                                });
                            }
                            else {
                                snapVisualFeedback.push({
                                    type: 'radial',
                                    x: snapCenter.x,
                                    y: snapCenter.y,
                                    angle: svf.angle + rotationAngle
                                });
                            }
                        }
                    }
                }
            }
        }
        
        /* external snapping requires the rotated point */
        point = point.getRotated(rotationAngle, center);

        /* try to snap externally (to siblings) */
        var internalSnapVisualFeedback = snapVisualFeedback; /* remember the svf returned by the internal snapping */
        if ((snappedX == null || snappedY == null) && this.isSnapExternallyEnabled()) {
            result = this.snapExternally(index, point, fixedPoints, rotationAngle, center);
            if (result != null) {
                if ((result.x != null && snappedX == null) || (result.y != null && snappedY == null)) {
                    /* if at least one coordinate snapped externally,
                     * the display snap info is considered to be linear */
                    snapVisualFeedback = {
                        type: 'linear',
                        x: null,
                        y: null
                    };
                    
                    if (result.x != null && snappedX == null) {
                        snappedX = result.x; 
                        snapVisualFeedback.x = result.x;
                        xSnapped = true;
                    }
                    if (result.y != null && snappedY == null) {
                        snappedY = result.y;
                        snapVisualFeedback.y = result.y;
                        ySnapped = true;
                    }
                }
            }
        }
        
        /* conclude the internal and external snapping */
        if (snappedX == null) {
            if (snappedY == null) {
                /* neither of the two coordinates has snapped,
                 * the only thing we have to do is to apply
                 * the functions (equations) given by the internal snapping */
                
                if (funcX != null) {
                    if (funcY != null) {
                        /* the both functions were supplied */
                        if (preferredPoint != null) {
                            /* use a preferred point if any */
                            snappedX = preferredPoint.x;
                            snappedY = preferredPoint.y;
                        }
                        else {
                            /* no preferred point? use one of the
                             * original point`s coordinate at random */
                            snappedY = funcY;
                        }
                    }
                    else {
                        /* only funcX is given */
                        snappedX = funcX;
                    }
                }
                else {
                    if (funcY != null) {
                        /* only funcY is given */
                        snappedY = funcY;
                    }
                    else {
                        /* none of the equations is given,
                         * let the snapping to grid decide the final point */
                    }
                }
            }
            else {
                /* only the y coordinate snapped */
                if (funcX != null) {
                    /* apply the x equation */
                    snappedX = funcX(snappedY);
                }
                
                /* although we have both coordinates snapped now,
                 * we want to ignore the points that are way too far
                 * from the original point, and use instead the preferred point */
                var dist = new Webgram.Geometry.Point(snappedX, snappedY).getDistanceTo(point);
                var snapDistance = this.getSetting('snapDistance', Math.min(this.getWidth(), this.getHeight()) / 4);
                if (dist > 2 * snapDistance && preferredPoint != null) {
                    snappedX = preferredPoint.x;
                    snappedY = preferredPoint.y;
                    snapVisualFeedback = internalSnapVisualFeedback;
                }
            }
        }
        else {
            if (snappedY == null) {
                /* only the x coordinate snapped */
                if (funcY != null) {
                    /* apply the y equation */
                    snappedY = funcY(snappedX);
                }

                /* although we have both coordinates snapped now,
                 * we want to ignore the points that are way too far
                 * from the original point, and use instead the preferred point */
                var dist = new Webgram.Geometry.Point(snappedX, snappedY).getDistanceTo(point);
                var snapDistance = this.getSetting('snapDistance', Math.min(this.getWidth(), this.getHeight()) / 4);
                if (dist > 2 * snapDistance && preferredPoint != null) {
                    snappedX = preferredPoint.x;
                    snappedY = preferredPoint.y;
                    snapVisualFeedback = internalSnapVisualFeedback;
                }
            }
            else {
                /* the both coordinates snapped, nothing more to do */
            }
        }
        
        /* and finally snap to grid */
        if (this.isSnapToGridEnabled() && (snappedX == null || snappedY == null)) {
            result = this.snapToGrid(point, rotationAngle, center);
            if (result != null) {
                /* snapping to grid does not set the snap display details */
                
                if (result.x != null && snappedX == null) {
                    snappedX = result.x;
                }
                if (result.y != null && snappedY == null) {
                    snappedY = result.y;
                }
                
                if (snappedX instanceof Function) {
                    snappedX = snappedX(snappedY);
                }
                if (snappedY instanceof Function) {
                    snappedY = snappedY(snappedX);
                }
            }
        }

        /* if no snapping succedded at all, keep the original coordinates */ 
        if (snappedX == null) {
            snappedX = point.x;
        }
        if (snappedY == null) {
            snappedY = point.y;
        }
        
        var snappedPoint = new Webgram.Geometry.Point(snappedX, snappedY);
        
        if (rotationAngle !== 0) {
            /* rotate back the snapped point */
            snappedPoint = snappedPoint.getRotated(-rotationAngle, center);
        }
        
        return {
            point: snappedPoint,
            snapVisualFeedback: snapVisualFeedback,
            xSnapped: xSnapped,
            ySnapped: ySnapped
        };
    },
    
    _snapToSiblings: function (point, rotationAngle, center) {
        var snapDistance = this.getSetting('snapDistance');
        if (snapDistance == null) {
            return;
        }
        
        var snapX = null;
        var minDx = Infinity;
        var snapY = null;
        var minDy = Infinity;
        
        for (var i = 0; i < this._parent.drawingElements.length; i++) {
            var drawingElement = this._parent.drawingElements[i];
            
            if (drawingElement === this) { /* don`t snap to this element */
                continue;
            }
            
            if (drawingElement instanceof Webgram.Connectors.Connector) { /* don`t snap to connectors */
                continue;
            }
            
            var thosePoints = drawingElement.getSnappingPoints();
            
            for (var j = 0; j < thosePoints.length; j++) {
                var thatPoint = thosePoints[j];
                
                var dx = thatPoint.x - point.x;
                if (Math.abs(dx) <= snapDistance && Math.abs(dx) < Math.abs(minDx)) {
                    snapX = thatPoint.x;
                    minDx = dx;
                }
                
                var dy = thatPoint.y - point.y;
                if (Math.abs(dy) <= snapDistance && Math.abs(dy) < Math.abs(minDy)) {
                    snapY = thatPoint.y;
                    minDy = dy;
                }
            }
        }
        
        if (snapX != null || snapY != null) { /* something snapped at least */
            return new Webgram.Geometry.Point(snapX, snapY);
        }
    },
    
    _applyShapePointConstraints: function (index, point, fixedPoints, rotationAngle, center) {
        point = this.applyShapePointConstraints(index, point, fixedPoints, rotationAngle, center);
        
        return point;
    },
    
    _computeBaseRectangle: function () {
        return this.shape.getBoundingRectangle();
    },

    _setRotationAngle: function (angle) {
        var snapAngle = this.getSetting('snapAngle');
        var snapAngleThreshold = this.getSetting('snapAngleThreshold');
        
        if (this.isSnapToAngleEnabled() && snapAngle != null && 
                this.rotationCenter.x === 0 && this.rotationCenter.y === 0 && /* only snap when rotation center is the center of the DE */
                snapAngle != null) {
            
            var snappedAngle = Webgram.Utils.getSnappedAngle(angle, snapAngle, snapAngleThreshold);
            if (snappedAngle != null) {
                var center = this.getCenter();
                this.setSnapVisualFeedback({
                    type: 'radial',
                    x: center.x, y: center.y, 
                    angle: snappedAngle - Math.PI / 2
                });
                
                angle = snappedAngle;
            }
        }
        else {
            angle = Webgram.Utils.normalizeAngle(angle);
        }
        
        this._rotationAngle = angle;
        
        if (this._parent != null) {
            this.saveParentRelativePosition();
        }
        
        this.invalidatePoints();
        this.invalidate();
    },

    _enterContainerElement: function (containerElement, triggerEvents) {
        if (containerElement.getRotationAngle() !== 0) { /* don`t enter a rotated block element */
            return;
        }

        if (this._parent) {
            this._parent._remDrawingElement(this, triggerEvents);
        }
        
        containerElement._addDrawingElement(this, null, triggerEvents);
        
        var blockCenter = containerElement.getCenter();
        
        this.shape= this.shape.getTranslated(-blockCenter.x, -blockCenter.y);
        this.invalidateBaseRectangle();
        
        this._focusType = Webgram.DrawingElement.FOCUS_NONE;
        
        if (this.rotationCenterControlPoint) {
            this.rotationCenterControlPoint.reset();
        }

        this.saveParentRelativePosition();
        this.invalidatePoints();
    },

    _leaveContainerElement: function (triggerEvents) {
        if (!this._parent || !this._parent._parent) {
            return;
        }
        
        var oldParent = this._parent;
        var newParent = oldParent._parent;
        oldParent._remDrawingElement(this, triggerEvents);
        newParent._addDrawingElement(this, null, triggerEvents);
        
        var parentCenter = oldParent.getCenter();
        
        if (oldParent.getRotationAngle() !== 0) {
            var center = this.getCenter();
            var rotatedCenter = center.getRotated(oldParent.getRotationAngle());
            var deltaX = parentCenter.x + rotatedCenter.x - center.x;
            var deltaY = parentCenter.y + rotatedCenter.y - center.y;
            
            this.shape= this.shape.getTranslated(deltaX, deltaY);
            this._rotationAngle += oldParent.getRotationAngle();
        }
        else {
            this.shape= this.shape.getTranslated(parentCenter.x, parentCenter.y);
        }
        
        this.invalidateBaseRectangle();
        
        this._focusType = Webgram.DrawingElement.FOCUS_NONE;

        if (this.rotationCenterControlPoint) {
            this.rotationCenterControlPoint.reset();
        }

        this.saveParentRelativePosition();
        this.invalidatePoints();
    },

    _setGradientProportionalPoints: function (style) {
        if (style == null) {
            return;
        }
        
        var gradientPoint1 = style.gradientPoint1;
        if (gradientPoint1 != null) { /* linear or radial gradient */
            if (style.gradientRadius1 != null) { /* radial gradient */
                gradientPoint1._radiusPoint1 = new Webgram.Geometry.Point(gradientPoint1.x, gradientPoint1.y + style.gradientRadius1);
                gradientPoint1._radiusPoint2 = new Webgram.Geometry.Point(gradientPoint1.x + style.gradientRadius2, gradientPoint1.y);
                
                this.addProportionalPoint(gradientPoint1._radiusPoint1, function (point) {
                    style.gradientRadius1 = gradientPoint1._radiusPoint1.getDistanceTo(gradientPoint1);
                    this.invalidate();
                });
                
                this.addProportionalPoint(gradientPoint1._radiusPoint2, function (point) {
                    style.gradientRadius2 = gradientPoint1._radiusPoint2.getDistanceTo(gradientPoint1);
                    this.invalidate();
                });
                
                this.addProportionalPoint(gradientPoint1);
            }
            else {
                this.addProportionalPoint(gradientPoint1);
            }
        }
        
        if (style.gradientPoint2 != null && style.gradientRadius1 == null) { /* linear gradient */
            this.addProportionalPoint(style.gradientPoint2);
        }
    },

    _setGradientControlPoints: function (style) {
        if (style == null) {
            return;
        }
        
        var gradientPoint1 = style.gradientPoint1;
        var gradientControlPoint;
        if (gradientPoint1 != null) { /* linear or radial gradient */
            gradientControlPoint = new Webgram.ControlPoints.GradientControlPoint(style.gradientPoint1, style.gradientPoint2, true, style);
            gradientPoint1._controlPoint = gradientControlPoint;

            this.addControlPoint(gradientControlPoint);
            
            if (style.gradientRadius1 != null) { /* radial gradient */
                gradientPoint1._radiusControlPoint1 =
                    new Webgram.ControlPoints.GradientRadiusControlPoint(gradientPoint1._radiusPoint1, gradientPoint1, true, style);
                gradientPoint1._radiusControlPoint2 =
                    new Webgram.ControlPoints.GradientRadiusControlPoint(gradientPoint1._radiusPoint2, gradientPoint1, false, style);
                
                this.addControlPoint(gradientPoint1._radiusControlPoint1);
                this.addControlPoint(gradientPoint1._radiusControlPoint2);
            }
        }
        
        if (style.gradientPoint2 != null && style.gradientRadius1 == null) { /* linear gradient */
            gradientControlPoint = new Webgram.ControlPoints.GradientControlPoint(style.gradientPoint2, style.gradientPoint1, false, style);
            style.gradientPoint2._controlPoint = gradientControlPoint;
            
            this.addControlPoint(gradientControlPoint);
        }
        
       style._gradientEditEnabled = true;
    },
    
    _clearGradientProportionalPoints: function (style) {
        if (style == null) {
            return;
        }
        
        if (style.gradientPoint1 != null) {
            this.remProportionalPoint(style.gradientPoint1);
            
            if (style.gradientPoint1._radiusPoint1 != null) {
                this.remProportionalPoint(style.gradientPoint1._radiusPoint1);
                this.remProportionalPoint(style.gradientPoint1._radiusPoint2);
            }
        }

        if (style.gradientPoint2 != null && style.gradientRadius1 == null) {
            this.remProportionalPoint(style.gradientPoint2);
        }
    },
    
    _clearGradientControlPoints: function (style) {
        if (style == null || style._gradientEditEnabled == null) {
            return;
        }
        
        if (style.gradientPoint1 != null && style.gradientPoint1._controlPoint != null) {
            this.remControlPoint(style.gradientPoint1._controlPoint);
            
            if (style.gradientPoint1._radiusControlPoint1 != null) {
                this.remControlPoint(style.gradientPoint1._radiusControlPoint1);
                this.remControlPoint(style.gradientPoint1._radiusControlPoint2);
                style.gradientPoint1._radiusControlPoint1 = null;
                style.gradientPoint1._radiusControlPoint2 = null;
            }
        }

        if (style.gradientPoint2 != null && style.gradientPoint2._controlPoint != null && style.gradientRadius1 == null) {
            this.remControlPoint(style.gradientPoint2._controlPoint);
        }
        
        delete style._gradientEditEnabled;
    },
    
    _flipGradientProportionalPoints: function (style, horizontally) {
        if (style == null) {
            return;
        }
        
        if (style.gradientPoint1 != null) {
            if (horizontally) {
                style.gradientPoint1.x = -style.gradientPoint1.x;
            }
            else {
                style.gradientPoint1.y = -style.gradientPoint1.y;
            }
            
            this.saveProportionalPoint(style.gradientPoint1);
            
            if (style.gradientPoint1._radiusPoint1 != null) {
                if (horizontally) {
                    style.gradientPoint1._radiusPoint1.x = -style.gradientPoint1._radiusPoint1.x;
                    style.gradientPoint1._radiusPoint2.x = -style.gradientPoint1._radiusPoint2.x;
                }
                else {
                    style.gradientPoint1._radiusPoint1.y = -style.gradientPoint1._radiusPoint1.y;
                    style.gradientPoint1._radiusPoint2.y = -style.gradientPoint1._radiusPoint2.y;
                }
                    
                this.saveProportionalPoint(style.gradientPoint1._radiusPoint1);
                this.saveProportionalPoint(style.gradientPoint1._radiusPoint2);
            }
        }

        if (style.gradientPoint2 != null && style.gradientRadius1 == null) {
            if (horizontally) {
                style.gradientPoint2.x = -style.gradientPoint2.x;
            }
            else {
                style.gradientPoint2.y = -style.gradientPoint2.y;
            }
            
            this.saveProportionalPoint(style.gradientPoint2);
        }
    },
    
    _setWebgram: function (webgram) {
        this.webgram = webgram;
        if (this._id == null) {
            this._id = ':local:' + webgram.getNextIdSequence();
        }
    },

    _clearWebgram: function () {
        this.webgram = null;
    },
    
    _triggerAdded: function () {
        this.webgram.onDrawingElementAdd.trigger(this);
    },

    _triggerRemoved: function () {
        this.webgram.onDrawingElementRemove.trigger(this);
    },

    _fieldsToJson: function () {
        var json = {};
        for (var i = 0; i < this._jsonFields.length; i++) {
            var field = this._jsonFields[i];
            var value = Webgram.Utils.getField(field, undefined, this);
            Webgram.Utils.setField(field, value, json);
        }
        
        return json;
    },
    
    _fieldsFromJson: function (json) {
        for (var i = 0; i < this._jsonFields.length; i++) {
            var field = this._jsonFields[i];
            var value = Webgram.Utils.getField(field, undefined, json);
            
            value = Webgram.Utils.clone(value);
            Webgram.Utils.setField(field, value, this);
        }
    },

    _funcsToJson: function () {
        var json = {};
        for (var i = 0; i < this._jsonFuncs.length; i++) {
            var funcs = this._jsonFuncs[i];
            var value = funcs.toFunc.call(this, funcs.name);
            Webgram.Utils.setField(funcs.name, value, json);
        }
        
        return json;
    },
    
    _funcsFromJson: function (json) {
        for (var i = 0; i < this._jsonFuncs.length; i++) {
            var funcs = this._jsonFuncs[i];
            funcs.fromFunc.call(this, json[funcs.name], funcs.name);
        }
    }
};

Webgram.Class('Webgram.DrawingElement');
