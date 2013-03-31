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
 * @namespace Contains the classes needed to implement <em>connectors</em> in webgram.
 * Connectors are polygonal drawing elements with certain <em>end points</em> that
 * remain connected to <em>sockets</em>, when these sockets move along with their drawing elements.
 */
Webgram.Connectors = Webgram.Namespace('Webgram.Connectors');

/**
 * @class A special polygonal element that has one or more instances of
 * {@link Webgram.Connectors.EndPoint} as control points and allows
 * a visual interconnection between drawing elements.
 * @extends Webgram.DrawingElements.PolyElement
 * @see Webgram.Connectors.EndPoint
 * @see Webgram.Connectors.Socket
 * @param {String} id a given identifier, can be <tt>null</tt>
 * @param {Array} points a list of {@link Webgram.Geometry.Point} objects
 */
Webgram.Connectors.Connector = function (id, points) {
    Webgram.DrawingElements.PolyElement.call(this, id, points);
    
    this.zIndex = 10;
    
    /**
     * An event that is triggered whenever the connector is connected to a socket.<br>
     * Handlers receive the following arguments: <tt>(endPoint, socket)</tt> 
     * @type Webgram.Event
     */
    this.onConnect = new Webgram.Event('connect', this); /* (endPoint, socket) */

    /**
     * An event that is triggered whenever the connector is disconnected from a socket.<br>
     * Handlers receive the following arguments: <tt>(endPoint, socket)</tt> 
     * @type Webgram.Event
     */
    this.onDisconnect = new Webgram.Event('disconnect', this); /* (endPoint, socket) */
    
    this.addJsonFuncs('connections', this._connectionsToJson, this._connectionsFromJson);
};

