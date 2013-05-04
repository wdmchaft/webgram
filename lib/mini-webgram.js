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


Webgram.MiniWebgram = Webgram.extend( /** @lends Webgram.MiniWebgram.prototype */ {
    /**
     * A mini-webgram is a small version of a normal {@link Webgram} instance,
     * used as an overview of the whole drawing, enabling the user to pan and zoom
     * to certain areas that are not displayed by the main webgram. A webgram is paired
     * with a mini-webgram using {@link Webgram#setMiniWebgram}.
     * @constructs Webgram.MiniWebgram
     * @extends Webgram
     * @param {HtmlElement} htmlElement the <em>HTML</em> element to be used to receive the mouse and keyboard events;
     *  this is normally the <em>HTML Canvas</em> element whose 2D context is used to create the canvas object passed as the second argument
     * @param {Webgram.Canvas} canvas the canvas to be used
     *  by this instance of mini-webgram to paint everything.
     */
    initialize: function MiniWebgram(htmlElement, canvas) {
        this.super(htmlElement, canvas);

        /**
         * A reference to the main webgram that this mini-webgram was paired with.
         * @type Webgram
         */
        this.bigWebgram = null;
        
        /**
         * The amount of space to leave for the borders, expressed as a percent.
         * @type Number
         */
        this.marginFactor = 0.1;
        
        this.settings.mainGrid = null;
        this.settings.snapGrid = null;
        this.settings.snapAngle = null;
        this.settings.snapDistance = null;
        this.settings.showRulers = false;
        this.settings.showZoom = false;
        this.settings.panEnabled = false;
        this.settings.zoomEnabled = false;
        
        var miniWebgram = this;
        
        this.rootContainer._fillStyle = Webgram.Styles.getFillStyle('mini-background');
        this.rootContainer._strokeStyle = Webgram.Styles.getStrokeStyle('mini-background');
        
        this.rootContainer.drawBackground = function () {
            if (this._fillStyle != null) {
                miniWebgram.bigWebgram._drawMini();
                
                var miniRect = this.webgram.getVisibleArea().getShrinked(-1);
                var visibleRect = this.webgram.visibleArea.getBaseRectangle();
              
                var points = [
                    new Webgram.Geometry.Point(visibleRect.x1, miniRect.y2),
                    new Webgram.Geometry.Point(visibleRect.x1, visibleRect.y1),
                    new Webgram.Geometry.Point(visibleRect.x2, visibleRect.y1),
                    new Webgram.Geometry.Point(visibleRect.x2, visibleRect.y2),
                    new Webgram.Geometry.Point(visibleRect.x1, visibleRect.y2),
              
                    new Webgram.Geometry.Point(visibleRect.x1, miniRect.y2),
                    new Webgram.Geometry.Point(miniRect.x2, miniRect.y2),
                    new Webgram.Geometry.Point(miniRect.x2, miniRect.y1),
                    new Webgram.Geometry.Point(miniRect.x1, miniRect.y1),
                    new Webgram.Geometry.Point(miniRect.x1, miniRect.y2),
                  
                    new Webgram.Geometry.Point(visibleRect.x1, miniRect.y2)
                ];
              
                this.drawPoly(new Webgram.Geometry.Poly(points), true);
                this.paint(null, undefined);
                
                this.drawRect(visibleRect);
                this.paint(undefined, null);
            }
        };
        
        this.rootContainer.drawGrid = function () {
            /* avoid drawing the grid */
        };
        
        this.onMouseDown.bind(function (point, button, modifiers) {
            if (button === 1) {
                point = this.rootContainer.transformZoomOffsetInverse(point);
                
                if (!this.visibleArea.pointInside(point)) {
                    /* center on point */
                    this.visibleArea.moveTo(point);
                    return true;
                }
            }
        });
    },
    
    setVisibleArea: function (topLeft, bottomRight) {
        this._updatingMini = true;
        this.visibleArea._setTopLeft(topLeft, true);
        this.visibleArea._setBottomRight(bottomRight, true);
        
        delete this._updatingMini;
    },
    
    setWidth: function (width) {
        /* we override this method to restore the visible center to (0, 0)*/
        this.super(width);
        
        this.setVisibleCenter(new Webgram.Geometry.Point(0, 0));
        this.bigWebgram._updateMini();
    },
    
    setHeight: function (height) {
        /* we override this method to restore the visible center to (0, 0)*/
        this.super(height);
        
        this.setVisibleCenter(new Webgram.Geometry.Point(0, 0));
        this.bigWebgram._updateMini();
    },
    
    handleMouseDown: function (point, button, modifiers) {
        if (button === 3) { /* panning with mouse right click is not allowed */
            return;
        }
        
        return this.super(point, button, modifiers);
    },
    
    handleMouseScroll: function (point, up, modifiers) {
        var level = this.bigWebgram.getZoomLevel();
        var center = new Webgram.Geometry.Point(this.bigWebgram.getWidth() / 2, this.bigWebgram.getHeight() / 2);
        
        if (up) {
            this.bigWebgram.setZoomLevel(level - 1, center);
        }
        else {
            this.bigWebgram.setZoomLevel(level + 1, center);
        }
        
        return true;
    },
    
    _setRedrawLoop: function () {
        /* no redraw loop, redrawing handled by the big webgram */
    },
    
    _initDrawingElements: function () {
        this.visibleArea = new Webgram.MiniWebgram._MiniVisibleArea();
        this.addDrawingElement(this.visibleArea);
    }
});


Webgram.MiniWebgram._MiniVisibleArea = Webgram.DrawingElements.RectangularElement.extend({
    initialize: function _MiniVisibleArea() {
        this.super(':special:mini-visible-area', -20, -20, 41, 41);
        
        this.setRotateEnabled(false);
        this.setResizeEnabled(false);
        
        this.onMove.bind(this._updateBigWebgram);
        this.onResize.bind(this._updateBigWebgram);
    },

    draw: function () {
    },
    
    drawGuides: function () {
    },
    
    drawDecoration: function () {
    },
    
    getBaseRectangle: function () {
        var width = this.getWidth();
        var height = this.getHeight();
        
        var x1 = Math.round(-width / 2);
        var y1 = Math.round(-height / 2);
        var x2 = Math.round(width / 2);
        var y2 = Math.round(height / 2);
        
        return new Webgram.Geometry.Rectangle(x1, y1, x2, y2);
    },

    /* we override the following couple of methods because we want to prevent
     * any change-related events from triggering on this type of elements */
    
    setStrokeStyle: function (strokeStyle) {
        this._strokeStyle = strokeStyle;
    
        this.invalidate(true);
    },

    setFillStyle: function (fillStyle) {
        this._fillStyle = fillStyle;
    
        this.invalidate(true);
    },

    setTextStyle: function (textStyle) {
        this._textStyle = textStyle;

        this.invalidate(true);
    },

    snap: function () {
    },
    
    _updateBigWebgram: function () {
        if (this.webgram._updatingMini) { /* avoid recurrence */
            return;
        }
        
        var bigWebgram = this.webgram.bigWebgram;
        
        bigWebgram._updateFromMini();
    }
});
