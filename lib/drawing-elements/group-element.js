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


// TODO jsdoc
Webgram.DrawingElements.GroupElement = Webgram.DrawingElements.RectangularElement.extend(
        /** @lends Webgram.DrawingElements.GroupElement.prototype */ {
    
    initialize: function GroupElement(id) {
        Webgram.DrawingElements.GroupElement.parentClass.call(this, id);

        this.setStrokeStyle(Webgram.Styles.getStrokeStyle('group'));
        this.setFillStyle(Webgram.Styles.getFillStyle('group'));
        
        this._drawingElements = [];
        this._relativeRectangles = [];
        
        this._fitChildrenLock = false;
    },
    
    
    /* drawing methods */
    
    draw: Webgram.DrawingElements.ContainerElement.prototype.draw,
    
    /**
     * The drawing procedure of a group element is divided into two parts:
     * the drawing of the group's container (this method) and the drawing of the children,
     * which is done by a call to {@link Webgram.DrawingElements.GroupElement#drawElements}.
     */
    drawSelf: function () {
        this.drawRect(this.getBoundingRectangle());
        this.paint();
    },
    
    /**
     * Draws the children of this container element onto the canvas,
     * by calling their respective drawing methods.
     * See {@link Webgram.DrawingElements.GroupElement#drawSelf} for
     * an explanation.
     */
    drawElements: Webgram.DrawingElements.ContainerElement.prototype.drawElements,

    
    /* drawing primitives */
    
    drawImage: Webgram.DrawingElements.ContainerElement.prototype.drawImage,
    
    drawText: Webgram.DrawingElements.ContainerElement.prototype.drawText,
    
    paint: Webgram.DrawingElements.ContainerElement.prototype.paint,
    
    
    /* shape */
    
    _setWidth: function (width, fixedSide) {
        Webgram.DrawingElements.GroupElement.parent._setWidth.call(this, width, fixedSide);
        
        this._scaleChildren();
    },
    
    _setHeight: function (height, fixedSide) {
        Webgram.DrawingElements.GroupElement.parent._setHeight.call(this, height, fixedSide);
        
        this._scaleChildren();
    },
    
    // TODO implement fit
    

    /* children */
    
    /**
     * Adds a drawing element to the group.
     * @param {Webgram.DrawingElement} drawingElement the drawing element to add
     * @param {any} where indicates where to add the element:<ul>
     *  <li>if a {@link Webgram.DrawingElement} is given, the element is added after that element</li>
     *  <li>if a number is given, the element is added at that position</li>
     *  <li>if <tt>null</tt> or <tt>undefined</tt> is given, the element is added at the end</li>
     * </ul>
     */
    addDrawingElement: Webgram.DrawingElements.ContainerElement.prototype.addDrawingElement,
    
    _addDrawingElement: function (drawingElement, where, triggerEvents) {
        Webgram.DrawingElements.ContainerElement.prototype._addDrawingElement.call(this, drawingElement, where, triggerEvents);
        
        this._fitChildren();
        this._updateRestrictions();
        this._bindGeometryChangeHandlers(drawingElement);
    },
    
    _triggerAdded: Webgram.DrawingElements.ContainerElement.prototype._triggerAdded,

    /**
     * Removes the specified drawing element from this container.
     * @param {Webgram.DrawingElement} drawingElement the drawing element to remove
     */
    remDrawingElement: Webgram.DrawingElements.ContainerElement.prototype.remDrawingElement,
    
    _remDrawingElement: function (drawingElement, triggerEvents) {
        Webgram.DrawingElements.ContainerElement.prototype._remDrawingElement.call(this, drawingElement, triggerEvents);
        
        this._fitChildren();
        this._updateRestrictions();
        this._unbindGeometryChangeHandlers(drawingElement);
    },
        
    _triggerRemoved: Webgram.DrawingElements.ContainerElement.prototype._triggerRemoved,
    
    /**
     * Returns the index (position) of the given drawing element
     * in the list of children of this group. 
     * @param {Webgram.DrawingElement} drawingElement the drawing element of interest
     * @returns {Number} the position of the drawing element if found, <tt>-1</tt> otherwise
     */
    getDrawingElementIndex: Webgram.DrawingElements.ContainerElement.prototype.getDrawingElementIndex,
    
    /**
     * Changes the position of a drawing element in the list of children of the group.
     * @param {Webgram.DrawingElement} drawingElement the drawing element to reposition
     * @param {Number} index the new position for the drawing element
     */
    setDrawingElementIndex: Webgram.DrawingElements.ContainerElement.prototype.setDrawingElementIndex,
    
    _setDrawingElementIndex: function (drawingElement, index, triggerEvents) {
        Webgram.DrawingElements.ContainerElement.prototype._setDrawingElementIndex.call(this, drawingElement, index, triggerEvents);
        
        this._updateRelativeRectangles();
    },
    
    /**
     * Returns a list of all the children.
     * @returns {Array} a list with all the children
     */
    getDrawingElements: Webgram.DrawingElements.ContainerElement.prototype.getDrawingElements,

    _setWebgram: Webgram.DrawingElements.ContainerElement.prototype._setWebgram,

    _clearWebgram: Webgram.DrawingElements.ContainerElement.prototype._clearWebgram,
    
    _scaleChildren: function () {
        /* scales all the children by calling fit(),
         * recomputing their bounding rectangles
         * according to the saved relative rectangles */
        
        if (this._relativeRectangles.length === 0) {
            return; /* nothing to do */
        }
        
        var width = this.getWidth();
        var height = this.getHeight();
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            var drawingElement = this._drawingElements[i];
            
            if (!drawingElement.isEditEnabled()) {
                continue;
            }
            
            var relativeRectangle = this._relativeRectangles[i];
            var newBoundingRectangle = relativeRectangle.getScaled(width - 1, height - 1);

            drawingElement.fit(newBoundingRectangle);
        }
    },
    
    _fitChildren: function () {
        /* recomputes the width and the height
         * of this group so that it fits its children */
        
        this._fitChildrenLock = true;
        
        var width, height;
        var delta;
        
        if (this._drawingElements.length === 0) {
            width = height = 1;
            delta = null;
        }
        else {
            var minX = Infinity;
            var minY = Infinity;
            var maxX = -Infinity;
            var maxY = -Infinity;
            
            for (var i = 0; i < this._drawingElements.length; i++) {
                var drawingElement = this._drawingElements[i];
                var boundingRectangle = drawingElement.getBoundingRectangle(true);
                
                if (boundingRectangle.x1 < minX) {
                    minX = boundingRectangle.x1;
                }
                if (boundingRectangle.y1 < minY) {
                    minY = boundingRectangle.y1;
                }
                if (boundingRectangle.x2 > maxX) {
                    maxX = boundingRectangle.x2;
                }
                if (boundingRectangle.y2 > maxY) {
                    maxY = boundingRectangle.y2;
                }
            }
            
            width = maxX - minX + 1;
            height = maxY - minY + 1;
            
            delta = new Webgram.Geometry.Size((maxX + minX) / 2, (maxY + minY) / 2);
        }
        
        this._relativeRectangles = []; /* invalidate the relative rectangles */
        
        this._setWidth(width);
        this._setHeight(height);
        
        /* recenter the children */
        if (delta) {
            var thisDelta = this.scaleDirect(delta).getRotated(this.getRotationAngle());
            this._setLocation(this.getLocation().getTranslated(thisDelta.width, thisDelta.height));
            
            for (var i = 0; i < this._drawingElements.length; i++) {
                var drawingElement = this._drawingElements[i];
                drawingElement._setLocation(drawingElement.getLocation().getTranslated(-delta.width, -delta.height));
            }
        }
        
        this._updateRelativeRectangles();
        
        this._fitChildrenLock = false;
    },
    
    _updateRestrictions: function () {
        var isMoveEnabled = true;
        var isRotateEnabled = true;
        var isFlipEnabled = true;
        var isEditEnabled = true;
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            var drawingElement = this._drawingElements[i];
            
            if (!drawingElement.isMoveEnabled()) {
                isMoveEnabled = false;
            }
            if (!drawingElement.isRotateEnabled()) {
                isRotateEnabled = false;
            }
            if (!drawingElement.isFlipEnabled()) {
                isFlipEnabled = false;
            }
            if (!drawingElement.isEditEnabled()) {
                isEditEnabled = false;
            }
        }
        
        this.setMoveEnabled(isMoveEnabled);
        this.setRotateEnabled(isRotateEnabled);
        this.setFlipEnabled(isFlipEnabled);
        this.setEditEnabled(isEditEnabled);
    },

    _updateRelativeRectangles: function () {
        /* recomputes the relative rectangles
         * of all the children of this group */
        
        var width = this.getWidth();
        var height = this.getHeight();
        
        this._relativeRectangles = [];
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            var drawingElement = this._drawingElements[i];
            var boundingRectangle = drawingElement.getBoundingRectangle(true);
            var relativeRectangle = boundingRectangle.getScaled(1 / (width - 1), 1 / (height - 1));
            
            this._relativeRectangles.push(relativeRectangle);
        }
    },
    
    _bindGeometryChangeHandlers: function (drawingElement) {
        drawingElement.onShapeChange.bind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onRotate.bind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onMove.bind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onFlipHorizontally.bind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onFlipVertically.bind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
    },
    
    _unbindGeometryChangeHandlers: function (drawingElement) {
        drawingElement.onShapeChange.unbind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onRotate.unbind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onMove.unbind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onFlipHorizontally.unbind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
        drawingElement.onFlipVertically.unbind(Webgram.DrawingElements.GroupElement._whenChildrenGeometryChanged);
    },
    
    
    /* other methods */
    
    finishChangeEvents: Webgram.DrawingElements.ContainerElement.prototype.finishChangeEvents
    
}, 

/** @lends Webgram.DrawingElements.GroupElement */ {
    
    _whenChildrenGeometryChanged: function () {
        /* "this" is the child */
        
        groupElement = this._parent;
        if (groupElement._fitChildrenLock) {
            return;
        }
        
//        groupElement._fitChildren();
//        groupElement._updateRelativeRectangles();
    }    
});
