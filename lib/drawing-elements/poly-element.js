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


Webgram.DrawingElements.PolyElement =
        Webgram.DrawingElement.extend( /** @lends Webgram.DrawingElements.PolyElement.prototype */ {
    
    /**
     * A base class for polygonal drawing elements.
     * @constructs Webgram.DrawingElements.PolyElement
     * @extends Webgram.DrawingElement
     * @param {String} id a given identifier, can be <tt>null</tt>
     * @param {Array} points a list of {@link Webgram.Geometry.Point} objects
     * that form the shape of this polygonal element
     */
    initialize: function PolyElement(id, points) {
        this.callSuper(id);

        /**
         * <tt>true</tt> if the polygonal element is a closed shape, <tt>false</tt> otherwise.
         * For example, a <em>polygon</em> is closed, while a <em>polyline</em> is not.
         * @type Boolean
         */
        this.closed = false; /* a polygon is closed while a polyline is not */
        
        /**
         * The maximal number of points that the polygonal element is allowed to have.
         * @type Number
         */
        this.maxPointCount = Infinity;
        
        /**
         * The minimal number of points that the polygonal element is allowed to have.
         * The absolute minimal number of points is <tt>2</tt>.
         * @type Number
         */
        this.minPointCount = 2;
        
        this._points = points || [];
        
        this._additionPoint = null; /* the point that is marked for addition */
        this._pendingCreatePoint = false; /* true while creating if there's a point being created */
        this._removalIndex = -1; /* the index of the point that is marked for removal, or -1 */
        this._removeDistance = 10; /* the distance below which a point becomes marked for removal */
        
        this._addRemovePointsEnabled = false;
        this._editEnabled = false;

        
        /* events */
        
        /**
         * An event that is triggered when a poly point is added to this element.<br>
         * Handlers receive the following arguments: <tt>(index, point)</tt> 
         * @type Webgram.Event
         */
        this.onAddPoint = new Webgram.Event('add point', this); /* (index, point) */

        /**
         * An event that is triggered when a poly point is removed from this element.<br>
         * Handlers receive the following arguments: <tt>(index, point)</tt> 
         * @type Webgram.Event
         */
        this.onRemovePoint = new Webgram.Event('remove point', this); /* (index, point) */

        this.onMouseDown.bind(function (point, modifiers) {
            this._addMarkedPoint();
        });

        this.onMouseMove.bind(function (point, modifiers) {
            this._markAdditionPoint(point);
        });

        this.onMouseLeave.bind(function (modifiers) {
            this._markAdditionPoint(null);
        });
    },

    
    /* drawing methods */
    
    drawNoZoom: function () {
        if (this.isAddRemovePointsEnabled() &&
           (this.getFocusType() === Webgram.DrawingElement.FOCUS_HOVERED ||
            this.getFocusType() === Webgram.DrawingElement.FOCUS_SELECTED)) {
            
            this.drawAdditionPoint();
        }
    },
    
    drawDecoration: function () {
        if (this._points.length <= 1) {
            return;
        }
        else if (this._points.length === 2) {
            switch (this.getFocusType()) {
                case Webgram.DrawingElement.FOCUS_NONE:
                    break;
                
                case Webgram.DrawingElement.FOCUS_HOVERED:
                    if (this._hoveredDecorationStyle) {
                        this.drawPoly(this.getLineTolerancePoly(), true);
                        this.paint(this._hoveredDecorationStyle, null);
                    }
                    
                    break;
                
                case Webgram.DrawingElement.FOCUS_SELECTED:
                    if (this._selectedDecorationStyle) {
                        this.drawPoly(this.getLineTolerancePoly(), true);
                        this.paint(this._selectedDecorationStyle, null);
                    }
                    
                    break;
            }
        }
        else {
            this.callSuper();
        }
    },

    /**
     * Draws the point that is marked for addition.
     */
    drawAdditionPoint: function () {
        if (!this._additionPoint) {
            return;
        }
        
        var image = this.getImageStore().get('poly-point');
        if (!image) {
            return;
        }
        
        this.drawImage(image.content, this._additionPoint, image.size, 0, 0.5);
    },
    
    
    /* shape */
    
    pointInside: function (point) {
        if (this._points.length <= 1) { /* a single point or nothing - either way the answer is no */
            return false;
        }
        
        if (this.closed && this._points.length > 2) {
            poly = this.getPoly();
        }
        else {
            poly = this.getLineTolerancePoly();
        }
        
        return poly.pointInside(point);
    },

    getBoundingRectangle: function () {
        return this.getPoly().getBoundingRectangle();
    },
    
    /**
     * Adds a new point to this polygonal element.
     * @param {Number} index the position where the point will be added
     * @param {Webgram.Geometry.Point} point the point to add
     * @returns {Boolean} <tt>true</tt> if the point was added,
     * <tt>false</tt> otherwise
     */
    addPoint: function (index, point) {
        var result = this._addPoint(index, point, false);
        this.finishShapeEvents();
        
        return result;
    },
    
    _addPoint: function (index, point, snap) {
        if (index < 0 || index > this._points.length || this._points.length >= this.maxPointCount) {
            return false;
        }
        
        this.beginShapeChange();
        
        /* effectively add the shape point */
        this._points.splice(index, 0, point);
        
        this.onShapeChange.trigger();
        this.onAddPoint.trigger(index, point);
        
        this._recenter();
        
        this.invalidate(true);
        this.updateDependentElements();

        /* update the poly control point indices */
        var polyControlPoints = this.getPolyControlPoints();
        for (var i = 0; i < polyControlPoints.length; i++) {
            var controlPoint = polyControlPoints[i];
            
            if (controlPoint.polyPointIndex >= index) {
                controlPoint.polyPointIndex += 1;
            }
        }
        
        this._updatePolyControlPoints();
        
        return true;
    },
    
    /**
     * Removes a point from this polygonal element.
     * @param {Number} index the position of the point to be removed
     * @returns {Boolean} <tt>true</tt> if the point was removed,
     * <tt>false</tt> otherwise
     */
    remPoint: function (index) {
        var result = this._remPoint(index);
        this.finishShapeEvents();
        
        return result;
    },
    
    _remPoint: function (index) {
        if (index < 0 || index >= this._points.length || this._points.length <= this.minPointCount) {
            return false;
        }
        
        this.beginShapeChange();
        
        /* effectively remove the shape point */
        var point = this._points[index];
        this._points.splice(index, 1);
        
        this.onShapeChange.trigger();
        this.onRemovePoint.trigger(index, point);
        
        this._recenter();
        
        this.invalidate(true);
        this.updateDependentElements();

        var controlPoint, i;
        
        /* remove the given point & associated control point */
        var polyControlPoints = this.getPolyControlPoints();
        for (i = 0; i < polyControlPoints.length; i++) {
            controlPoint = polyControlPoints[i];
            
            if (controlPoint.polyPointIndex === index) {
                this.remControlPoint(controlPoint);
            }
        }
        
        /* update the poly control point indices */
        polyControlPoints = this.getPolyControlPoints();
        for (i = 0; i < polyControlPoints.length; i++) {
            controlPoint = polyControlPoints[i];
            
            if (controlPoint.polyPointIndex > index) {
                controlPoint.polyPointIndex -= 1;
            }
        }
        
        this._updatePolyControlPoints();
        
        return true;
    },
    
    /**
     * Modifies a point of this polygonal element.
     * @param {Number} index the index of the point to modify
     * @param {Webgram.Geometry.Point} point the new point
     * @returns {Boolean} <tt>true</tt> if the point was modified,
     * <tt>false</tt> otherwise
     */
    setPoint: function (index, point) {
        var result = this._setPoint(index, point, false);
        this.finishShapeEvents();
        
        return result;
    },
    
    _setPoint: function (index, point, snap) {
        if (index < 0 || index >= this._points.length) {
            return false;
        }
        
        this.beginShapeChange();
        
        this._points[index] = point;
        
        this.onShapeChange.trigger();
        
        this._recenter();
        
        this.invalidate(true);
        this.updateDependentElements();

        this._updatePolyControlPoints();
        
        return true;
    },
    
    /**
     * Returns a list of all the points of this polygonal element.
     * @returns {Array} a list with the points of this element
     */
    getPoints: function () {
        return this._points.slice();
    },
    
    /**
     * Returns a poly made of the points of this element.
     * @returns {Webgram.Geometry.Poly} the poly of this element
     */
    getPoly: function () {
        return new Webgram.Geometry.Poly(this._points);
    },
    
    _recenter: function () {
        /* moves the element so that the location
         * becomes the center of its poly */
        
        var transformedPoly = this.transformDirect(this.getPoly());
        var oldLocation = this.getLocation();
        var newLocation = transformedPoly.getCenter();
        
        if (!this._locationChanged) {
            this._locationChanged = true;
            this.onBeginMove.trigger();
        }
        
        this._location = newLocation;
        this.onMove.trigger(newLocation.x - oldLocation.x, newLocation.y - oldLocation.y);
        
        for (var i = 0; i < this._points.length; i++) {
            this._points[i] = this.transformInverse(transformedPoly.points[i]);
        }
    },
    
    /**
     * Returns the tolerance (the thickness) of the edges of this element.
     * This tolerance is used to determine if a point is over the edges or not.
     * Zooming affects the value of this tolerance.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Number} the line tolerance
     */
    getLineTolerance: function () {
        var strokeStyle = this.getStrokeStyle();
        var distance = Math.round(strokeStyle.lineWidth / 2) + 5 / this.getZoomFactor();
        
        return distance;
    },
        
    /**
     * Returns a polygon that wraps all the edges of this element.
     * This polygon is directly used to determine if a point is over
     * the edges of this element.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Poly} the line tolerance polygon
     */
    getLineTolerancePoly: function () {
        var lineTolerance = this.getLineTolerance();
        
        if (this._points.length === 0) {
            return null;
        }
        else if (this._points.length === 1) { /* only one point */
            var point = this._points[0];
            return new Webgram.Geometry.Poly([
                new Webgram.Geometry.Point(point.x - lineTolerance, point.y - lineTolerance),
                new Webgram.Geometry.Point(point.x + lineTolerance, point.y - lineTolerance),
                new Webgram.Geometry.Point(point.x + lineTolerance, point.y + lineTolerance),
                new Webgram.Geometry.Point(point.x - lineTolerance, point.y + lineTolerance)
            ]);
        }
        else if (this._points.length === 2) { /* only two points */
            var p1 = this._points[0];
            var p2 = this._points[1];
            var alpha = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            var len = lineTolerance * 1.4142135623730951; /* sqrt(2); */
            
            var a = p1.getPointAt(len, -3 * Math.PI / 4 + alpha);
            var b = p2.getPointAt(len, -Math.PI / 4 + alpha);
            var c = p2.getPointAt(len, Math.PI / 4 + alpha);
            var d = p1.getPointAt(len, 3 * Math.PI / 4 + alpha);
            
            return new Webgram.Geometry.Poly([a, b, c, d]);
        }
        else { /* more than two points */
            var polyPoints = [];
            var len = lineTolerance * 1.4142135623730951; /* sqrt(2); */
            var pi4 = Math.PI / 4;
            var p1, p2, p3;
            var alpha, alpha1, alpha2;
            var radius;
            
            for (var i = 0; i < this._points.length - 1; i++) {
                p1 = this._points[i];
                p2 = this._points[i + 1];
                
                if (i === 0) {
                    alpha1 = Webgram.Geometry.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p1.getPointAt(len, -3 * pi4 + alpha1));
                }
                
                if (i === this._points.length - 2) {
                    alpha1 = Webgram.Geometry.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p2.getPointAt(len, -pi4 + alpha1));
                }
                else {
                    p3 = this._points[i + 2];
                    alpha1 = Webgram.Geometry.normalizeAngle(p2.getAngleTo(p1));
                    alpha2 = Webgram.Geometry.normalizeAngle(p2.getAngleTo(p3));
                    radius = lineTolerance + (len - lineTolerance) * Math.abs(Math.sin(alpha2 - alpha1));
                    alpha = (alpha1 + alpha2) / 2;
                    if (alpha1 > alpha2) {
                        alpha += Math.PI;
                    }
                    polyPoints.push(p2.getPointAt(radius, alpha));
                }
            }
            
            for (i = this._points.length - 2; i >= 0; i--){
                p1 = this._points[i];
                p2 = this._points[i + 1];
                
                if (i === this._points.length - 2) {
                    alpha1 = Webgram.Geometry.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p2.getPointAt(len, pi4 + alpha1));
                }
                else {
                    p3 = this._points[i + 2];
                    alpha1 = Webgram.Geometry.normalizeAngle(p2.getAngleTo(p1));
                    alpha2 = Webgram.Geometry.normalizeAngle(p2.getAngleTo(p3));
                    radius = lineTolerance + (len - lineTolerance) * Math.abs(Math.sin(alpha2 - alpha1));
                    alpha = (alpha1 + alpha2) / 2 + Math.PI;
                    if (alpha1 > alpha2) {
                        alpha -= Math.PI;
                    }
                    polyPoints.push(p2.getPointAt(radius, alpha));
                }
                
                if (i === 0) {
                    alpha1 = Webgram.Geometry.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p1.getPointAt(len, 3 * pi4 + alpha1));
                }
            }
            
            return new Webgram.Geometry.Poly(polyPoints);
        }
    },
    
    /**
     * Tells whether the interactive addition and removal of points is enabled for this element, or not.
     * @returns {Boolean} <tt>true</tt> if the feature is enabled, <tt>false</tt> otherwise
     */
    isAddRemovePointsEnabled: function () {
        return this._addRemovePointsEnabled;
    },
    
    /**
     * Enables or disables the interactive addition and removal of points for this element.
     * @param {Boolean} enabled <tt>true</tt> to enable the feature, <tt>false</tt> to disable it
     */
    setAddRemovePointsEnabled: function (enabled) {
        this._addRemovePointsEnabled = enabled;
        
        if (!enabled) {
            this._additionPoint = null;
            this.invalidate();
        }
    },
    
    _markAdditionPoint: function (point) {
        this._additionPoint = null;
        
        if (!this.isAddRemovePointsEnabled()) {
            point = null;
        }
        if (this._points.length >= this.maxPointCount) {
            point = null;
        }
        
        if (point) {
            this._additionPoint = this._computeAdditionPoint(point);
        }
        
        this.invalidate();
    },
    
    _addMarkedPoint: function () {
        if (!this._additionPoint) {
            return;
        }
        
        var additionPointIndex = this._getAdditionPointIndex();
        if (additionPointIndex === -1) { /* not found */
            return;
        }
        
        this._addPoint(additionPointIndex, this._additionPoint, true);
        
        this._additionPoint = null;
    },
    
    _getAdditionPointIndex: function () {
        /* determine the segment that the point hovers */
        for (var i = 0; i < this._points.length; i++) {
            var point1 = this._points[i];
            var point2;
            if (i < this._points.length - 1) {
                point2 = this._points[i + 1];
            }
            else {
                point2 = this._points[0];
            }
            
            if (Webgram.Geometry.pointInSegment(this._additionPoint, point1, point2, 3)) { /* a line thickness of 3 should suffice */
                return i + 1;
            }
        }
        
        return -1;
    },

    _computeAdditionPoint: function (mousePoint) {
        /* determine the segment that the point is closest to,
         * and compute the point's projection on that segment */
        
        for (var i = 0; i < this._points.length; i++) {
            if (!this.closed && i === this._points.length - 1) {
                break;
            }
            
            var point1 = this._points[i];
            var point2;
            if (i < this._points.length - 1) {
                point2 = this._points[i + 1];
            }
            else {
                point2 = this._points[0];
            }
            
            if (Webgram.Geometry.pointInSegment(mousePoint, point1, point2, 2 * this.getLineTolerance())) {
                var x, y; // TODO this algorithm should be moved to geometry.js, inside the Line class
                if (point2.y === point1.y) {
                    y = point1.y;
                    x = mousePoint.x;
                }
                else if (point2.x === point1.x) {
                    x = point1.x;
                    y = mousePoint.y;
                }
                else {
                    var m = (point2.y - point1.y) / (point2.x - point1.x);
                    x = (mousePoint.y - point1.y + mousePoint.x / m + point1.x * m) / (m + 1 / m);
                    y = point1.y + m * (x - point1.x);
                }
                
                var additionPoint = new Webgram.Geometry.Point(x, y);
                
                /* don't mark the addition point if over a poly control point */
                var minDistThresh = this._controlPoints[0].radius * 1.5 / this.getZoomFactor();
                for (var j = 0; j < this._points.length; j++) {
                    if (additionPoint.getDistanceTo(this._points[j]) < minDistThresh) {
                        return null;
                    }
                }
                
                return additionPoint;
            }
        }
        
        return null;
    },
    
    _checkAndMarkForRemoval: function (index) {
        /* checks if a point should be marked for removal
         * (i.e. it's close enough to one of its neighbors),
         * and marks it as such by remembering its index */
        
        this._removalIndex = -1;
        
        if (this.isBeingCreated()) {
            return;
        }
        if (this._points.length <= this.minPointCount) {
            return;
        }
        if (!this.isAddRemovePointsEnabled()) {
            return;
        }
        
        var point = this._points[index];
        var point1, point2;
        if (index > 0) {
            point1 = this._points[index - 1];
        }
        else {
            point1 = this._points[this._points.length - 1];
        }
        
        if (index < this._points.length - 1) {
            point2 = this._points[index + 1];
        }
        else {
            point2 = this._points[0];
        }
        
        var dist = this._removeDistance / this.getZoomFactor();
        
        if (point.getDistanceTo(point1) < dist || point.getDistanceTo(point2) < dist) {
            this._removalIndex = index;
        }
    },
    
    _remIfMarked: function (index) {
        /* removes the point if marked for removal */
        
        if (this._removalIndex === index) {
            this._remPoint(index);
        }
        
        this._removalIndex = -1;
    },
    
    shapeToJson: function () {
        var json = [];
        for (var i = 0; i < this._points.length; i++) {
            json.push({
                x: this._points[i].x,
                y: this._points[i].y,
            });
        }
        
        return json;
    },
    
    shapeFromJson: function (json) {
        /* remove all control points */
        var polyControlPoints = this.getPolyControlPoints();
        for (var i = 0; i < polyControlPoints.length; i++) {
            this.remControlPoint(polyControlPoints[i]);
        }
        
        /* create the new points */
        this._points = [];
        
        for (i = 0; i < json.length; i++) {
            this._points.push(new Webgram.Geometry.Point(json[i].x, json[i].y));
        }
        
        /* recreate the poly control points */
        this._updatePolyControlPoints();
    },
    
    
    /* snapping */
    
