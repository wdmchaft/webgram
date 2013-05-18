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


Webgram.ActionMenuItem = Webgram.ControlPoint.extend( /** @lends Webgram.ActionMenuItem.prototype */ {
    /**
     * Represents a clickable menu item around a drawing element.
     * Instances of this class can be used to facilitate actions like
     * <em>copy</em>, <em>paste</em>, <em>duplicate</em> etc.
     * @constructs Webgram.ActionMenuItem 
     * @extends Webgram.ControlPoint
     * @param {String} icon the name of the image to use as the menu icon
     * @param {String} align a combination of two letters: ('l', 'c', 'r') and ('t', 'c', 'b') indicating the alignment of this item
     * @param {Function} callback a function to be called when the user clicks on the menu item
     */
    initialize: function ActionMenuItem(icon, align, callback) {
        this.callSuper();
        
        if (!align) {
            align = 'rt';
        }
        
        this.setRadius(15);
        
        /**
         * A menu item is in fact an icon painted around the element.
         * This field represents the name of the image loaded into the
         * {@link Webgram.ImageStore} to draw as icon. The default implementation
         * of <tt>draw</tt> requires this point to a valid image.
         * @type String
         */
        this.icon = icon;
        
        /**
         * When the user clicks on the action menu item (read: activates the menu item),
         * this is the function that will be called with the menu item as <tt>this</tt>.
         * If you need to force an activation, call {@link Webgram.ActionMenuItem#activate}.
         * @type Function
         */
        this.callback = callback;
        
        /**
         * This field indicates the alignment of the menu item relative to the drawing element.
         * It's a string made of two characters:<ul>
         *  <li><tt>'l'</tt>, <tt>'c'</tt> or <tt>'r'</tt> - left, center or right, respectively, for the horizontal alignment</li>
         *  <li><tt>'t'</tt>, <tt>'c'</tt> or <tt>'b'</tt> - top, center or bottom, respectively, for the vertical alignment</li>
         * </ul>
         * @type String
         */
        this.align = align;

        this._strokeStyle = Webgram.Styles.getStrokeStyle('action-menu-item');
        this._fillStyle = Webgram.Styles.getFillStyle('action-menu-item');
        this._hoveredStrokeStyle = Webgram.Styles.getStrokeStyle('action-menu-item-hover');
        this._hoveredFillStyle = Webgram.Styles.getFillStyle('action-menu-item-hover');

        
        /* events */
        
        /**
         * An event that is triggered when the menu item is activated (either by the user or by a call to
         * {@link Webgram.ActionMenuItem#activate}).<br>
         * Handlers receive no arguments. 
         * @type Webgram.Event
         */
        this.onActivate = new Webgram.Event('click', this); /* () */
    },
    
    draw: function () {
        var image = this.getImageStore().get(this.icon);
        if (!image) {
            return;
        }
        
        var radius = this.getRadius();
        var rect = new Webgram.Geometry.Rectangle(-radius, -radius, radius, radius);
        this.drawPoly(rect.getPoly().getRotated(this.drawingElement.getRotationAngle()), true);
        if (this.getFocusType() === Webgram.ActionMenuItem.FOCUS_HOVERED) {
            this.paint(this._hoveredStrokeStyle, this._hoveredFillStyle);
            this.drawImage(image, null, null, 0, 1);
        }
        else {
            this.paint();
            this.drawImage(image, null, null, 0, 0.5);
        }
    },
    
    getCursor: function () {
        return 'pointer';
    },
    
    /**
     * Returns a stroke style used by this control point.
     * @param {Boolean} hover if <tt>true</tt> returns the hover stroke style, otherwise returns the normal stroke style
     * @returns {Webgram.Styles.StrokeStyle} a stroke style of this control point
     */
    getStrokeStyle: function (hover) {
        if (hover) {
            return this._strokeStyle;
        }
        else {
            return this._hoveredStrokeStyle;
        }
    },

    /**
     * Sets a stroke style used by this control point.
     * @param {Webgram.Styles.StrokeStyle} strokeStyle a stroke style to be used by this control point
     * @param {Boolean} hovered if <tt>true</tt> sets the hover stroke style, otherwise sets the normal stroke style
     */
    setStrokeStyle: function (strokeStyle, hovered) {
        if (hovered) {
            this._hoveredStrokeStyle = strokeStyle;
        }
        else {
            this._strokeStyle = strokeStyle;
        }
    },

    /**
     * Returns a fill style used by this control point.
     * @param {Boolean} hover if <tt>true</tt> returns the hover fill style, otherwise returns the normal fill style
     * @returns {Webgram.Styles.FillStyle} a fill style of this control point
     */
    getFillStyle: function (hover) {
        if (hover) {
            return this._hoveredFillStyle;
        }
        else {
            return this._fillStyle;
        }
    },

    /**
     * Sets a fill style used by this control point.
     * @param {Webgram.Styles.FillStyle} fillStyle a fill style to be used by this control point
     * @param {Boolean} hovered if <tt>true</tt> sets the hover fill style, otherwise sets the normal fill style
     */
    setFillStyle: function (fillStyle, hovered) {
        if (hovered) {
            this._hoveredFillStyle = fillStyle;
        }
        else {
            this._fillStyle = fillStyle;
        }
    },

    computeAnchor: function () {
        var bounds = this.drawingElement.getBoundingPoints();
        
        if (this.align[0] === 't') {
            if (this.align[1] === 'l') {
                return bounds.topLeft;
            }
            else if (this.align[1] === 'c') {
                return bounds.top;
            }
            else if (this.align[1] === 'r') {
                return bounds.topRight;
            }
        }
        if (this.align[0] === 'b') {
            if (this.align[1] === 'l') {
                return bounds.bottomLeft;
            }
            else if (this.align[1] === 'c') {
                return bounds.bottom;
            }
            else if (this.align[1] === 'r') {
                return bounds.bottomRight;
            }
        }
        if (this.align[0] === 'l') {
            if (this.align[1] === 't') {
                return bounds.topLeft;
            }
            else if (this.align[1] === 'c') {
                return bounds.left;
            }
            else if (this.align[1] === 'b') {
                return bounds.bottomLeft;
            }
        }
        if (this.align[0] === 'r') {
            if (this.align[1] === 't') {
                return bounds.topRight;
            }
            else if (this.align[1] === 'c') {
                return bounds.right;
            }
            else if (this.align[1] === 'b') {
                return bounds.bottomRight;
            }
        }
    },
    
    update: function () {
        var anchor = this.computeAnchor();
        anchor = this.drawingElement.rotateDirect(this.drawingElement.translateDirect(anchor));
        var offsets = this._getOffsets();
        this._anchor = anchor.getTranslated(offsets.x, offsets.y).getRotated(this.drawingElement.getRotationAngle(), anchor);
    },
    
    /**
     * Performs the action associated with this menu item.
     * This is basically called when the user clicks on the item.
     * The associated action consists of a call to <tt>callback</tt>
     * and a trigger of the <tt>onActivate</tt> event.
     */
    activate: function () {
        this.callback.call(this);
        this.onActivate.trigger();
    },
    
    
    /* private methods */
    
    _getSiblingCounts: function () {
        var beforeCount = 0;
        var totalCount = 0;
        var before = true;
        
        for (var i = 0; i < this.drawingElement._actionMenuItems.length; i++) {
            var actionMenuItem = this.drawingElement._actionMenuItems[i];
            if (actionMenuItem === this) {
                before = false;
            }
            
            if (actionMenuItem.align === this.align) {
                if (before) {
                    beforeCount++;
                }
                totalCount++;
            }
        }
        
        return [beforeCount, totalCount];
    },
    
    _getOffsets: function () {
        var zoomFactor = this.getZoomFactor();
        var strokeStyle = this.drawingElement.getStrokeStyle();
        var thickness = strokeStyle.lineWidth / 2;
        var x = 0;
        var y = 0;
        var offsetX = 20;
        var offsetY = 20;
        var offsets = this.getOffsets();
        
        var counts = this._getSiblingCounts();
        var beforeCount = counts[0];
        var totalCount = counts[1];
        var radius = this.getRadius();
        
        if (this.align[0] === 't' || this.align[0] === 'b') {
            if (this.align[0] === 't') {
                y = -radius - offsetY;
            }
            else {
                y = radius + offsetY;
            }
            
            if (this.align[1] === 'l') {
                x = radius * 2 * beforeCount;
            }
            else if (this.align[1] === 'c') {
                x = radius * 2 * (beforeCount - (totalCount - 1) / 2);
            }
            else if (this.align[1] === 'r') {
                x = -radius * 2 * beforeCount;
            }
        }
        if (this.align[0] === 'l' || this.align[0] === 'r') {
            if (this.align[0] === 'l') {
                x = -radius - offsetX;
            }
            else {
                x = radius + offsetX;
            }
            
            if (this.align[1] === 't') {
                y = radius * 2 * beforeCount;
            }
            else if (this.align[1] === 'c') {
                y = radius * 2 * (beforeCount - (totalCount - 1) / 2);
            }
            else if (this.align[1] === 'b') {
                y = -radius * 2 * beforeCount;
            }
        }
        
        x = Math.round(x);
        y = Math.round(y);
        
        x /= zoomFactor;
        y /= zoomFactor;
        
        if (offsets.x > 0) {
            x += thickness;
        } else if (offsets.x < 0) {
            x -= thickness;
        }
        
        if (offsets.y > 0) {
            y += thickness;
        } else if (offsets.y < 0) {
            y -= thickness;
        }
        
        return {
            x : x,
            y : y
        };
    }
});
