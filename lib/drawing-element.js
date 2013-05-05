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


Webgram.DrawingElement = Webgram.Class.extend( /** @lends Webgram.DrawingElement.prototype */ {
    /**
     * The abstract base class for all drawing elements.
     * @constructs Webgram.DrawingElement
     * @param {String} id a given identifier, can be <tt>null</tt>
     */
    initialize: function DrawingElement(id) {
        /**
         * A reference to the main Webgram object, or <tt>null</tt> if this hasn't been added to a Webgram yet.
         * @type Webgram
         */
        this.webgram = null;
        
        /**
         * This field indicates the drawing order among elements of having the same parent.
         * It works just like the <tt>z-index</tt> CSS property. <br>
         * You should only set this field when constructing the object.
         * @type Number
         * @default 0
         */
        this.zIndex = 0;
        

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
         * Handlers receive the following arguments: <tt>(modifiers)</tt> 
         * @type Webgram.Event
         */
        this.onMouseLeave = new Webgram.Event('mouse leave', this); /* (modifiers) */
        
        /**
         * An event that is triggered before an editable part of the shape starts to change.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onBeginShapeChange = new Webgram.Event('shape begin change', this); /* () */

        /**
         * An event that is triggered whenever an editable part of the shape changes.<br>
         * Handlers receive no arguments.
         * @type Webgram.Event
         */
        this.onShapeChange = new Webgram.Event('shape change', this); /* () */

        /**
         * An event that is triggered after an editable part of the shape finishes to change.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onEndShapeChange = new Webgram.Event('end shape change', this); /* () */
        
        /**
         * An event that is triggered before an editable style begins to change.<br>
         * Handlers receive the following arguments: <tt>(styleHint)</tt>.
         * @type Webgram.Event
         */
        this.onBeginStyleChange = new Webgram.Event('begin style change', this); /* (styleHint) */

        /**
         * An event that is triggered whenever an editable style changes.<br>
         * Handlers receive the following arguments: <tt>(styleHint)</tt>.
         * @type Webgram.Event
         */
        this.onStyleChange = new Webgram.Event('style change', this); /* (styleHint) */

        /**
         * An event that is triggered after an editable style finishes to change.<br>
         * Handlers receive the following arguments: <tt>(styleHint)</tt>. 
         * @type Webgram.Event
         */
        this.onEndStyleChange = new Webgram.Event('end style change', this); /* (styleHint) */

        /**
         * An event that is triggered before the element's location begins to change.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onBeginMove = new Webgram.Event('begin move', this); /* () */

        /**
         * An event that is triggered when the element is moved.<br>
         * Handlers receive the following arguments: <tt>(deltaX, deltaY)</tt>. 
         * @type Webgram.Event
         */
        this.onMove = new Webgram.Event('move', this); /* (deltaX, deltaY) */

        /**
         * An event that is triggered after the element finishes to move.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onEndMove = new Webgram.Event('end move', this); /* () */

        /**
         * An event that is triggered before the rotation angle of this element begins to change.<br>
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
         * An event that is triggered after the rotation angle of this element has finished changing.<br>
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
         * An event that is triggered before an editable attribute of this element begins to change.<br>
         * Handlers receive the following arguments: <tt>(attributeHint)</tt>.
         * @type Webgram.Event
         */
        this.onBeginChange = new Webgram.Event('begin change', this); /* (attributeHint) */
        
        /**
         * An event that is triggered whenever an editable attribute of this element changes.<br>
         * Handlers receive the following arguments: <tt>(attributeHint)</tt>.
         * @type Webgram.Event
         */
        this.onChange = new Webgram.Event('change', this); /* (attributeHint) */
        
        /**
         * An event that is triggered after an editable attribute of this element finishes to change.<br>
         * This event triggers the more general {@link Webgram#onDrawingElementChange} event.<br>
         * Handlers receive the following arguments: <tt>(attributeHint)</tt>.
         * @type Webgram.Event
         */
        this.onEndChange = new Webgram.Event('end change', this); /* (attributeHint) */
        
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
         * An event that is triggered after the element is created by the {@link Webgram.DrawingControls.CreateDrawingControl}.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onCreate = new Webgram.Event('create', this); /* () */

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
         * An event that is triggered when the element is copied (to clipboard).<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onCopy = new Webgram.Event('copy', this); /* () */

        /**
         * An event that is triggered when the element is created using <em>paste</em> action.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onPaste = new Webgram.Event('paste', this); /* () */

        /**
         * An event that is triggered when the element is created using <em>duplicate</em> action.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onDuplicate = new Webgram.Event('duplicate', this); /* () */

        /**
         * An event that is triggered when the element's focus type is changed,
         * by a call to {@link Webgram.DrawingElement#setFocusType}.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onChangeFocus = new Webgram.Event('change focus', this); /* () */
        
        /* link the various change events to the main change events */
        this.onBeginShapeChange.bind(function () {
            this.onBeginChange.trigger('shape');
        });
        this.onBeginMove.bind(function () {
            this.onBeginChange.trigger('location');
        });
        this.onBeginRotate.bind(function () {
            this.onBeginChange.trigger('rotationAngle');
        });
        this.onBeginStyleChange.bind(function (styleHint) {
            this.onBeginChange.trigger(styleHint);
        });
        
        this.onEndShapeChange.bind(function () {
            this.onEndChange.trigger('shape');
        });
        this.onEndMove.bind(function () {
            this.onEndChange.trigger('location');
        });
        this.onEndRotate.bind(function () {
            this.onEndChange.trigger('rotationAngle');
        });
        this.onEndStyleChange.bind(function (styleHint) {
            this.onEndChange.trigger(styleHint);
        });
        
        this.onShapeChange.bind(function () {
            this.onChange.trigger('shape');
        });
        this.onMove.bind(function () {
            this.onChange.trigger('location');
        });
        this.onRotate.bind(function () {
            this.onChange.trigger('rotationAngle');
        });
        this.onStyleChange.bind(function (styleHint) {
            this.onChange.trigger(styleHint);
        });
        this.onFlipHorizontally.bind(function () {
            this.onBeginChange.trigger('flippedHorizontally');
            this.onChange.trigger('flippedHorizontally');
            this.onEndChange.trigger('flippedHorizontally');
        });
        this.onFlipVertically.bind(function () {
            this.onBeginChange.trigger('flippedVertically');
            this.onChange.trigger('flippedVertically');
            this.onEndChange.trigger('flippedVertically');
        });

        /* link the onChange event to the webgram's onDrawingElementChange event */
        this.onEndChange.bind(function (attribute) {
            if (this.webgram != null) {
                this.webgram.onDrawingElementChange.trigger(this, attribute);
            }
        });

        /* shape */
        this._shapeChanged = false;
        
        /* transforms */
        this._location = new Webgram.Geometry.Point(0, 0);
        this._locationChanged = false;
        this._rotationAngle = 0;
        this._rotationCenter = new Webgram.Geometry.Point(0, 0);
        this._rotationAngleChanged = false;
        this._flippedHorizontally = false;
        this._flippedVertically = false;
        
        /* styles */
        this._strokeStyle = Webgram.Styles.getStrokeStyle('default');
        this._fillStyle = Webgram.Styles.getFillStyle('default');
        this._textStyle = Webgram.Styles.getTextStyle('default');
        
        this._guidesStyle = Webgram.Styles.getStrokeStyle('default-guides');
        this._hoveredDecorationStyle = Webgram.Styles.getStrokeStyle('default-hovered-decoration');
        this._selectedDecorationStyle = Webgram.Styles.getStrokeStyle('default-selected-decoration');
        
        this._styleChanged = null;
        
        this._id = id;
        this._parent = null;
        this._mouseDownPoint = null;
        this._creating = false;
        this._pasting = false;
        this._duplicating = false;
        this._focusType = Webgram.DrawingElement.FOCUS_NONE;
        this._jsonFields = [];
        this._jsonFuncs = [];
        this._shiftBehaviors = [];
        
        this._hoveredControlPointsEnabled = false;
        this._selectEnabled = true;
        this._moveEnabled = true;
        this._rotateEnabled = false;
        this._snapToAngleEnabled = false;
        this._snapInternallyEnabled = false;
        this._snapExternallyEnabled = false;
        this._snapToGridEnabled = true;
        this._flipEnabled = true;
        this._shiftEnabled = false;
        
        this._controlPoints = [];
        this._sockets = [];
        this._actionMenuItems = [];
        
        this._dependentDrawingElements = [];
        
        /* initial settings */
        this.setRotateEnabled(false);
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
        this.drawRotationCenterLine();
    },

    /**
     * This method is responsible for the drawing of the rotation center link line.
     * It's called by the {@link Webgram.DrawingElement#drawGuides} method.<br><br>
     * <em>(should not be overridden)</em>
     */
    drawRotationCenterLine: function () {
        this.drawLine(Webgram.Geometry.Point.zero(), this.getRotationCenter());
        this.paint(this._guidesStyle, null);
    },

    /**
     * This method is responsible for the drawing of the <em>control points</em> of this element.<br><br>
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
     * This method is responsible for the drawing of the <em>sockets</em> of this element.<br><br>
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
     * This method is responsible for the drawing of the <em>action menu items</em> of this element.
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
     * The decoration offset is the distance between the border of the element's shape
     * and the decoration drawn around it. The default implementation returns the Webgram's
     * <tt>decorationOffset</tt> setting.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Number} the decoration offset of this element
     */
    getDecorationOffset: function () {
        return this.getSetting('decorationOffset', 0);
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
     * @param {Boolean} anti set to <tt>true</tt> to draw the arc anticlockwise
     */
    drawArc: function (center, radiusX, radiusY, startAngle, endAngle, anti) {
        if (this.webgram.rootContainer._noZoom) { /* used for drawing guides and decoration  */
            center = this.transformDirect(center);
            startAngle += this.getRotationAngle();
            endAngle += this.getRotationAngle();
            radiusX *= this.getZoomFactor();
            radiusY *= this.getZoomFactor();
        }

        this._parent.drawArc(center, radiusX, radiusY, startAngle, endAngle, anti);
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
            box = this.getBaseRectangle();
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
            box = this.getBaseRectangle();
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
     * The same algorithm is used for filling the path, using the <tt>fillStyle</tt> argument.<br><br>
     * <em>(should not be overridden)</em>
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
        
        if (strokeStyle) {
            strokeStyle = strokeStyle.clone();
        }
        if (fillStyle) {
            fillStyle = fillStyle.clone();
        }
        
        /* make the style coordinates absolute (i.e. get rid of the percent) */
        var boundingRectangle = this.getBoundingRectangle();
        var width = boundingRectangle.getWidth();
        var height = boundingRectangle.getHeight();
        
        if (strokeStyle && strokeStyle.gradientPoint1) {
            if (typeof strokeStyle.gradientPoint1.x === 'string' &&
                    strokeStyle.gradientPoint1.x[strokeStyle.gradientPoint1.x.length - 1] === '%') {
                strokeStyle.gradientPoint1.x = parseFloat(strokeStyle.gradientPoint1.x) * width / 100;
            }

            if (typeof strokeStyle.gradientPoint1.y === 'string' &&
                    strokeStyle.gradientPoint1.y[strokeStyle.gradientPoint1.y.length - 1] === '%') {
                strokeStyle.gradientPoint1.y = parseFloat(strokeStyle.gradientPoint1.y) * height / 100;
            }

            if (strokeStyle.gradientPoint2 && typeof strokeStyle.gradientPoint2.x === 'string' &&
                    strokeStyle.gradientPoint2.x[strokeStyle.gradientPoint2.x.length - 1] === '%') {
                strokeStyle.gradientPoint2.x = parseFloat(strokeStyle.gradientPoint2.x) * width / 100;
            }

            if (strokeStyle.gradientPoint2 && typeof strokeStyle.gradientPoint2.y === 'string' &&
                    strokeStyle.gradientPoint2.y[strokeStyle.gradientPoint2.y.length - 1] === '%') {
                strokeStyle.gradientPoint2.y = parseFloat(strokeStyle.gradientPoint2.y) * height / 100;
            }

            if (strokeStyle.gradientRadius1 && typeof strokeStyle.gradientRadius1 === 'string' &&
                strokeStyle.gradientRadius1[strokeStyle.gradientRadius1.length - 1] === '%') {
                strokeStyle.gradientRadius1 = parseFloat(strokeStyle.gradientRadius1) * width / 100;
            }

            if (strokeStyle.gradientRadius2 && typeof strokeStyle.gradientRadius2 === 'string' &&
                strokeStyle.gradientRadius2[strokeStyle.gradientRadius2.length - 1] === '%') {
                strokeStyle.gradientRadius2 = parseFloat(strokeStyle.gradientRadius2) * width / 100;
            }
        }
        
        if (fillStyle && fillStyle.gradientPoint1) {
            if (typeof fillStyle.gradientPoint1.x === 'string' &&
                    fillStyle.gradientPoint1.x[fillStyle.gradientPoint1.x.length - 1] === '%') {
                fillStyle.gradientPoint1.x = parseFloat(fillStyle.gradientPoint1.x) * width / 100;
            }

            if (typeof fillStyle.gradientPoint1.y === 'string' &&
                    fillStyle.gradientPoint1.y[fillStyle.gradientPoint1.y.length - 1] === '%') {
                fillStyle.gradientPoint1.y = parseFloat(fillStyle.gradientPoint1.y) * height / 100;
            }

            if (fillStyle.gradientPoint2 && typeof fillStyle.gradientPoint2.x === 'string' &&
                    fillStyle.gradientPoint2.x[fillStyle.gradientPoint2.x.length - 1] === '%') {
                fillStyle.gradientPoint2.x = parseFloat(fillStyle.gradientPoint2.x) * width / 100;
            }

            if (fillStyle.gradientPoint2 && typeof fillStyle.gradientPoint2.y === 'string' &&
                    fillStyle.gradientPoint2.y[fillStyle.gradientPoint2.y.length - 1] === '%') {
                fillStyle.gradientPoint2.y = parseFloat(fillStyle.gradientPoint2.y) * height / 100;
            }

            if (fillStyle.gradientRadius1 && typeof fillStyle.gradientRadius1 === 'string' &&
                fillStyle.gradientRadius1[fillStyle.gradientRadius1.length - 1] === '%') {
                fillStyle.gradientRadius1 = parseFloat(fillStyle.gradientRadius1) * width / 100;
            }

            if (fillStyle.gradientRadius2 && typeof fillStyle.gradientRadius2 === 'string' &&
                fillStyle.gradientRadius2[fillStyle.gradientRadius2.length - 1] === '%') {
                fillStyle.gradientRadius2 = parseFloat(fillStyle.gradientRadius2) * width / 100;
            }
        }
        
        this._parent.paint(strokeStyle, fillStyle, transformSet);
    },

    
    /* decorations and drawing helpers */

    /**
     * Determines the untransformed rectangle that is used to be drawn as decoration,
     * if the default implementation of {@link Webgram.DrawingElement.getDecorationPoly} is used.
     * This method does not take into account the decoration offset. The rectangle returned by this method
     * will be enlarged (or shrunk) according to the {@link Webgram.DrawingElement#getDecorationOffset} method.<br><br>
     * <em>(should be overridden)</em>
     * @returns {Webgram.Geometry.Rectangle} the rectangle to be drawn as decoration
     */
    getDecorationRectangle: function () {
        return this.getBoundingRectangle();
    },

    /**
     * This method is responsible for returning the actual polygon that will be drawn as decoration.
     * It takes into account the decoration offset ({@link Webgram.DrawingElement#getDecorationOffset}),
     * the zoom factor ({@link Webgram.DrawingElement#getZoomFactor}) and
     * the line width of the default stroke style used by this element.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Webgram.Geometry.Poly} the poly to be drawn as decoration
     */
    getDecorationPoly: function () {
        var decorationRect = this.getDecorationRectangle();
        var strokeStyle = this.getStrokeStyle();
        var thickness = Math.round(strokeStyle ? strokeStyle.lineWidth / 2 : 0);
        
        var offset = this.getDecorationOffset() / this.getZoomFactor() + thickness;
        
        decorationRect = decorationRect.getShrunk(-offset);
        
        return decorationRect.getPoly();
    },
    
    /**
     * Returns the current zoom factor of the Webgram. The element must be added to Webgram when calling this method.
     * @returns {Number} the current zoom factor of the Webgram
     */
    getZoomFactor: function () {
        return this.webgram.rootContainer._zoomFactor;
    },

    /**
     * Returns the image store of the Webgram that this
     * drawing element is added to. If the element is not added
     * to a Webgram, this method returns <tt>null</tt>.
     * @returns {Webgram.ImageStore} the image store, or <tt>null</tt> if element is not added
     */
    getImageStore: function () {
        if (!this.webgram) { /* not added yet */
            return null;
        }
        
        return this.webgram.getImageStore();
    },
    
    
    /* shape */
    
    /**
     * Determines if a given transformed <tt>point</tt> is inside the area of this element or not.<br><br>
     * <em>(must be overridden)</em> 
     * @param {Webgram.Geometry.Point} point the point to test
     * @returns {Boolean} <tt>true</tt> if the point is inside this element, <tt>false</tt> otherwise
     */
    pointInside: function (point) {
        /* must be overridden */
    },
    
    /**
     * Returns the bounding rectangle, which is the smallest rectangle
     * that contains the (untransformed) shape of this element.
     */
    getBoundingRectangle: function () {
        // TODO this could be cached
        /* must be overridden */
    },

    /**
     * Call this method right before changing the shape of this element.
     */
    beginShapeChange: function () {
        if (!this._shapeChanged) {
            this._shapeChanged = true;
            this.onBeginShapeChange.trigger();
            
            /* add an undo check point */
            if (this.webgram && !this.isBeingCreated()) {
                this.webgram.saveUndoCheckPoint([this], 'change');
            }
            
            /* reset the rotation center */
            if (this._rotationCenter) {
                this._rotationCenter = Webgram.Geometry.Point.zero();
            }
        }
    },

    /**
     * Call this method after the change of the shape of this element is done.
     */
    finishShapeEvents: function () {
        if (this._shapeChanged) {
            this._shapeChanged = false;
            this.onEndShapeChange.trigger();
            
            this.finishDependentChangeEvents(); /* call finish*Events on dependent DEs */
        }
    },
    

    /* location */

    // TODO jsdoc
    getLocation: function () {
        return this._location;
    },
    
    // TODO jsdoc
    setLocation: function (location) {
        this._setLocation(location, false);
        
        this.finishMoveEvents();
    },
    
    _setLocation: function (location, snap) {
        var oldLocation = this._location;
        
        this.beginMove();
        this._location = location;
        this.onMove.trigger(location.x - oldLocation.x, location.y - oldLocation.y);
        
        if (snap) {
            this.snap(); // TODO proper snapping
        }
        
        this.invalidate(true);
        this.updateDependentElements();
    },
    
    /**
     * Call this method before changing the location of this element.
     */
    beginMove: function () {
        if (!this._locationChanged) {
            this._locationChanged = true;
            this.onBeginMove.trigger();
            
            /* add an undo check point */
            if (this.webgram && !this.isBeingCreated()) {
                this.webgram.saveUndoCheckPoint([this], 'change');
            }
        }
    },

    /**
     * Call this method after the change of the location of this element is done.
     */
    finishMoveEvents: function () {
        if (this._locationChanged) {
            this._locationChanged = false;
            this.onEndMove.trigger();
            
            this.finishDependentChangeEvents(); /* call finish*Events on dependent DEs */
        }
    },
    
    
    /* rotation */
    
    /**
     * Returns the rotation angle of this element.
     * @returns {Number} the rotation angle of this element
     */
    getRotationAngle: function () {
        return this._rotationAngle;
    },

    /**
     * Sets the rotation angle of this element.
     * @param {Number} angle the new rotation angle
     */
    setRotationAngle: function (angle) {
        this._setRotationAngle(angle, false);
        
        this.finishRotateEvents();
    },
    
    _setRotationAngle: function (angle, snap) {
        var snapAngle = this.getSetting('snapAngle');
        var snapAngleThreshold = this.getSetting('snapAngleThreshold');
        
        if (snap && !this.isRotationCenterMoved() &&
                this.isSnapToAngleEnabled() && snapAngle != null) {
            
            var snappedAngle = Webgram.Geometry.getSnappedAngle(angle, snapAngle, snapAngleThreshold);
            if (snappedAngle != null) {
                var location = this.getLocation();
                this.setSnapVisualFeedback({
                    type: 'radial',
                    x: location.x, y: location.y, 
                    angle: snappedAngle - Math.PI / 2
                });
                
                angle = snappedAngle;
            }
        }
        else {
            angle = Webgram.Geometry.normalizeAngle(angle);
        }
        
        if (this._rotationAngle !== angle) {
            this.beginRotate();
            this._rotationAngle = angle;
            this.onRotate.trigger(angle);
            
            this.invalidate(true);
            this.updateDependentElements();
        }
    },

    /**
     * If rotation is enabled for the drawing element, this returns the rotation center,
     * relative to this element.<br>
     * This point is usually managed by an associated {@link Webgram.ControlPoints.RotationCenterControlPoint}.
     * @return {Webgram.Geometry.Point} the rotation center
     */
    getRotationCenter: function () {
        if (this.isRotateEnabled()) {
            return this._rotationCenter;
        }
        else {
            return null;
        }
    },

    /**
     * Sets the rotation center of this element.
     * @param {Webgram.Geometry.Point} rotationCenter the new rotation center
     */
    setRotationCenter: function (rotationCenter) {
        this._setRotationCenter(rotationCenter, false);
    },
    
    _setRotationCenter: function (rotationCenter, snap) {
        if (snap) {
            /* snap to the location of the element */
            var snapDistance = this.getSetting('snapDistance');
            if (snapDistance != null && rotationCenter.getDistanceTo(Webgram.Geometry.Point.zero()) <= snapDistance) {
                rotationCenter = Webgram.Geometry.Point.zero();
            }
        }
        
        this._rotationCenter = rotationCenter;
    },
    
    /**
     * Call this method before changing the rotation angle of this element.
     */
    beginRotate: function () {
        if (!this._rotationAngleChanged) {
            this._rotationAngleChanged = true;
            this.onBeginRotate.trigger();
            
            /* add an undo check point */
            if (this.webgram && !this.isBeingCreated()) {
                this.webgram.saveUndoCheckPoint([this], 'change');
            }
        }
    },

    /**
     * Call this method after the change of the rotation angle of this element is done.
     */
    finishRotateEvents: function () {
        if (this._rotationAngleChanged) {
            this._rotationAngleChanged = false;
            this.onEndRotate.trigger();
            
            this.finishDependentChangeEvents(); /* call finish*Events on dependent DEs */
        }
    },
    
    
    /* flipping */
    
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
        
        this._flipHorizontally();
    },
    
    _flipHorizontally: function () {
        /* add an undo check point */
        if (this.webgram && !this.isBeingCreated()) {
            this.webgram.saveUndoCheckPoint([this], 'change');
        }

        this._flippedHorizontally = !this._flippedHorizontally;
        this.onFlipHorizontally.trigger();
        
        this.invalidate(true);
        this.updateDependentElements();
        this.finishDependentChangeEvents();
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
        
        this._flipVertically();
    },

    _flipVertically: function () {
        /* add an undo check point */
        if (this.webgram && !this.isBeingCreated()) {
            this.webgram.saveUndoCheckPoint([this], 'change');
        }

        this._flippedVertically = !this._flippedVertically;
        this.onFlipVertically.trigger();
        
        this.invalidate(true);
        this.updateDependentElements();
        this.finishDependentChangeEvents();
    },

    /**
     * Flips an angle according to the flipping state
     * of this drawing element.
     * @param {Number} angle the angle to be flipped
     * @returns {Number} the flipped angle
     */
    getFlippedAngle: function (angle) {
        if (this.isFlippedHorizontally()) {
            angle = Math.PI - angle;
        }
        if (this.isFlippedVertically()) {
            angle = 2 * Math.PI - angle;
        }
        
        return angle;
    },
    
    
    /* transforms */

    /**
     * Takes the coordinates of a geometric object relative to this element and makes them
     * relative to its parent's coordinate system. This method does not affect the original object.
     * The applied transforms are in fact a <em>scaling</em>, followed by a <em>rotation<em> and then by a <em>rotation</em>.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to transform
     * @returns {Object} the transformed geometric object relative to the parent 
     */
    transformDirect: function (geometry) {
        var location = this.getLocation();
        
        return geometry.
            getScaled(this.isFlippedHorizontally() ? -1 : 1, this.isFlippedVertically() ? -1 : 1).
            getRotated(this.getRotationAngle()).
            getTranslated(location.x, location.y);
    },

    /**
     * Takes the coordinates of a transformed geometric object (relative to this element's parent) and makes them
     * relative to this element's coordinate system. This method does not affect the original object.
     * The applied transforms are in fact a <em>translation<em> followed by a <em>rotation</em> and then by a <em>scaling</em>.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to transform
     * @returns {Object} the geometric object relative to this element
     */
    transformInverse: function (geometry) {
        var location = this.getLocation();
        
        return geometry.
            getTranslated(-location.x, -location.y).
            getRotated(-this.getRotationAngle()).
            getScaled(this.isFlippedHorizontally() ? -1 : 1, this.isFlippedVertically() ? -1 : 1);
    },

    /**
     * Takes the coordinates of a geometric object relative to this element and translates them
     * into its parent's coordinate system. This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to translate
     * @returns {Object} the translated geometric object 
     */
    translateDirect: function (geometry) {
        var location = this.getLocation();
        
        return geometry.getTranslated(location.x, location.y);
    },

    /**
     * Takes the coordinates of a geometric object relative to this element's parent and translates them
     * into this element's coordinate system. This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to translate
     * @returns {Object} the geometric object relative to this element 
     */
    translateInverse: function (geometry) {
        var location = this.getLocation();
        
        return geometry.getTranslated(-location.x, -location.y);
    },

    /**
     * Rotates the geometric object using the rotation angle of this element.
     * The rotation uses the location of the drawing element as rotation center,
     * unless the <tt>center</tt> parameter is supplied.
     * This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to rotate
     * @param {Webgram.Geometry.Point} center an optional center for the rotation 
     * @returns {Object} the geometric object relative to the parent 
     */
    rotateDirect: function (geometry, center) {
        if (center == null) {
            center = this.getLocation();
        }
        
        return geometry.getRotated(this.getRotationAngle(), center);
    },

    /**
     * Rotates the geometric object using the negative of the rotation angle of this element.
     * The rotation uses the location of the drawing element as rotation center,
     * unless the <tt>center</tt> parameter is supplied.
     * This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to rotate
     * @param {Webgram.Geometry.Point} center an optional center for the rotation
     * @returns {Object} the geometric object relative to this element 
     */
    rotateInverse: function (geometry) {
        if (center == null) {
            center = this.getLocation();
        }
        
        return geometry.getRotated(-this.getRotationAngle(), center);
    },

    /**
     * Scales the geometric object using the flipping state of this element.
     * This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to scale
     * @returns {Object} the geometric object relative to the parent 
     */
    scaleDirect: function (geometry) {
        return geometry.getScaled(
                this.isFlippedHorizontally() ? -1 : 1,
                this.isFlippedVertically() ? -1 : 1);
    },

    /**
     * Scales the geometric object using the inverse of the flipping state of this element.
     * This method does not affect the original object.
     * @see Webgram.Geometry
     * @param {Object} geometry the geometric object to scale
     * @returns {Object} the geometric object relative to this element 
     */
    scaleInverse: function (geometry) {
        return geometry.getScaled(
            this.isFlippedHorizontally() ? -1 : 1,
            this.isFlippedVertically() ? -1 : 1);
    },

    _getTransformSet: function (transformSet) {
        var location = this.getLocation();
        
        if (transformSet == null) {
            transformSet = new Webgram.Canvas.TransformSet();
        }
            
        if (this.isFlippedHorizontally()) {
            transformSet.addScaling(-1, 1);
        }
        if (this.isFlippedVertically()) {
            transformSet.addScaling(1, -1);
        }
        transformSet.addRotation(this.getRotationAngle());
        transformSet.addTranslation(location.x, location.y);
        
        return transformSet;
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
        this._setStrokeStyle(strokeStyle);
        
        this.finishStyleEvents();
    },

    _setStrokeStyle: function (strokeStyle) {
        this.beginStyleChange('strokeStyle');
        
        if (strokeStyle != null) { /* stroke style wanted */
            if (this._strokeStyle == null) {
                /* had no stroke style before, creating a new default one */
                this._strokeStyle = Webgram.Styles.getStrokeStyle('default');
            }
            
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
                        this._strokeStyle.gradientPoint1 = new Webgram.Geometry.Point('-50%', '-50%');
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
                    this._strokeStyle.gradientPoint2 = new Webgram.Geometry.Point('50%', '50%');
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
                    this._strokeStyle.gradientRadius2 = '50%';
                }
            }
            else { /* gradient radius 2 not wanted */
                this._strokeStyle.gradientRadius2 = null;
            }        
        }
        else {
            this._strokeStyle = null;
        }
        
        this.onStyleChange.trigger('strokeStyle');
        
        this.invalidate(true);
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
        this._setFillStyle(fillStyle);
        
        this.finishStyleEvents();
    },

    _setFillStyle: function (fillStyle) {
        this.beginStyleChange('fillStyle');
        
        if (fillStyle != null) { /* fill style wanted */
            if (this._fillStyle == null) {
                /* had no fill style before, creating a new default one */
                this._fillStyle = Webgram.Styles.getFillStyle('default');
            }
            
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
                        this._fillStyle.gradientPoint1 = new Webgram.Geometry.Point('-50%', '-50%');
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
                    this._fillStyle.gradientPoint2 = new Webgram.Geometry.Point('50%', '50%');
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
                    this._fillStyle.gradientRadius2 = '50%';
                }
            }
            else { /* gradient radius 2 not wanted */
                this._fillStyle.gradientRadius2 = null;
            }
        }
        else {
            this._fillStyle = null;
        }
        
        this.onStyleChange.trigger('fillStyle');
        
        this.invalidate(true);
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
        this._setTextStyle(textStyle);
    },

    _setTextStyle: function (textStyle) {
        /* add an undo check point */
        if (this.webgram && !this.isBeingCreated()) {
            this.webgram.saveUndoCheckPoint([this], 'change');
        }
        
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
        
        this.onTextStyleChange.trigger();
        
        this.invalidate(true);
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
        
        this.invalidate(false);
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
        
        this.invalidate(false);
    },

    /**
     * Call this method before changing any style of this element.
     * @param {String} styleHint indicates the name of the style attribute
     */
    beginStyleChange: function (styleHint) {
        if (!this._styleChanged) {
            this._styleChanged = styleHint;
            this.onBeginStyleChange.trigger(styleHint);
            
            /* add an undo check point */
            if (this.webgram && !this.isBeingCreated()) {
                this.webgram.saveUndoCheckPoint([this], 'change');
            }
        }
    },

    /**
     * Call this method after the change of a style of this element is done.
     */
    finishStyleEvents: function () {
        if (this._styleChanged) {
            this.onEndStyleChange.trigger(this._styleChanged);
            this._styleChanged = null;
        }
    },
    
    
    /* snapping */
    
    /**
     * Snaps the whole element using the <em>external</em> and <em>grid</em> snapping methods.
     */
    snap: function (index) {
        return;
        // TODO properly implement snapping
        
        if (this.isEnclosed()) {
            return; /* don't snap if enclosed */
        }
        
        /* find the best point to snap and move the whole element accordingly */
        var i, deltaX, deltaY;
        var result, point;
        var minDeltaX = Infinity;
        var minDeltaY = Infinity;
        var minSnapX = null;
        var minSnapY = null;
        var snapVisualFeedback = {type: null, x: null, y: null, angle: null};

        var location = this.getLocation();
        var snappingPoints = this.getSnappingPoints();

        /* first try to snap externally (to siblings) */
        if (this.isSnapExternallyEnabled()) {
            for (i = 0; i < snappingPoints.length; i++) {
                var fixedPoints = snappingPoints.slice(0, i).concat(snappingPoints.slice(i + 1));
                point = snappingPoints[i];
                result = this.snapExternally(i, point, fixedPoints, 0, location);
                
                /* if point didn't snap, try the next one */
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
        
        /* if at least one of the two axes didn't snap, snap it to grid */
        if (this.isSnapToGridEnabled() && (minSnapX == null || minSnapY == null)) {
            for (i = 0; i < snappingPoints.length; i++) {
                point = snappingPoints[i];
                /* avoid snapping the center point to grid */
                if (point.x === location.x && point.y === location.y) {
                    continue;
                }
                
                result = this.snapToGrid(point, 0, location);
                
                /* if point didn't snap, try the next one */
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
            this._setLocation(this.getLocation().getTranslated(minDeltaX, 0));
        }
        if (minDeltaY < Infinity) {
            this._setLocation(this.getLocation().getTranslated(0, minDeltaY));
        }
        
        if (snapVisualFeedback.type == null) {
            snapVisualFeedback = null;
        }
        
        this.setSnapVisualFeedback(snapVisualFeedback);
    },

//    TODO decide if these functions belong here or not
//    /**
//     * Snaps the given point <em>externally</em>. By default, the external snapping
//     * consists of simply snapping to the siblings.<br><br>
//     * <em>(could be overridden)</em>
//     * @param {Number} index the index of the point in the shape
//     * @param {Webgram.Geometry.Point} point the point to snap
//     * @param {Array} fixedPoints the rest of the points
//     * @param {Number} rotationAngle the actual rotation angle of this element
//     * @param {Wegram.Geometry.Point} center the current center of this element
//     * @returns {Webgram.Geometry.Point} the snapped point 
//     */
//    snapExternally: function (index, point, fixedPoints, rotationAngle, center) {
//        if (this.getSetting('snapDistance')) {
//            return this._snapToSiblings(point, rotationAngle, center);
//        }
//    },
//    
//    /**
//     * Snaps the given point <em>internally</em> (i.e. against other points of the shape).<br><br>
//     * <em>(could be overridden)</em>
//     * @param {Number} index the index of the point in the shape
//     * @param {Wegram.Geometry.Point} point the point to snap
//     * @param {Array} fixedPoints the rest of the points
//     * @param {Number} rotationAngle the current rotation angle of this drawing element
//     * @param {Wegram.Geometry.Point} center the current center of this drawing element
//     * @returns {Object} the snapping results with:<ul>
//     *  <li><tt>x</tt> - Number|Function, the x snapped value or equation</li>
//     *  <li><tt>y</tt> - Number|Function, the y snapped value or equation</li>
//     *  <li><tt>preferredPoint</tt> - {@link Wegram.Geometry.Point}, a suggested point (can be <tt>null</tt>),
//     *   used only if both <tt>x</tt> and <tt>y</tt> are given as functions and no other snapping results are available</li>
//     *  <li><tt>snapVisualFeedback</tt> - Array|Object, the visual snapping feedback details</li>
//     * </ul>
//     */
//    snapInternally: function (index, point, fixedPoints, rotationAngle, center) {
//    },
//
//    /**
//     * Snaps the given point to the <em>grid</em>.
//     * @param {Webgram.Geometry.Point} point the point to snap
//     * @param {Number} rotationAngle the current rotation angle of this element
//     * @param {Wegram.Geometry.Point} center the current center of this element
//     * @returns {Webgram.Geometry.Point} the snapped point
//     */
//    snapToGrid: function (point, rotationAngle, center) {
//        var snapGrid = this.getSetting('snapGrid');
//        if (snapGrid == null) {
//            return;
//        }
//
//        /* snap the point */
//        point = new Webgram.Geometry.Point(
//                Math.round(point.x / snapGrid.sizeX) * snapGrid.sizeX,
//                Math.round(point.y / snapGrid.sizeY) * snapGrid.sizeY);
//
//        return point;
//    },
    
    /**
     * Returns a list of {@link Webgram.Geometry.Point} to be used for <em>external</em> snapping.
     * The returned points are relative to the parent, and by default this method returns
     * the location of this element.<br><br>
     * <em>should be overridden</em>
     * @returns {Array} the list of snapping points
     */
    getSnappingPoints: function () {
        return [this.transformDirect(this.getLocation())];
    },

    /**
     * Sets the <em>snap visual feedback</em> to display.
     * The snap visual feedback is the mechanism used
     * to display a feedback to the user when snapping occurs.
     * The snapping can be either <em>linear</em> or <em>radial</em>.
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
    

    /* parent-related methods */

    /**
     * Makes this element the child of <tt>containerElement</tt>. If this element
     * is already a child of another parent, it is firstly removed from that parent's children list.
     * The apparent coordinates and rotation angle of this element are preserved.
     * @param {Webgram.DrawingElements.ContainerElement} containerElement the new parent of this element
     */
    enterContainerElement: function (containerElement) {
        this._enterContainerElement(containerElement, true);
    },

    _enterContainerElement: function (containerElement, triggerEvents) {
        if (containerElement.getRotationAngle() !== 0) { /* don't enter a rotated block element */
            return;
        }

        if (this._parent) {
            this._parent._remDrawingElement(this, triggerEvents);
        }
        
        containerElement._addDrawingElement(this, null, triggerEvents);
        
        var blockLocation = containerElement.getLlocation();
        
        this._setLocation(this.getLocation().getTranslated(-blockLocation.x, -blockLocation.y), false);
        
        this._focusType = Webgram.DrawingElement.FOCUS_NONE;
    },

    /**
     * Makes this element the child of it's parent's parent.
     * The apparent coordinates and rotation angle of this element are preserved.
     */
    leaveContainerElement: function () {
        this._leaveContainerElement(true);
    },

    _leaveContainerElement: function (triggerEvents) {
        if (!this._parent || !this._parent._parent) {
            return;
        }
        
        var oldParent = this._parent;
        var newParent = oldParent._parent;
        oldParent._remDrawingElement(this, triggerEvents);
        newParent._addDrawingElement(this, null, triggerEvents);
        
        var parentLocation = oldParent.getLocation();
        
        if (oldParent.getRotationAngle() !== 0) {
            var location = this.getLocation();
            var rotatedLocation = location.getRotated(oldParent.getRotationAngle());
            var deltaX = parentLocation.x + rotatedLocation.x - location.x;
            var deltaY = parentLocation.y + rotatedLocation.y - location.y;
            
            this._setLocation(this.getLocation().getTranslated(deltaX, deltaY), false);
            this._rotationAngle += oldParent.getRotationAngle();
        }
        else {
            this._setLocation(this.getLocation().getTranslated(parentLocation.x, parentLocation.y));
        }
        
        this._focusType = Webgram.DrawingElement.FOCUS_NONE;
    },

    /**
     * Returns the parent of this element, or <tt>null</tt> if it has not been added to a container yet.
     * @returns {Webgram.DrawingElements.ContainerElement} the parent of this element
     */
    getParent: function () {
        // TODO instanceof _MultipleSelectionContainer is a hack and should be properly implemented
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
        if (this._parent && this._parent._parent) {
            return true;
        }
        else {
            return false;
        }
    },

    _triggerAdded: function () {
        this.webgram.onDrawingElementAdd.trigger(this);
    },

    _triggerRemoved: function () {
        this.webgram.onDrawingElementRemove.trigger(this);
    },


    /* control points */

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
    
    
    /* sockets */

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
    
    
    /* action menu items */

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
    
    
    /* dependencies between elements */
    
    /**
     * Specifies a drawing element that this element depends on,
     * shape-wise, rotation angle-wise or style-wise.
     * @param {Webgram.DrawingElement} drawingElement the element to add as dependency
     * @param {Function} updateFunc an optional function to be called whenever the
     * dependency element changes; it will be called on <tt>this</tt> object,
     * with the dependency as the first argument
     */
    addDependency: function (drawingElement, updateFunc) {
        drawingElement._dependentDrawingElements.push({element: this, updateFunc: updateFunc});
    },

    /**
     * Removes a drawing element from the dependencies of this element.
     * @param {Webgram.DrawingElement} drawingElement the element to remove
     */
    remDependency: function (drawingElement) {
        for (var i = 0; i < drawingElement._dependentDrawingElements.length; i++) {
            if (drawingElement._dependentDrawingElements[i].element === this) {
                drawingElement._dependentDrawingElements.splice(i, 1);
                i--;
            }
        }
    },
    
    /**
     * Returns a list of elements that depend (directly or indirectly) on this element.
     * This list includes the connectors that are connected to this element.
     * @returns {Array} the list of dependent elements
     */
    getDependentDrawingElements: function () {
        var dependentElements = [];
        var drawingElement;
        var i, j;
        
        for (i = 0; i < this._dependentDrawingElements.length; i++) {
            dependentElements.push(this._dependentDrawingElements[i].element);
        }
        
        /* consider the elements connected through connectors as well */
        for (i = 0; i < this._sockets.length; i++) {
            var socket = this._sockets[i];
            for (j = 0; j < socket._endPoints.length; j++) {
                var endPoint = socket._endPoints[j];
                dependentElements.push(endPoint.drawingElement);
            }
        }
        
        /* make sure the elements are unique */
        var elementsDict = {};
        for (i = 0; i < dependentElements.length; i++) {
            drawingElement = dependentElements[i];
            elementsDict[drawingElement.getId()] = drawingElement;
        }
        
        dependentElements = [];
        for (i in elementsDict) {
            if (elementsDict.hasOwnProperty(i)) {
                dependentElements.push(elementsDict[i]);
            }
        }
        
        // TODO avoid infinite recurrent calls due to loops in dependencies
        
        /* gather indirectly dependent elements */
        for (i = 0; i < dependentElements.length; i++) {
            drawingElement = dependentElements[i];
            var indirectDependentElements = drawingElement.getDependentDrawingElements();
            for (j = 0; j < indirectDependentElements.length; j++) {
                dependentElements.push(indirectDependentElements[j]);
            }
        }

        return dependentElements;
    },

    /**
     * Updates the elements that depend (directly or indirectly)
     * on this element. Call this whenever a property of this element
     * that other elements depend on has changed. It is automatically
     * called for shape, location, rotation angle and flipping state.<br><br>
     * <em>(should not be overridden)</em>
     */
    updateDependentElements: function () {
        /* temporarily disable the creation of undo check points,
         * since the end points belong to dependent elements,
         * and we don't want them to add undo check points in their turn */
        if (this.webgram) {
            this.webgram.disableUndoCheckPoints();
        }
        
        for (var i = 0; i < this._sockets.length; i++) {
            var socket = this._sockets[i];
            socket._dragAlongEndPoints();
        }
        
        for (i = 0; i < this._dependentDrawingElements.length; i++) {
            var updateFunc = this._dependentDrawingElements[i].updateFunc;
            if (updateFunc) {
                updateFunc.call(this._dependentDrawingElements[i].element, this);
            }
        }
        
        if (this.webgram) {
            this.webgram.enableUndoCheckPoints();
        }
    },
    
    /**
     * Call this whenever a property of this element that other elements depend on
     * finished to change. It is automatically called for shape, location, rotation angle
     * and flipping state.<br><br>.
     * <em>(should not be overridden)</em>.
     */
    finishDependentChangeEvents: function () {
        /* calls finish*Events() on elements that depend on this one */
        
        var dependentElements = this.getDependentDrawingElements();
        for (var i = 0; i < dependentElements.length; i++) {
            dependentElements[i].finishChangeEvents();
        }
    },


    /* settings */

    /**
     * Tells whether the <em>hovered control points</em> feature is enabled for this element or not.
     * @returns {Boolean} <tt>true</tt> if the hovered control points feature is enabled, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if the element is selectable, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if the element is movable, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if the element is rotatable, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if the element is rotatable, <tt>false</tt> otherwise
     */
    isRotationCenterEnabled: function () {
        return this.rotationCenterControlPoint != null;
    },
    
    /**
     * Tells whether the element's rotation center has been changed or not
     * (i.e. whether it differs from the default value, which is the center of the element).
     * @returns {Boolean} <tt>true</tt> if the rotation center was changed, <tt>false</tt> otherwise
     */
    isRotationCenterMoved: function () {
        var rotationCenter = this.getRotationCenter();
        
        return (rotationCenter != null) && ((rotationCenter.x !== 0) || (rotationCenter.y !== 0));
    },
    
    /**
     * Enables or disables changing of the rotation center of the element.
     * Changing is done using a special control point. This control point will
     * only be present in the element when this feature is enabled.
     * @see Webgram.ControlPoints.RotationCenterControlPoint
     * @param {Boolean} enabled <tt>true</tt> if the rotation center can be changed, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if flipping is enabled, <tt>false</tt> otherwise
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
     * Tells whether snapping to angle is enabled for this element or not.
     * @returns {Boolean} <tt>true</tt> if snapping to angle is enabled, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if internal snapping is enabled, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if external snapping is enabled, <tt>false</tt> otherwise
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
     * @returns {Boolean} <tt>true</tt> if snapping to grid is enabled, <tt>false</tt> otherwise
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
             * is the one that's supposed to be when shift is enabled */
            
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
     * Defines the way an element of this class is initially created.
     * This method is called by the {@link Webgram.DrawingControl.CreateDrawingControl}
     * with the first click of the user when creating an element of this class.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point of the initial click
     * @returns {Boolean} <tt>true</tt> if the creation process should continue, <tt>false</tt> if the creation is done
     */
    beginCreate: function (point) {
        this._setLocation(point, true);
        
        return true; /* accept creation */
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
        return false; /* stop */
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
        return true; /* succeeded */
    },
    
    /**
     * Tells whether the element is in the process of being created
     * by the {@link Webgram.DrawingControls.CreateDrawingControl} or not.
     * @returns {Boolean} <tt>true</tt> if the element is being created, <tt>false</tt> otherwise
     */
    isBeingCreated: function () {
        return this._creating;
    },
    
    /**
     * Tells whether the element is in the process of being pasted or not.
     * @returns {Boolean} <tt>true</tt> if the element is being pasted, <tt>false</tt> otherwise
     */
    isBeingPasted: function () {
        return this._pasting;
    },
    
    /**
     * Tells whether the element is in the process of being duplicated or not.
     * @returns {Boolean} <tt>true</tt> if the element is being duplicated, <tt>false</tt> otherwise
     */
    isBeingDuplicated: function () {
        return this._duplicating;
    },
    

    /* json */
    
    /**
     * Prepares a json object with the components that make up the shape of this element.
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(should be overridden)</em>
     * @returns {Object} the json with the shape information
     */
    shapeToJson: function () {
    },
    
    /**
     * Restores the components of this element that make up the shape,
     * from a json object.<br><br>
     * <em>(should be overridden)</em>
     * @param {Object} json the json object contanining the shape information
     */
    shapeFromJson: function (json) {
    },
    
    /**
     * Prepares a json object with the location of this element.
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Object} the json object with the location
     */
    locationToJson: function () {
        var location = this.getLocation();
        
        return {
            x: location.x,
            y: location.y
        };
    },
    
    /**
     * Restores the location of this element from a json object.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Object} json the json object with the location
     */
    locationFromJson: function (json) {
        this._location = new Webgram.Geometry.Point(json.x, json.y);
    },
    
    /**
     * Prepares a json object with the rotation angle of this element.
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Object} the json object with the rotation angle
     */
    rotationAngleToJson: function () {
        return this.getRotationAngle();
    },
    
    /**
     * Restores the rotation angle of this element from a json object.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Object} json the json object with the rotation angle
     */
    rotationAngleFromJson: function (json) {
        this._rotationAngle = json;
    },
    
    /**
     * Prepares a json object with the flipping state of this element.
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Object} the json object with the flipping state
     */
    flipToJson: function () {
        return {
            vert: this._flippedVertically,
            horiz: this._flippedHorizontally,
        };
    },
    
    /**
     * Restores the flipping state of this element from a json object.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Object} json the json object with the flipping state
     */
    flipFromJson: function (json) {
        this._flippedVertically = json.vert;
        this._flippedHorizontally = json.horiz;
    },
    
    /**
     * Prepares a json object with the stroke style of this element.
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(should not be overridden)</em>
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
     * <em>(should not be overridden)</em>
     * @param {Object} json the json object with the stroke style
     */
    strokeStyleFromJson: function (json) {
        if (json !== null) {
            var strokeStyle = this.getStrokeStyle();
            if (strokeStyle == null) {
                strokeStyle = Webgram.Styles.getStrokeStyle('default');
            }
            
            strokeStyle.fromJson(json);
            
            this._strokeStyle = strokeStyle;
                
        }
        else {
            this._strokeStyle = null;
        }
    },
    
    /**
     * Prepares a json object with the fill style of this element.
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(should not be overridden)</em>
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
     * <em>(should not be overridden)</em>
     * @param {Object} json the json object with the fill style
     */
    fillStyleFromJson: function (json) {
        if (json !== null) {
            var fillStyle = this.getFillStyle();
            if (fillStyle == null) {
                fillStyle = Webgram.Styles.getFillStyle('default');
            }
            
            fillStyle.fromJson(json);
            
            this._fillStyle = fillStyle;
                
        }
        else {
            this._fillStyle = null;
        }
    },
    
    /**
     * Prepares a json object with the text style of this element.
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(should not be overridden)</em>
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
     * <em>(should not be overridden)</em>
     * @param {Object} json the json object with the text style
     */
    textStyleFromJson: function (json) {
        if (json !== null) {
            var textStyle = this.getTextStyle();
            if (textStyle == null) {
                textStyle = Webgram.Styles.getTextStyle('default');
            }
            
            textStyle.fromJson(json);
            
            this._textStyle = textStyle;
        }
        else {
            this._textStyle = null;
        }
    },
    
    /**
     * Prepares a json object with various settings of this element
     * (not to be confused with the global Webgram settings).
     * If this method returns <tt>undefined</tt>, the corresponding part of the json object
     * will not exit.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} the json object with the settings
     */
    settingsToJson: function () {
    },
    
    /**
     * Restores various settings of this element from a json object.<br><br>
     * <em>(could be overridden)</em>
     * @param {Object} json the json object with the settings
     */
    settingsFromJson: function (json) {
    },
    
    /**
     * Includes additional fields when creating and restoring from the json object that completely
     * characterizes this element.
     * @param {String} name the name used to represent the field in the json object
     * @param {String} field the name of the element's field to include in the json object
     */
    addJsonField: function (name, field) {
        if (field === undefined) {
            field = name;
        }
        
        this._jsonFields.push({name: name, field: field});
    },
    
    _fieldsToJson: function () {
        var json = {};
        for (var i = 0; i < this._jsonFields.length; i++) {
            var info = this._jsonFields[i];
            var value = Webgram.Utils.getField(info.field, undefined, this);
            value = Webgram.Utils.clone(value);
            Webgram.Utils.setField(info.name, value, json);
        }
        
        return json;
    },
    
    _fieldsFromJson: function (json) {
        for (var i = 0; i < this._jsonFields.length; i++) {
            var info = this._jsonFields[i];
            var value = Webgram.Utils.getField(info.name, undefined, json);
            
            value = Webgram.Utils.clone(value);
            Webgram.Utils.setField(info.field, value, this);
        }
    },

    /**
     * Includes additional information when creating and restoring from the json object that completely
     * characterizes this element. The information is extracted/restored using two function calls.
     * @param {String} name the name to give to the json field
     * @param {Function} toFunc a function to be called to extract the field value; it will receive the element as <tt>this</tt>,
     * a <tt>useObjRefs</tt> argument telling if object references should be used instead of id-based references, and the <tt>name</tt> of the field
     * as the second argument
     * @param {Function} fromFunc a function to be called to restore the field value; it will receive the element as <tt>this</tt>,
     * the json information as a first argument and the <tt>name</tt> of the field as the second argument
     */
    addJsonFuncs: function (name, toFunc, fromFunc) {
        this._jsonFuncs.push({name: name, toFunc: toFunc, fromFunc: fromFunc});
    },
    
    _funcsToJson: function (useObjRefs) {
        var json = {};
        for (var i = 0; i < this._jsonFuncs.length; i++) {
            var funcs = this._jsonFuncs[i];
            var value = funcs.toFunc.call(this, useObjRefs, funcs.name);
            Webgram.Utils.setField(funcs.name, value, json);
        }
        
        return json;
    },
    
    _funcsFromJson: function (json) {
        for (var i = 0; i < this._jsonFuncs.length; i++) {
            var funcs = this._jsonFuncs[i];
            funcs.fromFunc.call(this, json[funcs.name], funcs.name);
        }
    },

    /**
     * Generates a json object that completely characterizes this element.
     * The result should be enough to restore the element using
     * {@link Webgram.DrawingElement#fromJson}. Instead of overriding or tweaking this
     * method, you should override the individual methods that contribute to the json object./<br><br>
     * <em>(could be overridden)</em>
     * @param {Boolean} useObjRefs use object references instead of id-based references,
     * when refering drawing elements (makes the resulting json usable only locally,
     * on the client side)
     * @returns {Object} the json object
     */
    toJson: function (useObjRefs) {
        var json = {
            'className': this.constructor.toString(),
            'cls': this.constructor 
        };
        
        var shapeJson = this.shapeToJson();
        if (shapeJson !== undefined) {
            json['shape'] = shapeJson;
        }
        
        var locationJson = this.locationToJson();
        if (locationJson !== undefined) {
            json['location'] = locationJson;
        }
        
        var rotAngleJson = this.rotationAngleToJson();
        if (rotAngleJson !== undefined) {
            json['rotationAngle'] = rotAngleJson;
        }
        
        var flipJson = this.flipToJson();
        if (flipJson !== undefined) {
            json['flip'] = flipJson;
        }

        var strokeStyleJson = this.strokeStyleToJson();
        if (strokeStyleJson !== undefined) {
            json['strokeStyle'] = strokeStyleJson;
        }
        
        var fillStyleJson = this.fillStyleToJson();
        if (fillStyleJson !== undefined) {
            json['fillStyle'] = fillStyleJson;
        }
        
        var textStyleJson = this.textStyleToJson();
        if (textStyleJson !== undefined) {
            json['textStyle'] = textStyleJson;
        }
        
        var settingsJson = this.settingsToJson();
        if (settingsJson !== undefined) {
            json['settings'] = settings;
        }
        
        var fields = this._fieldsToJson();
        for (var key in fields) {
            json[key] = fields[key];
        }
        
        fields = this._funcsToJson(useObjRefs);
        for (var key in fields) {
            json[key] = fields[key];
        }
        
        return json;
    },
    
    /**
     * Restores the element from a json object. This method is the opposite
     * of {@link Webgram.DrawingElement#toJson}.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Object} json the json object to restore the element from
     */
    fromJson: function(json) {
        if (json.shape !== undefined) {
            this.shapeFromJson(json.shape);
        }
        if (json.rotationAngle !== undefined) {
            this.rotationAngleFromJson(json.rotationAngle);
        }
        if (json.flip !== undefined) {
            this.flipFromJson(json.flip);
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
        if (json.settings !== undefined) {
            this.settingsFromJson(json.settings);
        }
        
        this._fieldsFromJson(json);
        this._funcsFromJson(json);
        
        this._baseRectangle = null;
        this.invalidate(true);
        this.updateDependentElements();
        
        // TODO remove the undo checkpoints related to this DE
    },
    
    
    /* other methods */

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
     * @param {Number} focusType one of the Webgram.DrawingElement.FOCUS_* values or a greater, user-defined value
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
    
    /**
     * Marks the drawing element, as well as its associated points (<tt>sockets</tt>, <tt>control points</tt> and <tt>action menu items</tt>)
     * as invalid, telling webgram to redraw them as soon as possible.
     * @param {Boolean} mini set to <tt>true</tt> to call redraw on the mini webgram as well
     */
    invalidate: function (mini) {
        for (var i = 0; i < this._controlPoints.length; i++) {
            this._controlPoints[i].invalidateAnchor();
        }

        for (i = 0; i < this._sockets.length; i++) {
            this._sockets[i].invalidateAnchor();
        }

        for (i = 0; i < this._actionMenuItems.length; i++) {
            this._actionMenuItems[i].invalidateAnchor();
        }
        
        if (this.webgram) {
            this.webgram.invalidate(mini);
        }
    },
    
    /**
     * Finishes the triggering of all the change events that
     * are made of a <tt>begin*Change</tt>, a <tt>change</tt> and
     * an <tt>end*Change</tt> part.
     * @see {Webgram.DrawingElement#finishShapeEvents}
     * @see {Webgram.DrawingElement#finishMoveEvents}
     * @see {Webgram.DrawingElement#finishRotateEvents}
     * @see {Webgram.DrawingElement#finishStyleEvents}
     */
    finishChangeEvents: function () {
        /* workaround to avoid triggering the onEndChange
         * event more than one time */
        var oldOnEndChange = this.onEndChange;
        this.onEndChange = new  Webgram.Event('dummy', this);
        
        var attributeHint = null;
        this.onEndChange.bind(function (ah) {
            attributeHint = ah;
        });
        
        this.finishShapeEvents();
        this.finishMoveEvents();
        this.finishRotateEvents();
        this.finishStyleEvents();
        
        this.onEndChange = oldOnEndChange;
        if (attributeHint) {
            this.onEndChange.trigger(attributeHint);
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
    }
},

/** @lends Webgram.DrawingElement */ {
    /** Represents the normal focus type of a drawing element, when it's neither hovered, nor selected. */
    FOCUS_NONE: 0, 
    
    /** Represents the hovered focus type of a drawing element. */
    FOCUS_HOVERED: 1,
    
    /** Represents the selected focus type of a drawing element. */
    FOCUS_SELECTED: 2, 

    /** Represents the multiple-selected focus type of a drawing element. */
    FOCUS_SELECTED_MULTIPLE: 3
    
    /* any greater values are user specific */
});
