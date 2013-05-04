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


Webgram.DrawingElements.RectangularElement =
        Webgram.DrawingElement.extend( /** @lends Webgram.DrawingElements.RectangularElement.prototype */ {
            
    /**
     * A base drawing element class for all rectangular drawing elements.
     * A rectangular element has two main points: <em>top-left</em> and <em>bottom-right</em>.
     * @constructs Webgram.DrawingElements.RectangularElement
     * @extends Webgram.DrawingElement
     * @param {String} id a given identifier, can be <tt>null</tt> 
     * @param {Number} x the coordinate of the left side
     * @param {Number} y the coordinate of the top side
     * @param {Number} width the width of the rectangular element
     * @param {Number} height the height of the rectangular element
     */
    initialize: function RectangularElement(id, x, y, width, height) {
        this._minSize = new Webgram.Geometry.Size(1, 1); /* the default minimal size */
        this._maxSize = new Webgram.Geometry.Size(Infinity, Infinity); /* the default maximal size */
        
        if (x == null) { /* default attributes */
            x = 0;
            y = 0;
            width = this._minSize.width;
            height = this._minSize.height;
        }
        
        var points = [
            new Webgram.Geometry.Point(x, y),
            new Webgram.Geometry.Point(x + width - 1, y + height - 1)
        ];
        
        this.callSuper(id, points);
        
        this._aspectRatio = null;
        this._keepSquareEnabled = false;
        
        this.setResizeEnabled(true);
        
        /**
         * An event that is triggered when the rectangular element is resized.<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onResize = new Webgram.Event('resize', this); /* () */
        
        this.onResize.bind(function () {
            if (this.rotationCenterControlPoint) { // TODO is this needed?
                this.rotationCenterControlPoint.reset();
            }
        });
    },

    
    /* shape */
    
    getMinShapePoint: function (index) {
        var minSize = this.getMinSize();
        
        switch (index) {
            case Webgram.DrawingElements.RectangularElement.TOP_LEFT:
                return new Webgram.Geometry.Point(-(minSize.width - 1) / 2, -(minSize.height - 1) / 2);

            case Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT:
                return new Webgram.Geometry.Point((minSize.width - 1) / 2, (minSize.height - 1) / 2);
        }
    },
    
    getMaxShapePoint: function (index) {
        var maxSize = this.getMaxSize();
        
        switch (index) {
            case Webgram.DrawingElements.RectangularElement.TOP_LEFT:
                return new Webgram.Geometry.Point(-(maxSize.width - 1) / 2, -(maxSize.height - 1) / 2);

            case Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT:
                return new Webgram.Geometry.Point((maxSize.width - 1) / 2, (maxSize.height - 1) / 2);
        }
    },
    
    getSnappingPoints: function () {
        var points = this._getFourPointsShape(true).points;
        points.push(this.getCenter());

        return points;
    },
    
    /**
     * Sets the top point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the top point to set
     */
    setTop: function (point) {
        this._setTop(point, false);
    },
    
    _setTop: function (point, snap, noFlip) {
        if (!noFlip) {
            if (this.isFlippedVertically()) {
                return this._setBottom(point, snap, true);
            }
        }
        
        var shape = this._getFourPointsShape();
        var rotatedShape = this.rotateDirect(shape);
        var rotationAngle = this.getRotationAngle();
        var oldCenter = this.getShape().getCenter();
        
        var nrBottomLeft = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_LEFT];
        var nrBottomRight = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        var nrBottom = nrBottomLeft.getCenterTo(nrBottomRight);
        var nrTop = point.getRotated(-rotationAngle, oldCenter);
        
        /* snap the real shape point and apply
         * the result to the fake point */
        var nrTopLeft = shape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        nrTopLeft.y = nrTop.y;
        
        /* only snap when angle is multiple of PI/2 */
        var snapDetails = null;
        if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI / 2)) { 
            snapDetails = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.TOP_LEFT, nrTopLeft, [nrBottomRight], rotationAngle, oldCenter);
            nrTopLeft = snapDetails.point;
            
            if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI)) { /* even multiple of PI */
                if (snapDetails.ySnapped && snap) {
                    snapDetails.snapVisualFeedback.x = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
            else { /* odd multiple of PI */
                if (snapDetails.xSnapped && snap) {
                    snapDetails.snapVisualFeedback.y = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
        }
        
        nrTop.y = nrTopLeft.y;
        
        /* apply other constraints */
        var width = nrBottomRight.x - nrBottomLeft.x + 1;
        var constrained = this._applyTopConstraints(nrTop, nrBottom, width);
        nrTop = constrained.nrTop;
        width = constrained.width;
        
        var top = nrTop.getRotated(rotationAngle, oldCenter);
        var bottomLeft = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_LEFT];
        var bottomRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        var bottom = bottomLeft.getCenterTo(bottomRight);
        var newCenter = top.getCenterTo(bottom);
        
        nrTop = top.getRotated(-this.getRotationAngle(), newCenter);
        nrBottom = bottom.getRotated(-this.getRotationAngle(), newCenter);
        
        var x1 = newCenter.x - width / 2 + 0.5;
        var y1 = nrTop.y;
        var x2 = newCenter.x + width / 2 - 0.5;
        var y2 = nrBottom.y;
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT, new Webgram.Geometry.Point(x1, y1));
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, new Webgram.Geometry.Point(x2, y2));
        
        this.onResize.trigger();
    },
    
    /**
     * Sets the right point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the right point to set
     */
    setRight: function (point) {
        this._setRight(point, false);
    },
    
    _setRight: function (point, snap, noFlip) {
        if (!noFlip) {
            if (this.isFlippedHorizontally()) {
                return this._setLeft(point, snap, true);
            }
        }
        
        var shape = this._getFourPointsShape();
        var rotatedShape = this.rotateDirect(shape);
        var rotationAngle = this.getRotationAngle();
        var oldCenter = this.getShape().getCenter();
        
        var nrTopLeft = shape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        var nrBottomLeft = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_LEFT];
        var nrLeft = nrTopLeft.getCenterTo(nrBottomLeft);
        var nrRight = point.getRotated(-rotationAngle, oldCenter);
        
        /* snap the real shape point and apply
         * the result to the fake point */
        var nrBottomRight = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        nrBottomRight.x = nrRight.x;
        
        /* only snap when angle is multiple of PI/2 */
        var snapDetails = null;
        if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI / 2)) { 
            snapDetails = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
            nrBottomRight = snapDetails.point;
        
            if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI)) { /* even multiple of PI */
                if (snapDetails.xSnapped && snap) {
                    snapDetails.snapVisualFeedback.y = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
            else { /* odd multiple of PI */
                if (snapDetails.ySnapped && v) {
                    snapDetails.snapVisualFeedback.x = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
        }
        
        nrRight.x = nrBottomRight.x;
        
        /* apply other constraints */
        var height = nrBottomLeft.y - nrTopLeft.y + 1;
        var constrained = this._applyRightConstraints(nrRight, nrLeft, height);
        nrRight = constrained.nrRight;
        height = constrained.height;
        
        var right = nrRight.getRotated(rotationAngle, oldCenter);
        var topLeft = rotatedShape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        var bottomLeft = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_LEFT];
        var left = topLeft.getCenterTo(bottomLeft);
        var newCenter = left.getCenterTo(right);
        
        nrLeft = left.getRotated(-this.getRotationAngle(), newCenter);
        nrRight = right.getRotated(-this.getRotationAngle(), newCenter);

        var x1 = nrLeft.x;
        var y1 = newCenter.y - height / 2 + 0.5;
        var x2 = nrRight.x;
        var y2 = newCenter.y + height / 2 - 0.5;
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT, new Webgram.Geometry.Point(x1, y1));
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, new Webgram.Geometry.Point(x2, y2));
        
        this.onResize.trigger();
    },
    
    /**
     * Sets the bottom point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the bottom point to set
     */
    setBottom: function (point) {
        this._setBottom(point, false);
    },
    
    _setBottom: function (point, snap, noFlip) {
        if (!noFlip) {
            if (this.isFlippedVertically()) {
                return this._setTop(point, snap, true);
            }
        }
        
        var shape = this._getFourPointsShape();
        var rotatedShape = this.rotateDirect(shape);
        var rotationAngle = this.getRotationAngle();
        var oldCenter = this.getShape().getCenter();
        
        var nrTopLeft = shape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        var nrTopRight = shape.points[Webgram.DrawingElements.RectangularElement.TOP_RIGHT];
        var nrTop = nrTopLeft.getCenterTo(nrTopRight);
        var nrBottom = point.getRotated(-rotationAngle, oldCenter);
        
        /* snap the real shape point and apply
         * the result to the fake point */
        var nrBottomRight = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        nrBottomRight.y = nrBottom.y;
        
        /* only snap when angle is multiple of PI/2 */
        var snapDetails = null;
        if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI / 2)) { 
            snapDetails = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
            nrBottomRight = snapDetails.point;
        
            if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI)) { /* even multiple of PI */
                if (snapDetails.ySnapped && snap) {
                    snapDetails.snapVisualFeedback.x = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
            else { /* odd multiple of PI */
                if (snapDetails.xSnapped && snap) {
                    snapDetails.snapVisualFeedback.y = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
        }
        
        nrBottom.y = nrBottomRight.y;
        
        /* apply other constraints */
        var width = nrTopRight.x - nrTopLeft.x + 1;
        var constrained = this._applyBottomConstraints(nrBottom, nrTop, width);
        nrBottom = constrained.nrBottom;
        width = constrained.width;

        var bottom = nrBottom.getRotated(rotationAngle, oldCenter);
        var topLeft = rotatedShape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        var topRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.TOP_RIGHT];
        var top = topLeft.getCenterTo(topRight);
        var newCenter = top.getCenterTo(bottom);
        
        nrTop = top.getRotated(-this.getRotationAngle(), newCenter);
        nrBottom = bottom.getRotated(-this.getRotationAngle(), newCenter);
        
        var x1 = newCenter.x - width / 2 + 0.5;
        var y1 = nrTop.y;
        var x2 = newCenter.x + width / 2 - 0.5;
        var y2 = nrBottom.y;
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT, new Webgram.Geometry.Point(x1, y1));
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, new Webgram.Geometry.Point(x2, y2));
        
        this.onResize.trigger();
    },
    
    /**
     * Sets the left point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the left point to set
     */
    setLeft: function (point) {
        this._setLeft(point, false);
    },
    
    _setLeft: function (point, snap, noFlip) {
        if (!noFlip) {
            if (this.isFlippedHorizontally()) {
                return this._setRight(point, snap, true);
            }
        }
        
        var shape = this._getFourPointsShape();
        var rotatedShape = this.rotateDirect(shape);
        var rotationAngle = this.getRotationAngle();
        var oldCenter = this.getShape().getCenter();
        
        var nrTopRight = shape.points[Webgram.DrawingElements.RectangularElement.TOP_RIGHT];
        var nrBottomRight = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        var nrRight = nrTopRight.getCenterTo(nrBottomRight);
        var nrLeft = point.getRotated(-rotationAngle, oldCenter);
        
        /* snap the real shape point and apply
         * the result to the fake point */
        var nrTopLeft = shape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        nrTopLeft.x = nrLeft.x;
        
        /* only snap when angle is multiple of PI/2 */
        var snapDetails = null;
        if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI / 2)) { 
            snapDetails = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.TOP_LEFT, nrTopLeft, [nrBottomRight], rotationAngle, oldCenter);
            nrTopLeft = snapDetails.point;

            if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI)) { /* even multiple of PI */
                if (snapDetails.xSnapped && snap) {
                    snapDetails.snapVisualFeedback.y = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
            else { /* odd multiple of PI */
                if (snapDetails.ySnapped && snap) {
                    snapDetails.snapVisualFeedback.x = null;
                    this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
                }
            }
        }
        
        nrLeft.x = nrTopLeft.x;
        
        /* apply other constraints */
        var height = nrBottomRight.y - nrTopRight.y + 1;
        var constrained = this._applyLeftConstraints(nrLeft, nrRight, height);
        nrLeft = constrained.nrLeft;
        height = constrained.height;
        
        var left = nrLeft.getRotated(rotationAngle, oldCenter);
        var topRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.TOP_RIGHT];
        var bottomRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        var right = topRight.getCenterTo(bottomRight);
        var newCenter = left.getCenterTo(right);
        
        nrLeft = left.getRotated(-this.getRotationAngle(), newCenter);
        nrRight = right.getRotated(-this.getRotationAngle(), newCenter);
        
        var x1 = nrLeft.x;
        var y1 = newCenter.y - height / 2 + 0.5;
        var x2 = nrRight.x;
        var y2 = newCenter.y + height / 2 - 0.5;
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT, new Webgram.Geometry.Point(x1, y1));
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, new Webgram.Geometry.Point(x2, y2));
        
        this.onResize.trigger();
    },
    
    /**
     * Sets the top-left point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the top-left point to set
     */
    setTopLeft: function (point) {
        this._setTopLeft(point, false, false);
    },
    
    _setTopLeft: function (point, snap, noFlip) {
        var flipState = [false, false];
        if (noFlip) {
            flipState = [this._flippedHorizontally, this._flippedVertically];
            this._flippedHorizontally = this._flippedVertically = false;
        }
        
        this._setShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT, point, true, snap);
        
        if (noFlip) {
            this._flippedHorizontally = flipState[0];
            this._flippedVertically = flipState[1];
        }
        
        this.onResize.trigger();
    },
    
    /**
     * Sets the bottom-right point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the bottom-right point to set
     */
    setBottomRight: function (point) {
        this._setBottomRight(point, false, false);
    },
    
    _setBottomRight: function (point, snap, noFlip) {
        var flipState = [false, false];
        if (noFlip) {
            flipState = [this._flippedHorizontally, this._flippedVertically];
            this._flippedHorizontally = this._flippedVertically = false;
        }
        
        this._setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, point, true, snap);
        
        if (noFlip) {
            this._flippedHorizontally = flipState[0];
            this._flippedVertically = flipState[1];
        }
        
        this.onResize.trigger();
    },
    
    /**
     * Sets the top-right point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the top-right point to set
     */
    setTopRight: function (point) {
        this._setTopRight(point, false, false);
    },
    
    _setTopRight: function (point, snap, noFlip) {
        if (!noFlip) {
            if (this.isFlippedHorizontally()) {
                if (this.isFlippedVertically()) {
                    return this._setBottomLeft(point, snap, true);
                }
                else {
                    return this._setTopLeft(point, snap, true);
                }
            }
            else {
                if (this.isFlippedVertically()) {
                    return this._setBottomRight(point, snap, true);
                }
            }
        }
        
        var shape = this._getFourPointsShape();
        var rotatedShape = this.rotateDirect(shape);
        var rotationAngle = this.getRotationAngle();
        var oldCenter = this.getShape().getCenter();
        
        var nrBottomLeft = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_LEFT];
        var nrTopRight = point.getRotated(-rotationAngle, oldCenter);
        
        /* snap the two real shape points and apply
         * the result to the fake point */
        var nrTopLeft = shape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        var nrBottomRight = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        nrTopLeft.y = nrTopRight.y;
        nrBottomRight.x = nrTopRight.x;
        /* only snap when angle is multiple of PI/2 */
        var snapDetailsTopLeft = null, snapDetailsBottomRight = null;
        var topSnapped = false, rightSnapped = false;
        if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI / 2)) { 
            snapDetailsTopLeft = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.TOP_LEFT, nrTopLeft, [nrBottomRight], rotationAngle, oldCenter);
            nrTopLeft = snapDetailsTopLeft.point;
            snapDetailsBottomRight = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
            nrBottomRight = snapDetailsBottomRight.point;
            
            if (snap) {
                if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI)) { /* even multiple of PI/2 */
                    topSnapped = snapDetailsTopLeft.ySnapped;
                    rightSnapped = snapDetailsBottomRight.xSnapped;
                    
                    if (topSnapped) {
                        if (rightSnapped) {
                            snapDetailsTopLeft.snapVisualFeedback.x = snapDetailsBottomRight.snapVisualFeedback.x;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                        else {
                            snapDetailsTopLeft.snapVisualFeedback.x = null;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                    }
                    else {
                        if (rightSnapped) {
                            snapDetailsBottomRight.snapVisualFeedback.y = null;
                            this.setSnapVisualFeedback(snapDetailsBottomRight.snapVisualFeedback);
                        }
                        else {
                            /* nothing snapped */
                        }
                    }
                }
                else { /* odd multiple of PI/2 */ 
                    topSnapped = snapDetailsTopLeft.xSnapped;
                    rightSnapped = snapDetailsBottomRight.ySnapped;
                    
                    if (topSnapped) {
                        if (rightSnapped) {
                            snapDetailsTopLeft.snapVisualFeedback.y = snapDetailsBottomRight.snapVisualFeedback.y;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                        else {
                            snapDetailsTopLeft.snapVisualFeedback.y = null;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                    }
                    else {
                        if (rightSnapped) {
                            snapDetailsBottomRight.snapVisualFeedback.x = null;
                            this.setSnapVisualFeedback(snapDetailsBottomRight.snapVisualFeedback);
                        }
                        else {
                            /* nothing snapped */
                        }
                    }
                }
            }
        }
        
        nrTopRight.y = nrTopLeft.y;
        nrTopRight.x = nrBottomRight.x;
        
        /* apply other constraints */
        nrTopRight = this._applyTopRightConstraints(nrTopRight, nrBottomLeft);
        
        var topRight = nrTopRight.getRotated(rotationAngle, oldCenter);
        var bottomLeft = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_LEFT];
        var newCenter = bottomLeft.getCenterTo(topRight);
        
        nrTopRight = topRight.getRotated(-rotationAngle, newCenter);
        nrBottomLeft = bottomLeft.getRotated(-rotationAngle, newCenter);

        nrTopLeft = new Webgram.Geometry.Point(nrBottomLeft.x, nrTopRight.y);
        nrBottomRight = new Webgram.Geometry.Point(nrTopRight.x, nrBottomLeft.y);
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT, nrTopLeft);
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight);
        
        this.onResize.trigger();
    },
    
    /**
     * Sets the bottom-left point of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the bottom-left point to set
     */
    setBottomLeft: function (point) {
        this._setBottomLeft(point, false, false);
    },
    
    _setBottomLeft: function (point, snap, noFlip) {
        if (!noFlip) {
            if (this.isFlippedHorizontally()) {
                if (this.isFlippedVertically()) {
                    return this._setTopRight(point, snap, true);
                }
                else {
                    return this._setBottomRight(point, snap, true);
                }
            }
            else {
                if (this.isFlippedVertically()) {
                    return this._setTopLeft(point, snap, true);
                }
            }
        }
        
        var shape = this._getFourPointsShape();
        var rotatedShape = this.rotateDirect(shape);
        var rotationAngle = this.getRotationAngle();
        var oldCenter = this.getShape().getCenter();
        
        var nrTopRight = shape.points[Webgram.DrawingElements.RectangularElement.TOP_RIGHT];
        var nrBottomLeft = point.getRotated(-rotationAngle, oldCenter);
        
        /* snap the two real shape points and apply
         * the result to the fake point */
        var nrTopLeft = shape.points[Webgram.DrawingElements.RectangularElement.TOP_LEFT];
        var nrBottomRight = shape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        nrTopLeft.x = nrBottomLeft.x;
        nrBottomRight.y = nrBottomLeft.y;
        
        /* only snap when angle is multiple of PI/2 */
        var snapDetailsTopLeft = null, snapDetailsBottomRight = null;
        if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI / 2)) { 
            snapDetailsTopLeft = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.TOP_LEFT, nrTopLeft, [nrBottomRight], rotationAngle, oldCenter);
            nrTopLeft = snapDetailsTopLeft.point;
            snapDetailsBottomRight = this._snapShapePoint(
                    Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
            nrBottomRight = snapDetailsBottomRight.point;
            
            if (snap) {
                if (Webgram.Geometry.angleMultipleOf(rotationAngle, Math.PI)) { /* even multiple of PI/2 */
                    leftSnapped = snapDetailsTopLeft.xSnapped;
                    bottomSnapped = snapDetailsBottomRight.ySnapped;
                    
                    if (leftSnapped) {
                        if (bottomSnapped) {
                            snapDetailsTopLeft.snapVisualFeedback.y = snapDetailsBottomRight.snapVisualFeedback.y;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                        else {
                            snapDetailsTopLeft.snapVisualFeedback.y = null;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                    }
                    else {
                        if (bottomSnapped) {
                            snapDetailsBottomRight.snapVisualFeedback.x = null;
                            this.setSnapVisualFeedback(snapDetailsBottomRight.snapVisualFeedback);
                        }
                        else {
                            /* nothing snapped */
                        }
                    }
                }
                else { /* odd multiple of PI/2 */ 
                    leftSnapped = snapDetailsTopLeft.ySnapped;
                    bottomSnapped = snapDetailsBottomRight.xSnapped;
                    
                    if (leftSnapped) {
                        if (bottomSnapped) {
                            snapDetailsTopLeft.snapVisualFeedback.x = snapDetailsBottomRight.snapVisualFeedback.x;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                        else {
                            snapDetailsTopLeft.snapVisualFeedback.x = null;
                            this.setSnapVisualFeedback(snapDetailsTopLeft.snapVisualFeedback);
                        }
                    }
                    else {
                        if (leftSnapped) {
                            snapDetailsBottomRight.snapVisualFeedback.y = null;
                            this.setSnapVisualFeedback(snapDetailsBottomRight.snapVisualFeedback);
                        }
                        else {
                            /* nothing snapped */
                        }
                    }
                }
            }
        }
        
        nrBottomLeft.x = nrTopLeft.x;
        nrBottomLeft.y = nrBottomRight.y;
        
        /* apply other constraints */
        nrBottomLeft = this._applyBottomLeftConstraints(nrBottomLeft, nrTopRight);
        
        var bottomLeft = nrBottomLeft.getRotated(rotationAngle, oldCenter);
        var topRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.TOP_RIGHT];
        var newCenter = topRight.getCenterTo(bottomLeft);
        
        nrBottomLeft = bottomLeft.getRotated(-rotationAngle, newCenter);
        nrTopRight = topRight.getRotated(-rotationAngle, newCenter);

        nrTopLeft = new Webgram.Geometry.Point(nrBottomLeft.x, nrTopRight.y);
        nrBottomRight = new Webgram.Geometry.Point(nrTopRight.x, nrBottomLeft.y);
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT, nrTopLeft);
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight);
        
        this.onResize.trigger();
    },
    
    _getFourPointsShape: function (transformed) {
        var points = this.getShape().points;
        var poly = new Webgram.Geometry.Poly([
            points[Webgram.DrawingElements.RectangularElement.TOP_LEFT],
            points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT],
            new Webgram.Geometry.Point(
                    points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT].x,
                    points[Webgram.DrawingElements.RectangularElement.TOP_LEFT].y),
            new Webgram.Geometry.Point(
                    points[Webgram.DrawingElements.RectangularElement.TOP_LEFT].x,
                    points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT].y)
        ]);
        
        if (transformed) {
            return this.transformDirect(poly);
        }
        else {
            return poly;
        }
    },

    _applyShapePointConstraints: function (index, point, fixedPoints, rotationAngle, center) {
        point = this.callSuper(index, point, fixedPoints, rotationAngle, center);

        switch (index) {
            case Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT:
                point = this._applyBottomRightConstraints(point, fixedPoints[0]);
                break;
            
            case Webgram.DrawingElements.RectangularElement.TOP_LEFT:
                point = this._applyTopLeftConstraints(point, fixedPoints[0]);
                break;
        }
        
        return point;
    },
    
    _applyTopConstraints: function (nrTop, nrBottom, width) {
        var height = nrBottom.y - nrTop.y + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height), false);
        
        return {
            nrTop: new Webgram.Geometry.Point(nrBottom.x, nrBottom.y - size.height + 1),
            width: size.width
        };
    },
    
    _applyRightConstraints: function (nrRight, nrLeft, height) {
        var width = nrRight.x - nrLeft.x + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height), true);
        
        return {
            nrRight: new Webgram.Geometry.Point(nrLeft.x + size.width - 1, nrLeft.y),
            height: size.height
        };
    },
    
    _applyBottomConstraints: function (nrBottom, nrTop, width) {
        var height = nrBottom.y - nrTop.y + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height), false);
        
        return {
            nrBottom: new Webgram.Geometry.Point(nrTop.x, nrTop.y + size.height - 1),
            width: size.width
        };
    },
    
    _applyLeftConstraints: function (nrLeft, nrRight, height) {
        var width = nrRight.x - nrLeft.x + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height), true);
        
        return {
            nrLeft: new Webgram.Geometry.Point(nrRight.x - size.width + 1, nrRight.y),
            height: size.height
        };
    },
    
    _applyTopLeftConstraints: function (nrTopLeft, nrBottomRight) {
        var width = nrBottomRight.x - nrTopLeft.x + 1;
        var height = nrBottomRight.y - nrTopLeft.y + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height));
        
        return new Webgram.Geometry.Point(nrBottomRight.x - size.width + 1, nrBottomRight.y - size.height + 1);
    },
    
    _applyBottomRightConstraints: function (nrBottomRight, nrTopLeft) {
        var width = nrBottomRight.x - nrTopLeft.x + 1;
        var height = nrBottomRight.y - nrTopLeft.y + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height));
        
        return new Webgram.Geometry.Point(nrTopLeft.x + size.width - 1, nrTopLeft.y + size.height - 1);
    },
    
    _applyTopRightConstraints: function (nrTopRight, nrBottomLeft) {
        var width = nrTopRight.x - nrBottomLeft.x + 1;
        var height = nrBottomLeft.y - nrTopRight.y + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height));
        
        return new Webgram.Geometry.Point(nrBottomLeft.x + size.width - 1, nrBottomLeft.y - size.height + 1);
    },
    
    _applyBottomLeftConstraints: function (nrBottomLeft, nrTopRight) {
        var width = nrTopRight.x - nrBottomLeft.x + 1;
        var height = nrBottomLeft.y - nrTopRight.y + 1;
        var size = this._applySizeConstraints(new Webgram.Geometry.Size(width, height));
        
        return new Webgram.Geometry.Point(nrTopRight.x - size.width + 1, nrTopRight.y + size.height - 1);
    },
    
    /**
     * Applies the size constraints (minimum size, aspect ratio, keep square) to the given size.
     * @param {Webgram.Geometry.Size} size the size to be evaluated and constrained
     * @param {Boolean} keepWidth <tt>true</tt> to adjust the height based on width,
     *  false to adjust the width based on height,
     *  null to choose the best way (minimal size)
     * @returns {Webgram.Geometry.Size} the constrained size
     */
    _applySizeConstraints: function (size, keepWidth) {
        if (keepWidth == null) {
            var sizeKeepWidth = this._applySizeConstraints(size, true);
            var sizeKeepHeight = this._applySizeConstraints(size, false);
            
            /* prefer the variant that yields the minimum size */
            if (sizeKeepHeight.width + sizeKeepHeight.height > sizeKeepWidth.width + sizeKeepWidth.height) {
                return sizeKeepWidth;
            }
            else {
                return sizeKeepHeight;
            }
        }
        
        var minSize = this.getMinSize();
        var maxSize = this.getMaxSize();
        var aspectRatio = this.getAspectRatio();
        var width = size.width;
        var height = size.height;

        if (this.isKeepSquareEnabled()) {
            aspectRatio = 1;
        }
        
        if (aspectRatio != null) {
            if (keepWidth) {
                height = width / aspectRatio;
            }
            else {
                width = height * aspectRatio;
            }
            
            if (width < minSize.width) {
                width = minSize.width;
                height = width / aspectRatio;
            }
            if (height < minSize.height) {
                height = minSize.height;
                width = height * aspectRatio;
            }         
            if (width > maxSize.width) {
                width = maxSize.width;
                height = width / aspectRatio;
            }
            if (height > maxSize.height) {
                height = maxSize.height;
                width = height * aspectRatio;
            }         
        }
        else {
            if (width < minSize.width) {
                width = minSize.width;
            }
            if (height < minSize.height) {
                height = minSize.height;
            }            
            if (width > maxSize.width) {
                width = maxSize.width;
            }
            if (height > maxSize.height) {
                height = maxSize.height;
            }            
        }
        
        return new Webgram.Geometry.Size(width, height);
    },
    
    
    /* bounds and dimensions */
    
    /**
     * Sets the width of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} width the new width
     */
    setWidth: function (width) {
        this._setWidth(width, false);
    },
    
    _setWidth: function (width, snap) {
        // TODO properly implement this
        
        /* limit the width to the minimum size */
        var minSize = this.getMinSize();
        var maxSize = this.getMaxSize();
        width = Math.min(Math.max(width, minSize.width), maxSize.width);

        var oldCenter = this.getCenter();
        var rotationAngle = this.getRotationAngle();
        var nrTopLeft = this.getShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT);
        var nrBottomRight = this.getShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT);
        
        nrBottomRight.x = nrTopLeft.x + width - 1;
        if (this.isKeepSquareEnabled()) {
            nrBottomRight.y = nrTopLeft.y + width - 1;
        }
        else if (this.isKeepAspectRatioEnabled()) {
            nrBottomRight.y = nrTopLeft.y + width / this.getAspectRatio() - 1;
        }
        
        var snapDetails = this._snapShapePoint(1, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
        nrBottomRight = snapDetails.point;
        nrBottomRight = this._applyShapePointConstraints(1, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight);
      
        if (snap) {
            this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
        }
      
        this.onResize.trigger();
    },
    
    /**
     * Sets the height of the rectangular element.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} height the new height
     */
    setHeight: function (height) {
        this._setHeight(height, false);
    },
    
    _setHeight: function (height, snap) {
        // TODO properly implement this
        
        /* limit the height to the minimum size */
        var minSize = this.getMinSize();
        var maxSize = this.getMaxSize();
        height = Math.min(Math.max(height, minSize.height), maxSize.height);

        var oldCenter = this.getCenter();
        var rotationAngle = this.getRotationAngle();
        var nrTopLeft = this.getShapePoint(Webgram.DrawingElements.RectangularElement.TOP_LEFT);
        var nrBottomRight = this.getShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT);
        
        nrBottomRight.y = nrTopLeft.y + height - 1;
        if (this.isKeepSquareEnabled()) {
            nrBottomRight.x = nrTopLeft.x + height - 1;
        }
        else if (this.isKeepAspectRatioEnabled()) {
            nrBottomRight.x = nrTopLeft.x + height * this.getAspectRatio() - 1;
        }
        
        var snapDetails = this._snapShapePoint(1, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
        nrBottomRight = snapDetails.point;
        nrBottomRight = this._applyShapePointConstraints(1, nrBottomRight, [nrTopLeft], rotationAngle, oldCenter);
        
        this.setShapePoint(Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT, nrBottomRight);
        
        if (snap) {
            this.setSnapVisualFeedback(snapDetails.snapVisualFeedback);
        }
      
        this.onResize.trigger();
    },
    
    getBoundingRectangle: function (transformed) {
        var shape = this._getFourPointsShape();
        
        if (transformed) {
            return this.transformDirect(shape).getBoundingRectangle();
        }
        else {
            return shape.getBoundingRectangle();
        }
    },
    
    _computeBaseRectangle: function () {
        /* an optimized version for rectangular elements */
        
        var points = this.getShape().points;
        
        return new Webgram.Geometry.Rectangle(
                points[Webgram.DrawingElements.RectangularElement.TOP_LEFT].x,
                points[Webgram.DrawingElements.RectangularElement.TOP_LEFT].y,
                points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT].x,
                points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT].y);
    },
    

    /* settings */
    
    /**
     * Returns the minimal size that this rectangular element can have.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Webgram.Geometry.Size} the minimal size of this element
     */
    getMinSize: function () {
        return this._minSize.clone();
    },
    
    /**
     * Sets the minimal size that this drawing element can have.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Size} size the new minimal size
     */
    setMinSize: function (size) {
        this._minSize = size;
        
        /* call the setBottomRight method to apply the new size constraint */
        var rotatedShape = this.getShape(true);
        var bottomRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        this._setBottomRight(bottomRight, true);
    },
    
    /**
     * Returns the maximal size that this rectangular element can have.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Webgram.Geometry.Size} the maximal size of this element
     */
    getMaxSize: function () {
        return this._maxSize.clone();
    },
    
    /**
     * Sets the maximal size that this drawing element can have.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Size} size the new maximal size
     */
    setMaxSize: function (size) {
        this._maxSize = size;
        
        /* call the setBottomRight method to apply the new size constraint */
        var rotatedShape = this.getShape(true);
        var bottomRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
        this._setBottomRight(bottomRight, true);
    },
    
    /**
     * Tells whether the aspect ratio is kept for this rectangular element, or not.
     * @returns {Boolean} <tt>true</tt> if the aspect ratio is kept, <tt>false</tt> otherwise
     */
    isKeepAspectRatioEnabled: function () {
        return this._aspectRatio != null;
    },

    /**
     * Returns the current aspect ratio of this drawing element.
     * @returns {Number} the aspect ratio
     */
    getAspectRatio: function () {
        return this._aspectRatio;
    },
    
    /**
     * Enables or disables preserving of the aspect ratio for this rectangular element.
     * Additionally, if <tt>aspectRatio</tt> is given, its value is enforced as the new aspect ratio.
     * @param {Boolean} enabled <tt>true</tt> to enable preserving of the aspect ratio, <tt>false</tt> to disable it
     * @param {Number} aspectRatio a ratio to enforce, or <tt>null</tt>/<tt>undefined</tt> to consider the current ratio
     */
    setKeepAspectRatioEnabled: function (enabled, aspectRatio) {
        if (enabled) {
            if (this._aspectRatio == null || aspectRatio != null) { /* avoid setting the aspect ratio if already set */
                if (aspectRatio != null) {
                    this._aspectRatio = aspectRatio;
                }
                else {
                    this._aspectRatio = this.getWidth() / this.getHeight();
                }
            }
        }
        else {
            this._aspectRatio = null;
        }
    },
    
    /**
     * Tells whether the square form is preserved for this rectangular element or not
     * @returns {Boolean} <tt>true</tt> if the square form is kept, <tt>false</tt> otherwise
     */
    isKeepSquareEnabled: function () {
        return this._keepSquareEnabled;
    },
    
    /**
     * Enables or disables preserving of the square form of this rectangular element.
     * @param {Boolean} enabled <tt>true</tt> to enable preserving of the square form, <tt>false</tt> to disable it
     */
    setKeepSquareEnabled: function (enabled) {
        this._keepSquareEnabled = enabled;
        
        if (enabled) {
            /* call the setBottomRight method to apply the new square constraint */
            var rotatedShape = this.getShape(true);
            var bottomRight = rotatedShape.points[Webgram.DrawingElements.RectangularElement.BOTTOM_RIGHT];
            this._setBottomRight(bottomRight, true);
        }
    },
    
    /**
     * Tells whether resizing is enabled for this element or not.
     * @returns {Boolean} <tt>true</tt> if resizing is enabled, <tt>false</tt> otherwise
     */
    isResizeEnabled: function () {
        return this._resizeEnabled;
    },
    
    /**
     * Enables or disables resizing of this drawing element.
     * When resizing is enabled, eight resize control points placed
     * around the drawing element will allow the user to resize it interactively.
     * @param enabled <tt>true</tt> to enable resizing, <tt>false</tt> to disable it
     */
    setResizeEnabled: function (enabled) {
        if (enabled) {
            if (this._resizeEnabled) {
                return;
            }
            
            this._resizeEnabled = true;
            
            this._enableResizeControlPoints();
        }
        else {
            if (!this._resizeEnabled) {
                return;
            }
            
            this._disableResizeControlPoints();
            
            this._resizeEnabled = false;
        }
    },
    

    /* creation */
    
    beginCreate: function (point) {
        this._setCenter(point, true);
        
        return true;
    },
    
    continueCreate: function (point, size, mouseDown, click) {
        if (mouseDown) {
            if (size.width > 0) {
                if (size.height > 0) {
                    this._setBottomRight(point);
                }
                else {
                    this._setTopRight(point);
                }
            }
            else {
                if (size.height > 0) {
                    this._setBottomLeft(point);
                }
                else {
                    this._setTopLeft(point);
                }
            }
            
            return true; /* continue */
        }
        else {
            return false; /* finish */
        }
    },
    

    /* json */
    
    settingsToJson: function () {
        // TODO these should not be part of the json object
        var json = Webgram.DrawingElement.prototype.settingsToJson();
        var minSize = this.getMinSize();
        var maxSize = this.getMaxSize();
        
        json['minSize'] = {
            'x': minSize.x,
            'y': minSize.y
        };
        json['maxSize'] = {
            'x': maxSize.x,
            'y': maxSize.y
        };
        
        json['keepAspectRatioEnabled'] = this.getAspectRatio() != null;
        json['keepSquareEnabled'] = this.isKeepSquareEnabled();
        json['resizeEnabled'] = this.isResizeEnabled();
        
        return json;
    },
    
    settingsFromJson: function (json) {
        Webgram.DrawingElement.prototype.settingsFromJson(json);
        
        if (json.keepAspectRatioEnabled !== undefined) {
            this.setKeepAspectRatioEnabled(json.keepAspectRatio);
        }
        
        if (json.keepSquareEnabled !== undefined && json.keepSquareEnabled !== this._keepSquareEnabled) {
            this.setKeepSquareEnabled(json.keepSquareEnabled);
        }

        if (json.resizeEnabled !== undefined && json.resizeEnabled !== this._resizeEnabled) {
            this.setResizeEnabled(json.resizeEnabled);
        }
    },
    
    
    /* other methods */
    
    _enableResizeControlPoints: function () {
        if (!this.isResizeEnabled()) {
            return;
        }
        
        if (this.resizeTopLeftControlPoint != null) { /* already enabled */
            return;
        }
        
        this.resizeTopLeftControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeTopLeftControlPoint();
        this.resizeTopControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeTopControlPoint();
        this.resizeTopRightControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeTopRightControlPoint();
        this.resizeRightControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeRightControlPoint();
        this.resizeBottomRightControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeBottomRightControlPoint();
        this.resizeBottomControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeBottomControlPoint();
        this.resizeBottomLeftControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeBottomLeftControlPoint();
        this.resizeLeftControlPoint = new Webgram.DrawingElements.RectangularElement.ResizeLeftControlPoint();
        
        this.addControlPoint(this.resizeTopLeftControlPoint);
        this.addControlPoint(this.resizeTopControlPoint);
        this.addControlPoint(this.resizeTopRightControlPoint);
        this.addControlPoint(this.resizeRightControlPoint);
        this.addControlPoint(this.resizeBottomRightControlPoint);
        this.addControlPoint(this.resizeBottomControlPoint);
        this.addControlPoint(this.resizeBottomLeftControlPoint);
        this.addControlPoint(this.resizeLeftControlPoint);
    },
    
    _disableResizeControlPoints: function () {
        if (this.resizeTopLeftControlPoint == null) { /* already disabled */
            return;
        }
        
        this.remControlPoint(this.resizeTopLeftControlPoint);
        this.remControlPoint(this.resizeTopControlPoint);
        this.remControlPoint(this.resizeTopRightControlPoint);
        this.remControlPoint(this.resizeRightControlPoint);
        this.remControlPoint(this.resizeBottomRightControlPoint);
        this.remControlPoint(this.resizeBottomControlPoint);
        this.remControlPoint(this.resizeBottomLeftControlPoint);
        this.remControlPoint(this.resizeLeftControlPoint);
        
        this.resizeTopLeftControlPoint = null;
        this.resizeTopControlPoint = null;
        this.resizeTopRightControlPoint = null;
        this.resizeRightControlPoint = null;
        this.resizeBottomRightControlPoint = null;
        this.resizeBottomControlPoint = null;
        this.resizeBottomLeftControlPoint = null;
        this.resizeLeftControlPoint = null;
    }    
},

