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


Webgram.DrawingElements.ContainerElement = 
            Webgram.DrawingElement.extend( /** @lends Webgram.DrawingElements.ContainerElement.prototype */ {
                
    /**
     * A base class for drawing elements that behave  like containers for other elements.
     * @constructs Webgram.DrawingElements.ContainerElement
     * @extends Webgram.DrawingElement
     */
    initialize: function ContainerElement(id) {
        this._drawingElements = [];
        
        Webgram.DrawingElements.ContainerElement.parentClass.call(this, id);
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
        this.drawRect(this.getBoundingRectangle());
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
        for (i = 0; i < this._drawingElements.length; i++) {
            drawingElement = this._drawingElements[i];
            
            drawingElement.draw();
            
            this.webgram.rootContainer._noZoom = true;
            drawingElement.drawNoZoom();
            this.webgram.rootContainer._noZoom = false;
        }
        
        /* the "on top" draw loop */
        for (i = 0; i < this._drawingElements.length; i++) {
            drawingElement = this._drawingElements[i];
            
            drawingElement.drawTop();
            
            this.webgram.rootContainer._noZoom = true;
            drawingElement.drawNoZoomTop();
            this.webgram.rootContainer._noZoom = false;
        }
        
        /* control points */
        for (i = 0; i < this._drawingElements.length; i++) {
            drawingElement = this._drawingElements[i];
            this.webgram.rootContainer._noZoom = true;
            drawingElement.drawControlPoints();
            this.webgram.rootContainer._noZoom = false;
        }
    },
    
    
    /* drawing primitives */
    
    drawImage: function (image, center, size, rotationAngle, alpha, transformSet) {
        if (transformSet) { /* called from a child */
            this._parent.drawImage(image, center, size, rotationAngle, alpha, this._getTransformSet(transformSet));
        }
        else { /* own drawing */
            Webgram.DrawingElements.ContainerElement.parent.drawImage.call(this, image, center, size, rotationAngle, alpha);
        }
    },
    
    drawText: function (text, box, rotationAngle, textStyle, transformSet) {
        if (box == null) {
            box = this.getBoundingRectangle();
        }
        
        if (textStyle === undefined) {
            textStyle = this.getTextStyle();
        }
        
        if (transformSet) { /* called from a child */
            this._parent.drawText(text, box, rotationAngle, textStyle, this._getTransformSet(transformSet));
        }
        else { /* own drawing */
            Webgram.DrawingElements.ContainerElement.parent.drawText.call(this, text, box, rotationAngle, textStyle);
        }
    },
    
    paint: function (strokeStyle, fillStyle, transformSet) {
        if (transformSet) { /* called from a child */
            this._parent.paint(strokeStyle, fillStyle, this._getTransformSet(transformSet));
        }
        else { /* own drawing */
            if (strokeStyle === undefined) {
                strokeStyle = this.getStrokeStyle();
            }
            if (fillStyle === undefined) {
                fillStyle = this.getFillStyle();
            }
            
            Webgram.DrawingElements.ContainerElement.parent.paint.call(this, strokeStyle, fillStyle);
        }
    },
    

    /* shape */
    
    pointInside: function (point) {
        /* a point is inside a CE if it is inside of any of the children DEs */
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            if (this._drawingElements[i].transformedPointInside(point)) {
                return true;
            }
        }
        
        return false;
    },
    
    getBoundingRectangle: function () {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            var drawingElement = this._drawingElements[i];
            var boundingRectangle = drawingElement.transformDirect(
                    drawingElement.getBoundingRectangle().getPoly()).getBoundingRectangle();
            
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
        
        if (minX === Infinity) { /* no children */
            minX = 0;
            minY = 0;
            maxX = 0;
            maxY = 0;
        }
        
        return new Webgram.Geometry.Rectangle(minX, minY, maxX, maxY);
    },

    
    /* children */
    
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
    
    _addDrawingElement: function (drawingElement, where, triggerEvents) {
        if (drawingElement._parent) {
            return null;
        }
        
        if (this.webgram && !drawingElement.isBeingCreated()) {
            this.webgram.saveUndoCheckPoint([drawingElement], 'add');
        }
        
        drawingElement._parent = this;
        
        var afterDrawingElement = (where instanceof Webgram.DrawingElement) ? where : null;
        var beforeIndex = (typeof where === 'number') ? where : this._drawingElements.length;
        var i, minIndex = 0, maxIndex = this._drawingElements.length, finalIndex = null;
        
        /* find the minimum index, according to the zIndex property */
        for (i = 0; i < this._drawingElements.length; i++) {
            if (this._drawingElements[i].zIndex >= drawingElement.zIndex) {
                break;
            }
        }
        minIndex = i;
        
        /* find the maximum index, according to the zIndex property */
        while ((i < this._drawingElements.length) && (this._drawingElements[i].zIndex === drawingElement.zIndex)) {
            if (this._drawingElements[i] === afterDrawingElement) {
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
        
        this._drawingElements.splice(finalIndex, 0, drawingElement);
        
        if (this.webgram) {
            drawingElement._setWebgram(this.webgram);
        }
        
        if (triggerEvents) {
            drawingElement.onAdd.trigger(this);
            for (i = finalIndex + 1; i < this._drawingElements.length; i++) {
                this._drawingElements[i].onIndexChange.trigger(i);
                this.webgram.onDrawingElementIndexChange.trigger(this._drawingElements[i], i);
            }
        }
        
        if (this.webgram && triggerEvents) {
            drawingElement._triggerAdded();
            drawingElement.finishChangeEvents();
        }
        
        this.invalidate(true);
    },
    
    _triggerAdded: function () {
        this.webgram.onDrawingElementAdd.trigger(this);
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            this._drawingElements[i]._triggerAdded();
        }
    },

    /**
     * Removes the specified drawing element from this container.
     * @param {Webgram.DrawingElement} drawingElement the drawing element to remove
     */
    remDrawingElement: function (drawingElement) {
        this._remDrawingElement(drawingElement, true);
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
        drawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
        
        this._drawingElements.splice(index, 1);
        
        if (this.webgram && triggerEvents) {
            drawingElement._triggerRemoved();
        }

        if (triggerEvents) {
            drawingElement.onRemove.trigger(this);
            for (var i = index; i < this._drawingElements.length; i++) {
                this._drawingElements[i].onIndexChange.trigger(i);
                this.webgram.onDrawingElementIndexChange.trigger(this._drawingElements[i], i);
            }
        }
        
        if (this.webgram) {
            drawingElement._clearWebgram();
        }
        
        this.invalidate(true);
    },
        
    _triggerRemoved: function () {
        for (var i = 0; i < this._drawingElements.length; i++) {
            this._drawingElements[i]._triggerRemoved();
        }
        
        this.webgram.onDrawingElementRemove.trigger(this);
    },
    
    /**
     * Returns the index (position) of the given drawing element
     * in the list of children of this container. 
     * @param {Webgram.DrawingElement} drawingElement the drawing element of interest
     * @returns {Number} the position of the drawing element if found, <tt>-1</tt> otherwise
     */
    getDrawingElementIndex: function (drawingElement) {
        for (var i = 0; i < this._drawingElements.length; i++) {
            if (this._drawingElements[i] === drawingElement) {
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
    
    _setDrawingElementIndex: function (drawingElement, index, triggerEvents) {
        var currentIndex = this.getDrawingElementIndex(drawingElement);
        if (currentIndex === -1) {
            return;
        }
        
        if (this.webgram) {
            this.webgram.saveUndoCheckPoint([drawingElement], 'index-change');
        }
        
        var i, minIndex = 0, maxIndex = this._drawingElements.length - 1;
        
        /* find the minimum index, according to the zIndex property */
        for (i = 0; i < this._drawingElements.length; i++) {
            if (this._drawingElements[i] !== drawingElement && this._drawingElements[i].zIndex >= drawingElement.zIndex) {
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
        while ((i < this._drawingElements.length) && (this._drawingElements[i].zIndex === drawingElement.zIndex)) {
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
        
        this._drawingElements.splice(currentIndex, 1); /* remove it from the old position */
        this._drawingElements.splice(index, 0, drawingElement); /* add it to the new position */
        
        if (triggerEvents) {
            /* trigger the onIndexChange events */
            for (i = Math.min(index, currentIndex); i <= Math.max(index, currentIndex); i++) {
                this._drawingElements[i].onIndexChange.trigger(i);
                if (this.webgram) {
                    this.webgram.onDrawingElementIndexChange.trigger(this._drawingElements[i], i);
                }
            }
        }
        
        this.invalidate(true);
    },
    
    /**
     * Returns a list of all the children.
     * @returns {Array} a list with all the children
     */
    getDrawingElements: function () {
        return this._drawingElements.slice(0);
    },
        
    _setWebgram: function (webgram) {
        this.webgram = webgram;
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            this._drawingElements[i]._setWebgram(webgram);
        }
    },

    _clearWebgram: function () {
        for (var i = 0; i < this._drawingElements.length; i++) {
            this._drawingElements[i]._clearWebgram();
        }
        
        this.webgram = null;        
    },

    
    /* other methods */
    
    finishChangeEvents: function () {
        // TODO not sure if this is required
        for (var i = 0; i < this._drawingElements.length; i++) {
            this._drawingElements[i].finishChangeEvents();
        }

        Webgram.DrawingElements.ContainerElement.parent.finishChangeEvents.call(this);
    }
});
