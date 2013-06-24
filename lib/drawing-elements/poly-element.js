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
        Webgram.DrawingElements.PolyElement.parentClass.call(this, id);

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
        
        this._recenter();
        
        this.invalidate(true);
        this.updateDependentElements();
        this._updatePolyControlPoints();
    },

    
    /* drawing methods */
    
    drawNoZoom: function () {
        if (this.isAddRemovePointsEnabled() &&
           (this.getFocus() === Webgram.DrawingElement.FOCUS_HOVERED ||
            this.getFocus() === Webgram.DrawingElement.FOCUS_SELECTED)) {
            
            this.drawAdditionPoint();
        }
    },
    
    drawDecoration: function () {
        if (this._points.length <= 1) {
            return;
        }
        else if (this._points.length === 2) {
            switch (this.getFocus()) {
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
            Webgram.DrawingElements.PolyElement.parent.drawDecoration.call(this);
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
        
        this.drawImage(image, this._additionPoint, null, 0, 0.5);
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

    getBoundingRectangle: function (transformed) {
        if (transformed) {
            return this.transformDirect(this.getPoly()).getBoundingRectangle();
        }
        else {
            return this.getPoly().getBoundingRectangle();
        }
    },
    
    fit: function (rectangle) {
        if (this._points.length === 0) {
            return; /* nothing to do */
        }
        
        var rectWidth = rectangle.getWidth();
        var rectHeight = rectangle.getHeight();
        var rectCenter = rectangle.getCenter();
        
        var boundingRectangle = this.getBoundingRectangle(true);
        var boundingWidth = boundingRectangle.getWidth();
        var boundingHeight = boundingRectangle.getHeight();
        var boundingCenter = boundingRectangle.getCenter();
        
        var widthScale = (rectWidth - 1) / (boundingWidth - 1);
        var heightScale = (rectHeight - 1) / (boundingHeight - 1);
        var deltaX = rectCenter.x - boundingCenter.x;
        var deltaY = rectCenter.y - boundingCenter.y;
        
        /* translate and scale the transformed points;
         * transform inverse and restore the points */
        for (var i = 0; i < this._points.length; i++) {
            var point = this.transformDirect(this._points[i]);
            
            point = point.getTranslated(deltaX, deltaY);
            point = point.getScaled(widthScale, heightScale);
            
            point = this.transformInverse(point);
            this._setPoint(i, point);
        }
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
        
        if (snap) {
            point = this.snapPoint(point, index, true, true, true);
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
        
        if (snap) {
            point = this.snapPoint(point, index, true, true, true);
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
        var newLocation = transformedPoly.getBoundingRectangle().getCenter();
        this._setLocation(newLocation, false, true);
        
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
                var line = Webgram.Geometry.Line.fromPoints(point1, point2);
                var additionPoint = line.projectPoint(mousePoint);
                
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
    
    setEditEnabled: function (enabled) {
        Webgram.DrawingElements.RectangularElement.parent.setEditEnabled.call(this, enabled);
        
        this._updatePolyControlPoints();
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
    
    
    /* snapping & interaction between elements */
    
    getSnappingPoints: function () {
        return this.getPoints();
    },
    
    snapInternally: function (point, snapVisualFeedbackList, hint) {
        return (hint >= 0) && this.isSnapToAngleEnabled() && this.snapToAngleInternally(point, snapVisualFeedbackList, hint) || null;
    },
    
    /**
     * Snaps the given point to the angles made by its neighbors.
     * This method is called by the <tt>snapInternally</tt> method,
     * when snapping to angle and internally is enabled for this element.
     * @param {Webgram.Geometry.Point} point the point to snap
     * @param {Array} snapVisualFeedbackList a list of {@link Webgram.DrawingElements.RootContainer.SnapVisualFeedback}
     * objects that can be altered
     * @param {Number} index the index of the snapping point, given as a hint to the snapping routines
     * @returns {Webgram.Geometry.Point|Webgram.Geometry.Line} the snapped geometry,
     * either a point, a line or null, if no snapping was performed 
     */
    snapToAngleInternally: function (point, snapVisualFeedbackList, index) {
        var snapAngle = this.getSetting('snapAngle');
        if (!snapAngle) {
            return null;
        }
        
        var snapDistance = this.getSetting('snapDistance');
        if (!snapDistance) {
            return null;
        }
        
        var count = this._points.length;
        if (count < 2) {
            return; /* nothing to do less than two points */
        }
        
        var prevPoint = null;
        var prevPrevPoint = null;
        var nextPoint = null;
        var nextNextPoint = null;

        /* find the previous two points */
        if (index > 0) {
            prevPoint = this._points[index - 1];
        }
        else if (this.closed) { /* wrap around if poly is closed */
            prevPoint = this._points[count - 1];
        }
        
        if (index > 1) {
            prevPrevPoint = this._points[index - 2];
        }
        else if (this.closed && count >= 3) {
            /* wrap around if poly is closed and we have at least 3 points */
            
            if (index === 1) {
                prevPrevPoint = this._points[count - 1];
            }
            else { /* index === 0 */
                prevPrevPoint = this._points[count - 2];
            }
        }
       
        /* find the next two points */
        if (index < count - 1) {
            nextPoint = this._points[index + 1];
        }
        else if (this.closed) { /* wrap around if poly is closed */
            nextPoint = this._points[0];
        }
        
        if (index < count - 2) {
            nextNextPoint = this._points[index + 2];
        }
        else if (this.closed && count >= 3) {
            /* wrap around if poly is closed and we have at least 3 points */
            
            if (index === count - 2) {
                nextNextPoint = this._points[0];
            }
            else { /* index === count - 1 */
                nextNextPoint = this._points[1];
            }
        }
        
        /* angle offsets represent angles between prevPrevPoint and prevPoint,
         * and nextNextPoint and nextPoint, respectively; in the absence of such points,
         * the angle offset is 0 */
        var prevAngleOffset = 0;
        var nextAngleOffset = 0;
        if (prevPrevPoint) {
            prevAngleOffset = prevPrevPoint.getAngleTo(prevPoint);
        }
        if (nextNextPoint) {
            nextAngleOffset = nextPoint.getAngleTo(nextNextPoint);
        }
        
        /* generate the lines centered in prevPoint and nextPoint
         * at angles spaced by snapAngle */
        var prevLines = [];
        var nextLines = [];
        
        if (prevPoint) {
            var withOffset = Boolean(prevAngleOffset);
            for (var angle = 0; angle < Math.PI; angle += snapAngle) {
                var slope = Math.tan(angle + prevAngleOffset);
                if (Math.abs(slope) > 10e10) { /* vertical line */
                    slope = Infinity;
                }
                
                var line = Webgram.Geometry.Line.fromPointAndSlope(prevPoint, slope);
                line._withOffset = withOffset;
                prevLines.push(line);
                
                if (withOffset) {
                    /* also generate the line without angle offset */

                    slope = Math.tan(angle);
                    if (Math.abs(slope) > 10e10) { /* vertical line */
                        slope = Infinity;
                    }
                    
                    line = Webgram.Geometry.Line.fromPointAndSlope(prevPoint, slope);
                    line._withOffset = false;
                    prevLines.push(line);
                }
            }
        }

        if (nextPoint) {
            var withOffset = Boolean(nextAngleOffset);
            for (var angle = 0; angle < Math.PI; angle += snapAngle) {
                var slope = Math.tan(angle + nextAngleOffset);
                if (Math.abs(slope) > 10e10) { /* vertical line */
                    slope = Infinity;
                }
                
                var line = Webgram.Geometry.Line.fromPointAndSlope(nextPoint, slope);
                line._withOffset = withOffset;
                nextLines.push(line);

                if (withOffset) {
                    /* also generate the line without angle offset */

                    slope = Math.tan(angle);
                    if (Math.abs(slope) > 10e10) { /* vertical line */
                        slope = Infinity;
                    }
                    
                    line = Webgram.Geometry.Line.fromPointAndSlope(nextPoint, slope);
                    line._withOffset = false;
                    nextLines.push(line);
                }
            }
        }
        
        /* find intersections of prevLines with nextLines,
         * which represent snapping solutions */
        var solutions = [];
        for (var i = 0; i < prevLines.length; i++) {
            for (var j = 0; j < nextLines.length; j++) {
                var prevLine = prevLines[i];
                var nextLine = nextLines[j];
                
                var inters = prevLine.intersectLine(nextLine);
                if (!inters) {
                    continue; /* ignore pairs of lines that don't intersect */
                }
                
                var dist = inters.getDistanceTo(point);
                if (dist < snapDistance) {
                    /* compute the visual snap feedback */
                    var prevSnapVisualFeedback = null;
                    var nextSnapVisualFeedback = null;
                    if (prevLine._withOffset) {
                        if (nextLine._withOffset) { /* both lines are with angle offset */
                            prevSnapVisualFeedback = new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                                    this.transformDirect(prevPoint), prevAngleOffset, prevPoint.getAngleTo(inters));
                            nextSnapVisualFeedback = new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                                    this.transformDirect(nextPoint), nextAngleOffset, nextPoint.getAngleTo(inters));
                        }
                        else { /* only the prev line is with angle offset */
                            prevSnapVisualFeedback = new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                                    this.transformDirect(prevPoint), prevAngleOffset, prevPoint.getAngleTo(inters));
                            nextSnapVisualFeedback = new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                                    this.transformDirect(inters), 0, inters.getAngleTo(nextPoint));
                        }
                    }
                    else {
                        if (nextLine._withOffset) { /* only the next line is with angle offset */
                            prevSnapVisualFeedback = new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                                    this.transformDirect(inters), 0, inters.getAngleTo(prevPoint));
                            nextSnapVisualFeedback = new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                                    this.transformDirect(nextPoint), nextAngleOffset, nextPoint.getAngleTo(inters));
                        }
                        else { /* none of the lines is with angle offset */
                            prevSnapVisualFeedback = new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                                    this.transformDirect(inters), inters.getAngleTo(prevPoint), inters.getAngleTo(nextPoint));
                        }
                    }
                    
                    /* add the obtained solution */
                    solutions.push({
                        snappedPoint: inters,
                        dist: dist,
                        prevSnapVisualFeedback: prevSnapVisualFeedback,
                        nextSnapVisualFeedback: nextSnapVisualFeedback
                    });
                }
            }
        }
        
        /* choose the best solutuion based on the smallest distance */
        var minDist = Infinity;
        var bestSolution = null;
        for (i = 0; i < solutions.length; i++) {
            var solution = solutions[i];
            if (solution.dist < minDist) {
                minDist = solution.dist;
                bestSolution = solution;
            }
        }
        
        if (bestSolution) {
            if (bestSolution.prevSnapVisualFeedback) {
                snapVisualFeedbackList.push(bestSolution.prevSnapVisualFeedback);
            }
            if (bestSolution.nextSnapVisualFeedback) {
                snapVisualFeedbackList.push(bestSolution.nextSnapVisualFeedback);
            }
            
            return bestSolution.snappedPoint;
        }
        
        /* if no solution found at the intersection of lines,
         * we choose the closest line and propose it as the final snapping solution */
        minDist = Infinity;
        bestSolution = null;
        var bestAngleOffset = 0;
        var bestPoint = null;
        var bestPrevNextPoint = null;
        for (i = 0; i < prevLines.length; i++) {
            var prevLine = prevLines[i];
            var projection = prevLine.projectPoint(point);
            var dist = projection.getDistanceTo(point);
            if (dist < snapDistance && dist < minDist) {
                minDist = dist;
                bestSolution = prevLine;
                bestAngleOffset = prevLine._withOffset ? Math.PI + prevAngleOffset : 0;
                bestPoint = projection;
                bestPrevNextPoint = prevPoint;
            }
        }

        if (prevPoint && nextPoint) {
            var line = Webgram.Geometry.Line.fromPoints(prevPoint, nextPoint);
            nextLines.push(line);
        }
        for (i = 0; i < nextLines.length; i++) {
            var nextLine = nextLines[i];
            var projection = nextLine.projectPoint(point);
            var dist = projection.getDistanceTo(point);
            if (dist < snapDistance && dist < minDist) {
                minDist = dist;
                bestSolution = nextLine;
                bestAngleOffset = nextLine._withOffset ? nextAngleOffset : 0;
                bestPoint = projection;
                bestPrevNextPoint = nextPoint;
            }
        }
        
        if (bestSolution) {
            var angle = bestPrevNextPoint.getAngleTo(bestPoint);
            if (bestSolution._withOffset != null) {
                snapVisualFeedbackList.push(new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                        this.transformDirect(bestPrevNextPoint), bestAngleOffset, angle));
            }
            else {
                snapVisualFeedbackList.push(new Webgram.DrawingElements.RootContainer.AngularSnapVisualFeedback(
                        this.transformDirect(bestPoint), angle, angle + Math.PI));
            }
            
            return bestSolution;
        }
        
        return null;
    },
    
    
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
        
        return Webgram.DrawingElements.PolyElement.parent.getCursor.call(this);
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
        Webgram.DrawingElements.PolyElement.PolyControlPoint.parentClass.call(this);
        
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

        if (this.drawingElement.getFocus() === Webgram.DrawingElement.FOCUS_HOVERED) {
            alpha = 0.5;
        }
        
        this.drawImage(image, null, null, 0, alpha);
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
        
        this.drawImage(image);
    },
    
    computeAnchor: function () {
        return this.drawingElement._points[this.polyPointIndex];
    },
    
    processMove: function (point, vanillaPoint, snap) {
        this.drawingElement._setPoint(this.polyPointIndex, point, snap);
        
        /* marks the point for removal if it's close enough to one of its neighbors */
        this.drawingElement._checkAndMarkForRemoval(this.polyPointIndex);
    }
});