//    snapInternally: function (index, point, fixedPoints, rotationAngle, center) {
//        if (this.isSnapToAngleEnabled() && this.getSetting('snapAngle') != null) {
//            return this._snapToAngleInternally(index, point, rotationAngle, center);
//        }
//    },
//    
//    _snapShapePoint: function (index, point, fixedPoints, rotationAngle, center) {
//        /* if the requested point is marked for removal,
//         * don't bother snapping it, just return it as it is */
//        var markedForRemovalPointIndex = this._markedForRemovalIndex;
//        if (markedForRemovalPointIndex === index) {
//            return {
//                point: point,
//                snapVisualFeedback: null,
//                xSnapped: false,
//                ySnapped: false
//            };
//        }
//        
//        return this.callSuper(index, point, fixedPoints, rotationAngle, center);
//    },
//    
//    _snapToAngleInternally: function (index, point, rotationAngle, center) {
//        function getLinesIntersection(point1, angle1, point2, angle2) {
//            angle1 = Webgram.Geometry.normalizeAngle(angle1);
//            angle2 = Webgram.Geometry.normalizeAngle(angle2);
//            
//            if (Math.abs(angle1 - angle2) < 0.000001) {
//                if (point1.equals(point2)) {
//                    return point1;
//                }
//                else {
//                    return null;
//                }
//            }
//            else {
//                var m1, n1, m2, n2, x, y;
//                /* the special 90 deg for the first line */
//                if (Math.abs(angle1 - Math.PI / 2) < 0.000001) {
//                    m2 = Math.tan(angle2);
//                    n2 = point2.y - m2 * point2.x;
//                    x = point1.x;
//                    y = m2 * x + n2;
//                }
//                /* the special 90 deg for the second line */
//                else if (Math.abs(angle2 - Math.PI / 2) < 0.000001) {
//                    m1 = Math.tan(angle1);
//                    n1 = point1.y - m1 * point1.x;
//                    x = point2.x;
//                    y = m1 * x + n1;
//                }
//                /* none of them is at 90 deg */
//                else {
//                    m1 = Math.tan(angle1);
//                    n1 = point1.y - m1 * point1.x;
//                    m2 = Math.tan(angle2);
//                    n2 = point2.y - m2 * point2.x;
//                    x = (n1 - n2) / (m2 - m1);
//                    y = (n1 * m2 - n2 * m1) / (m2 - m1);
//                }
//
//                return new Webgram.Geometry.Point(x, y);
//            }
//        }
//        
//        var points = this.getShape().points;
//        if (points.length < 2) {
//            return;
//        }
//
//        var snapAngle = this.getSetting('snapAngle');
//        var snapAngleThreshold = this.getSetting('snapAngleThreshold');
//        
//        if (snapAngle == null || snapAngleThreshold == null) {
//            return;
//        }
//        
//        /* gather previous points */
//        var prevPoints = [];
//        if (index >= 2) {
//            prevPoints.push(points[index - 1]);
//            prevPoints.push(points[index - 2]);
//        }
//        else if (index == 1) {
//            prevPoints.push(points[0]);
//            if (this.closed && points.length > 2) {
//                prevPoints.push(points[points.length - 1]);
//            }
//        }
//        else {  /* if (index == 0) */
//            if (this.closed && points.length > 2) {
//                prevPoints.push(points[points.length - 1]);
//                prevPoints.push(points[points.length - 2]);
//            }
//        }
//
//        /* gather next points */
//        var nextPoints = [];
//        if (index <= points.length - 3) {
//            nextPoints.push(points[index + 1]);
//            nextPoints.push(points[index + 2]);
//        }
//        else if (index == points.length - 2) {
//            nextPoints.push(points[points.length - 1]);
//            if (this.closed && points.length > 2) {
//                nextPoints.push(points[0]);
//            }
//        }
//        else {  /* if (index == points.length - 1) */
//            if (this.closed && points.length > 2) {
//                nextPoints.push(points[0]);
//                nextPoints.push(points[1]);
//            }
//        }
//        
//        /* all the angles in angle sets are treated modulo PI */
//        
//        var i, j, m, n, angle, offsetAngle, snappedPoint;
//        
//        /* compute previous point and angle sets */
//        var prevAngleSet = [];
//        var prevPoint = null;
//        if (prevPoints.length > 0) {
//            prevPoint = prevPoints[0];
//            offsetAngle = 0;
//            if (prevPoints.length == 2) {
//                offsetAngle = prevPoint.getAngleTo(prevPoints[1]);
//            }
//            
//            angle = 0;
//            while (angle < Math.PI) {
//                prevAngleSet.push(Webgram.Geometry.normalizeAngle(angle + offsetAngle) % Math.PI);
//                /* add the round angle relative to the system */
//                if (!Webgram.Geometry.angleMultipleOf(offsetAngle + rotationAngle, snapAngle)) {
//                    prevAngleSet.push(Webgram.Geometry.normalizeAngle(angle - rotationAngle) % Math.PI);
//                }
//                angle += snapAngle;
//            }
//        }
//
//        /* compute next point and angle sets */
//        var nextAngleSet = [];
//        var nextPoint = null;
//        if (nextPoints.length > 0) {
//            nextPoint = nextPoints[0];
//            offsetAngle = 0;
//            if (nextPoints.length == 2) {
//                offsetAngle = nextPoint.getAngleTo(nextPoints[1]);
//            }
//            
//            angle = 0;
//            while (angle < Math.PI) {
//                nextAngleSet.push(Webgram.Geometry.normalizeAngle(angle + offsetAngle) % Math.PI);
//                /* add the round angle relative to the system */
//                if (!Webgram.Geometry.angleMultipleOf(offsetAngle + rotationAngle , snapAngle)) {
//                    nextAngleSet.push(Webgram.Geometry.normalizeAngle(angle - rotationAngle) % Math.PI);
//                }
//                angle += snapAngle;
//            }
//        }
//        
//        /* if the two angle sets are available, compute the solutions
//         * based on intersections of lines at given angles */
//        var solution, solutions = [];
//        if (prevAngleSet.length > 0 && nextAngleSet.length > 0) {
//            /* consider the straight line between the two points as a potential solution */
//            if (Math.abs(prevPoint.x - nextPoint.x) < 0.000001) { /* special 90 deg case */
//                solution = {x: null, y: null, m: Infinity, n: Infinity, x0: prevPoint.x};
//            }
//            else {
//                m = (prevPoint.y - nextPoint.y) / (prevPoint.x - nextPoint.x);
//                n = prevPoint.y - m * prevPoint.x;
//                
//                solution = {x: null, y: null, m: m, n: n, x0: null};
//            }
//            
//            solutions.push(solution);
//            
//            for (i = 0; i < prevAngleSet.length; i++) {
//                for (j = 0; j < nextAngleSet.length; j++) {
//                    if (Math.abs(prevAngleSet[i] - nextAngleSet[j]) < 0.000001) {
//                        /* this solution is in fact the one given by a straight line
//                         * between the prev and next points */
//                        continue;
//                    }
//                    
//                    var intersectionPoint = getLinesIntersection(
//                            prevPoint, prevAngleSet[i], nextPoint, nextAngleSet[j]);
//                    
//                    if (intersectionPoint != null) {
//                        solution = {x: intersectionPoint.x, y: intersectionPoint.y, m: null, n: null, x0: null};
//                        solutions.push(solution);
//                    }
//                }
//            }
//        }
//        
//        /* compute the best match coming from the intersection of the lines at given angles */
//        var angle1, angle2, minAngle = Infinity;
//        var dist1, dist2, dist3, cosVal;
//        var bestSolution = null;
//        for (i = 0; i < solutions.length; i++) {
//            solution = solutions[i];
//
//            if (solution.m != null) { /* the straight line between prevPoint and nextPoint */
//                /* apply the law of cosines to determine the angle between the previous point, point and next point */
//                dist1 = point.getDistanceTo(prevPoint);
//                dist2 = point.getDistanceTo(nextPoint);
//                dist3 = nextPoint.getDistanceTo(prevPoint);
//                
//                /* compute the cosine value and bound it to -1..1 */
//                cosVal = (dist1 * dist1 + dist2 * dist2 - dist3 * dist3) / (2 * dist1 * dist2);
//                if (cosVal > 1) {
//                    cosVal = 1;
//                }
//                if (cosVal < -1) {
//                    cosVal = -1;
//                }
//
//                angle = Math.acos(cosVal);
//                angle = Math.PI - angle;
//            }
//            else { /* a point */
//                /* apply the law of cosines twice to determine the differences in angles */
//                snappedPoint = new Webgram.Geometry.Point(solution.x, solution.y);
//                dist3 = point.getDistanceTo(snappedPoint);
//                
//                dist1 = point.getDistanceTo(prevPoint);
//                dist2 = snappedPoint.getDistanceTo(prevPoint);
//                cosVal = (dist1 * dist1 + dist2 * dist2 - dist3 * dist3) / (2 * dist1 * dist2);
//                if (cosVal > 1) {
//                    cosVal = 1;
//                }
//                if (cosVal < -1) {
//                    cosVal = -1;
//                }
//                
//                angle1 = Math.acos(cosVal);
//                
//                dist1 = point.getDistanceTo(nextPoint);
//                dist2 = snappedPoint.getDistanceTo(nextPoint);
//                cosVal = (dist1 * dist1 + dist2 * dist2 - dist3 * dist3) / (2 * dist1 * dist2);
//                if (cosVal > 1) {
//                    cosVal = 1;
//                }
//                if (cosVal < -1) {
//                    cosVal = -1;
//                }
//                
//                angle2 = Math.acos(cosVal);
//                
//                angle = angle1 + angle2;
//            }
//            
//            /* minimum angle difference (the sum of the two) wins */
//            if (angle < minAngle && angle < snapAngleThreshold) {
//                minAngle = angle;
//                bestSolution = solution;
//            }
//        }
//        
//        /* if there is a match coming from an intersection of the lines, return it right away */
//        
//        var xValue, yValue, preferredPoint = null;
//        if (bestSolution != null) {
//            snapVisualFeedback = null;
//            
//            if (bestSolution.m != null) { /* line */
//                if (bestSolution.m === 0) {
//                    xValue = null;
//                    yValue = bestSolution.n;
//                }
//                else if (bestSolution.m === Infinity) {
//                    xValue = bestSolution.x0;
//                    yValue = null;
//                }
//                else {
//                    /** @ignore */
//                    xValue = function (y) { return (y - bestSolution.n) / bestSolution.m; };
//                    /** @ignore */
//                    yValue = function (x) { return bestSolution.m * x + bestSolution.n; };
//                    m = bestSolution.m;
//                    n = bestSolution.n;
//                    preferredPoint = new Webgram.Geometry.Point(
//                            (point.y * m + point.x - m * n) / (m * m + 1),
//                            (m * m * point.y + m * point.x + n) / (m * m + 1));
//                }
//            }
//            else { /* point */
//                xValue = bestSolution.x;
//                yValue = bestSolution.y;
//                bestPoint = new Webgram.Geometry.Point(xValue, yValue);
//                
//                snapVisualFeedback = [];
//                snapVisualFeedback.push({
//                    type: 'radial',
//                    x: prevPoint.x,
//                    y: prevPoint.y,
//                    angle: prevPoint.getAngleTo(bestPoint)
//                });
//                snapVisualFeedback.push({
//                    type: 'radial',
//                    x: nextPoint.x,
//                    y: nextPoint.y,
//                    angle: nextPoint.getAngleTo(bestPoint)
//                });
//            }
//            
//            return {
//                x: xValue,
//                y: yValue,
//                preferredPoint: preferredPoint,
//                snapVisualFeedback: snapVisualFeedback
//            };
//        }
//        
//        /* if no intersection matched, compute the solutions formed by lines at given angles */
//        /* the best match among these solutions is the one that yields the smallest angle difference */
//        minAngle = null;
//        var minPoint = null;
//        var minAngleDelta = Infinity;
//        var angleDelta;
//        var fullAngleSet = [];
//        
//        for (i = 0; i < prevAngleSet.length; i++) {
//            fullAngleSet.push({
//                angle: prevAngleSet[i],
//                point: prevPoint
//            });
//
//            /* since the angle set contains angles from 0 to PI,
//             * we must manually add the rest of the angles from PI to 2*PI */
//            fullAngleSet.push({
//                angle: prevAngleSet[i] + Math.PI,
//                point: prevPoint
//            });
//        }
//        
//        for (i = 0; i < nextAngleSet.length; i++) {
//            fullAngleSet.push({
//                angle: nextAngleSet[i],
//                point: nextPoint
//            });
//
//            /* since the angle set contains angles from 0 to PI,
//             * we must manually add the rest of the angles from PI to 2*PI */
//            fullAngleSet.push({
//                angle: nextAngleSet[i] + Math.PI,
//                point: nextPoint
//            });
//        }
//        
//        for (i = 0; i < fullAngleSet.length; i++) {
//            angle = fullAngleSet[i].angle;
//            
//            angle1 = Webgram.Geometry.normalizeAngle(fullAngleSet[i].point.getAngleTo(point));
//            angleDelta = Math.abs(angle - angle1);
//            if (angleDelta > Math.PI) {
//                angleDelta = 2 * Math.PI - angleDelta;
//            }
//            if (angleDelta < minAngleDelta && angleDelta < snapAngleThreshold) {
//                minAngleDelta = angleDelta;
//                minAngle = angle;
//                minPoint = fullAngleSet[i].point;
//            }
//        }
//        
//        /* if we have a solution based on lines at given angles,
//         * we return it among with a radial display snapping info */
//        if (minAngle != null) {
//            minAngle = Webgram.Geometry.normalizeAngle(minAngle); /* the angle is now between 0 and 2*PI */
//            preferredPoint = null;
//            if (Math.abs(minAngle - Math.PI / 2) < 0.000001 || Math.abs(minAngle - 3 * Math.PI / 2) < 0.000001) { /* the angle is odd multiple of PI/2 */
//                xValue = minPoint.x;
//                yValue = null;
//            }
//            else if (Math.abs(minAngle) < 0.000001 || Math.abs(minAngle - Math.PI) < 0.000001) { /* the angle is even multiple of PI/2 */
//                xValue = null;
//                yValue = minPoint.y;
//            }
//            else {
//                m = Math.tan(minAngle);
//                n = minPoint.y - m * minPoint.x;
//                xValue = function (y) { return (y - n) / m; };
//                yValue = function (x) { return m * x + n; };
//                preferredPoint = new Webgram.Geometry.Point(
//                        (point.y * m + point.x - m * n) / (m * m + 1),
//                        (m * m * point.y + m * point.x + n) / (m * m + 1));
//            }
//
//            return {
//                x: xValue,
//                y: yValue,
//                preferredPoint: preferredPoint,
//                snapVisualFeedback: {
//                    type: 'radial',
//                    x: minPoint.x,
//                    y: minPoint.y,
//                    angle: minAngle
//                }
//            };
//        }
//    },
    
    
    /* control points */
    
    /**
     * Returns a list with all the poly control points of this element.
     * @see Webgram.DrawingElements.PolyElement.PolyControlPoint
     * @returns {Array} the list of poly control points
     */
    getPolyControlPoints: function () {
        return this.getControlPoints(Webgram.DrawingElements.PolyElement.PolyControlPoint);
    },
    
    /**
     * Returns the poly control point that controls the point with the given index.
     * @param {Number} index the index of the point
     * @returns {Webgram.DrawingElements.PolyElement.PolyControlPoint} the corresponding poly control point,
     * or <tt>null</tt> if no such control point is found
     */
    getPolyControlPointByIndex: function (index) {
        var polyControlPoints = this.getPolyControlPoints();
        
        for (var i = 0; i < polyControlPoints.length; i++) {
            if (polyControlPoints[i].polyPointIndex === index) {
                return controlPoint;
            }
        }
        
        return null;
    },
    
    /**
     * Returns the class to be used to create the poly control point
     * for the point with the given index.<br><br>
     * <em>(could be overridden)</em>
     * @param {Number} index the index of the point
     * @see Webgram.DrawingElements.PolyElement.PolyControlPoint
     * @returns {Function} the poly control point class
     */
    getPolyControlPointClass: function (index) {
        return Webgram.DrawingElements.PolyElement.PolyControlPoint;
    },
    
    /**
     * Tells whether the editing of points is enabled for this element, or not.
     * @returns {Boolean} <tt>true</tt> if the feature is enabled, <tt>false</tt> otherwise
     */
    isEditEnabled: function () {
        return this._editEnabled;
    },
    
    /**
     * Enables or disables the editing of points for this element.
     * @param {Boolean} enabled <tt>true</tt> to enable the feature, <tt>false</tt> to disable it
     */
    setEditEnabled: function (enabled) {
        if (enabled && !this._editEnabled) {
            this._editEnabled = true;
            this._updatePolyControlPoints();
        }
        else if (!enabled && this._editEnabled) {
            this._editEnabled = false;
            this._updatePolyControlPoints();
        }
    },
    
    _updatePolyControlPoints: function () {
        var i, controlPoints = this.getPolyControlPoints();
        var controlPointsByIndex = [];
        
        /* gather the existing poly control points */
        for (i = 0; i < controlPoints.length; i++) {
            controlPointsByIndex[controlPoints[i].polyPointIndex] = controlPoints[i];
        }

        /* recreate the poly control point, where needed */
        for (i = 0; i < this._points.length; i++) {
            var ControlPointClass = this.isEditEnabled() && this.getPolyControlPointClass(i) || null;
            var oldControlPoint = controlPointsByIndex[i];
            var oldControlPointClass = oldControlPoint && oldControlPoint.constructor;
            
            if (ControlPointClass != oldControlPointClass) { /* something has changed */
                if (oldControlPoint != null) {
                    this.remControlPoint(oldControlPoint);
                }
                
                if (ControlPointClass != null) {
                    this.addControlPoint(new ControlPointClass(i));
                }
            }
        }
    },
    

    /* creation */
    
    beginCreate: function (point) {
        this._addPoint(0, point, true);
        if (this.maxPointCount > 1) {
            this._pendingCreatePoint = true;
        }
        
        return true; /* accept creation */
    },
    
    continueCreate: function (point, size, mouseDown, click) {
        point = this.transformInverse(point);
        
        /* move the temporary point along the mouse */
        this._setPoint(this._points.length - 1, point, true);
        
        if (click) {
            /* stop the creation if we've got enough points */
            if (this._points.length >= this.maxPointCount) {
                this._pendingCreatePoint = false;
                return false; /* stop */
            }
            
            /* add a new point */
            this._addPoint(this._points.length, point, true);
        }
        
        return true; /* continue */
    },
    
    endCreate: function () {
        if (this._pendingCreatePoint) {
            this._pendingCreatePoint = false;
            this._remPoint(this._points.length - 1);
        }
        
        if (this._points.length < this.minPointCount) {
            return false; /* failed */
        }
        
        return true; /* succeeded */
    },
    
    
    /* other methods */
    
    getCursor: function () {
        if (this._additionPoint) {
            return 'pointer';
        }
        
        return this.callSuper();
    }
});


