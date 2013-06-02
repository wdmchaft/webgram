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
            this._setHoveredDrawingElement(null); /* clear the hovered DE */
        });

        var endPoint = this;
        
        /* call checkConnect() whenever the element of this end point is moved, rotated or flipped */
        function checkConnect() {
            /* avoid recurrent call */
//            if (endPoint._checkConnectLock) {
//                return;
//            }
//            
//            endPoint._checkConnectLock = true;
            endPoint._checkConnect();
            endPoint.dragToSocket();
//            delete endPoint._checkConnectLock;
        }
        function disconnect() {
            if (endPoint.isConnected()) {
                endPoint.socket.disconnect(endPoint);
            }
        }
        
        this.onAdd.bind(function (drawingElement) {
            //drawingElement.onBeginMove.bind(disconnect);
        });

        this.onRemove.bind(function (drawingElement) {
            //drawingElement.onMove.unbind(disconnect);
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
        if (!this._checkConnect(point)) {
            this.constructor.parent.processMove.call(this, point);
        }
    },
    
    // TODO jsdoc
    dragToSocket: function () {
        if (!this.isConnected()) {
            return; /* refuse to drag if not connected */
        }
        
        var point = this.socket.getAnchor();
        point = this.socket.drawingElement.transformDirect(point);
        point = this.drawingElement.transformInverse(point);
    
        /* temporary disable any kind of snapping on the end point's element */
        Webgram.Utils.temporarySet(this.drawingElement,
                this.drawingElement.isSnapInternallyEnabled,
                this.drawingElement.setSnapInternallyEnabled, false);
        Webgram.Utils.temporarySet(this.drawingElement,
                this.drawingElement.isSnapExternallyEnabled,
                this.drawingElement.setSnapExternallyEnabled, false);
        Webgram.Utils.temporarySet(this.drawingElement,
                this.drawingElement.isSnapToGridEnabled,
                this.drawingElement.setSnapToGridEnabled, false);
        
        // TODO rather than disabling snapping, a _processMove method
        // should be defined on ControlPoint that accepts snap as an argument
        this.constructor.parent.processMove.call(this, point);
        
        Webgram.Utils.temporaryRestore(this.drawingElement);
        Webgram.Utils.temporaryRestore(this.drawingElement);
        Webgram.Utils.temporaryRestore(this.drawingElement);
    },

    _checkConnect: function (point) {
        /* connects, disconnects or leaves the end point unchanged,
         * depending on the position hovered by the given point;
         * returns true if the end point should be kept attached to the socket */
        
        if (point == null) {
            point = this.getAnchor();
        }
        
        var hoveredObject = this._getHoveredObject(point);
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
            
            return true;
        }
        else {
            /* hoveredObject is either a drawing element or null */
            
            if (this.socket) { /* disconnect from the previously connected socket */
                this.socket.disconnect(this);
            }
            
            /* recompute the hovered DE */
            this._setHoveredDrawingElement(hoveredObject);
            
            return false;
        }
    },
    
    _getHoveredObject: function (point) {
        /* returns either a socket, an element or null */
        
        point = this.drawingElement.transformDirect(point);
        
        /* stick with the connected socket, if any */
        if (this.socket && this.socket.pointInside(point)) {
            return this.socket;
        }
        
        /* parse the list backwards to honour the index order */
        var siblings = this.drawingElement.getSiblings();
        for (var i = siblings.length - 1; i >= 0; i--) {
            var sibling = siblings[i];
            if (sibling === this.drawingElement) {
                continue; /* ignore this element */
            }

            Webgram.Utils.temporarySetAttr(sibling, '_hoveredWithEndPoint', true);
            var socket = sibling.pointInsideControlPoint(point);
            Webgram.Utils.temporaryRestore(sibling);
            
            if (socket instanceof Webgram.Connectors.Socket) {
                return socket;
            }
            
            if (sibling.transformedPointInside(point)) {
                return sibling;
            }
        }
        
        return null;
    },
    
    _setHoveredDrawingElement: function (drawingElement) {
        /* marks a given element as the current hovered element
         * of this end point; clears the current hovered element
         * if called with null */
        
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
