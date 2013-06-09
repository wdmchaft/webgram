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


Webgram.DrawingElements.RootContainer =
        Webgram.DrawingElements.ContainerElement.extend( /** @lends Webgram.DrawingElements.RootContainer.prototype */ {
    
    /**
     * The parent container of all the drawing elements of a Webgram instance.
     * @constructs Webgram.DrawingElements.RootContainer
     * @extends Webgram.DrawingElements.ContainerElement
     * @param {Webgram} webgram the Webgram instance
     * @param {Webgram.Canvas} canvas the canvas to be used with this root container
     */
    initialize: function RootContainer(webgram, canvas) {
        Webgram.DrawingElements.RootContainer.parentClass.call(this, ':special:root-container');
        
        /**
         * The webgram instance associated with this root container.
         * @type Webgram
         */
        this.webgram = webgram;
        
        /**
         * The canvas used by this root container to draw.
         * @type Webgram.Canvas
         */
        this.canvas = canvas;
        
        /* drawing controls */
        this._activeDrawingControl = null;
        this._prevDrawingControl = null;
        this._lastMousePoint = null;
        
        /* zooming & panning */
        this._noZoom = false;
        this._zoomLevel = this.getSetting('zoomLevel');
        this._zoomFactor = this.getSetting('zoomFactors')[this._zoomLevel];
        this._offsetX = -this.canvas.getWidth() / 2;
        this._offsetY = -this.canvas.getHeight() / 2;
        
        /* snap visual feedback */
        this._snapVisualFeedback = null;
        
        this._fillStyle = Webgram.Styles.getFillStyle('background');
    },

    
    /* drawing methods */
    
    /**
     * Draws the background of the root container, if enabled.
     * This is internally called by {@link Webgram.DrawingElements.RootContainer#draw}.<br><br>
     * <em>(could be overridden)</em>
     */
    drawBackground: function () {
        this.canvas.clear();
        
        if (this._fillStyle != null) {
            this.drawRect(this.webgram.getVisibleArea().getShrunk(-1));
            this.paint();
        }
    },
    
    /**
     * Draws the grid of the root container.
     * This is internally called by {@link Webgram.DrawingElements.RootContainer#draw}.<br><br>
     * <em>(could be overridden)</em>
     */
    drawGrid: function () {
        var visibleWidth = this.canvas.getWidth() / this._zoomFactor;
        var visibleHeight = this.canvas.getHeight() / this._zoomFactor;
        var lineWidth = 1 / this._zoomFactor;
        var lineNo, gmin, gmax, x, y;
        
        var snapGrid = this.getSetting('snapGrid');
        var mainGrid = this.getSetting('mainGrid');
        var mainGridStrokeStyle = Webgram.Styles.getStrokeStyle('main-grid').replace({lineWidth: lineWidth});
        var axisStrokeStyle = Webgram.Styles.getStrokeStyle('main-grid-axes').replace({lineWidth: lineWidth});
        
        var snapGridStrokeStyle = null;
        if (snapGrid != null && snapGrid.sizeX != null) {
            snapGridStrokeStyle = Webgram.Styles.getStrokeStyle('snap-grid').replace({lineWidth: lineWidth});
        }
        
        /* _mini property is true while the root container element
         * is being drawn on the mini webgram */
        if (!this._mini) {
            /* draw the snap grid only when zoomed and enabled */
            if (this._zoomFactor > 1 && snapGridStrokeStyle != null) {
                /* draw the vertical snap grid */
                gmin = Math.floor(this._offsetX / snapGrid.sizeX) + 1;
                gmax = Math.floor((this._offsetX + visibleWidth) / snapGrid.sizeX);
                for (lineNo = gmin; lineNo <= gmax; lineNo++) {
                    x = snapGrid.sizeX * lineNo;
                    this.drawLine(new Webgram.Geometry.Point(x, this._offsetY), new Webgram.Geometry.Point(x, visibleHeight + this._offsetY - 1));
                    this.paint(snapGridStrokeStyle, null);
                }
                
                /* draw the horizontal snap grid */
                gmin = Math.floor(this._offsetY / snapGrid.sizeY) + 1;
                gmax = Math.floor((this._offsetY + visibleHeight) / snapGrid.sizeY);
                for (lineNo = gmin; lineNo <= gmax; lineNo++) {
                    y = snapGrid.sizeY * lineNo;
                    this.drawLine(new Webgram.Geometry.Point(this._offsetX, y), new Webgram.Geometry.Point(visibleWidth + this._offsetX - 1, y));
                    this.paint(snapGridStrokeStyle, null);
                }
            }
        
            var skipFactor;
            if (this._zoomFactor < 1) {
                skipFactor = Math.round(1 / this._zoomFactor);
            }
            else {
                skipFactor = 1;
            }
            
            /* draw the vertical main grid */
            gmin = Math.floor(this._offsetX / mainGrid.sizeX) + 1;
            gmax = Math.floor((this._offsetX + visibleWidth) / mainGrid.sizeX);
            for (lineNo = gmin; lineNo <= gmax; lineNo++) {
                if (lineNo % skipFactor) {
                    continue;
                }
                x = mainGrid.sizeX * lineNo;
                if (x === 0) {
                    continue;
                }
                
                this.drawLine(new Webgram.Geometry.Point(x, this._offsetY), new Webgram.Geometry.Point(x, visibleHeight + this._offsetY - 1));
                this.paint(mainGridStrokeStyle, null);
            }
            
            /* draw the horizontal main grid */
            gmin = Math.floor(this._offsetY / mainGrid.sizeY) + 1;
            gmax = Math.floor((this._offsetY + visibleHeight) / mainGrid.sizeY);
            for (lineNo = gmin; lineNo <= gmax; lineNo++) {
                if (lineNo % skipFactor) {
                    continue;
                }
                y = mainGrid.sizeY * lineNo;
                if (y === 0) {
                    continue;
                }
                
                this.drawLine(new Webgram.Geometry.Point(this._offsetX, y), new Webgram.Geometry.Point(visibleWidth + this._offsetX - 1, y));
                this.paint(mainGridStrokeStyle, null);
            }
        }
        
        /* draw the vertical axis */
        this.drawLine(new Webgram.Geometry.Point(0, this._offsetY), new Webgram.Geometry.Point(0, visibleHeight + this._offsetY - 1));
        this.paint(axisStrokeStyle, null);
        
        /* draw the horizontal axis */
        this.drawLine(new Webgram.Geometry.Point(this._offsetX, 0), new Webgram.Geometry.Point(visibleWidth + this._offsetX - 1, 0));
        this.paint(axisStrokeStyle, null);
    },
    
    /**
     * Draws the <em>snap visual feedback</em>, if present.
     * This is internally called by {@link Webgram.DrawingElements.RootContainer#draw}.<br><br>
     * <em>(should not be overridden)</em>
     * @see Webgram.DrawingElement#setSnapVisualFeedback
     * @see Webgram.DrawingElements.RootContainer.SnapVisualFeedback
     */
    drawSnapVisualFeedback: function () {
        if (this._mini) {
            return;
        }
        
        if (this._snapVisualFeedback == null) {
            return;
        }
        
        if (!this.getSetting('snapVisualFeedback')) {
            return;
        }
        
        var strokeStyle = Webgram.Styles.getStrokeStyle('snap-visual-feedback');
        var fillStyle = Webgram.Styles.createFillStyle({colors: strokeStyle.colors});
        var textStyle = Webgram.Styles.getTextStyle('snap-visual-feedback');
        
        var visibleArea = this.getVisibleArea();
        
        this._snapVisualFeedback.draw(this, visibleArea, strokeStyle, fillStyle, textStyle);
    },
    
    /**
     * Draws the rulers on the root container.
     * This is internally called by {@link Webgram.DrawingElements.RootContainer#draw}.<br><br>
     * <em>(could be overridden)</em>
     */
    drawRulers: function () {
        var fillStyle = Webgram.Styles.getFillStyle('rulers');
        var strokeStyle = Webgram.Styles.getStrokeStyle('rulers');
        var textStyle = Webgram.Styles.getTextStyle('rulers');
        
        var mainGrid = this.getSetting('mainGrid');
        var snapGrid = this.getSetting('snapGrid');
        var showRulers = this.getSetting('showRulers');
        var showZoom = this.getSetting('showZoom');
        
        var barWidth, barHeight, gmin, gmax, lineNo, box;
        
        if (!this._mini) {
            var visibleWidth = this.canvas.getWidth() / this._zoomFactor;
            var visibleHeight = this.canvas.getHeight() / this._zoomFactor;
            var zoomUnit = 1 / this._zoomFactor; /* used to adjust various coordinates */
            
            var gridSizeX = null, gridSizeY = null;
            if (snapGrid != null && snapGrid.sizeX != null) {
                gridSizeX = snapGrid.sizeX;
                gridSizeY = snapGrid.sizeY;
            }
            else if (mainGrid != null && mainGrid.sizeX != null) {
                gridSizeX = Math.round(mainGrid.sizeX / 2);
                gridSizeY = Math.round(mainGrid.sizeY / 2);
            }
            
            if (showRulers && gridSizeX != null) {
                barHeight = 15;
                barWidth = Math.max(('' + Math.round(this._offsetY)).length, 
                        ('' + Math.round(this._offsetY + visibleHeight)).length) * 7;
                
                /* draw the ruler background */
                this.drawRect(new Webgram.Geometry.Rectangle(this._offsetX - zoomUnit, this._offsetY - zoomUnit,
                        this._offsetX + visibleWidth, this._offsetY + barHeight / this._zoomFactor));
                this.drawRect(new Webgram.Geometry.Rectangle(this._offsetX - zoomUnit, this._offsetY - zoomUnit,
                        this._offsetX + barWidth / this._zoomFactor, this._offsetY + visibleHeight));
                
                this.paint(null, fillStyle);
                
                /* draw the separator lines */
                this.drawLine(new Webgram.Geometry.Point(this._offsetX + barWidth / this._zoomFactor, this._offsetY + barHeight / this._zoomFactor),
                        new Webgram.Geometry.Point(this._offsetX + visibleWidth, this._offsetY + barHeight / this._zoomFactor));
                this.paint(strokeStyle, null);
                
                this.drawLine(new Webgram.Geometry.Point(this._offsetX + barWidth / this._zoomFactor, this._offsetY + barHeight / this._zoomFactor),
                        new Webgram.Geometry.Point(this._offsetX + barWidth / this._zoomFactor, this._offsetY + visibleHeight));
                this.paint(strokeStyle, null);
                
                var skipFactorX = Math.ceil(Math.round(10 / this._zoomFactor) / gridSizeX) * gridSizeX;
                
                /* draw the horizontal ruler */
                gmin = Math.floor(this._offsetX / gridSizeX) + Math.round(10 / this._zoomFactor);
                gmax = Math.floor((this._offsetX + visibleWidth) / gridSizeX) - 1;
                for (lineNo = gmin; lineNo <= gmax; lineNo++) {
                    if (lineNo % skipFactorX) {
                        continue;
                    }
                    var x = gridSizeX * lineNo;
                    box = new Webgram.Geometry.Rectangle(x, this._offsetY, x, this._offsetY + barHeight / this._zoomFactor);
                    
                    this.drawText('' + x, box, 0, textStyle);
                }
                
                var skipFactorY = Math.ceil(Math.round(10 / this._zoomFactor) / gridSizeY) * gridSizeY;
                
                /* draw the vertical ruler */
                gmin = Math.floor(this._offsetY / gridSizeY) + 2;
                gmax = Math.floor((this._offsetY + visibleHeight) / gridSizeY) - 1;
                for (lineNo = gmin; lineNo <= gmax; lineNo++) {
                    if (lineNo % skipFactorY) {
                        continue;
                    }
                    var y = gridSizeY * lineNo;
                    box = new Webgram.Geometry.Rectangle(this._offsetX, y, this._offsetX + (barWidth - 3) / this._zoomFactor, y);
                    
                    this.drawText('' + y, box, 0, textStyle.replace({justify: 'rc'}));
                }
            }
            
            if (showZoom) {
                /* draw the zoom background */
                barWidth = 45;
                barHeight = 15;
                
                this.drawRect(new Webgram.Geometry.Rectangle(
                        this._offsetX + visibleWidth - barWidth / this._zoomFactor, 
                        this._offsetY + visibleHeight - barHeight / this._zoomFactor,
                        this._offsetX + visibleWidth, this._offsetY + visibleHeight));
                
                this.paint(strokeStyle, fillStyle);
                
                /* draw the zoom text */
                var text = '' + this._zoomFactor.toFixed(this._zoomFactor < 1 ? 2 : 1) + ' x';
                
                box = new Webgram.Geometry.Rectangle(
                        this._offsetX + visibleWidth - barWidth / this._zoomFactor,
                        this._offsetY + visibleHeight - barHeight / this._zoomFactor,
                        this._offsetX + visibleWidth,
                        this._offsetY + visibleHeight);
                
                this.drawText(text, box, 0, textStyle.replace({justify: 'cc'}));
            }
        }
    },
    
    /**
     * Draws the elements themselves on the root container.
     * This is internally called by {@link Webgram.DrawingElements.RootContainer#draw}.<br><br>
     * <em>(should not be overridden)</em>
     */
    drawElements: function () {
        /* the normal draw loop */
        for (var i = 0; i < this._drawingElements.length; i++) {
            drawingElement = this._drawingElements[i];
            
            drawingElement.draw();
        
            if (!this._mini) {
                this._noZoom = true;
                drawingElement.drawNoZoom();
                this._noZoom = false;
            }
        }
        
        /* the "on top" draw loop */
        for (i = 0; i < this._drawingElements.length; i++) {
            drawingElement = this._drawingElements[i];
            
            drawingElement.drawTop();
                
            if (!this._mini) {
                this._noZoom = true;
                drawingElement.drawNoZoomTop();
                this._noZoom = false;
            }
        }
    },
    
    /**
     * Draws the control points and other points on the root container.
     * This is internally called by {@link Webgram.DrawingElements.RootContainer#draw}.<br><br>
     * <em>(should not be overridden)</em>
     */
    drawPoints: function () {
        this._noZoom = true;
        
        var drawingElement, i;
        for (i = 0; i < this._drawingElements.length; i++) {
            drawingElement = this._drawingElements[i];
            drawingElement.drawActionMenuItems();
            drawingElement.drawControlPoints();
        }
        
        this._noZoom = false;
    },
    
    draw: function () {
        this.drawBackground();
        if (this.webgram.settings.mainGrid) {
            this.drawGrid();
        }
        
        this.drawElements();
        if (!this._mini) {
            this.drawPoints();
        }
        
        this._noZoom = true; // TODO add a setter and a getter for noZoom
        this.drawSnapVisualFeedback();
        this.drawRulers();
        this._noZoom = false;
    },
    
    
    /* drawing primitives */
    
    drawLine: function (point1, point2) {
        if (this._noZoom) {
            point1 = this.transformZoomOffsetDirect(point1);
            point2 = point2 && this.transformZoomOffsetDirect(point2);
        }
        
        this.canvas.drawLine(point1, point2);
    },
    
    drawPoly: function (poly, closed) {
        if (this._noZoom) {
            var newPoints = [];
            for (var i = 0; i < poly.points.length; i++) {
                var point = poly.points[i];
                point = this.transformZoomOffsetDirect(point);
                newPoints.push(point);
            }
            
            poly = new Webgram.Geometry.Poly(newPoints);
        }
        
        this.canvas.drawPoly(poly, closed);
    },
    
    drawRect: function (rectangle) {
        var poly = rectangle.getPoly();
        
        this.drawPoly(poly, true);
    },
    
    drawArc: function (center, radiusX, radiusY, startAngle, endAngle, anti) {
        if (this._noZoom) {
            center = this.transformZoomOffsetDirect(center);
        }
        
        this.canvas.drawArc(center, radiusX, radiusY, startAngle, endAngle, anti);
    },
    
    drawBezier: function (point1, point2, controlPoint1, controlPoint2) {
        if (this._noZoom) {
            point1 = this.transformZoomOffsetDirect(point1);
            point2 = this.transformZoomOffsetDirect(point2);
            if (controlPoint2 != null) {
                controlPoint1 = this.transformZoomOffsetDirect(controlPoint1);
            }
            controlPoint2 = this.transformZoomOffsetDirect(controlPoint2);
        }
        
        this.canvas.drawBezier(point1, point2, controlPoint1, controlPoint2);
    },
    
    drawImage: function (image, center, size, rotationAngle, alpha, transformSet) {
        if (!transformSet) {
            transformSet = new Webgram.Canvas.TransformSet();
        }
        
        if (!this._noZoom) {
            transformSet.addTranslation(-this._offsetX, -this._offsetY);
            transformSet.addScaling(this._zoomFactor);
        }
        else {
            center = this.transformZoomOffsetDirect(center);
        }
        
        this.canvas.drawImage(image, center, size, rotationAngle, alpha, transformSet);
    },
    
    drawText: function (text, box, rotationAngle, textStyle, transformSet) {
        if (box == null) {
            box = this.getBoundingRectangle();
        }
        
        if (textStyle === undefined) {
            textStyle = this.getTextStyle();
        }
        
        if (!transformSet) {
            transformSet = new Webgram.Canvas.TransformSet();
        }
        
        if (!this._noZoom) {
            transformSet.addTranslation(-this._offsetX, -this._offsetY);
            transformSet.addScaling(this._zoomFactor);
        }
        else {
            var topLeft = this.transformZoomOffsetDirect(box.getTopLeft());
            var bottomRight = this.transformZoomOffsetDirect(box.getBottomRight());
            
            box = new Webgram.Geometry.Rectangle(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
        }
        
        this.canvas.drawText(text, box, rotationAngle, textStyle, transformSet);
    },

    paint: function (strokeStyle, fillStyle, transformSet) {
        if (!transformSet) {
            transformSet = new Webgram.Canvas.TransformSet();
        }
        
        if (strokeStyle === undefined) {
            strokeStyle = this.getStrokeStyle();
        }
        if (fillStyle === undefined) {
            fillStyle = this.getFillStyle();
        }
        
        if (!this._noZoom) {
            transformSet.addTranslation(-this._offsetX, -this._offsetY);
            transformSet.addScaling(this._zoomFactor);
        }
        else {
            if (strokeStyle) {
                strokeStyle = strokeStyle.clone();
            }
            if (fillStyle) {
                fillStyle = fillStyle.clone();
            }
            
            var styles = [strokeStyle, fillStyle];
            for (var i = 0; i < styles.length; i++) {
                var style = styles[i];
                if (!style) {
                    continue;
                }
                
                if (style.gradientPoint1) {
                    style.gradientPoint1 = this.transformZoomOffsetDirect(style.gradientPoint1);
                }
                if (style.gradientPoint2) {
                    style.gradientPoint2 = this.transformZoomOffsetDirect(style.gradientPoint2);
                }
            }
        }
        
        this.canvas.paint(strokeStyle, fillStyle, transformSet);
    },
    
    
    /* shape */
    
    getBoundingRectangle: function () {
        if (this._drawingElements.length > 0) {
            return Webgram.DrawingElements.RootContainer.parent.getBoundingRectangle.call(this);
        }
        else {
            var width = this.getWidth();
            var height = this.getHeight();
            
            return new Webgram.Geometry.Rectangle(-width / 2, -height / 2, width / 2, height / 2);
        }
    },
    
    
    /* children */
    
    _addDrawingElement: function (drawingElement, where, triggerEvents) {
        Webgram.DrawingElements.RootContainer.parent._addDrawingElement.call(this, drawingElement, where, triggerEvents);
        
        if (triggerEvents) {
            var drawingControl = this.getActiveDrawingControl();
            if (drawingControl != null) {
                drawingControl.handleDrawingElementAdd(drawingElement);
            }
        }
    },
    
    _remDrawingElement: function (drawingElement, triggerEvents) {
        if (triggerEvents) {
            var drawingControl = this.getActiveDrawingControl();
            if (drawingControl != null) {
                var beforeSelectedDrawingElements = drawingControl.getSelectedDrawingElements(); 
                drawingControl.handleDrawingElementRemove(drawingElement);
                var afterSelectedDrawingElements = drawingControl.getSelectedDrawingElements();
                
                if (!Webgram.Utils.equals(beforeSelectedDrawingElements, afterSelectedDrawingElements) && this.webgram != null) {
                    this.webgram.onSelectionChange.trigger(afterSelectedDrawingElements);
                }
            }
        }

        Webgram.DrawingElements.RootContainer.parent._remDrawingElement.call(this, drawingElement, triggerEvents);
    },
    
    
    /* zoom, visible area & size */
    
    /**
     * Returns the current zoom factor of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the current zoom factor
     */
    getZoomFactor: function () {
        return this._zoomFactor;
    },
    
    /**
     * Changes the zoom factor to the exact given value.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} zoomFactor the zoom factor to set
     * @param {Webgram.Geometry.Point} point the point in the webgram that should remain fixed
     */
    setZoomFactor: function (zoomFactor, point) {
        var oldZoomFactor = this._zoomFactor;
        this._zoomFactor = zoomFactor;
        
        /* recenter if a center point was provided */
        if (point) {
            var dx = point.x * (this._zoomFactor / oldZoomFactor - 1);
            var dy = point.y * (this._zoomFactor / oldZoomFactor - 1);
            
            var offset = this.getOffset();
            offset = offset.getTranslated(dx / this._zoomFactor, dy / this._zoomFactor);
            this.setOffset(offset);
        }
        
        this.invalidate(true);
        this.webgram.onZoom.trigger(this._zoomLevel);
    },
    
    /**
     * Returns the current zoom level of the root container.
     * The zoom <em>level</em> is different from the <em>zoom</em> factor in that
     * the zoom level is an integer number representing an index in a list
     * of predefined zoom factors, while the zoom factor is effectively the
     * ratio at which the scaling is being done.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the current zoom level
     */
    getZoomLevel: function () {
        return this._zoomLevel;
    },
    
    /**
     * Sets the zoom level of the root container and optionally recenters. 
     * The list of the available zoom levels is defined through the <tt>zoomLevels</tt> global setting.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} zoomLevel the zoom level to set
     * @param {Webgram.Geometry.Point} point the point of the webgram that should remain fixed
     */
    setZoomLevel: function (zoomLevel, point) {
        this._zoomLevel = zoomLevel;
        
        var zoomFactors = this.getSetting('zoomFactors');
        if (this._zoomLevel > zoomFactors.length - 1) {
            this._zoomLevel = zoomFactors.length - 1;
        }
        
        if (this._zoomLevel < 0) {
            this._zoomLevel = 0;
        }
        
        this.setZoomFactor(zoomFactors[this._zoomLevel], point);
        
        /* update all the DEs - the offsets of the various points might have changed with the zoom */
        for (var i = 0; i < this._drawingElements.length; i++) {
            this._drawingElements[i].invalidate();
        }
        
        this.invalidate();
    },
    
    /**
     * Returns the panning offset of this root container,
     * in the form of a point.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Point} the panning offset
     */
    getOffset: function () {
        return new Webgram.Geometry.Point(this._offsetX, this._offsetY);
    },
    
    /**
     * Sets the panning offset to the given value.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Object} offset an object with:<ul>
     *  <li><tt>x</tt> - the horizontal offset</li>
     *  <li><tt>y</tt> - the vertical offset</li>
     * </ul>
     */
    setOffset: function (offset) {
        this._offsetX = Math.round(offset.x);
        this._offsetY = Math.round(offset.y);
        
        this.webgram.onPan.trigger(this.getVisibleCenter());
    },
    
    /**
     * Returns the current visible center of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Point} the visible center
     */
    getVisibleCenter: function () {
        return this.transformZoomOffsetInverse(new Webgram.Geometry.Point(this.getWidth() / 2, this.getHeight() / 2));
    },
    
    /**
     * Recenters the root container without affecting the zoom.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} center the new visible center
     */
    setVisibleCenter: function (center) {
        var offsetX = center.x - this.getWidth() / 2 / this._zoomFactor;
        var offsetY = center.y - this.getHeight() / 2 / this._zoomFactor;
        
        this.setOffset(new Webgram.Geometry.Point(offsetX, offsetY));
        
        this.invalidate(true);
    },
    
    /**
     * Determines the visible portion of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Rectangle} the currently visible area
     */
    getVisibleArea: function () {
        var topLeft = new Webgram.Geometry.Point(0, 0);
        var bottomRight = new Webgram.Geometry.Point(this.getWidth() - 1, this.getHeight() - 1);
        
        topLeft = this.transformZoomOffsetInverse(topLeft);
        bottomRight = this.transformZoomOffsetInverse(bottomRight);
        
        return new Webgram.Geometry.Rectangle(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
    },
    
    /**
     * Changes the visible area according to the two <tt>topLeft</tt> and <tt>bottomRight</tt> points.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} topLeft the top-left corner of the desired visible area
     * @param {Webgram.Geometry.Point} bottomRight the bottom-right corner of the desired visible area
     */
    setVisibleArea: function (topLeft, bottomRight) {
        var width = this.getWidth();
        var height = this.getHeight();
        
        var zoomWidth = width / (bottomRight.x - topLeft.x + 1);
        var zoomHeight = height / (bottomRight.y - topLeft.y + 1);
        var zoomFactor = Math.min(zoomWidth, zoomHeight);
        var minZoomDif = Infinity;
        var closestZoomLevel = null;
        var zoomFactors = this.getSetting('zoomFactors');
        for (var i = 0; i < zoomFactors.length; i++) {
            var zf = zoomFactors[i];
            var dif = Math.abs(zoomFactor - zf);
            if (dif < minZoomDif) {
                minZoomDif = dif;
                closestZoomLevel = i;
            }
        }
        
        var centerX = (topLeft.x + bottomRight.x) / 2;
        var centerY = (topLeft.y + bottomRight.y) / 2;
        
        this.setZoomLevel(closestZoomLevel);
        this.setVisibleCenter(new Webgram.Geometry.Point(centerX, centerY));
        
        this.invalidate(true);
    },
    
    /**
     * Returns the visible width of the root container.
     * This is normally the width of the <em>HTML Canvas</em> element.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the width of the root container
     */
    getWidth: function () {
        return this.canvas.getWidth();
    },
    
    /**
     * Returns the visible height of the root container.
     * This is normally the height of the <em>HTML Canvas</em> element.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the height of the root container
     */
    getHeight: function () {
        return this.canvas.getHeight();
    },
    
    /**
     * Changes the width of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} width the new width of the root container
     */
    setWidth: function (width) {
        this.canvas.setWidth(width);
        this.invalidate(true);
    },
    
    /**
     * Changes the height of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} height the new height of the root container
     */
    setHeight: function (height) {
        this.canvas.setHeight(height);
        this.invalidate(true);
    },
    

    /* transforms */
    
    /**
     * Transforms a point from the webgram coordinates system
     * to the window coordinates system. The transformation takes into account
     * the <em>zoom</em> and the <em>panning offset</em> of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point with webgram coordinates to transform
     * @returns {Webgram.Geometry.Point} the corresponding point in window coordinates
     */
    transformZoomOffsetDirect: function (point) {
        return new Webgram.Geometry.Point(
                (point.x - this._offsetX) * this._zoomFactor,
                (point.y - this._offsetY) * this._zoomFactor);
    },
    
    /**
     * Transforms a point from the window coordinates system
     * to the webgram coordinates system. The transformation takes into account
     * the <em>zoom</em> and the <em>panning offset</em> of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point a point with window coordinates to transform
     * @returns {Webgram.Geometry.Point} the corresponding point in webgram coordinates
     */
    transformZoomOffsetInverse: function (point) {
        return new Webgram.Geometry.Point(
                point.x / this._zoomFactor + this._offsetX,
                point.y / this._zoomFactor + this._offsetY);
    },
    

    /* drawing controls */
    
    /**
     * Returns the active drawing control. To activate a drawing control,
     * use {@link Webgram.DrawingControl#activate}.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.DrawingControl} the active drawing control,
     * or <tt>null</tt> if no drawing control is currently active
     */
    getActiveDrawingControl: function () {
        return this._activeDrawingControl;
    },
    

    /* event handlers */
    
    /**
     * Handles the <em>mouse down</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse button was pressed
     * @param {Number} button the mouse button that was pressed (<tt>1</tt> - left, <tt>2</tt> - middle, <tt>3</tt> - right)
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseDown: function (point, button, modifiers) {
        this.setSnapVisualFeedback(null);
        
        point = this.transformZoomOffsetInverse(point);
        this._lastMousePoint = point; /* remember the last position of the mouse */
        
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleMouseDown(point, button, modifiers))) {
            return result;
        }
        else {
            return this.onMouseDown.trigger(point, button, modifiers);
        }
    },
    
    /**
     * Handles the <em>mouse up</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse button was released
     * @param {Number} button the mouse button that was released (<tt>1</tt> - left, <tt>2</tt> - middle, <tt>3</tt> - right)
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseUp: function (point, button, modifiers) {
        this.setSnapVisualFeedback(null);
        
        point = this.transformZoomOffsetInverse(point);
        this._lastMousePoint = point; /* remember the last position of the mouse */
        
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleMouseUp(point, button, modifiers))) {
            return result;
        }
        else {
            return this.onMouseUp.trigger(point, button, modifiers);
        }
    },
    
    /**
     * Handles the <em>mouse move</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse was moved
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseMove: function (point, modifiers) {
        this.setSnapVisualFeedback(null);
        
        point = this.transformZoomOffsetInverse(point);
        this._lastMousePoint = point; /* remember the last position of the mouse */
        
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleMouseMove(point, modifiers))) {
            return result;
        }
        else {
            return this.onMouseMove.trigger(point, modifiers);
        }
            
        return this.onMouseMove.trigger(point, modifiers);
    },
    
    /**
     * Handles the <em>mouse wheel</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse wheel was turned
     * @param {Boolean} up <tt>true</tt> if the mouse wheel was turned up, <tt>false</tt> otherwise
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseScroll: function (point, up, modifiers) {
        this.setSnapVisualFeedback(null);
        
        point = this.transformZoomOffsetInverse(point);
        this._lastMousePoint = point; /* remember the last position of the mouse */
        
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleMouseScroll(point, up, modifiers))) {
            return result;
        }
        else {
            return this.onMouseScroll.trigger(point, up, modifiers);
        }
    },
    
    /**
     * Handles the <em>key press</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {String} key the character corresponding to the key that was pressed
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyPress: function (key, modifiers) {
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleKeyPress(key, modifiers))) {
            return result;
        }
        else {
            return this.onKeyPress.trigger(key, modifiers);
        }
    },
    
    /**
     * Handles the <em>key down</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} key the code corresponding to the key that was pressed
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyDown: function (key, modifiers) {
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleKeyDown(key, modifiers))) {
            return result;
        }
        else {
            return this.onKeyDown.trigger(key, modifiers);
        }
    },
    
    /**
     * Handles the <em>key up</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} key the code corresponding to the key that was released
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyUp: function (key, modifiers) {
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleKeyUp(key, modifiers))) {
            return result;
        }
        else {
            return this.onKeyUp.trigger(key, modifiers);
        }
    },
    
    /**
     * Handles the <em>focus</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     */
    handleFocus: function () {
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleFocus())) {
            return result;
        }
    },
    
    /**
     * Handles the <em>blur</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     */
    handleBlur: function () {
        this.setSnapVisualFeedback(null);
        
        var result, drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null && (result = drawingControl.handleBlur())) {
            return result;
        }
    },


    /* other methods */
    
    setSnapVisualFeedback: function (snapVisualFeedback) {
        this._snapVisualFeedback = snapVisualFeedback;
        this.invalidate();
    }
});


