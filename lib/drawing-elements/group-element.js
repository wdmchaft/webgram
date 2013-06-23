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


Webgram.DrawingElements.GroupElement = Webgram.DrawingElements.ContainerElement.extend(
        /** @lends Webgram.DrawingElements.RectangularElement */ {
    
    initialize: function GroupElement(id) {
        Webgram.DrawingElements.GroupElement.parentClass.call(this, id);

        this.setStrokeStyle(Webgram.Styles.getStrokeStyle('group'));
        this.setFillStyle(Webgram.Styles.getFillStyle('group'));
        
        this._aspectRatio = null;
        
        this._editControlPoints = null;
    },

    drawSelf: function () {
        this.drawRect(this.getBoundingRectangle());
        this.paint();
    },

    /**
     * Returns the width of this group element.
     * @returns {Number}
     */
    getWidth: function () {
        return this.getBoundingRectangle().getWidth();
    },

    /**
     * Sets the width of this group element.
     * @param {Number} width the width to set
     * @param {Number} fixedSide the side that remains fixed when
     * changing the width, or <tt>null</tt> to resize from the center
     * (use one of the <tt>Webgram.DrawingElements.RectangularElement.SIDE_*</tt> values)
     */
    setWidth: Webgram.DrawingElements.RectangularElement.prototype.setWidth,

    _setWidth: function (width, fixedSide) {
        var oldWidth = this.getWidth();
        var oldHeight = this.getHeight();
        
        width = Math.max(this.getMinSize().width, width);
        width = Math.min(this.getMaxSize().width, width);
        
        var height = oldHeight;
        if (this._aspectRatio) {
            height = width / this._aspectRatio;
        }
        
        var widthScale = width / oldWidth;
        var heightScale = height / oldHeight;
        
        /* effectively change the size */
        this.beginShapeChange();
        this._scaleChildren(widthScale, heightScale);
        this.onShapeChange.trigger();
        
        /* recompute the width, it might have been changed */
        width = this.getWidth();
        
        /* move, so that the given side remains fixed */
        var offsetX = 0;
        switch (fixedSide) {
            case Webgram.DrawingElements.RectangularElement.SIDE_LEFT:
                offsetX = (width - oldWidth) / 2;
                break;

            case Webgram.DrawingElements.RectangularElement.SIDE_RIGHT:
                offsetX = (oldWidth - width) / 2;
                break;
        }
        
        var size = new Webgram.Geometry.Size(offsetX, 0);
        size = this.scaleDirect(size).getRotated(this.getRotationAngle());
        
        var newLocation = this.getLocation().getTranslated(size.width, size.height);
        this._setLocation(newLocation, false, true);
        
        this.invalidate(true);
        this.updateDependentElements();
    },

    /**
     * Returns the height of this group element.
     * @returns {Number}
     */
    getHeight: function () {
        return this.getBoundingRectangle().getHeight();
    },

    /** Sets the height of this group element.
     * @param {Number} height the height to set
     * @param {Number} fixedSide the side that remains fixed when
     * changing the width, or <tt>null</tt> to resize from the center
     * (use one of the <tt>Webgram.DrawingElements.RectangularElement.SIDE_*</tt> values)
     */
    setHeight: Webgram.DrawingElements.RectangularElement.prototype.setHeight,

    _setHeight: function (height, fixedSide) {
        var oldWidth = this.getWidth();
        var oldHeight = this.getHeight();
        
        height = Math.max(this.getMinSize().height, height);
        height = Math.min(this.getMaxSize().height, height);
        
        var width = oldWidth;
        if (this._aspectRatio) {
            width = height * this._aspectRatio;
        }
        
        var widthScale = width / oldWidth;
        var heightScale = height / oldHeight;
        
        /* effectively change the size */
        this.beginShapeChange();
        this._scaleChildren(widthScale, heightScale);
        this.onShapeChange.trigger();
        
        /* recompute the width, it might have been changed */
        height = this.getHeight();
        
        /* move, so that the given side remains fixed */
        var offsetY = 0;
        switch (fixedSide) {
            case Webgram.DrawingElements.RectangularElement.SIDE_TOP:
                offsetY = (height - oldHeight) / 2;
                break;

            case Webgram.DrawingElements.RectangularElement.SIDE_BOTTOM:
                offsetY = (oldHeight - height) / 2;
                break;
        }
        
        var size = new Webgram.Geometry.Size(0, offsetY);
        size = this.scaleDirect(size).getRotated(this.getRotationAngle());
        
        var newLocation = this.getLocation().getTranslated(size.width, size.height);
        this._setLocation(newLocation, false, true);
        
        this.invalidate(true);
        this.updateDependentElements();
    },
    
    getMinSize: function () {
        var width = this.getWidth();
        var height = this.getHeight();
        
        var minScale = this._scaleChildren(Number.MIN_VALUE, Number.MIN_VALUE, true);
        var minWidth = Math.max(minScale.maxWidthScale * width, 1);
        var minHeight = Math.max(minScale.maxHeightScale * height, 1);
        
        return new Webgram.Geometry.Size(minWidth, minHeight);
    },
    
    getMaxSize: function () {
        var width = this.getWidth();
        var height = this.getHeight();
        
        var maxScale = this._scaleChildren(10e100, 10e100, true);
        var maxWidth = maxScale.minWidthScale * width;
        var maxHeight = maxScale.minHeightScale * height;
        
        return new Webgram.Geometry.Size(maxWidth, maxHeight);
    },
    
    _scaleChildren: function (widthScale, heightScale, test) {
        /* scales all the children by calling fit();
         * if test is set to true, then no actual scaling is performed,
         * but the min/max scaling factors are returned */
        
        var minWidthScale = Infinity;
        var minHeightScale = Infinity;
        var maxWidthScale = -Infinity;
        var maxHeightScale = -Infinity;
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            var drawingElement = this._drawingElements[i];
            var childRect = drawingElement.transformDirect(
                    drawingElement.getBoundingRectangle().getPoly()).getBoundingRectangle();
            
            var scaledChildRect = childRect.getScaled(widthScale, heightScale);
            var newChildRect = drawingElement.fit(scaledChildRect, test);
            
            if (test) {
                newChildRect = drawingElement.transformDirect(newChildRect.getPoly()).getBoundingRectangle();
                var ws = newChildRect.getWidth() / childRect.getWidth();
                var hs = newChildRect.getHeight() / childRect.getHeight();
                
                if (ws < minWidthScale) {
                    minWidthScale = ws;
                }
                if (ws > maxWidthScale) {
                    maxWidthScale = ws;
                }
                if (hs < minHeightScale) {
                    minHeightScale = hs;
                }
                if (hs > maxHeightScale) {
                    maxHeightScale = hs;
                }
            }
        }
        
        return {
            minWidthScale: minWidthScale,
            minHeightScale: minHeightScale,
            maxWidthScale: maxWidthScale,
            maxHeightScale: maxHeightScale
        };
    },

    /**
     * Returns the top-left corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the top-left corner
     */
    getTopLeft: Webgram.DrawingElements.RectangularElement.prototype.getTopLeft,
    
    /**
     * Sets the top-left corner of the group element.
     * @param {Webgram.Geometry.Point} topLeft the top-left corner to set
     */
    setTopLeft: Webgram.DrawingElements.RectangularElement.prototype.setTopLeft,
    
    _setTopLeft: Webgram.DrawingElements.RectangularElement.prototype._setTopLeft,
    
    /**
     * Returns the top-left corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the top-left corner
     */
    getTopRight: Webgram.DrawingElements.RectangularElement.prototype.getTopRight,
    
    /**
     * Sets the top-left corner of the group element.
     * @param {Webgram.Geometry.Point} topRight the top-left corner to set
     */
    setTopRight: Webgram.DrawingElements.RectangularElement.prototype.setTopRight,
    
    _setTopRight: Webgram.DrawingElements.RectangularElement.prototype._setTopRight,
    
    /**
     * Returns the top-left corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the top-left corner
     */
    getBottomRight: Webgram.DrawingElements.RectangularElement.prototype.getBottomRight,
    
    /**
     * Sets the top-left corner of the group element.
     * @param {Webgram.Geometry.Point} bottomRight the top-left corner to set
     */
    setBottomRight: Webgram.DrawingElements.RectangularElement.prototype.setBottomRight,
    
    _setBottomRight: Webgram.DrawingElements.RectangularElement.prototype._setBottomRight,
    
    /**
     * Returns the top-left corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the top-left corner
     */
    getBottomLeft: Webgram.DrawingElements.RectangularElement.prototype.getBottomLeft,
    
    /**
     * Sets the top-left corner of the group element.
     * @param {Webgram.Geometry.Point} bottomLeft the top-left corner to set
     */
    setBottomLeft: Webgram.DrawingElements.RectangularElement.prototype.setBottomLeft,
    
    _setBottomLeft: Webgram.DrawingElements.RectangularElement.prototype._setBottomLeft,
    
    /**
     * Returns the top side of this group element.
     * @returns {Number} the top side
     */
    getTop: Webgram.DrawingElements.RectangularElement.prototype.getTop,
    
    /**
     * Sets the top side of this group element.
     * @param {Number} top the top side to set
     */
    setTop: Webgram.DrawingElements.RectangularElement.prototype.setTop,
    
    _setTop: Webgram.DrawingElements.RectangularElement.prototype._setTop,
    
    /**
     * Returns the right side of this group element.
     * @returns {Number} the right side
     */
    getRight: Webgram.DrawingElements.RectangularElement.prototype.getRight,
    
    /**
     * Sets the right side of this group element.
     * @param {Number} right the right side to set
     */
    setRight: Webgram.DrawingElements.RectangularElement.prototype.setRight,
    
    _setRight: Webgram.DrawingElements.RectangularElement.prototype._setRight,
    
    /**
     * Returns the bottom side of this group element.
     * @returns {Number} the bottom side
     */
    getBottom: Webgram.DrawingElements.RectangularElement.prototype.getBottom,
    
    /**
     * Sets the bottom side of this group element.
     * @param {Number} bottom the bottom side to set
     */
    setBottom: Webgram.DrawingElements.RectangularElement.prototype.setBottom,
    
    _setBottom: Webgram.DrawingElements.RectangularElement.prototype._setBottom,
    
    /**
     * Returns the left side of this group element.
     * @returns {Number} the left side
     */
    getLeft: Webgram.DrawingElements.RectangularElement.prototype.getLeft,
    
    /**
     * Sets the left side of this group element.
     * @param {Number} left the left side to set
     */
    setLeft: Webgram.DrawingElements.RectangularElement.prototype.setLeft,
    
    _setLeft: Webgram.DrawingElements.RectangularElement.prototype._setLeft,
    
    // TODO fit: 
    
    _recenter: function () {
        /* moves the element so that the location
         * becomes the center of the group's rectangle */
        
        var boundingRectangle = this.getBoundingRectangle();
        var oldCenter = boundingRectangle.getCenter();
        this._setLocation(this.getLocation().getTranslated(oldCenter.x, oldCenter.y));
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            var drawingElement = this._drawingElements[i];
            drawingElement._setLocation(drawingElement.getLocation().getTranslated(-oldCenter.x, -oldCenter.y));
        }
        
        this.invalidate();
    },
    
    /**
     * Tells if the aspect ratio is preserved for this element.
     * @returns {Boolean} <tt>true</tt> if the aspect ratio is preserved,
     * <tt>false</tt> otherwise.
     */
    isPreserveAspectRatioEnabled: Webgram.DrawingElements.RectangularElement.prototype.isPreserveAspectRatioEnabled,
    
    /**
     * Enables or disables the preserving of the aspect ratio.
     * @param {Boolean} enabled set to <tt>true</tt> to enable the preserving
     * of the aspect ratio, <tt>false</tt> to disable it
     */
    setPreserveAspectRatioEnabled: Webgram.DrawingElements.RectangularElement.prototype.setPreserveAspectRatioEnabled,

    /**
     * Tells if the interactive editing is enabled for this element.
     * @returns {Boolean} <tt>true</tt> if the interactive editing is enabled,
     * <tt>false</tt> otherwise
     */
    isEditEnabled: Webgram.DrawingElements.RectangularElement.prototype.isEditEnabled,
    
    /**
     * Enables or disables the interactive editing for this element.
     * @param {Boolean} enabled <tt>true</tt> to enable the editing,
     * <tt>false</tt>otherwise
     */
    setEditEnabled: Webgram.DrawingElements.RectangularElement.prototype.setEditEnabled,

    getSnappingPoints: function () {
        return [];
    },
    
    _addDrawingElement: function (drawingElement, where, triggerEvents) {
        Webgram.DrawingElements.GroupElement.parent._addDrawingElement.call(this, drawingElement, where, triggerEvents);
        
        this._recenter();
    },

    _remDrawingElement: function (drawingElement, triggerEvents) {
        Webgram.DrawingElements.GroupElement.parent._remDrawingElement.call(this, drawingElement, triggerEvents);
        
        this._recenter();
    }
});
