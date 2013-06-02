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


Webgram.Connectors.EndPoint =
        Webgram.Class.extend( /** @lends Webgram.Connectors.EndPoint.prototype */ {

    /**
     * An augmentation class that makes a control point remain connected to sockets.
     * @constructs Webgram.Connectors.EndPoint
     * @see Webgram.Connectors.Socket
     */
    initialize: function EndPoint() {
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
            /* clear the hovered DE */
            this._setHoveredDrawingElement(null); // TODO is this needed?
        });
    },
    
    /**
     * Tells whether this end point is connected to a socket or not.
     * @returns {Boolean} <tt>true</tt> if it's connected, <tt>false</tt> otherwise
     */
    isConnected: function () {
        return this.socket != null;
    },
        
    drawBase: function () {
        //TODO move this to PolyEndPoint
        if (this.isConnected()) {
            var alpha = 1;
            var image = this.getImageStore().get('end-point-connected');
            if (!image) {
                return;
            }
            
            if (this.drawingElement.getFocusType() === Webgram.DrawingElement.FOCUS_HOVERED) {
                alpha = 0.5;
            }
            
            this.drawImage(image, null, null, 0, alpha);
        }
        else {
            this.constructor.parent.drawBase.call(this);
        }
    },
    
    processMove: function (point) {
        // TODO implement snapping to socket here
        //this.callSuper(point);
        
        this._checkConnect();
    },

    _checkConnect: function () {
        var hoveredObject = this._getHoveredObject();
        if (hoveredObject instanceof Webgram.Connectors.Socket) {
            if (this.socket) { /* connected */
                if (hoveredObject !== this.socket) {
                    this.socket.disconnect(this);
                    hoveredObject.connect(this);
                }
            }
            else { /* not (yet) connected */
                hoveredObject.connect(this);
            }
            
            /* clear the hovered DE */
            this._setHoveredDrawingElement(null);
        }
        else {
            /* hoveredObject is either a drawing element or null */
            
            if (this.socket) { /* disconnect from the previously connected socket */
                this.socket.disconnect(this);
            }
            
            /* recompute the hovered DE */
            this._setHoveredDrawingElement(hoveredObject);
        }
    },
    
    _getHoveredObject: function () {
        /* returns either a socket, an element or null */
        var point = this.getAnchor(true);
        
        /* stick with the connected socket, if any */
        if (this.socket && this.socket.pointInside(point)) {
            return this.socket;
        }
        
        /* parse the list backwards to honour the index order */
        // TODO the zIndex should be considered here, maybe a getDrawingElements method can take that into account
        var siblings = this.drawingElement._parent._drawingElements;
        for (var i = siblings.length - 1; i >= 0; i--) {
            var sibling = siblings[i];
            if (sibling === this.drawingElement) {
                continue; /* ignore this element */
            }
            
            var notHoveredWithEndPoint = !Boolean(sibling._hoveredWithEndPoint);
            if (notHoveredWithEndPoint) {
                /* temporary set this flag so that Socket.pointInside works */
                sibling._hoveredWithEndPoint = true;
            }
            var socket = sibling.pointInsideControlPoint(point);
            if (!(socket instanceof Webgram.Connectors.Socket)) {
                socket = null;
            }
            if (notHoveredWithEndPoint) {
                /* remove the temporary flag */
                delete sibling._hoveredWithEndPoint;
            }
            
            if (socket) {
                return socket;
            }
            
            if (sibling.transformedPointInside(point)) {
                return sibling;
            }
        }
        
        return null;
    },
    
    _setHoveredDrawingElement: function (drawingElement) {
        if (this._hoveredDrawingElement === drawingElement) {
            return;
        }
        
        if (this._hoveredDrawingElement) {
            this._hoveredDrawingElement._hoveredControlPointsEnabled = this._hoveredDrawingElement._originalHoveredControlPointsEnabled;
            this._hoveredDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
            delete this._hoveredDrawingElement._originalHoveredControlPointsEnabled;
            delete this._hoveredDrawingElement._hoveredWithEndPoint;
        }
        
        this._hoveredDrawingElement = drawingElement;
        
        if (this._hoveredDrawingElement) {
            this._hoveredDrawingElement._hoveredWithEndPoint = true;
            this._hoveredDrawingElement._originalHoveredControlPointsEnabled = this._hoveredDrawingElement._hoveredControlPointsEnabled;
            this._hoveredDrawingElement._hoveredControlPointsEnabled = true;
            this._hoveredDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_HOVERED);
            this._hoveredDrawingElement.invalidate();
        }
    }
});
