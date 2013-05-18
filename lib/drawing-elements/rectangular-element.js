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


/**
 * Contains some common drawing element classes.
 * @namespace
 */
Webgram.DrawingElements = {
};


Webgram.DrawingElements.RectangularElement = Webgram.DrawingElement.extend( /** @lends Webgram.DrawingElements.RectangularElement */ {
    /**
     * A base drawing element class for rectangular drawing elements.
     * @constructs Webgram.DrawingElements.RectangularElement
     * @extends Webgram.DrawingElement
     * @param {String} id a given identifier, can be <tt>null</tt>
     * @param {Number} width the width of the rectangular element
     * @param {Number} height the height of the rectangular element
     */
    initialize: function RectangularElement(id, width, height) {
        if (width === undefined) {
            width = 1;
        }
        if (height === undefined) {
            height = 1;
        }
        
        this.callSuper(id);
        
        /**
         * Represents the minimal size that this rectangular element can have.
         * @type {Webgram.Geometry.Size}
         */
        this.minSize = new Webgram.Geometry.Size(0, 0);
        
        /**
         * Represents the maximal size that this rectangular element can have.
         * @type {Webgram.Geometry.Size}
         */
        this.maxSize = new Webgram.Geometry.Size(Infinity, Infinity);
        
        this._width = width;
        this._height = height;
        
        this._editControlPoints = null;
    },
    
    
    /* drawing methods */

    draw: function () {
    },
    
    
    /* shape */
    
    pointInside: function (point) {
        return this.getBoundingRectangle().pointInside(point);
    },
    
    getBoundingRectangle: function () {
        return new Webgram.Geometry.Rectangle(
                -this._width / 2, -this._height / 2,
                this._width / 2, this._height / 2);
    },

    /**
     * Returns the width of this rectangular element.
     * @returns {Number}
     */
    getWidth: function () {
        return this._width;
    },

    /**
     * Sets the width of this rectangular element.
     * @param {Number} width the width to set
     * @param {Number} fixedSide the side that remains fixed when
     * changing the width, or <tt>null</tt> to resize from the center
     * (use one of the <tt>Webgram.DrawingElements.RectangularElement.SIDE_*</tt> values)
     */
    setWidth: function (width, fixedSide) {
        this._setWidth(width, fixedSide);
        this.finishShapeEvents();
    },

    _setWidth: function (width, fixedSide) {
        width = Math.max(this.minSize.width, width);
        width = Math.min(this.maxSize.width, width);
        
        var height = this._height;
        if (this._aspectRatio) {
            height = width / this._aspectRatio;
        }
        
        var offsetX = 0;
        
        switch (fixedSide) {
            case Webgram.DrawingElements.RectangularElement.SIDE_LEFT:
                offsetX = (width - this._width) / 2;
                break;

            case Webgram.DrawingElements.RectangularElement.SIDE_RIGHT:
                offsetX = (this._width - width) / 2;
                break;
        }
        
        this.beginShapeChange();
        
        /* effectively change the size */
        this._width = width;
        this._height = height;
        
        this.onShapeChange.trigger();
        
        /* move, so that the given side remains fixed */
        var size = new Webgram.Geometry.Size(offsetX, 0);
        size = this.scaleDirect(size).getRotated(this.getRotationAngle());
        
        var newLocation = this.getLocation().getTranslated(size.width, size.height);
        this._setLocation(newLocation, false, true);
        
        this.invalidate(true);
        this.updateDependentElements();
    },

    /**
     * Returns the height of this rectangular element.
     * @returns {Number}
     */
    getHeight: function () {
        return this._height;
    },

    /**
     * Sets the height of this rectangular element.
     * @param {Number} height the height to set
     * @param {Number} fixedSide the side that remains fixed when
     * changing the height, or <tt>null</tt> to resize from the center
     * (use one of the <tt>Webgram.DrawingElements.RectangularElement.SIDE_*</tt> values)
     */
    setHeight: function (height, fixedSide) {
        this._setHeight(height, fixedSide);
        this.finishShapeEvents();
    },

    _setHeight: function (height, fixedSide) {
        height = Math.max(this.minSize.height, height);
        height = Math.min(this.maxSize.height, height);
        
        var width = this._width;
        if (this._aspectRatio) {
            width = height * this._aspectRatio;
        }
        
        var offsetY = 0;
        
        switch (fixedSide) {
            case Webgram.DrawingElements.RectangularElement.SIDE_TOP:
                offsetY = (height - this._height) / 2;
                break;

            case Webgram.DrawingElements.RectangularElement.SIDE_BOTTOM:
                offsetY = (this._height - height) / 2;
                break;
        }
        
        this.beginShapeChange();
        
        /* effectively change the size */
        this._width = width;
        this._height = height;
        
        this.onShapeChange.trigger();

        /* move, so that the given side remains fixed */ 
        var size = new Webgram.Geometry.Size(0, offsetY);
        size = this.scaleDirect(size).getRotated(this.getRotationAngle());
        
        var newLocation = this.getLocation().getTranslated(size.width, size.height);
        this._setLocation(newLocation, false, true);
        
        this.invalidate(true);
        this.updateDependentElements();
    },
    
    /**
     * Returns the top-left corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the top-left corner
     */
    getTopLeft: function () {
        return new Webgram.Geometry.Point(-this._width / 2, -this._height / 2);
    },
    
    /**
     * Sets the top-left corner of the rectangular element.
     * @param {Webgram.Geometry.Point} topLeft the top-left corner to set
     */
    setTopLeft: function (topLeft) {
        this._setTopLeft(topLeft, false);
        this.finishShapeEvents();
    },
    
    _setTopLeft: function (topLeft, snap) {
        if (snap) {
            var snappedExternally = this.isSnapExternallyEnabled() && this.snapExternally(topLeft);
            var snappedToGrid = this.isSnapToGridEnabled() && this.snapToGrid(topLeft) || topLeft;
            if (snappedExternally) {
                if (snappedExternally instanceof Webgram.Geometry.Point) {
                    
                }
                else /* if (snapped instanceof Wrbgram.Geometry.Line) */ {
                    
                }
            }
            else {
                topLeft = snappedToGrid;
            }
        }
        
        var bottomRight = this.getBottomRight();
        var width = bottomRight.x - topLeft.x + 1;
        var height = bottomRight.y - topLeft.y + 1;
        
        if (this._aspectRatio != null) {
            if (width > height) {
                height = width / this._aspectRatio;
            }
            else {
                width = height * this._aspectRatio;
            }
        }
        
        this._setWidth(width, Webgram.DrawingElements.RectangularElement.SIDE_RIGHT);
        this._setHeight(height, Webgram.DrawingElements.RectangularElement.SIDE_BOTTOM);
    },
    
    /**
     * Returns the top-right corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the top-right corner
     */
    getTopRight: function () {
        return new Webgram.Geometry.Point(this._width / 2, -this._height / 2);
    },
    
    /**
     * Sets the top-right corner of the rectangular element.
     * @param {Webgram.Geometry.Point} topRight the top-right corner to set
     */
    setTopRight: function (topRight) {
        this._setTopRight(topRight, false);
        this.finishShapeEvents();
    },
    
    _setTopRight: function (topRight, snap) {
        var bottomLeft = this.getBottomLeft();
        var width = topRight.x - bottomLeft.x + 1;
        var height = bottomLeft.y - topRight.y + 1;
        
        if (this._aspectRatio != null) {
            if (width > height) {
                height = width / this._aspectRatio;
            }
            else {
                width = height * this._aspectRatio;
            }
        }
        
        this._setWidth(width, Webgram.DrawingElements.RectangularElement.SIDE_LEFT);
        this._setHeight(height, Webgram.DrawingElements.RectangularElement.SIDE_BOTTOM);
    },
    
    /**
     * Returns the bottom-right corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the bottom-right corner
     */
    getBottomRight: function () {
        return new Webgram.Geometry.Point(this._width / 2, this._height / 2);
    },
    
    /**
     * Sets the bottom-right corner of the rectangular element.
     * @param {Webgram.Geometry.Point} bottomRight the bottom-right corner to set
     */
    setBottomRight: function (bottomRight) {
        this._setBottomRight(bottomRight, false);
        this.finishShapeEvents();
    },
    
    _setBottomRight: function (bottomRight, snap) {
        var topLeft = this.getTopLeft();
        var width = bottomRight.x - topLeft.x + 1;
        var height = bottomRight.y - topLeft.y + 1;
        
        if (this._aspectRatio != null) {
            if (width > height) {
                height = width / this._aspectRatio;
            }
            else {
                width = height * this._aspectRatio;
            }
        }
        
        this._setWidth(width, Webgram.DrawingElements.RectangularElement.SIDE_LEFT);
        this._setHeight(height, Webgram.DrawingElements.RectangularElement.SIDE_TOP);
    },
    
    /**
     * Returns the bottom-left corner of the rectangular element.
     * @returns {Webgram.Geometry.Point} the bottom-left corner
     */
    getBottomLeft: function () {
        return new Webgram.Geometry.Point(-this._width / 2, this._height / 2);
    },
    
    /**
     * Sets the bottom-left corner of the rectangular element.
     * @param {Webgram.Geometry.Point} bottomLeft the bottom-left corner to set
     */
    setBottomLeft: function (bottomLeft) {
        this._setBottomLeft(bottomLeft, false);
        this.finishShapeEvents();
    },
    
    _setBottomLeft: function (bottomLeft, snap) {
        var topRight = this.getTopRight();
        var width = topRight.x - bottomLeft.x + 1;
        var height = bottomLeft.y - topRight.y + 1;
        
        if (this._aspectRatio != null) {
            if (width > height) {
                height = width / this._aspectRatio;
            }
            else {
                width = height * this._aspectRatio;
            }
        }
        
        this._setWidth(width, Webgram.DrawingElements.RectangularElement.SIDE_RIGHT);
        this._setHeight(height, Webgram.DrawingElements.RectangularElement.SIDE_TOP);
    },
    
    /**
     * Returns the top side of this rectangular element.
     * @returns {Number} the top side
     */
    getTop: function () {
        return -this._height / 2;
    },
    
    /**
     * Sets the top side of this rectangular element.
     * @param {Number} top the top side to set
     */
    setTop: function (top) {
        this._setTop(top, false);
        this.finishShapeEvents();
    },
    
    _setTop: function (top, snap) {
        var bottom = this.getBottom();
        var height = bottom - top + 1;
        
        this._setHeight(height, Webgram.DrawingElements.RectangularElement.SIDE_BOTTOM);
    },
    
    /**
     * Returns the right side of this rectangular element.
     * @returns {Number} the right side
     */
    getRight: function () {
        return this._width / 2;
    },
    
    /**
     * Sets the right side of this rectangular element.
     * @param {Number} right the right side to set
     */
    setRight: function (right) {
        this._setRight(right, false);
        this.finishShapeEvents();
    },
    
    _setRight: function (right, snap) {
        var left = this.getLeft();
        var width = right - left + 1;
        
        this._setWidth(width, Webgram.DrawingElements.RectangularElement.SIDE_LEFT);
    },
    
    /**
     * Returns the bottom side of this rectangular element.
     * @returns {Number} the bottom side
     */
    getBottom: function () {
        return this._height / 2;
    },
    
    /**
     * Sets the bottom side of this rectangular element.
     * @param {Number} bottom the bottom side to set
     */
    setBottom: function (bottom) {
        this._setBottom(bottom, false);
        this.finishShapeEvents();
    },
    
    _setBottom: function (bottom, snap) {
        var top = this.getTop();
        var height = bottom - top + 1;
        
        this._setHeight(height, Webgram.DrawingElements.RectangularElement.SIDE_TOP);
    },
    
    /**
     * Returns the left side of this rectangular element.
     * @returns {Number} the left side
     */
    getLeft: function () {
        return -this._width / 2;
    },
    
    /**
     * Sets the left side of this rectangular element.
     * @param {Number} left the left side to set
     */
    setLeft: function (left) {
        this._setLeft(left, false);
        this.finishShapeEvents();
    },
    
    _setLeft: function (left, snap) {
        var right = this.getRight();
        var width = right - left + 1;
        
        this._setWidth(width, Webgram.DrawingElements.RectangularElement.SIDE_RIGHT);
    },
    
    shapeToJson: function () {
        return {
            width: this._width,
            height: this._height
        };
    },
    
    shapeFromJson: function (json) {
        if (json.width) {
            this._width = json.width;
        }
        if (json.height) {
            this._height = json.height;
        }
    },
    
    /**
     * Tells if the aspect ratio is preserved for this element.
     * @returns {Boolean} <tt>true</tt> if the aspect ratio is preserved,
     * <tt>false</tt> otherwise.
     */
    isPreserveAspectRatioEnabled: function () {
        return this._aspectRatio != null;
    },
    
    /**
     * Enables or disables the preserving of the aspect ratio.
     * @param {Boolean} enabled set to <tt>true</tt> to enable the preserving
     * of the aspect ratio, <tt>false</tt> to disable it
     */
    setPreserveAspectRatioEnabled: function (enabled) {
        if (enabled) {
            this._aspectRatio = this.getWidth() / this.getHeight();
        }
        else {
            this._aspectRatio = null;
        }
    },

    /**
     * Tells if the interactive editing is enabled for this element.
     * @returns {Boolean} <tt>true</tt> if the interactive editing is enabled,
     * <tt>false</tt> otherwise
     */
    isEditEnabled: function () {
        return this._editControlPoints != null;
    },
    
    /**
     * Enables or disables the interactive editing for this element.
     * @param {Boolean} enabled <tt>true</tt> to enable the editing,
     * <tt>false</tt>otherwise
     */
    setEditEnabled: function (enabled) {
        if (enabled && this._ediControlPoints == null) {
            /* enable */
            
            this._editControlPoints = {
                topLeft: new Webgram.DrawingElements.RectangularElement.ResizeTopLeftControlPoint(),
                topRight: new Webgram.DrawingElements.RectangularElement.ResizeTopRightControlPoint(),
                bottomRight: new Webgram.DrawingElements.RectangularElement.ResizeBottomRightControlPoint(),
                bottomLeft: new Webgram.DrawingElements.RectangularElement.ResizeBottomLeftControlPoint(),
                
                top: new Webgram.DrawingElements.RectangularElement.ResizeTopControlPoint(),
                right: new Webgram.DrawingElements.RectangularElement.ResizeRightControlPoint(),
                bottom: new Webgram.DrawingElements.RectangularElement.ResizeBottomControlPoint(),
                left: new Webgram.DrawingElements.RectangularElement.ResizeLeftControlPoint()
            };
            
            this.addControlPoint(this._editControlPoints.topLeft);
            this.addControlPoint(this._editControlPoints.topRight);
            this.addControlPoint(this._editControlPoints.bottomRight);
            this.addControlPoint(this._editControlPoints.bottomLeft);
            
            this.addControlPoint(this._editControlPoints.top);
            this.addControlPoint(this._editControlPoints.right);
            this.addControlPoint(this._editControlPoints.bottom);
            this.addControlPoint(this._editControlPoints.left);
        }
        else if (!enabled && this._editControlPoints != null) {
            /* disable */
            
            this.remControlPoint(this._editControlPoints.topLeft);
            this.remControlPoint(this._editControlPoints.topRight);
            this.remControlPoint(this._editControlPoints.bottomRight);
            this.remControlPoint(this._editControlPoints.bottomLeft);
            
            this.remControlPoint(this._editControlPoints.top);
            this.remControlPoint(this._editControlPoints.right);
            this.remControlPoint(this._editControlPoints.bottom);
            this.remControlPoint(this._editControlPoints.left);
            
            this._editControlPoints = null; 
        }
    },

    
    /* snapping */
    
    getSnappingPoints: function () {
        return [
            Webgram.Geometry.Point.zero(),
            this.getTopLeft(),
            this.getTopRight(),
            this.getBottomRight(),
            this.getBottomLeft()
        ];
    },
    
    
    /* creation */
  
    beginCreate: function (point) {
        this._setLocation(point, true);
      
        return true;
    },
  
    continueCreate: function (point, size, mouseDown, click) {
        point = this.transformInverse(point);
        
        if (mouseDown) {
            if (size.width > 0) {
                if (size.height > 0) {
                    this._setBottomRight(point, true);
                }
                else {
                    this._setTopRight(point, true);
                }
            }
            else {
                if (size.height > 0) {
                    this._setBottomLeft(point, true);
                }
                else {
                    this._setTopLeft(point, true);
                }
            }
          
            return true; /* continue */
        }
        else {
            return false; /* finish */
        }
    },
    
    endCreate: function () {
        return (this._width > 0 && this._height > 0);
    }
},

/** @lends Webgram.DrawingElements.RectangularElement */ {
    /** Represents the top side of the rectangular element. */
    SIDE_TOP: 0,
    
    /** Represents the right side of the rectangular element. */
    SIDE_RIGHT: 1,
    
    /** Represents the bottom side of the rectangular element. */
    SIDE_BOTTOM: 2,
    
    /** Represents the left side of the rectangular element. */
    SIDE_LEFT: 3,
    
    /** Represents the top-left corner of the rectangular element. */
    CORNER_TOP_LEFT: 4,
    
    /** Represents the top-right corner of the rectangular element. */
    CORNER_TOP_RIGHT: 5,
    
    /** Represents the bottom-right corner of the rectangular element. */
    CORNER_BOTTOM_RIGHT: 6,
    
    /** Represents the bottom-left corner of the rectangular element. */
    CORNER_BOTTOM_LEFT: 7
});