Webgram.DrawingElements.PolyElement.PolyControlPoint =
        Webgram.ControlPoint.extend( /** @lends Webgram.DrawingElements.PolyElement.PolyControlPoint.prototype */ {
            
    /**
     * A control point that controls a poly point of a polygonal element.
     * @constructs Webgram.DrawingElements.PolyElement.PolyControlPoint
     * @extends Webgram.ControlPoint
     * @see Webgram.DrawingElements.PolyElement
     * @param {Number} polyPointIndex the index of the polygonal point to control
     */
    initialize: function PolyControlPoint(polyPointIndex) {
        this.callSuper();
        
        /**
         * The index of the poly point controlled by this control point.
         * @type Number
         */
        this.polyPointIndex = polyPointIndex;
        
        this.onEndMove.bind(function () {
            this.drawingElement._remIfMarked(this.polyPointIndex);
        });
    },

    getCursor: function () {
        return 'pointer';
    },
    
    draw: function () {
        this.drawBase();
        
        if (this.drawingElement._removalIndex === this.polyPointIndex) {
            this.drawRemovalMark();
        }
    },
    
    /**
     * The drawing procedure for a poly control point is divided into two parts:
     * a base drawing method (this one) and an additional drawing of a removal mark,
     * for the points that are marked for removal. You should override this method
     * to give a different look to your control point.
     * @see Webgram.DrawingElements.PolyElement.PolyControlPoint#drawRemovalMark 
     */
    drawBase: function () {
        var alpha = 1;
        var image = this.getImageStore().get('poly-point');
        if (!image) {
            return;
        }

        if (this.drawingElement.getFocusType() === Webgram.DrawingElement.FOCUS_HOVERED) {
            alpha = 0.5;
        }
        
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0, alpha);
    },
    
    /**
     * Draws the removal mark for a poly control point that is marked for removal.
     * @see Webgram.DrawingElements.PolyElement.PolyControlPoint#drawBase
     */
    drawRemovalMark: function () {
        var image = this.getImageStore().get('remove-poly-point');
        if (!image) {
            return;
        }
        
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
    },
    
    computeAnchor: function () {
        return this.drawingElement._points[this.polyPointIndex];
    },
    
    processMove: function (point) {
        this.drawingElement._setPoint(this.polyPointIndex, point, true);
        
        /* marks the point for removal if it's close enough to one of its neighbors */
        this.drawingElement._checkAndMarkForRemoval(this.polyPointIndex);
    }
});
