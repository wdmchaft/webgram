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


Webgram.Namespace('Webgram.DrawingElements');

/**
 * @class A rectangular drawing element that behaves like a container for other elements.
 * @extends Webgram.DrawingElements.RectangularElement
 */
Webgram.DrawingElements.ContainerElement = function (id, x, y, width, height) {
    this.drawingElements = [];
    
    Webgram.DrawingElements.RectangularElement.call(this, id, x, y, width, height);
};

Webgram.DrawingElements.ContainerElement.prototype = {
    setFocusType: function (focusType) {
        if (focusType < Webgram.DrawingElement.FOCUS_SELECTED) {
            for (var i = 0; i < this.drawingElements.length; i++) {
                var drawingElement = this.drawingElements[i];
                drawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
            }
        }
        
        Webgram.DrawingElement.prototype.setFocusType.call(this, focusType);
    },
    
    
    /* drawing methods */
    
    draw: function () {
        this.drawSelf();
        this.drawElements();
    },
    
    /**
     * The drawing procedure of a container element is divided into two parts:
     * the drawing of the container itself (this method) and the drawing of the children,
     * which is done by a call to {@link Webgram.DrawingElements.ContainerElement#drawElements}.
     */
    drawSelf: function () {
    },
    
    drawDecoration: function () {
        this.drawRect(this.getDrawingRectangle());
        this.paint(undefined, null);
    },
    
    /**
     * Draws the children of this container element onto the canvas,
     * by calling their respective drawing methods.
     * See {@link Webgram.DrawingElements.ContainerElement#drawElements} for
     * an explanation.
     */
    drawElements: function () {
        /* elements themselves */
        var drawingElement, i;
        
        /* the normal draw loop */ 
        for (i = 0; i < this.drawingElements.length; i++) {
            drawingElement = this.drawingElements[i];
            
            drawingElement.draw();
            
            this.webgram.rootContainer._noZoom = true;
            drawingElement.drawNoZoom();
            this.webgram.rootContainer._noZoom = false;
        }
        
        /* the "on top" draw loop */
        for (i = 0; i < this.drawingElements.length; i++) {
            drawingElement = this.drawingElements[i];
            
            drawingElement.drawTop();
            
            this.webgram.rootContainer._noZoom = true;
            drawingElement.drawNoZoomTop();
            this.webgram.rootContainer._noZoom = false;
        }
        
        /* control points & sockets */
        for (i = 0; i < this.drawingElements.length; i++) {
            drawingElement = this.drawingElements[i];
            this.webgram.rootContainer._noZoom = true;
            drawingElement.drawActionMenuItems();
            drawingElement.drawControlPoints();
            drawingElement.drawSockets();
            this.webgram.rootContainer._noZoom = false;
        }
    },
    
    
    /* drawing primitives */
    
    drawImage: function (image, center, size, rotationAngle, alpha, transformSet) {
        if (transformSet) { /* called from a child */
            this._parent.drawImage(image, center, size, rotationAngle, alpha, this._getTransformSet(transformSet));
        }
        else { /* own drawing */
            Webgram.DrawingElement.prototype.drawImage.call(this, image, center, size, rotationAngle, alpha);
        }
    },
    
    drawText: function (text, box, textStyle, transformSet) {
        if (box == null) {
            box = this.getBaseRectangle();
        }
        
        if (textStyle === undefined) {
            textStyle = this.getTextStyle();
        }
        
        if (transformSet) { /* called from a child */
            this._parent.drawText(text, box, textStyle, this._getTransformSet(transformSet));
        }
        else { /* own drawing */
            Webgram.DrawingElement.prototype.drawText.call(this, text, box, textStyle);
        }
    },
    
    paint: function (strokeStyle, fillStyle, transformSet) {
        if (strokeStyle === undefined) {
            strokeStyle = this.getStrokeStyle();
        }
        if (fillStyle === undefined) {
            fillStyle = this.getFillStyle();
        }
        
        if (transformSet) { /* called from a child */
            this._parent.paint(strokeStyle, fillStyle, this._getTransformSet(transformSet));
        }
        else { /* own drawing */
            Webgram.DrawingElement.prototype.paint.call(this, strokeStyle, fillStyle);
        }
    },
    

    /* shape-related methods */
    
    finishShapeEvents: function (force) {
        Webgram.DrawingElement.prototype.finishShapeEvents.call(this, force);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            this.drawingElements[i].finishShapeEvents(force);
        }
    },
    
    setTransformedShapePoint: function (index, point) {
        Webgram.DrawingElements.RectangularElement.prototype.setTransformedShapePoint.call(this, index, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    
    /* points */

    // nothing, for now
    
    /* children drawing elements */
    
    /**
     * Adds a drawing element to the container.
     * @param {Webgram.DrawingElement} drawingElement the drawing element to add
     * @param {any} where indicates where to add the element:<ul>
     *  <li>if a {@link Webgram.DrawingElement} is given, the element is added after that element</li>
     *  <li>if a number is given, the element is added at that position</li>
     *  <li>if <tt>null</tt> or <tt>undefined</tt> is given, the element is added at the end</li>
     * </ul>
     */
    addDrawingElement: function (drawingElement, where) {
        this._addDrawingElement(drawingElement, where, true);
    },
    
    /**
     * Removes the specified drawing element from this container.
     * @param {Webgram.DrawingElement} drawingElement the drawing element to remove
     */
    remDrawingElement: function (drawingElement) {
        this._remDrawingElement(drawingElement, true);
    },
    
    /**
     * Returns the index (position) of the given drawing element
     * in the list of children of this container. 
     * @param {Webgram.DrawingElement} drawingElement the drawing element of interest
     * @returns {Number} the position of the drawing element if found, <tt>-1</tt> otherwise
     */
    getDrawingElementIndex: function (drawingElement) {
        for (var i = 0; i < this.drawingElements.length; i++) {
            if (this.drawingElements[i] === drawingElement) {
                return i;
            }
        }
        
        return -1;
    },
    
    /**
     * Changes the position of a drawing element in the list of children of the container.
     * @param {Webgram.DrawingElement} drawingElement the drawing element to reposition
     * @param {Number} index the new position for the drawing element
     */
    setDrawingElementIndex: function (drawingElement, index) {
        this._setDrawingElementIndex(drawingElement, index, true);
    },
    
    /**
     * Returns a list of all the children.
     * @returns {Array} a list with all the children
     */
    getDrawingElements: function () {
        return this.drawingElements.slice(0);
    },
    
    /**
     * Returns the margins of this container. Margins are defined as the smallest rectangle
     * that contains all the children.
     * @returns {Webgram.Geometry.Rectangle} the margins of this container
     */
    getMargins: function () {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var boundingRectangle;
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            boundingRectangle = drawingElement.getBoundingRectangle();
            if (boundingRectangle.x1 < minX) {
                minX = boundingRectangle.x1;
            }
            if (boundingRectangle.x2 > maxX) {
                maxX = boundingRectangle.x2;
            }
            if (boundingRectangle.y1 < minY) {
                minY = boundingRectangle.y1;
            }
            if (boundingRectangle.y2 > maxY) {
                maxY = boundingRectangle.y2;
            }
        }
        
        if (minX === Infinity) { /* no children, margins are given by this block element */
            boundingRectangle = this.getBoundingRectangle();
            minX = boundingRectangle.x1;
            minY = boundingRectangle.y1;
            maxX = boundingRectangle.x2;
            maxY = boundingRectangle.y2;
        }
        
        return new Webgram.Geometry.Rectangle(minX, minY, maxX, maxY);
    },
    
    _addDrawingElement: function (drawingElement, where, triggerEvents) {
        if (drawingElement._parent) {
            return null;
        }
        
        if (this.webgram && !drawingElement.isBeingCreated()) {
            this.webgram.saveUndoCheckPoint([drawingElement], 'add');
        }
        
        drawingElement._parent = this;
        drawingElement.saveParentRelativePosition();
        
        var afterDrawingElement = (where instanceof Webgram.DrawingElement) ? where : null;
        var beforeIndex = (typeof where === 'number') ? where : this.drawingElements.length;
        var i, minIndex = 0, maxIndex = this.drawingElements.length, finalIndex = null;
        
        /* find the minimum index, according to the zIndex property */
        for (i = 0; i < this.drawingElements.length; i++) {
            if (this.drawingElements[i].zIndex >= drawingElement.zIndex) {
                break;
            }
        }
        minIndex = i;
        
        /* find the maximum index, according to the zIndex property */
        while ((i < this.drawingElements.length) && (this.drawingElements[i].zIndex === drawingElement.zIndex)) {
            if (this.drawingElements[i] === afterDrawingElement) {
                finalIndex = i + 1;
                break; /* no need to go further */
            }
            i++;
        }
        maxIndex = i;
        
        /* find the final position to insert the drawing element */
        if (finalIndex == null) { /* no before drawing element specified, or specified but not found */
            if (beforeIndex < minIndex) {
                finalIndex = minIndex;
            }
            else if (beforeIndex > maxIndex) {
                finalIndex = maxIndex;
            }
            else {
                finalIndex = beforeIndex;
            }
        }
        
        this.drawingElements.splice(finalIndex, 0, drawingElement);
        
        if (this.webgram) {
            drawingElement._setWebgram(this.webgram);
        }
        
        if (triggerEvents) {
            drawingElement.onAdd.trigger(this);
            for (i = finalIndex + 1; i < this.drawingElements.length; i++) {
                this.drawingElements[i].onIndexChange.trigger(i);
                this.webgram.onDrawingElementIndexChange.trigger(this.drawingElements[i], i);
            }
        }
        
        if (this.webgram && triggerEvents) {
            drawingElement._triggerAdded();
            drawingElement.finishChangeEvents();
        }
        
        this.invalidateDrawing(true);
    },
    
    _remDrawingElement: function (drawingElement, triggerEvents) {
        var index = this.getDrawingElementIndex(drawingElement);
        if (index === -1) {
            return;
        }
        
        if (this.webgram && !drawingElement.isBeingCreated()) {
            if (this.webgram.userInteraction()) {
                this.webgram.saveUndoCheckPoint([drawingElement], 'remove');
            }
            else {
                this.webgram.purgeUndoCheckPoints(drawingElement);
            }
        }
        
        drawingElement._parent = null;
        drawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
        
        /* disconnect all end-points */
        var endPoints = drawingElement.getControlPoints(Webgram.Connectors.EndPoint);
        for (var i = 0; i < endPoints.length; i++) {
            var endPoint = endPoints[i];
            if (endPoint.isConnected()) {
                endPoint.socket.disconnect(endPoint);
            }
        }

        /* disconnect all sockets */
        for (i = 0; i < drawingElement._sockets.length; i++) {
            var socket = drawingElement._sockets[i];
            if (socket.isConnected()) {
                socket.disconnect();
            }
        }

        this.drawingElements.splice(index, 1);
        
        if (this.webgram && triggerEvents) {
            drawingElement._triggerRemoved();
        }

        if (triggerEvents) {
            drawingElement.onRemove.trigger(this);
            for (i = index; i < this.drawingElements.length; i++) {
                this.drawingElements[i].onIndexChange.trigger(i);
                this.webgram.onDrawingElementIndexChange.trigger(this.drawingElements[i], i);
            }
        }
        
        if (this.webgram) {
            drawingElement._clearWebgram();
        }
        
        this.invalidateDrawing(true);
    },
        
    _setDrawingElementIndex: function (drawingElement, index, triggerEvents) {
        var currentIndex = this.getDrawingElementIndex(drawingElement);
        if (currentIndex === -1) {
            return;
        }
        
        if (this.webgram) {
            this.webgram.saveUndoCheckPoint([drawingElement], 'index-change');
        }
        
        var i, minIndex = 0, maxIndex = this.drawingElements.length - 1;
        
        /* find the minimum index, according to the zIndex property */
        for (i = 0; i < this.drawingElements.length; i++) {
            if (this.drawingElements[i] !== drawingElement && this.drawingElements[i].zIndex >= drawingElement.zIndex) {
                break;
            }
        }
        
        /* if the given DE is on the first position with this zIndex,
         * the above loop skipped it */ 
        if (currentIndex === i - 1) {
            i--;
        }
        
        minIndex = i;
        
        /* find the maximum index, according to the zIndex property */
        while ((i < this.drawingElements.length) && (this.drawingElements[i].zIndex === drawingElement.zIndex)) {
            i++;
        }
        maxIndex = i - 1;
        
        /* find the final position to insert the drawing element */
        if (index < minIndex) {
            index = minIndex;
        }
        else if (index > maxIndex) {
            index = maxIndex;
        }
        
        if (currentIndex === index) {
            return;
        }
        
        this.drawingElements.splice(currentIndex, 1); /* remove it from the old position */
        this.drawingElements.splice(index, 0, drawingElement); /* add it to the new position */
        
        if (triggerEvents) {
            /* trigger the onIndexChange events */
            for (i = Math.min(index, currentIndex); i <= Math.max(index, currentIndex); i++) {
                this.drawingElements[i].onIndexChange.trigger(i);
                if (this.webgram) {
                    this.webgram.onDrawingElementIndexChange.trigger(this.drawingElements[i], i);
                }
            }
        }
        
        this.invalidateDrawing(true);
    },
    
    _setTop: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setTop.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setRight: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setRight.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setBottom: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setBottom.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setLeft: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setLeft.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setTopLeft: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setTopLeft.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setBottomRight: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setBottomRight.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setTopRight: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setTopRight.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setBottomLeft: function (point) {
        Webgram.DrawingElements.RectangularElement.prototype._setBottomLeft.call(this, point);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            drawingElement.restoreParentRelativePosition();
        }
    },
    
    _setWebgram: function (webgram) {
        this.webgram = webgram;
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            this.drawingElements[i]._setWebgram(webgram);
        }
    },

    _clearWebgram: function () {
        for (var i = 0; i < this.drawingElements.length; i++) {
            this.drawingElements[i]._clearWebgram();
        }
        
        this.webgram = null;        
    },

    _triggerAdded: function () {
        this.webgram.onDrawingElementAdd.trigger(this);
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            this.drawingElements[i]._triggerAdded();
        }
    },

    _triggerRemoved: function () {
        for (var i = 0; i < this.drawingElements.length; i++) {
            this.drawingElements[i]._triggerRemoved();
        }
        
        this.webgram.onDrawingElementRemove.trigger(this);
    }
};

Webgram.Class('Webgram.DrawingElements.ContainerElement', Webgram.DrawingElements.RectangularElement);