Webgram.DrawingElements.RectangularElement.ResizeControlPoint = 
        Webgram.ControlPoint.extend( /** @lends Webgram.DrawingElements.RectangularElement.ResizeControlPoint.prototype */ {
    
    /**
     * A base class for the resize control points used by rectangular elements.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     * @extends Webgram.ControlPoint
     * @see Webgram.DrawingElements.RectangularElement
     */
    initialize: function ResizeControlPoint() {
        this.callSuper();
        
        this.imageName = null;
        this.cursorAngle = 0;
    },

    draw: function () {
        var image = this.getImageStore().get(this.imageName);
        
        if (!image) {
            return;
        }
    
        this.drawImage(image);
    },
    
    getCursor: function () {
        var angle = this.drawingElement.getRotationAngle();
        angle = angle + this.drawingElement.getFlippedAngle(this.cursorAngle);
        
        return Webgram.Utils.getCursorByAngle(angle);
    },
    
    getOffsets: function () {
        var decorationOffset = this.drawingElement.getDecorationOffset();
        
        return {
            x: this.offsetX * decorationOffset,
            y: this.offsetY * decorationOffset
        };
    }
});


Webgram.DrawingElements.RectangularElement.ResizeTopLeftControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeTopLeftControlPoint.prototype */ {
            
    /**
     * A control point used to resize rectangular elements by moving the top-left corner.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeTopLeftControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeTopLeftControlPoint() {
        this.callSuper();
        
        this.offsetX = -1;
        this.offsetY = -1;
        this.imageName = 'resize-top-left';
        this.cursorAngle = - 3 * Math.PI / 4;
    },

    computeAnchor: function () {
        return this.drawingElement.getTopLeft();
    },
    
    processMove: function (point) {
        this.drawingElement._setTopLeft(point, true);
    }
});


Webgram.DrawingElements.RectangularElement.ResizeTopRightControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeTopRightControlPoint.prototype */ {
            
    /**
     * A control point used to resize rectangular elements by moving the top-right corner.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeTopRightControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeTopRightControlPoint() {
        this.callSuper();
        
        this.offsetX = 1;
        this.offsetY = -1;
        this.imageName = 'resize-top-right';
        this.cursorAngle = -Math.PI / 4;
    },

    computeAnchor: function () {
        return this.drawingElement.getTopRight();
    },
    
    processMove: function (point) {
        this.drawingElement._setTopRight(point, true);
    }
});


Webgram.DrawingElements.RectangularElement.ResizeBottomLeftControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeBottomLeftControlPoint.prototype */ {
                    
    /**
     * A control point used to resize rectangular elements by moving the bottom-left corner.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeBottomLeftControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeBottomLeftControlPoint() {
        this.callSuper();
        
        this.offsetX = -1;
        this.offsetY = 1;
        this.imageName = 'resize-bottom-left';
        this.cursorAngle = 3 * Math.PI / 4;
    },

    computeAnchor: function () {
        return this.drawingElement.getBottomLeft();
    },
    
    processMove: function (point) {
        this.drawingElement._setBottomLeft(point, true);
    }
});


Webgram.DrawingElements.RectangularElement.ResizeBottomRightControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeBottomRightControlPoint.prototype */ {
    
    /**
     * A control point used to resize rectangular elements by moving the bottom-right corner.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeBottomRightControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeBottomRightControlPoint() {
        this.callSuper();
        
        this.offsetX = 1;
        this.offsetY = 1;
        this.imageName = 'resize-bottom-right';
        this.cursorAngle = Math.PI / 4;
    },

    computeAnchor: function () {
        return this.drawingElement.getBottomRight();
    },
    
    processMove: function (point) {
        this.drawingElement._setBottomRight(point, true);
    }
});


Webgram.DrawingElements.RectangularElement.ResizeTopControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeTopControlPoint.prototype */ {
                    
    /**
     * A control point used to resize rectangular elements by moving the top point.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeTopControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeTopControlPoint() {
        this.callSuper();
        
        this.offsetX = 0;
        this.offsetY = -1;
        this.imageName = 'resize-top';
        this.cursorAngle = -Math.PI / 2;
    },

    computeAnchor: function () {
        return new Webgram.Geometry.Point(0, this.drawingElement.getTop());
    },
    
    processMove: function (point) {
        this.drawingElement._setTop(point.y, true);
    }
});


Webgram.DrawingElements.RectangularElement.ResizeBottomControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeBottomControlPoint.prototype */ {
                    
    /**
     * A control point used to resize rectangular elements by moving the bottom point.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeBottomControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeBottomControlPoint() {
        this.callSuper();

        this.offsetX = 0;
        this.offsetY = 1;
        this.imageName = 'resize-bottom';
        this.cursorAngle = Math.PI / 2;
    },

    computeAnchor: function () {
        return new Webgram.Geometry.Point(0, this.drawingElement.getBottom());
    },
    
    processMove: function (point) {
        this.drawingElement._setBottom(point.y, true);
    }
});


Webgram.DrawingElements.RectangularElement.ResizeLeftControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeLeftControlPoint.prototype */ {
    
    /**
     * A control point used to resize rectangular elements by moving the left point.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeLeftControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeLeftControlPoint() {
        this.callSuper();

        this.offsetX = -1;
        this.offsetY = 0;
        this.imageName = 'resize-left';
        this.cursorAngle = Math.PI;
    },

    computeAnchor: function () {
        return new Webgram.Geometry.Point(this.drawingElement.getLeft(), 0);
    },
    
    processMove: function (point) {
        this.drawingElement._setLeft(point.x, true);
    }
});


Webgram.DrawingElements.RectangularElement.ResizeRightControlPoint = 
        Webgram.DrawingElements.RectangularElement.ResizeControlPoint.extend(
                /** @lends Webgram.DrawingElements.RectangularElement.ResizeRightControlPoint.prototype */ {
                    
    /**
     * A control point used to resize rectangular elements by moving the right point.
     * @constructs Webgram.DrawingElements.RectangularElement.ResizeRightControlPoint
     * @extends Webgram.DrawingElements.RectangularElement.ResizeControlPoint
     */
    initialize: function ResizeRightControlPoint() {
        this.callSuper();

        this.offsetX = 1;
        this.offsetY = 0;
        this.imageName = 'resize-right';
        this.cursorAngle = 0;
    },

    computeAnchor: function () {
        return new Webgram.Geometry.Point(this.drawingElement.getRight(), 0);
    },
    
    processMove: function (point) {
        this.drawingElement._setRight(point.x, true);
    }
});
