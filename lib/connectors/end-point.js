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


Webgram.Namespace('Webgram.Connectors');


/**
 * @class A special poly control point that remains connected to sockets.
 * This control point class can only be used with instances of
 * {@link Webgram.Connectors.Connector}.
 * @extends Webgram.DrawingElements.PolyElement.PolyControlPoint
 * @see Webgram.Connectors.Connector
 * @see Webgram.Connectors.Socket
 * @param {Number} polyPointIndex the index of the polygonal point to control
 */
Webgram.Connectors.EndPoint = function (polyPointIndex) {
    Webgram.DrawingElements.PolyElement.PolyControlPoint.call(this, polyPointIndex);
    
    /**
     * The socket that this endPoint is connected to,
     * or <tt>null</tt> if it is not connected.
     */
    this.socket = null;
    
    /**
     * An event that is triggered when this end point is connected to a socket.<br>
     * Handlers receive the following arguments: <tt>(socket)</tt> 
     * @type Webgram.Event
     */
    this.onConnect = new Webgram.Event('connect', this); /* (socket) */

    /**
     * An event that is triggered when this end point is disconnected from a socket.<br>
     * Handlers receive the following arguments: <tt>(socket)</tt> 
     * @type Webgram.Event
     */
    this.onDisconnect = new Webgram.Event('disconnect', this); /* (socket) */
    
    this._hoveredDrawingElement = null;
    
    this.onEndMove.bind(function () {
        /* unmark the hovered DE */
        this._setHoveredDrawingElement(null);
    });
};

Webgram.Connectors.EndPoint.prototype = {
    /**
     * Tells whether this end point is connected to a socket or not.
     * @returns {Boolean} <tt>true</tt> if it's connected, <tt>false</tt> otherwise
     */
    isConnected: function () {
        return this.socket != null;
    },
    
    /**
     * Moves the corresponding connector point to the given coordinates.
     * @param {Webgram.Geometry.Point} point the point with the new coordinates
     */
    movePoint: function (point) {
        this.drawingElement._setShapePoint(this.polyPointIndex, point, true, true);
    },
    
    drawBase: function () {
        if (this.isConnected()) {
            var alpha = 1;
            var image = this.getImageStore().get('end-point-connected');
            if (!image) {
                return;
            }
            
            if (this.drawingElement.getFocusType() === Webgram.DrawingElement.FOCUS_HOVERED) {
                alpha = 0.5;
            }
            
            this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0, alpha);
        }
        else {
            Webgram.DrawingElements.PolyElement.PolyControlPoint.prototype.drawBase.call(this);
        }
    },
    
    processMove: function (point, vanillaPoint) {
        Webgram.DrawingElements.PolyElement.PolyControlPoint.prototype.processMove.call(this, point, vanillaPoint);
        
        this._checkConnect();
    },
        
    _checkConnect: function () {
        var hoveredSocket = this._getHoveredSocket(this.getAnchor());
        if (hoveredSocket) {
            if (this.socket) { /* connected */
                if (hoveredSocket !== this.socket) {
                    this.socket.disconnect(this);
                    hoveredSocket.connect(this);
                }
            }
            else { /* not (yet) connected */
                hoveredSocket.connect(this);
            }
            
            this._setHoveredDrawingElement(null); /* clear the hovered DE */
        }
        else { /* outside of any socket */
            if (this.socket) { /* disconnect from the previously connected socket */
                this.socket.disconnect(this);
            }
            
            var hoveredDrawingElement = this._getHoveredDrawingElement();
            this._setHoveredDrawingElement(hoveredDrawingElement);
        }
    },
    
    _getHoveredSocket: function (point) {
        /* stick with the connected socket, if any */
        if (this.socket && this.socket.pointInside(point)) {
            return this.socket;
        }
        
        if (this.drawingElement._parent == null) {
            return null;
        }
        
        var siblings = this.drawingElement._parent.drawingElements;
        for (var i = siblings.length - 1; i >= 0; i--) {
            var sibling = siblings[i];
            if (sibling === this.drawingElement) {
                continue;
            }
            
            var socket = sibling.pointInsideSocket(point);
            if (socket) {
                return socket;
            }
        }
        
        return null;
    },
    
    _getHoveredDrawingElement: function () {
        var siblings = this.drawingElement._parent.drawingElements;
        var point = this.getAnchor();
        
        for (var i = siblings.length - 1; i >= 0; i--) {
            var sibling = siblings[i];
            if (sibling === this.drawingElement) {
                continue;
            }
            
            if (sibling.pointInside(point, true)) {
                return sibling;
            }
        }
        
        return null;
    },
    
    _setHoveredDrawingElement: function (drawingElement) {
        if (this._hoveredDrawingElement === drawingElement) {
            return;
        }
        
        var socket, i;
        if (this._hoveredDrawingElement) {
            for (i = 0; i < this._hoveredDrawingElement._sockets.length; i++) {
                socket = this._hoveredDrawingElement._sockets[i];
                socket.setFocusType(Webgram.ControlPoint.FOCUS_NONE);
            }
        }
        
        this._hoveredDrawingElement = drawingElement;
        
        if (this._hoveredDrawingElement) {
            for (i = 0; i < this._hoveredDrawingElement._sockets.length; i++) {
                socket = this._hoveredDrawingElement._sockets[i];
                socket.setFocusType(Webgram.ControlPoint.FOCUS_HOVERED);
            }
        }
    }
};

Webgram.Class('Webgram.Connectors.EndPoint', Webgram.DrawingElements.PolyElement.PolyControlPoint);
