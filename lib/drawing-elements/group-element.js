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
        /** @lends Webgram.DrawingElements.GroupElement */ {
    
    initialize: function GroupElement(id) {
        Webgram.DrawingElements.GroupElement.parentClass.call(this, id);

        this.setStrokeStyle(Webgram.Styles.getStrokeStyle('group'));
        this.setFillStyle(Webgram.Styles.getFillStyle('group'));
        
        this._drawingElements = [];
        this._relativeRectangles = [];
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

    // TODO jsdoc
    setDrawingElements: function (drawingElements) {
        /* remove all existing children */
        while (this._drawingElements.length) {
            this._remDrawingElement(this._drawingElements[this._drawingElements.length - 1], true);
        }
        
        /* temporarily "override" the _addDrawingElement call to avoid reshaping */
        this._addDrawingElement = Webgram.DrawingElements.ContainerElement.prototype._addDrawingElement;
        
        /* add the supplied children */
        for (var i = 0; i < drawingElements.length; i++) {
            this._addDrawingElement(drawingElements[i], true);
        }
        
        delete this._addDrawingElement;
        
        this._fitChildren();
    },

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
            var relativeRectangle = this._relativeRectangles[i];
            var newBoundingRectangle = relativeRectangle.getScaled(width - 1, height - 1);

            drawingElement.fit(newBoundingRectangle);
        }
    },

    _fitChildren: function () {
        /* recomputes the width and the height
         * of this group so that it fits its children */
        
        var width, height;
        var deltaX, deltaY;
        
        if (this._drawingElements.length === 0) {
            width = height = 1;
            deltaX = deltaY = 0;
        }
        else {
            var minX = Infinity;
            var minY = Infinity;
            var maxX = -Infinity;
            var maxY = -Infinity;
            
            for (var i = 0; i < this._drawingElements.length; i++) {
                var drawingElement = this._drawingElements[i];
                var boundingRectangle = drawingElement.transformDirect(drawingElement.getBoundingRectangle().getPoly()).getBoundingRectangle();
                
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
            deltaX = (maxX + minX) / 2;
            deltaY = (maxY + minY) / 2;
        }
        
        this._relativeRectangles = []; /* invalidate the relative rectangles */
        
        this._setWidth(width);
        this._setHeight(height);
        
        /* recenter the children */
        if (deltaX || deltaY) {
            this._setLocation(this.getLocation().getTranslated(deltaX, deltaY));
            
            for (var i = 0; i < this._drawingElements.length; i++) {
                var drawingElement = this._drawingElements[i];
                drawingElement._setLocation(drawingElement.getLocation().getTranslated(-deltaX, -deltaY));
            }
        }
        
        this._updateRelativeRectangles();
    },
    
    _updateRelativeRectangles: function () {
        /* recomputes the relative rectangles
         * of all the children of this group */
        
        var width = this.getWidth();
        var height = this.getHeight();
        
        this._relativeRectangles = [];
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            var drawingElement = this._drawingElements[i];
            var boundingRectangle = drawingElement.transformDirect(drawingElement.getBoundingRectangle().getPoly()).getBoundingRectangle();
            var relativeRectangle = boundingRectangle.getScaled(1 / (width - 1), 1 / (height - 1));
            
            this._relativeRectangles.push(relativeRectangle);
        }
    },
    
    
    /* other methods */
    
    finishChangeEvents: Webgram.DrawingElements.ContainerElement.prototype.finishChangeEvents,


//    getMinSize: function () {
//        var width = this.getWidth();
//        var height = this.getHeight();
//        
//        var minScale = this._scaleChildren(Number.MIN_VALUE, Number.MIN_VALUE, true);
//        var minWidth = Math.max(minScale.maxWidthScale * width, 1);
//        var minHeight = Math.max(minScale.maxHeightScale * height, 1);
//        
//        return new Webgram.Geometry.Size(minWidth, minHeight);
//    },
//    
//    getMaxSize: function () {
//        var width = this.getWidth();
//        var height = this.getHeight();
//        
//        var maxScale = this._scaleChildren(10e100, 10e100, true);
//        var maxWidth = maxScale.minWidthScale * width;
//        var maxHeight = maxScale.minHeightScale * height;
//        
//        return new Webgram.Geometry.Size(maxWidth, maxHeight);
//    },
//    
//    _scaleChildren: function (widthScale, heightScale, test) {
//        /* scales all the children by calling fit();
//         * if test is set to true, then no actual scaling is performed,
//         * but the min/max scaling factors are returned */
//        
//        var minWidthScale = Infinity;
//        var minHeightScale = Infinity;
//        var maxWidthScale = -Infinity;
//        var maxHeightScale = -Infinity;
//        
//        for (var i = 0; i < this._drawingElements.length; i++) {
//            var drawingElement = this._drawingElements[i];
//            var childRect = drawingElement.transformDirect(
//                    drawingElement.getBoundingRectangle().getPoly()).getBoundingRectangle();
//            
//            var scaledChildRect = childRect.getScaled(widthScale, heightScale);
//            var newChildRect = drawingElement.fit(scaledChildRect, test);
//            
//            if (test) {
//                newChildRect = drawingElement.transformDirect(newChildRect.getPoly()).getBoundingRectangle();
//                var ws = newChildRect.getWidth() / childRect.getWidth();
//                var hs = newChildRect.getHeight() / childRect.getHeight();
//                
//                if (ws < minWidthScale) {
//                    minWidthScale = ws;
//                }
//                if (ws > maxWidthScale) {
//                    maxWidthScale = ws;
//                }
//                if (hs < minHeightScale) {
//                    minHeightScale = hs;
//                }
//                if (hs > maxHeightScale) {
//                    maxHeightScale = hs;
//                }
//            }
//        }
//        
//        return {
//            minWidthScale: minWidthScale,
//            minHeightScale: minHeightScale,
//            maxWidthScale: maxWidthScale,
//            maxHeightScale: maxHeightScale
//        };
//    },
});