Webgram.Connectors.Connector.prototype = {
    draw: function () {
        this.drawPoly(this.getDrawingPoly(), false);
        this.paint(undefined, null);
    },
    
    saveParentRelativePosition: function () {
        var parentWidth = this._parent.getWidth();
        var parentHeight = this._parent.getHeight();
        
        this._parentRelativePositions = [];
        for (var i = 0; i < this.getShape().points.length; i++) {
            var point = this.getShapePoint(i, true, true);
            
            this._parentRelativePositions.push({
                x: point.x / (parentWidth - 1),
                y: point.y / (parentHeight - 1)
            });
        }
    },
    
    restoreParentRelativePosition: function () {
        var parentWidth = this._parent.getWidth();
        var parentHeight = this._parent.getHeight();
        var shape = this.getShape();
        var changed = false;
        
        /* update shape points */
        for (var i = 0; i < shape.points.length; i++) {
            var controlPoint = this.getPolyControlPointByIndex(i);
            if (controlPoint && (controlPoint instanceof Webgram.Connectors.EndPoint) && controlPoint.isConnected()) {
                continue;
            }
            
            var percents = this._parentRelativePositions[i];
            if (percents == null) {
                continue;
            }
            
            var point = new Webgram.Geometry.Point(
                percents.x * (parentWidth - 1),
                percents.y * (parentHeight - 1)
            );
            
            changed = changed || this.setTransformedShapePoint(i, point);
        }
        
        return changed;
    },

    remControlPoint: function (controlPoint) {
        /* we have to override this method in order to disconnect
         * an end point before removing actually it */
        
        if (controlPoint instanceof Webgram.Connectors.EndPoint && controlPoint.isConnected()) {
            controlPoint.socket.disconnect(controlPoint);
        }
        
        Webgram.DrawingElements.PolyElement.prototype.remControlPoint.call(this, controlPoint);
    },
    
    getPolyControlPointClass: function (index) {
        return Webgram.Connectors.EndPoint;
    },
    
    snapExternally: function (index, point, fixedPoints, rotationAngle, center) {
        var result = this._snapToSockets(index, point, fixedPoints, rotationAngle, center);
        if (result != null) {
            return result;
        }
        
        return Webgram.DrawingElement.prototype.snapExternally.call(this, index, point, fixedPoints, rotationAngle, center);
    },
    
    setEditEnabled: function (enabled) {
        if (!enabled) {
            /* disconnect all endPoints before removing them */
            this._disconnectAllEndPoints();
        }
        
        Webgram.DrawingElements.PolyElement.prototype.setEditEnabled.call(this, enabled);
    },
    
    getEndPoints: function () {
        return this.getControlPoints(Webgram.Connectors.EndPoint);
    },
    
    moveTo: function (point) {
        /* we override this function because we want to make it harder
         * to move a connector when at least one of its end points is connected.
         * The move distance has to be greater than a threshold in order to move
         * the element. */
        
        var endPoints = this.getEndPoints();
        var endPoint = null;
        for (var i = 0; i < endPoints.length; i++) {
            if (endPoints[i].isConnected()) {
                endPoint = endPoints[i];
                break;
            }
        }
        
        if (endPoint) { /* at least an end point is connected */
            var center = this.getCenter();
            var dist = center.getDistanceTo(point);
            if (dist < 4 * endPoint.getRadius()) {
                return;
            }
        }
        
        this._disconnectAllEndPoints();
        
        Webgram.DrawingElement.prototype.moveTo.call(this, point);
    },
    
    flipHorizontally: function () {
        /* we override this method because we want
         * a connector to disconnect when flipped */
        
        if (!this.isFlipEnabled()) {
            return;
        }
        
        this._disconnectAllEndPoints();

        Webgram.DrawingElements.PolyElement.prototype.flipHorizontally.call(this);
    },
    
    flipVertically: function () {
        /* we override this method because we want
         * a connector to disconnect when flipped */
        
        if (!this.isFlipEnabled()) {
            return;
        }
        
        this._disconnectAllEndPoints();

        Webgram.DrawingElements.PolyElement.prototype.flipVertically.call(this);
    },

    continueCreate: function (point, size, mouseDown, click) {
        /* we override this method because we want to stop the creation
         * when an end point (different than the very first one) gets connected */
        
        var count = this.getShape().points.length;
        if (click && count > 1 && count >= this.minPointCount) {
            var controlPoint = this.getPolyControlPointByIndex(count - 1);
            if (controlPoint instanceof Webgram.Connectors.EndPoint && controlPoint.isConnected()) {
                this._pendingCreatePoint = false;
                return false; /* stop */
            }
        }
        
        return Webgram.DrawingElements.PolyElement.prototype.continueCreate.call(this, point, size, mouseDown, click);
    },
    
    isSnapExternallyEnabled: function () {
        /* a connector cannot function without this feature enabled */
        
        return true;
    },
    
    _snapToSockets: function (index, point, fixedPoints, rotationAngle, center) {
        var endPoint = this.getPolyControlPointByIndex(index);
        if (!(endPoint instanceof Webgram.Connectors.EndPoint)) {
            return null;
        }
        
        /* rotate the point to get the actual position,
         * relative to the parent */
        point = point.getRotated(rotationAngle, center);
        
        /* if the end point is over a socket, 
         * place it directly in the middle of the socket */
        var socket = endPoint._getHoveredSocket(point);
        if (socket) {
            return socket.getAnchor().getRotated(-rotationAngle, center);
        }
    },
    
    _setRotationAngle: function (angle, triggerEvents) {
        if (this._rotationAngle !== angle) {
            this._disconnectAllEndPoints();
        }
        
        Webgram.DrawingElements.PolyElement.prototype._setRotationAngle.call(this, angle, triggerEvents);
    },
    
    _disconnectAllEndPoints: function () {
        /* create an undo check point
         * just before the connector gets disconnected */
        
        var endPoints = this.getEndPoints();
        
        for (var i = 0; i < endPoints.length; i++) {
            var endPoint = endPoints[i];
            if (endPoint.isConnected()) {
                /* initiating the shape change so that an undo check point
                 *  is being created right before disconnecting
                 * the first end point */
                this.beginShapeChange();
                
                endPoint.socket.disconnect(endPoint);
            }
        }
    },
    
    _connectionsToJson: function (useObjRefs) {
        var connections = [];
        
        var endPoints = this.getEndPoints();
        for (var i = 0; i < endPoints.length; i++) {
            var endPoint = endPoints[i];
            if (!endPoint.isConnected()) {
                continue;
            }
            
            var socket = endPoint.socket;
            var drawingElement = socket.drawingElement;
            
            connections.push({
                'element': useObjRefs ? drawingElement : drawingElement.getId(),
                'endPointIndex': endPoint.polyPointIndex,
                'socketIndex': socket.getIndex()
            });
        }
        
        return connections;
    },
    
    _connectionsFromJson: function (json) {
        /* what we do here is to disconnect all the no longer connected
         * end points, and connect any new end points */
        
        if (this.webgram == null) {
            return; /* cannot restore connections if element is not added to a webgram */
        }
        
        var key, drawingElement, socket, endPoint;
        var stillConnections = {};
        var oldConnections = {};

        /* gather info about existing connections */
        var endPoints = this.getEndPoints();
        for (var i = 0; i < endPoints.length; i++) {
            endPoint = endPoints[i];
            if (!endPoint.isConnected()) {
                continue;
            }
            
            socket = endPoint.socket;
            drawingElement = socket.drawingElement;
            
            key = drawingElement.getId() + '|' + endPoint.polyPointIndex + '|' + socket.getIndex();
            oldConnections[key] = true;
        }
        
        /* create any new connections */
        for (i = 0; i < json.length; i++) {
            var connection = json[i];
            
            /* treat the two cases: (1) objects as refs and (2) ids as refs */
            var elementId;
            if (connection.element instanceof Webgram.DrawingElement) {
                elementId = connection.element.getId();
                drawingElement = connection.element;
            }
            else {
                elementId = connection.element;
                drawingElement = this.webgram.getDrawingElementById(connection.element);
            }

            if (drawingElement == null) {
                continue; /* not found for some reason */
            }
            
            key = elementId + '|' + connection.endPointIndex + '|' + connection.socketIndex;
            stillConnections[key] = true;
            if (key in oldConnections) {
                continue; /* connection already exists */
            }
            
            endPoint = this.getPolyControlPointByIndex(connection.endPointIndex);
            if (endPoint == null) {
                continue; /* not found for some reason */
            }
        
            socket = drawingElement.getSockets()[connection.socketIndex];
            if (socket == null) {
                continue; /* not found for some reason */
            }
            
            socket.connect(endPoint);
        }
        
        /* destroy old connections */
        for (i = 0; i < endPoints.length; i++) {
            endPoint = endPoints[i];
            if (!endPoint.isConnected()) {
                continue;
            }
            
            socket = endPoint.socket;
            drawingElement = socket.drawingElement;
            
            key = drawingElement.getId() + '|' + endPoint.polyPointIndex + '|' + socket.getIndex();
            if (key in stillConnections) {
                continue; /* connection still exists */
            }
            
            socket.disconnect(endPoint);
        }
    }
};

Webgram.Class('Webgram.Connectors.Connector', Webgram.DrawingElements.PolyElement);
