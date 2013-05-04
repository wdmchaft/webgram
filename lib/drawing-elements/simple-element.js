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
 * Contains concrete base classes for the common types of drawing elements.
 * @namespace
 */
Webgram.DrawingElements = {
};


Webgram.DrawingElements.SimpleElement = Webgram.DrawingElement.extend( /** @lends Webgram.DrawingElements.SimpleElement.prototype */ {
    /**
     * A concrete base class for elements that are formed of a given, fixed number of points.
     * @constructs Webgram.DrawingElements.SimpleElement
     * @extends Webgram.DrawingElement
     * @param {String} id a given identifier, can be <tt>null</tt>
     * @param {Array} points the list of {@link Webgram.Geometry.Point} that form this element
     */
    initialize: function SimpleElement(id, points) {
        this.callSuper(id, points);
        
        this.minPointCount = 0;
    },

    beginCreate: function (point) {
        this._setCenter(point, true);

        return true; /* accept creation */
    },
    
    continueCreate: function (point, size, mouseDown, click) {
        return false; /* stop */
    },
    
    endCreate: function () {
        return true; /* succeeded */
    }
});