/**
 * An end point to be used with poly elements.
 * @constructs Webgram.DrawingElements.PolyElement.PolyEndPoint
 * @extends Webgram.DrawingElements.PolyElement.PolyControlPoint
 * @see Webgram.DrawingElements.PolyElement
 * @see Webgram.Connectors.EndPoint
 * @param {Number} polyPointIndex the index of the polygonal point to control
 */
Webgram.DrawingElements.PolyElement.PolyEndPoint =
        Webgram.DrawingElements.PolyElement.PolyControlPoint.augment(Webgram.Connectors.EndPoint,
                /** @lends Webgram.DrawingElements.PolyElement.PolyEndPoint.prototype */ {
    
    drawBase: function () {
        if (this.isConnected()) {
            var alpha = 1;
            var image = this.getImageStore().get('end-point-connected');
            if (!image) {
                return;
            }
            
            if (this.drawingElement.getFocus() === Webgram.DrawingElement.FOCUS_HOVERED) {
                alpha = 0.5;
            }
            
            this.drawImage(image, null, null, 0, alpha);
        }
        else {
            Webgram.DrawingElements.PolyElement.PolyEndPoint.parent.drawBase.call(this);
        }
    }
}, 

/** @lends Webgram.DrawingElements.PolyElement.PolyEndPoint */ {
    name: 'PolyEndPoint'
});
