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
 * @class A special control point that is capable to drag along
 * the end points connected to it.
 * @extends Webgram.ControlPoint
 * @see Webgram.Connectors.EndPoint
 * @param {Function} anchorFunc a function used to compute the anchor of the socket;
 * it's called with the drawing element as <tt>this</tt> and receives the socket as argument
 */
Webgram.Connectors.Socket = function (anchorFunc) {
    Webgram.ControlPoint.call(this);
    
    this.radius = 10;

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
};

Webgram.Connectors.Socket.prototype = {
    draw: function () {
        var image;
        var alpha = 1;
        
        if (this.getFocusType() !== Webgram.ControlPoint.FOCUS_HOVERED) {
            return;
        }
        
        image = this.getImageStore().get('socket');
        if (!image) {
            return;
        }
        
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0, alpha);
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
        this._endPoints.push(endPoint);
        endPoint.socket = this;
        endPoint.onConnect.trigger(this);
        endPoint.movePoint(this.getAnchor());
        
        this.onConnect.trigger(endPoint);
        
        var connector = endPoint.drawingElement;
        connector.onConnect.trigger(endPoint, this);
        
        if (connector.webgram) {
            connector.webgram.onDrawingElementInteract.trigger(connector, this.drawingElement, 'connect');
        }
    },
    
    /**
     * Disconnects an end point from this socket.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Connectors.EndPoint} endPoint the end point to disconnect
     */
    disconnect: function (endPoint) {
        if (endPoint != null) {
            var index = Webgram.Utils.indexOf(this._endPoints, endPoint);
            
            if (index === -1) { /* not connected to this endPoint */
                return;
            }
            
            this.onDisconnect.trigger(endPoint);
            endPoint.onDisconnect.trigger(this);
            endPoint.socket = null;
            this._endPoints.splice(index, 1);
            
            var connector = endPoint.drawingElement;
            connector.onDisconnect.trigger(endPoint, this);
        }
        else {
            this.onDisconnect.trigger(endPoint);
            
            for (var i = 0; i < this._endPoints.length; i++) {
                var endPoint = this._endPoints[i];
                endPoint.onDisconnect.trigger(this);
                endPoint.socket = null;

                var connector = endPoint.drawingElement;
                connector.onDisconnect.trigger(endPoint, this);
                
                if (connector.webgram) {
                    connector.webgram.onDrawingElementInteract.trigger(connector, this.drawingElement, 'disconnect');
                }
            }
            
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
        return true;
    },
    
    /**
     * Returns the index of this socket in the array
     * of sockets of the drawing element.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the index of this socket
     */
    getIndex: function () {
        for (var i = 0; i < this.drawingElement._sockets.length; i++) {
            if (this.drawingElement._sockets[i] === this) {
                return i;
            }
        }
        
        return -1;
    },
    
    _dragAlongEndPoints: function () {
        /* (indirectly) move all end points connected to this socket */ 
        for (var i = 0; i < this._endPoints.length; i++) {
            var endPoint = this._endPoints[i];
            endPoint.movePoint(this.getAnchor());
        }
    },
};

Webgram.Class('Webgram.Connectors.Socket', Webgram.ControlPoint);