Webgram.DrawingElements.RootContainer.SnapVisualFeedback =
        Webgram.Class.extend( /** @lends Webgram.DrawingElements.RootContainer.SnapVisualFeedback.prototype */ {
    
    /**
     * The base abstract class for snapping visual feedback objects.
     * @constructs Webgram.DrawingElements.RootContainer.SnapVisualFeedback
     */
    initialize: function SnapVisualFeedback() {
    },

    
    /**
     * Draws the visual feedback on the root container.<br><br>
     * <em>(must be overridden)</em>
     * @param {Webgram.DrawingElements.RootContainer} the root container
     * on which to draw the feedback
     * @param {Webgram.Geometry.Rectangle} visibleArea the bounding box representing the currently visible area
     * @param {Number} visibleHeight the current visible height of the canvas
     * @param {Webgram.Styles.StrokeStyle} strokeStyle the visual feedback stroke style to use
     * @param {Webgram.Styles.FillStyle} fillStyle the visual feedback fill style to use
     * @param {Webgram.Styles.TextStyle} textStyle the visual feedback text style to use
     */
    draw: function (rootContainer, visibleArea, strokeStyle, fillStyle, textStyle) {
        /* must be overridden */
    }
});


Webgram.DrawingElements.RootContainer.PointSnapVisualFeedback =
        Webgram.DrawingElements.RootContainer.SnapVisualFeedback.extend(
                /** @lends Webgram.DrawingElements.RootContainer.PointSnapVisualFeedback.prototype */ {

    /**
     * Represents a visual feedback for a snapping that occurred in a point.
     * @constructs Webgram.DrawingElements.RootContainer.PointSnapVisualFeedback
     * @extends Webgram.DrawingElements.RootContainer.SnapVisualFeedback
     * @param {Webgram.Geometry.Point} point the point in which the snapping occurred
     */
    initialize: function PointSnapVisualFeedback(point) {
        this._point = point;
    },
    
    draw: function (rootContainer, visibleArea, strokeStyle, fillStyle, textStyle) {
        /* draw the vertical axis */
        rootContainer.drawLine(
                new Webgram.Geometry.Point(this._point.x, visibleArea.y1),
                new Webgram.Geometry.Point(this._point.x, visibleArea.y2));
        rootContainer.paint(strokeStyle, null);
        
        /* draw the horizontal axis */
        rootContainer.drawLine(
                new Webgram.Geometry.Point(visibleArea.x1, this._point.y),
                new Webgram.Geometry.Point(visibleArea.x2, this._point.y));
        rootContainer.paint(strokeStyle, null);
    }
});


