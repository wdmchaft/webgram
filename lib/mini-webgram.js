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
     * to certain areas that are not displayed by the main webgram. A Webgram is paired
     * with a mini-webgram using {@link Webgram#setMiniWebgram}.
     * @constructs Webgram.MiniWebgram
     * @extends Webgram
     * @param {HtmlElement} htmlElement the <em>HTML</em> element to be used to receive the mouse and keyboard events;
     *  this is normally the <em>HTML Canvas</em> element whose 2D context is used to create the canvas object passed as the second argument
     * @param {Webgram.Canvas} canvas the canvas to be used
     *  by this instance of mini-webgram to paint everything.
     */
    initialize: function MiniWebgram(htmlElement, canvas) {
        Webgram.call(this, htmlElement, canvas);

        /**
         * A reference to the main Webgram that this mini-webgram was paired with.
         * @type Webgram
         */
        this.mainWebgram = null;
        
        /**
         * The amount of space to leave for the borders, expressed as a percent.
         * @type Number
         */
        this.marginFactor = 0.1;
        
        /* override some settings */
        this.settings.mainGrid = null;
        this.settings.snapGrid = null;
        this.settings.snapAngle = null;
        this.settings.snapDistance = null;
        this.settings.showRulers = false;
        this.settings.showZoom = false;
        this.settings.panEnabled = false;
        this.settings.zoomEnabled = false;
        this.settings.multipleSelectionEnabled = false;
        this.settings.actionsEnabled = false;
        
        var miniWebgram = this;
        
        this.rootContainer._fillStyle = Webgram.Styles.getFillStyle('mini-background');
        this.rootContainer._strokeStyle = Webgram.Styles.getStrokeStyle('mini-background');
        
        this.rootContainer.drawBackground = function () {
            if (this._fillStyle != null) {
                miniWebgram.mainWebgram._drawMini();
                
                var miniRect = this.webgram.getVisibleArea().getShrunk(-1);
                var visibleRect = this.webgram.visibleArea.getBoundingRectangle(true);
              
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
                
                this.drawPoly(visibleRect.getPoly(), true);
                this.paint(undefined, null);
            }
        };
        
        this.rootContainer.drawGrid = function () {
            /* avoid drawing the grid */
        };
        
        this.onMouseDown.bind(function (point, button, modifiers) {
            if (button === 1) {
                point = this.rootContainer.transformZoomOffsetInverse(point);
                
                if (!this.visibleArea.transformedPointInside(point)) {
                    /* center on point */
                    this.visibleArea.setLocation(point);
                    
                    return true;
                }
            }
        });

        /* add the visible area */
        this.visibleArea = new Webgram.MiniWebgram._MiniVisibleArea();
        this.addDrawingElement(this.visibleArea);
    },
    
    setVisibleArea: function (topLeft, bottomRight) {
        this._updatingMini = true;
        
        topLeft = this.visibleArea.transformInverse(topLeft);
        this.visibleArea._setTopLeft(topLeft, false);
        
        bottomRight = this.visibleArea.transformInverse(bottomRight);
        this.visibleArea._setBottomRight(bottomRight, false);
        
        delete this._updatingMini;
    },
    
    setWidth: function (width) {
        /* we override this method to restore the visible center to (0, 0)*/
        Webgram.MiniWebgram.parent.setWidth.call(this, width);
        
        this.setVisibleCenter(new Webgram.Geometry.Point(0, 0));
        this.mainWebgram._updateMini();
    },
    
    setHeight: function (height) {
        /* we override this method to restore the visible center to (0, 0)*/
        Webgram.MiniWebgram.parent.setHeight.call(this, height);
        
        this.setVisibleCenter(new Webgram.Geometry.Point(0, 0));
        this.mainWebgram._updateMini();
    },
    
    handleMouseDown: function (point, button, modifiers) {
        if (button === 3) { /* panning with mouse right click is not allowed */
            return;
        }
        
        return Webgram.MiniWebgram.parent.handleMouseDown.call(this, point, button, modifiers);
    },
    
    handleMouseScroll: function (point, up, modifiers) {
        var level = this.mainWebgram.getZoomLevel();
        var center = new Webgram.Geometry.Point(this.mainWebgram.getWidth() / 2, this.mainWebgram.getHeight() / 2);
        
        if (up) {
            this.mainWebgram.setZoomLevel(level - 1, center);
        }
        else {
            this.mainWebgram.setZoomLevel(level + 1, center);
        }
        
        return true;
    },
    
    _setRedrawLoop: function () {
        /* no redraw loop, redrawing handled by the main Webgram */
    }
});


Webgram.MiniWebgram._MiniVisibleArea = Webgram.DrawingElements.RectangularElement.extend({
    initialize: function _MiniVisibleArea() {
        Webgram.MiniWebgram._MiniVisibleArea.parentClass.call(this, ':special:mini-visible-area', 1, 1);
        
        this.onMove.bind(this._updateMainWebgram);
        this.onShapeChange.bind(this._updateMainWebgram);
    },

    draw: function () {
    },
    
    drawGuides: function () {
    },
    
    drawDecoration: function () {
    },
    
    getBoundingRectangle: function (transformed) {
        var width = this.getWidth();
        var height = this.getHeight();
        
        var x1 = Math.round(-width / 2);
        var y1 = Math.round(-height / 2);
        var x2 = Math.round(width / 2);
        var y2 = Math.round(height / 2);
        
        var rectangle = new Webgram.Geometry.Rectangle(x1, y1, x2, y2);
        
        if (transformed) {
            rectangle = this.translateDirect(rectangle);
        }
        
        return rectangle;
    },

    _updateMainWebgram: function () {
        if (this.webgram._updatingMini) { /* avoid recurrence */
            return;
        }
        
        this.webgram.mainWebgram._updateFromMini();
    }
});