/** @lends Webgram.DrawingElements.RectangularElement */ {
    /** Represents the index of the top-left point in the shape polygon of a rectangular element */
    TOP_LEFT: 0,
    
    /** Represents the index of the bottom-right point in the shape polygon of a rectangular element */
    BOTTOM_RIGHT: 1,
    
    /** Represents the index of the top-right point in the extended shape polygon of a rectangular element */
    TOP_RIGHT: 2,
    
    /** Represents the index of the bottom-left point in the extended shape polygon of a rectangular element */
    BOTTOM_LEFT: 3
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
    
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
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
        return this.drawingElement.getBoundingPoints().topLeft;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
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
        return this.drawingElement.getBoundingPoints().topRight;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
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
        return this.drawingElement.getBoundingPoints().bottomLeft;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
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
        return this.drawingElement.getBoundingPoints().bottomRight;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
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
        return this.drawingElement.getBoundingPoints().top;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
        this.drawingElement._setTop(point, true);
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
        return this.drawingElement.getBoundingPoints().bottom;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
        this.drawingElement._setBottom(point, true);
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
        return this.drawingElement.getBoundingPoints().left;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
        this.drawingElement._setLeft(point, true);
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
        return this.drawingElement.getBoundingPoints().right;
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
        this.drawingElement._setRight(point, true);
    }
});


