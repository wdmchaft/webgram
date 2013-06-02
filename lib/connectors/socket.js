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


Webgram.Connectors.Socket =
        Webgram.ControlPoint.extend( /** @lends Webgram.Connectors.Socket.prototype */ {
            
    /**
     * A special control point that is capable to drag along
     * the end points connected to it.
     * @constructs Webgram.Connectors.Socket
     * @extends Webgram.ControlPoint
     * @see Webgram.Connectors.EndPoint
     * @param {Function} anchorFunc a function used to compute the anchor of the socket;
     * it's called with the drawing element as <tt>this</tt> and receives the socket as argument
     */
    initialize: function Socket(anchorFunc) {
        Webgram.Connectors.Socket.parentClass.call(this);
        
        this._endPoints = [];
        this._anchorFunc = anchorFunc;
        
        /**
         * An event that is triggered when an end point is connected to this socket.<br>
         * Handlers receive the following arguments: <tt>(endPoint)</tt>. 
         * @type Webgram.Event
         */
        this.onConnect = new Webgram.Event('connect', this); /* (endPoint) */

        /**
         * An event that is triggered when an end point is disconnected from this socket.<br>
         * Handlers receive the following arguments: <tt>(endPoint)</tt>. 
         * @type Webgram.Event
         */
        this.onDisconnect = new Webgram.Event('disconnect', this); /* (endPoint) */
        
        var socket = this;
        
        /* make sure that when this socket's element is remove,
         * the socket disconnects from all the connected end points */
        function disconnectSocket() {
            socket.disconnect();
        }
        
        this.onAdd.bind(function (drawingElement) {
            drawingElement.onRemove.bind(disconnectSocket);
        });

        this.onRemove.bind(function (drawingElement) {
            drawingElement.onRemove.unbind(disconnectSocket);
        });
    },
    
    getCursor: function () {
        return this.drawingElement.getCursor();
    },

    draw: function () {
        var image;
        var alpha = 1;
        
        if (!this.drawingElement._hoveredWithEndPoint) {
            return;
        }
        
        image = this.getImageStore().get('socket');
        if (!image) {
            return;
        }
        
        this.drawImage(image, null, null, 0, alpha);
    },
    
    pointInside: function (point) {
        if (!this.drawingElement._hoveredWithEndPoint) {
            return false;
        }
        
        return Webgram.Connectors.Socket.parent.pointInside.call(this, point);
    },
    
    computeAnchor: function () {
        return this._anchorFunc.call(this.drawingElement, this);
    },
    
    /**
     * Tells whether this socket has a connected end point or not.
     * @returns {Boolean} <tt>true</tt> if it's connected, <tt>false</tt> otherwise
     */
    isConnected: function () {
        return this._endPoints.length > 0;
    },
    
    /**
     * Connects an end point to this socket.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Connectors.EndPoint} endPoint the end point to connect
     */
    connect: function (endPoint) {
        console.log('connect');
        this._endPoints.push(endPoint);
        endPoint.socket = this;
        endPoint.onConnect.trigger(this);
        this.onConnect.trigger(endPoint);
        
        if (endPoint.drawingElement.webgram) {// TODO what do we do about this event?
            endPoint.drawingElement.webgram.onDrawingElementInteract.trigger(endPoint.drawingElement, this.drawingElement, 'connect');
        }
        
        var socket = this;

        endPoint.drawingElement.addDependency(this.drawingElement, function () {
            endPoint.dragToSocket();
        });
        
        endPoint.drawingElement.onRemove.bind(function () {
            socket.disconnect(endPoint);
        });
        
        endPoint.dragToSocket();
    },
    
    /**
     * Disconnects an end point from this socket.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Connectors.EndPoint} endPoint the end point to disconnect,
     * or <tt>null</tt> to disconnect all end points
     */
    disconnect: function (endPoint) {
        console.log('disconnect');
        if (endPoint != null) {
            var index = Webgram.Utils.indexOf(this._endPoints, endPoint);
            if (index === -1) { /* not connected to this endPoint */
                return;
            }
            
            endPoint.onDisconnect.trigger(this);
            this.onDisconnect.trigger(endPoint);
            endPoint.socket = null;
            this._endPoints.splice(index, 1);
            
            if (endPoint.drawingElement.webgram) {// TODO what do we do about this event?
                endPoint.drawingElement.webgram.onDrawingElementInteract.trigger(endPoint.drawingElement, this.drawingElement, 'disconnect');
            }
            
            endPoint.drawingElement.remDependency(this.drawingElement);
        }
        else {
            for (var i = 0; i < this._endPoints.length; i++) {
                endPoint = this._endPoints[i];
                endPoint.onDisconnect.trigger(this);
                endPoint.socket = null;
    
                if (endPoint.drawingElement.webgram) {// TODO what do we do about this event?
                    endPoint.drawingElement.webgram.onDrawingElementInteract.trigger(endPoint.drawingElement, this.drawingElement, 'disconnect');
                }
                
                endPoint.drawingElement.remDependency(this.drawingElement);
            }
            
            this.onDisconnect.trigger(endPoint);
            
            this._endPoints = [];
        }
    },
    
    /**
     * Tells whether an end point can be connected to this socket.
     * The default implementation accepts all end points.<br><br>
     * <em>(could be overridden)</em>
     * @param {Webgram.Connectors.EndPoint} endPoint the end point to be tested
     * @returns {Boolean} <tt>true</tt> if the end point can be connected to this socket, <tt>false</tt> otherwise
     */
    accepts: function (endPoint) {
        return true;//TODO use this
    }
});