Webgram.DrawingElements.RootContainer.LineSnapVisualFeedback =
        Webgram.DrawingElements.RootContainer.SnapVisualFeedback.extend(
                /** @lends Webgram.DrawingElements.RootContainer.LineSnapVisualFeedback.prototype */ {

    /**
     * Represents a visual feedback for a snapping that occurred on a line.
     * @constructs Webgram.DrawingElements.RootContainer.LineSnapVisualFeedback
     * @extends Webgram.DrawingElements.RootContainer.SnapVisualFeedback
     * @param {Webgram.Geometry.Line} line the line on which the snapping occurred
     */
    initialize: function LineSnapVisualFeedback(line) {
        this._line = line;
    },
    
    draw: function (rootContainer, visibleArea, strokeStyle, fillStyle, textStyle) {
        if (this._line.isVertical()) {
            rootContainer.drawLine(
                    new Webgram.Geometry.Point(this._line.intercept, visibleArea.y1),
                    new Webgram.Geometry.Point(this._line.intercept, visibleArea.y2));
            rootContainer.paint(strokeStyle, null);
        }
        else if (this._line.isHorizontal()) {
            rootContainer.drawLine(
                    new Webgram.Geometry.Point(visibleArea.x1, this._line.intercept),
                    new Webgram.Geometry.Point(visibleArea.x2, this._line.intercept));
            rootContainer.paint(strokeStyle, null);
        }
        else { /* oblique line */
            rootContainer.drawLine(
                    new Webgram.Geometry.Point(visibleArea.x1, this._line.getY(visibleArea.x1)),
                    new Webgram.Geometry.Point(visibleArea.x2, this._line.getY(visibleArea.x2)));
            rootContainer.paint(strokeStyle, null);
        }
    }
});