// TODO functionality to be moved to RectangularElement:
// this._gradientEditEnabled = false;
//drawGuides: function () {
//    if (this.isGradientEditEnabled()) {
//        this.drawGradientLines(this._fillStyle);
//        this.drawGradientLines(this._strokeStyle);
//    }
//},

///**
// * This method is responsible for the drawing of the gradient link lines.
// * It's called by the {@link Webgram.DrawingElement#drawGuides} method.<br><br>
// * <em>(should not be overridden)</em>
// */
//drawGradientLines: function (style) {
//    if (this.getFocusType() !== Webgram.DrawingElement.FOCUS_SELECTED) {
//        return;
//    }
//    
//    if (style == null) {
//        return;
//    }
//    
//    if (style.gradientPoint1 != null) { /* any kind of gradient form enabled */
//        if (style.gradientPoint1._radiusPoint1) { /* radial gradient */
//            /* draw a line between the gradient point and its radius point */
//            
//            this.drawLine(style.gradientPoint1, style.gradientPoint1._radiusPoint1);
//            this.drawLine(style.gradientPoint1, style.gradientPoint1._radiusPoint2);
//            this.paint(this._guidesStyle, null);
//        }
//        else { /* linear gradient */
//            /* draw a line between the gradient points */
//            
//            this.drawLine(style.gradientPoint1, style.gradientPoint2);
//            this.paint(this._guidesStyle, null);
//        }
//    }
//},
//