Webgram.DrawingElements.RootContainer.IntersectionSnapVisualFeedback =
        Webgram.DrawingElements.RootContainer.SnapVisualFeedback.extend(
                /** @lends Webgram.DrawingElements.RootContainer.IntersectionSnapVisualFeedback.prototype */ {
    
    /**
     * Represents a visual feedback for a snapping that occurred at an intersection of two lines.
     * @constructs Webgram.DrawingElements.RootContainer.IntesectionSnapVisualFeedback
     * @extends Webgram.DrawingElements.RootContainer.SnapVisualFeedback
     * @param {Webgram.Geometry.Line} line1 the first line of the intersection
     * @param {Webgram.Geometry.Line} line2 the second line of the intersection
     */
    initialize: function IntersectionSnapVisualFeedback(line1, line2) {
        this._line1 = line1;
        this._line2 = line2;
    },
    
    draw: function (rootContainer, visibleArea, strokeStyle, fillStyle, textStyle) {
        /* we simply use LineSnapVisualFeedback to draw the two lines */
        
        new Webgram.LineSnapVisualFeedback(this._line1).draw(rootContainer, visibleArea, strokeStyle, fillStyle, textStyle);
        new Webgram.LineSnapVisualFeedback(this._line2).draw(rootContainer, visibleArea, strokeStyle, fillStyle, textStyle);
    }
});


Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback =
        Webgram.DrawingElements.RootContainer.SnapVisualFeedback.extend(
                /** @lends Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback.prototype */ {
    
    /**
     * Represents a visual feedback for a snapping that occurred around an origin, at a given angle.
     * @constructs Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback
     * @extends Webgram.DrawingElements.RootContainer.SnapVisualFeedback
     * @param {Webgram.Geometry.Point} origin the origin of the angular snapping
     * @param {Number} angle the snapping angle
     */
    initialize: function AngularSnapVisualFeedback(origin, startAngle, endAngle) {
        this._origin = origin;
        this._startAngle = Webgram.Geometry.normalizeAngle(startAngle);
        this._endAngle = Webgram.Geometry.normalizeAngle(endAngle);
        
        if ((this._startAngle > this._endAngle && this._startAngle - this._endAngle < Math.PI) ||
            (this._startAngle < this._endAngle && this._endAngle - this._startAngle > Math.PI)) {
            
            var aux = this._startAngle;
            this._startAngle = this._endAngle;
            this._endAngle = aux;
        }
    },
    
    draw: function (rootContainer, visibleArea, strokeStyle, fillStyle, textStyle) {
        var zoomFactor = rootContainer.getZoomFactor();
        var radius = 30;
        var angleDelta = Math.PI / 6;
        
        var arrowStartTop = this._origin.getPointAt(radius / zoomFactor, this._startAngle);
        var arrowEndTop = this._origin.getPointAt(radius / zoomFactor, this._endAngle);
        var arrowLen = 10 / zoomFactor;
        var arrowAngle = Math.PI / 4;
        var arrowAngleOffset = 5 / radius;
        
        /* draw the arc */
        rootContainer.drawArc(this._origin, radius, radius, this._startAngle - angleDelta, this._endAngle + angleDelta, 0);
        rootContainer.paint(strokeStyle, null);

        /* draw the first arrow */
        rootContainer.drawLine(arrowStartTop, arrowStartTop.getPointAt(arrowLen, this._startAngle - Math.PI / 2 - arrowAngle / 2 - arrowAngleOffset));
        rootContainer.drawLine(arrowStartTop.getPointAt(arrowLen, this._startAngle - Math.PI / 2 + arrowAngle / 2 - arrowAngleOffset));
        rootContainer.drawLine(arrowStartTop);
        rootContainer.paint(null, fillStyle);

        /* draw the second arrow */
        rootContainer.drawLine(arrowEndTop, arrowEndTop.getPointAt(arrowLen, this._endAngle + Math.PI / 2 - arrowAngle / 2 + arrowAngleOffset));
        rootContainer.drawLine(arrowEndTop.getPointAt(arrowLen, this._endAngle + Math.PI / 2 + arrowAngle / 2 + arrowAngleOffset));
        rootContainer.drawLine(arrowEndTop);
        rootContainer.paint(null, fillStyle);
        
        /* draw the first axis */
        rootContainer.drawLine(this._origin, this._origin.getPointAt(radius * 100, this._startAngle));
        rootContainer.paint(strokeStyle, null);

        if (this._startAngle !== this._endAngle) {
            /* draw the second axis */
            rootContainer.drawLine(this._origin, this._origin.getPointAt(radius * 100, this._endAngle));
            rootContainer.paint(strokeStyle, null);
        }
    }
});


Webgram.DrawingElements.RootContainer.CompositeSnapVisualFeedback =
        Webgram.DrawingElements.RootContainer.SnapVisualFeedback.extend(
                /** @lends Webgram.DrawingElements.RootContainer.CompositeSnapVisualFeedback.prototype */ {
    
    /**
     * Represents a composite visual feedback, composed of more than one snap visual feedbacks.
     * @constructs Webgram.DrawingElements.RootContainer.CompositeSnapVisualFeedback
     * @extends Webgram.DrawingElements.RootContainer.SnapVisualFeedback
     * @param {Array} snapVisualFeedbacks a list of {@link Webgram.DrawingElements.RootContainer.SnapVisualFeedback} objects
     */
    initialize: function CompositeSnapVisualFeedback(snapVisualFeedbacks) {
        this._snapVisualFeedbacks = snapVisualFeedbacks;
    },
    
    draw: function (rootContainer, visibleArea, strokeStyle, fillStyle, textStyle) {
        /* draw the children snap visual feedbacks, one by one */
        
        for (var i = 0; i < this._snapVisualFeedbacks.length; i++) {
            this._snapVisualFeedbacks[i].draw(rootContainer, visibleArea, strokeStyle, fillStyle, textStyle);
        }
    }
});
