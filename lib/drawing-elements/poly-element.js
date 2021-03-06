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


Webgram.Namespace('Webgram.DrawingElements');


/**
 * @class A base class for all the polygonal drawing elements.
 * @extends Webgram.DrawingElement
 * @param {String} id a given identifier, can be <tt>null</tt>
 * @param {Array} points a list of {@link Webgram.Geometry.Point} objects
 * that form the shape of this polygonal element 
 */
Webgram.DrawingElements.PolyElement = function (id, points) {
    Webgram.DrawingElement.call(this, id, points);

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
    
    this._hoveredPoint = null;
    this._pendingCreatePoint = false;
    
    this.setHoveredControlPointsEnabled(true);
    this.setRotateEnabled(false);
    this.setAddRemovePointsEnabled(true);
    this.setEditEnabled(true);

    
    /* events */
    
    /**
     * An event that is triggered when a poly point is added to this polygonal element.<br>
     * Handlers receive the following arguments: <tt>(index, point)</tt> 
     * @type Webgram.Event
     */
    this.onAddPoint = new Webgram.Event('add point', this); /* (index, point) */

    /**
     * An event that is triggered when a poly point is removed from this polygonal element.<br>
     * Handlers receive the following arguments: <tt>(index, point)</tt> 
     * @type Webgram.Event
     */
    this.onRemovePoint = new Webgram.Event('remove point', this); /* (index, point) */

    this.onKeyUp.bind(function (key, modifiers) {
        if (key === 16) { /* shift */
            this._markHoveredPoint(null);
            
            return false; /* yes, false; we want to continue the event propagation */
        }
    });
    
    this.onMouseDown.bind(function (point, button, modifiers) {
        if (modifiers.shift && this.isAddRemovePointsEnabled()) {
            this._addHoveredPoint();
        }
    });

    this.onMouseMove.bind(function (point, modifiers) {
        if (modifiers.shift && this.isAddRemovePointsEnabled() && this.getPolyControlPoints().length < this.maxPointCount) {
            this._markHoveredPoint(point);
        }
        else {
            this._markHoveredPoint(null);
        }
    });

    this.onMouseLeave.bind(function (modifiers) {
        this._markHoveredPoint(null);
    });
};

Webgram.DrawingElements.PolyElement.prototype = {
    getCursor: function () {
        if (this._hoveredPoint) {
            return 'pointer';
        }
        
        return Webgram.DrawingElement.prototype.getCursor.call(this);
    },
    
    drawNoZoom: function () {
        Webgram.DrawingElement.prototype.drawNoZoom.call(this);
        
        if (this.isAddRemovePointsEnabled() &&
                (this.getFocusType() === Webgram.DrawingElement.FOCUS_HOVERED ||
                 this.getFocusType() === Webgram.DrawingElement.FOCUS_SELECTED)) {
            
            this.drawHoveredPoint();
        }
    },
    
    drawDecoration: function () {
        if (this.getShape().points.length == 2) {
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
            Webgram.DrawingElement.prototype.drawDecoration.call(this);
        }
    },

    /**
     * Draws the point to be created, when using the
     * interactive poly point creation.
     */
    drawHoveredPoint: function () {
        if (!this._hoveredPoint) {
            return;
        }
        
        var image = this.getImageStore().get('poly-point');
        if (!image) {
            return;
        }
        
        this.drawImage(image.content, this._hoveredPoint, image.size, 0, 0.5);
    },
    
    
    /* shape-related methods */
    
    pointInside: function (point) {
        if (this.getShape().points.length <= 1) { /* a single point or nothing - either way the answer is no */
            return false;
        }
        
        if (this.closed) {
            return this.getShape(true).pointInside(point);
        }
        else {
            return this.transformDirect(this.getLineTolerancePoly()).pointInside(point);
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
        
        if (this.getShape().points.length === 0) {
            return null;
        }
        else if (this.getShape().points.length === 1) {
            var point = this.translateInverse(this.getShapePoint(0));
            return new Webgram.Geometry.Poly([
                new Webgram.Geometry.Point(point.x - lineTolerance, point.y - lineTolerance),
                new Webgram.Geometry.Point(point.x + lineTolerance, point.y - lineTolerance),
                new Webgram.Geometry.Point(point.x + lineTolerance, point.y + lineTolerance),
                new Webgram.Geometry.Point(point.x - lineTolerance, point.y + lineTolerance)
            ]);
        }
        else if (this.getShape().points.length === 2) {
            /* just two points */
            var p1 = this.translateInverse(this.getShapePoint(0));
            var p2 = this.translateInverse(this.getShapePoint(1));
            var alpha = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            var len = lineTolerance * 1.4142135623730951; /* sqrt(2); */
            
            var a = p1.getPointAt(len, -3 * Math.PI / 4 + alpha);
            var b = p2.getPointAt(len, -Math.PI / 4 + alpha);
            var c = p2.getPointAt(len, Math.PI / 4 + alpha);
            var d = p1.getPointAt(len, 3 * Math.PI / 4 + alpha);
            
            return new Webgram.Geometry.Poly([a, b, c, d]);
        }
        else {
            /* more than two points */
            var polyPoints = [];
            var points = this.getDrawingPoly().points;
            var len = lineTolerance * 1.4142135623730951; /* sqrt(2); */
            var pi4 = Math.PI / 4;
            var p1, p2, p3;
            var alpha, alpha1, alpha2;
            var radius;
            
            for (var i = 0; i < points.length - 1; i++) {
                p1 = points[i];
                p2 = points[i + 1];
                
                if (i === 0) {
                    alpha1 = Webgram.Utils.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p1.getPointAt(len, -3 * pi4 + alpha1));
                }
                
                if (i === points.length - 2) {
                    alpha1 = Webgram.Utils.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p2.getPointAt(len, -pi4 + alpha1));
                }
                else {
                    p3 = points[i + 2];
                    alpha1 = Webgram.Utils.normalizeAngle(p2.getAngleTo(p1));
                    alpha2 = Webgram.Utils.normalizeAngle(p2.getAngleTo(p3));
                    radius = lineTolerance + (len - lineTolerance) * Math.abs(Math.sin(alpha2 - alpha1));
                    alpha = (alpha1 + alpha2) / 2;
                    if (alpha1 > alpha2) {
                        alpha += Math.PI;
                    }
                    polyPoints.push(p2.getPointAt(radius, alpha));
                }
            }
            
            for (var i = points.length - 2; i >= 0; i--){
                p1 = points[i];
                p2 = points[i + 1];
                
                if (i === points.length - 2) {
                    alpha1 = Webgram.Utils.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p2.getPointAt(len, pi4 + alpha1));
                }
                else {
                    p3 = points[i + 2];
                    alpha1 = Webgram.Utils.normalizeAngle(p2.getAngleTo(p1));
                    alpha2 = Webgram.Utils.normalizeAngle(p2.getAngleTo(p3));
                    radius = lineTolerance + (len - lineTolerance) * Math.abs(Math.sin(alpha2 - alpha1));
                    alpha = (alpha1 + alpha2) / 2 + Math.PI;
                    if (alpha1 > alpha2) {
                        alpha -= Math.PI;
                    }
                    polyPoints.push(p2.getPointAt(radius, alpha));
                }
                
                if (i === 0) {
                    alpha1 = Webgram.Utils.normalizeAngle(p1.getAngleTo(p2));
                    polyPoints.push(p1.getPointAt(len, 3 * pi4 + alpha1));
                }
            }
            
            return new Webgram.Geometry.Poly(polyPoints);
        }
    },
    
    
    /* shape manipulation & snapping */
    
    snapInternally: function (index, point, fixedPoints, rotationAngle, center) {
        if (this.isSnapToAngleEnabled() && this.getSetting('snapAngle') != null) {
            return this._snapToAngleInternally(index, point, rotationAngle, center);
        }
    },
    
    /**
     * Adds a new point to this polygonal element.
     * @param {Number} index the position where the point will be added
     * @param {Webgram.Geometry.Point} point the point to add, relative to the parent but not rotated
     */
    addPoint: function (index, point) {
        if (!this._addPoint(index, point, false, true)) {
            return;
        }
    },
    
    /**
     * Adds a new point to this polygonal element.
     * @param {Number} index the position where the point will be added
     * @param {Webgram.Geometry.Point} point the transformed point to add (relative to the parent)
     */
    addTransformedPoint: function (index, point) {
        if (!this._addPoint(index, point, true, true)) {
            return;
        }
    },
    
    /**
     * Removes a point from this polygonal element.
     * @param {Number} index the position of the point to be deleted
     */
    remPoint: function (index) {
        if (!this._remPoint(index, true)) {
            return;
        }
    },
    
    /**
     * Changes a point of this polygonal element.
     * @param {Number} index the index of the point to change
     * @param {Webgram.Geometry.Point} point the new point, relative to the parent
     */
    setPoint: function (index, point) {
        this._setTransformedShapePoint(index, point);
        
        if (this.rotationCenterControlPoint) {
            this.rotationCenterControlPoint.reset();
        }
        
        this._recreatePolyControlPoints();
    },
    
    /**
     * Returns a list of all the points of this polygonal element.
     * All points are relative to the parent.
     * @returns {Array} a list with the points of this element
     */
    getPoints: function () {
        return this.getShape(true).points;
    },
    
    /**
     * Returns the currently selected point index among the points
     * of this polygonal element.
     * @returns {Number} the selected point index, or <tt>-1</tt> if no point is selected
     */
    getSelectedPointIndex: function () {
        var polyControlPoints = this.getPolyControlPoints();
        
        for (var i = 0; i < polyControlPoints.length; i++) {
            var controlPoint = polyControlPoints[i];
            
            if (controlPoint.getFocusType() === Webgram.ControlPoint.FOCUS_SELECTED) {
                return controlPoint.polyPointIndex;
            }
        }
        
        return -1;
    },
    
    /**
     * Sets the selected point of this polygonal element.
     * @param {Number} index the index of the new selected point
     */
    setSelectedPointIndex: function (index) {
        var polyControlPoints = this.getPolyControlPoints();
        
        for (var i = 0; i < polyControlPoints.length; i++) {
            var controlPoint = polyControlPoints[i];
            
            if (controlPoint.getFocusType() === Webgram.ControlPoint.FOCUS_SELECTED) {
                controlPoint.getFocusType(Webgram.ControlPoint.FOCUS_NONE); 
            }
            
            if (i === index) {
                controlPoint.getFocusType(Webgram.ControlPoint.FOCUS_SELECTED);
            }
        }
    },
    
    /**
     * Returns the index of the point that is marked for removal.
     * A point is marked for removal when it is dragged with the mouse over one of its neighbors.
     * @returns {Number} the index of the point marked for removal, or <tt>-1</tt> if no point is marked for removal
     */
    getMarkedForRemovalPointIndex: function () {
        var controlPoints = this.getPolyControlPoints();
        for (var i = 0; i < controlPoints.length; i++) {
            var controlPoint = controlPoints[i];
            if (controlPoint._markedForRemoval != null) {
                return controlPoint.polyPointIndex;
            }
        }
        
        return -1;
    },
    
    
    /* creation */
    
    beginCreate: function (point) {
        this.addPoint(0, point);
        if (this.maxPointCount > 1) {
            this._pendingCreatePoint = true;
        }
        
        return true; /* accept creation */
    },
    
    continueCreate: function (point, size, mouseDown, click) {
        /* move the temporary point along the mouse */
        var controlPoint = this.getPolyControlPointByIndex(this.getShape().points.length - 1);
        if (controlPoint != null) { /* a control point has been created for the last point */
            controlPoint.move(point, true);
        }
        else { /* no control point has been created, move the shape point*/
            var shape = this.getShape();
            this.setShapePoint(shape.points.length - 1, point);
        }
        
        if (click) {
            if (controlPoint != null) {
                controlPoint.onEndMove.trigger();
            }

            /* stop the creation if we've got enough points */
            if (this.getShape().points.length >= this.maxPointCount) {
                this._pendingCreatePoint = false;
                return false; /* stop */
            }
            
            this.addPoint(this.getShape().points.length, point);
            
            controlPoint = this.getPolyControlPointByIndex(this.getShape().points.length - 1);
            if (controlPoint != null) {
                controlPoint.move(point, true);
            }
        }
        
        return true; /* continue */
    },
    
    endCreate: function () {
        if (this._pendingCreatePoint) {
            this._pendingCreatePoint = false;
            
            var controlPoint = this.getPolyControlPointByIndex(this.getShape().points.length - 1);
            if (controlPoint != null) { /* we have a control point for this point */
                controlPoint.onEndMove.trigger();
                this.remPoint(controlPoint.polyPointIndex); /* remove the temporary poly point */
            }
            else { /* no control point for this point, remove the shape point */
                this.remPoint(this.getShape().points.length - 1);
            }
        }
        
        if (this.getShape().points.length < this.minPointCount) {
            return false; /* failed */
        }
        
        return true; /* succeeded */
    },
    
    
    /* json */

    shapeFromJson: function (json) {
        var i, points = [];
        for (i = 0; i < json.length; i++) {
            var point = json[i];
            var newPoint = new Webgram.Geometry.Point(point.x, point.y);
            
            points.push(newPoint);
        }
        
        /* add, remove and change the points according to the shape changes */
        if (points.length > this.getShape().points.length) { /* points were added */
            for (i = 0; i < this.getShape().points.length; i++) {
                this.setShapePoint(i, points[i]);
            }
            
            for (i = this.getShape().points.length; i < points.length; i++) {
                this._addPoint(this.getShape().points.length, points[i], false);
            }
        }
        else { /* points were removed or just nothing was added */
            for (i = 0; i < points.length; i++) {
                this.setShapePoint(i, points[i]);
            }
            
            while (this.getShape().points.length > points.length) {
                this._remPoint(this.getShape().points.length - 1);
            }
        }
        
        this._recreatePolyControlPoints();
    },
    
    
    /* poly control points */
    
    /**
     * Returns a list with all the poly control points of this element.
     * @see Webgram.DrawingElements.PolyElement.PolyControlPoint
     * @returns {Array} the list of poly control points
     */
    getPolyControlPoints: function () {
        return this.getControlPoints(Webgram.DrawingElements.PolyElement.PolyControlPoint);
    },
    
    /**
     * Returns the poly control point corresponding to the next point whose
     * control point is given as argument.
     * @param {Webgram.DrawingElements.PolyElement.PolyControlPoint} polyControlPoint the poly control point
     * @returns {Webgram.DrawingElements.PolyElement.PolyControlPoint} the next poly control point
     */
    getNextPolyControlPoint: function (polyControlPoint) {
        if (polyControlPoint.polyPointIndex === this.getShape().points.length - 1) {
            return this.getPolyControlPointByIndex(0);
        }
        else {
            return this.getPolyControlPointByIndex(polyControlPoint.polyPointIndex + 1);
        }
    },
    
    /**
     * Returns the poly control point corresponding to the previous point whose
     * control point is given as argument.
     * @param {Webgram.DrawingElements.PolyElement.PolyControlPoint} polyControlPoint the poly control point
     * @returns {Webgram.DrawingElements.PolyElement.PolyControlPoint} the previous poly control point
     */
    getPrevPolyControlPoint: function (polyControlPoint) {
        if (polyControlPoint.polyPointIndex === 0) {
            return this.getPolyControlPointByIndex(this.getShape().points.length - 1);
        }
        else {
            return this.getPolyControlPointByIndex(polyControlPoint.polyPointIndex - 1);
        }
    },
    
    /**
     * Returns the poly control point that controls the point with the given index.
     * @param {Number} index the index of the point
     * @returns {Webgram.DrawingElements.PolyElement.PolyControlPoint} the corresponding poly control point,
     * or <tt>-1</tt> if no such control point is found
     */
    getPolyControlPointByIndex: function (index) {
        var polyControlPoints = this.getPolyControlPoints();
        
        for (var i = 0; i < polyControlPoints.length; i++) {
            var controlPoint = polyControlPoints[i];
            
            if (controlPoint.polyPointIndex === index) {
                return controlPoint;
            }
        }
        
        return null;
    },
    
    /**
     * Returns the class to be used to create the poly control point
     * for the point with the given index.
     * @param {Number} index the index of the point
     * @see Webgram.DrawingElements.PolyElement.PolyControlPoint
     * @returns {Function} the poly control point class
     */
    getPolyControlPointClass: function (index) {
        return Webgram.DrawingElements.PolyElement.PolyControlPoint;
    },
    
    
    /* settings */
    
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
            this._hoveredPoint = null;
        }
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
        if (enabled) {
            if (this._editEnabled) {
                return;
            }
            
            this._recreatePolyControlPoints();
            
            this._editEnabled = true;
            this._selectedDecorationStyle = Webgram.Styles.getStrokeStyle('default-selected-decoration');
        }
        else {
            if (!this._editEnabled) {
                return;
            }
            
            var polyControlPoints = this.getPolyControlPoints();
            for (var i = 0; i < polyControlPoints.length; i++) {
                this.remControlPoint(polyControlPoints[i]);
            }
            
            this._editEnabled = false;
            this._selectedDecorationStyle = this._hoveredDecorationStyle;
        }
    },
    
    _snapShapePoint: function (index, point, fixedPoints, rotationAngle, center) {
        /* if the requested point is marked for removal,
         * don't bother snapping it, just return it as it is */
        var markedForRemovalPointIndex = this.getMarkedForRemovalPointIndex();
        if (markedForRemovalPointIndex === index) {
            return {
                point: point,
                snapVisualFeedback: null,
                xSnapped: false,
                ySnapped: false
            };
        }
        
        return Webgram.DrawingElement.prototype._snapShapePoint.call(this, index, point, fixedPoints, rotationAngle, center);
    },
    
    _snapToAngleInternally: function (index, point, rotationAngle, center) {
        function getLinesIntersection(point1, angle1, point2, angle2) {
            angle1 = Webgram.Utils.normalizeAngle(angle1);
            angle2 = Webgram.Utils.normalizeAngle(angle2);
            
            if (Math.abs(angle1 - angle2) < 0.000001) {
                if (point1.equals(point2)) {
                    return point1;
                }
                else {
                    return null;
                }
            }
            else {
                var m1, n1, m2, n2, x, y;
                /* the special 90 deg for the first line */
                if (Math.abs(angle1 - Math.PI / 2) < 0.000001) {
                    m2 = Math.tan(angle2);
                    n2 = point2.y - m2 * point2.x;
                    x = point1.x;
                    y = m2 * x + n2;
                }
                /* the special 90 deg for the second line */
                else if (Math.abs(angle2 - Math.PI / 2) < 0.000001) {
                    m1 = Math.tan(angle1);
                    n1 = point1.y - m1 * point1.x;
                    x = point2.x;
                    y = m1 * x + n1;
                }
                /* none of them is at 90 deg */
                else {
                    m1 = Math.tan(angle1);
                    n1 = point1.y - m1 * point1.x;
                    m2 = Math.tan(angle2);
                    n2 = point2.y - m2 * point2.x;
                    x = (n1 - n2) / (m2 - m1);
                    y = (n1 * m2 - n2 * m1) / (m2 - m1);
                }

                return new Webgram.Geometry.Point(x, y);
            }
        }
        
        var points = this.getShape().points;
        if (points.length < 2) {
            return;
        }

        var snapAngle = this.getSetting('snapAngle');
        var snapAngleThreshold = this.getSetting('snapAngleThreshold');
        
        if (snapAngle == null || snapAngleThreshold == null) {
            return;
        }
        
        /* gather previous points */
        var prevPoints = [];
        if (index >= 2) {
            prevPoints.push(points[index - 1]);
            prevPoints.push(points[index - 2]);
        }
        else if (index == 1) {
            prevPoints.push(points[0]);
            if (this.closed && points.length > 2) {
                prevPoints.push(points[points.length - 1]);
            }
        }
        else {  /* if (index == 0) */
            if (this.closed && points.length > 2) {
                prevPoints.push(points[points.length - 1]);
                prevPoints.push(points[points.length - 2]);
            }
        }

        /* gather next points */
        var nextPoints = [];
        if (index <= points.length - 3) {
            nextPoints.push(points[index + 1]);
            nextPoints.push(points[index + 2]);
        }
        else if (index == points.length - 2) {
            nextPoints.push(points[points.length - 1]);
            if (this.closed && points.length > 2) {
                nextPoints.push(points[0]);
            }
        }
        else {  /* if (index == points.length - 1) */
            if (this.closed && points.length > 2) {
                nextPoints.push(points[0]);
                nextPoints.push(points[1]);
            }
        }
        
        /* all the angles in angle sets are treated modulo PI */
        
        var i, j, m, n, angle, offsetAngle, snappedPoint;
        
        /* compute previous point and angle sets */
        var prevAngleSet = [];
        var prevPoint = null;
        if (prevPoints.length > 0) {
            prevPoint = prevPoints[0];
            offsetAngle = 0;
            if (prevPoints.length == 2) {
                offsetAngle = prevPoint.getAngleTo(prevPoints[1]);
            }
            
            angle = 0;
            while (angle < Math.PI) {
                prevAngleSet.push(Webgram.Utils.normalizeAngle(angle + offsetAngle) % Math.PI);
                /* add the round angle relative to the system */
                if (!Webgram.Utils.angleMultipleOf(offsetAngle + rotationAngle, snapAngle)) {
                    prevAngleSet.push(Webgram.Utils.normalizeAngle(angle - rotationAngle) % Math.PI);
                }
                angle += snapAngle;
            }
        }

        /* compute next point and angle sets */
        var nextAngleSet = [];
        var nextPoint = null;
        if (nextPoints.length > 0) {
            nextPoint = nextPoints[0];
            offsetAngle = 0;
            if (nextPoints.length == 2) {
                offsetAngle = nextPoint.getAngleTo(nextPoints[1]);
            }
            
            angle = 0;
            while (angle < Math.PI) {
                nextAngleSet.push(Webgram.Utils.normalizeAngle(angle + offsetAngle) % Math.PI);
                /* add the round angle relative to the system */
                if (!Webgram.Utils.angleMultipleOf(offsetAngle + rotationAngle , snapAngle)) {
                    nextAngleSet.push(Webgram.Utils.normalizeAngle(angle - rotationAngle) % Math.PI);
                }
                angle += snapAngle;
            }
        }
        
        /* if the two angle sets are available, compute the solutions
         * based on intersections of lines at given angles */
        var solution, solutions = [];
        if (prevAngleSet.length > 0 && nextAngleSet.length > 0) {
            /* consider the straight line between the two points as a potential solution */
            if (Math.abs(prevPoint.x - nextPoint.x) < 0.000001) { /* special 90 deg case */
                solution = {x: null, y: null, m: Infinity, n: Infinity, x0: prevPoint.x};
            }
            else {
                m = (prevPoint.y - nextPoint.y) / (prevPoint.x - nextPoint.x);
                n = prevPoint.y - m * prevPoint.x;
                
                solution = {x: null, y: null, m: m, n: n, x0: null};
            }
            
            solutions.push(solution);
            
            for (i = 0; i < prevAngleSet.length; i++) {
                for (j = 0; j < nextAngleSet.length; j++) {
                    if (Math.abs(prevAngleSet[i] - nextAngleSet[j]) < 0.000001) {
                        /* this solution is in fact the one given by a straight line
                         * between the prev and next points */
                        continue;
                    }
                    
                    var intersectionPoint = getLinesIntersection(
                            prevPoint, prevAngleSet[i], nextPoint, nextAngleSet[j]);
                    
                    if (intersectionPoint != null) {
                        solution = {x: intersectionPoint.x, y: intersectionPoint.y, m: null, n: null, x0: null};
                        solutions.push(solution);
                    }
                }
            }
        }
        
        /* compute the best match coming from the intersection of the lines at given angles */
        var angle1, angle2, minAngle = Infinity;
        var dist1, dist2, dist3, cosVal;
        var bestSolution = null;
        for (i = 0; i < solutions.length; i++) {
            solution = solutions[i];

            if (solution.m != null) { /* the straight line between prevPoint and nextPoint */
                /* apply the law of cosines to determine the angle between the previous point, point and next point */
                dist1 = point.getDistanceTo(prevPoint);
                dist2 = point.getDistanceTo(nextPoint);
                dist3 = nextPoint.getDistanceTo(prevPoint);
                
                /* compute the cosine value and bound it to -1..1 */
                cosVal = (dist1 * dist1 + dist2 * dist2 - dist3 * dist3) / (2 * dist1 * dist2);
                if (cosVal > 1) {
                    cosVal = 1;
                }
                if (cosVal < -1) {
                    cosVal = -1;
                }

                angle = Math.acos(cosVal);
                angle = Math.PI - angle;
            }
            else { /* a point */
                /* apply the law of cosines twice to determine the differences in angles */
                snappedPoint = new Webgram.Geometry.Point(solution.x, solution.y);
                dist3 = point.getDistanceTo(snappedPoint);
                
                dist1 = point.getDistanceTo(prevPoint);
                dist2 = snappedPoint.getDistanceTo(prevPoint);
                cosVal = (dist1 * dist1 + dist2 * dist2 - dist3 * dist3) / (2 * dist1 * dist2);
                if (cosVal > 1) {
                    cosVal = 1;
                }
                if (cosVal < -1) {
                    cosVal = -1;
                }
                
                angle1 = Math.acos(cosVal);
                
                dist1 = point.getDistanceTo(nextPoint);
                dist2 = snappedPoint.getDistanceTo(nextPoint);
                cosVal = (dist1 * dist1 + dist2 * dist2 - dist3 * dist3) / (2 * dist1 * dist2);
                if (cosVal > 1) {
                    cosVal = 1;
                }
                if (cosVal < -1) {
                    cosVal = -1;
                }
                
                angle2 = Math.acos(cosVal);
                
                angle = angle1 + angle2;
            }
            
            /* minimum angle difference (the sum of the two) wins */
            if (angle < minAngle && angle < snapAngleThreshold) {
                minAngle = angle;
                bestSolution = solution;
            }
        }
        
        /* if there is a match coming from an intersection of the lines, return it right away */
        
        var xValue, yValue, preferredPoint = null;
        if (bestSolution != null) {
            snapVisualFeedback = null;
            
            if (bestSolution.m != null) { /* line */
                if (bestSolution.m === 0) {
                    xValue = null;
                    yValue = bestSolution.n;
                }
                else if (bestSolution.m === Infinity) {
                    xValue = bestSolution.x0;
                    yValue = null;
                }
                else {
                    /** @ignore */
                    xValue = function (y) { return (y - bestSolution.n) / bestSolution.m; };
                    /** @ignore */
                    yValue = function (x) { return bestSolution.m * x + bestSolution.n; };
                    m = bestSolution.m;
                    n = bestSolution.n;
                    preferredPoint = new Webgram.Geometry.Point(
                            (point.y * m + point.x - m * n) / (m * m + 1),
                            (m * m * point.y + m * point.x + n) / (m * m + 1));
                }
            }
            else { /* point */
                xValue = bestSolution.x;
                yValue = bestSolution.y;
                bestPoint = new Webgram.Geometry.Point(xValue, yValue);
                
                snapVisualFeedback = [];
                snapVisualFeedback.push({
                    type: 'radial',
                    x: prevPoint.x,
                    y: prevPoint.y,
                    angle: prevPoint.getAngleTo(bestPoint)
                });
                snapVisualFeedback.push({
                    type: 'radial',
                    x: nextPoint.x,
                    y: nextPoint.y,
                    angle: nextPoint.getAngleTo(bestPoint)
                });
            }
            
            return {
                x: xValue,
                y: yValue,
                preferredPoint: preferredPoint,
                snapVisualFeedback: snapVisualFeedback
            };
        }
        
        /* if no intersection matched, compute the solutions formed by lines at given angles */
        /* the best match among these solutions is the one that yields the smallest angle difference */
        minAngle = null;
        var minPoint = null;
        var minAngleDelta = Infinity;
        var angleDelta;
        var fullAngleSet = [];
        
        for (i = 0; i < prevAngleSet.length; i++) {
            fullAngleSet.push({
                angle: prevAngleSet[i],
                point: prevPoint
            });

            /* since the angle set contains angles from 0 to PI,
             * we must manually add the rest of the angles from PI to 2*PI */
            fullAngleSet.push({
                angle: prevAngleSet[i] + Math.PI,
                point: prevPoint
            });
        }
        
        for (i = 0; i < nextAngleSet.length; i++) {
            fullAngleSet.push({
                angle: nextAngleSet[i],
                point: nextPoint
            });

            /* since the angle set contains angles from 0 to PI,
             * we must manually add the rest of the angles from PI to 2*PI */
            fullAngleSet.push({
                angle: nextAngleSet[i] + Math.PI,
                point: nextPoint
            });
        }
        
        for (i = 0; i < fullAngleSet.length; i++) {
            angle = fullAngleSet[i].angle;
            
            angle1 = Webgram.Utils.normalizeAngle(fullAngleSet[i].point.getAngleTo(point));
            angleDelta = Math.abs(angle - angle1);
            if (angleDelta > Math.PI) {
                angleDelta = 2 * Math.PI - angleDelta;
            }
            if (angleDelta < minAngleDelta && angleDelta < snapAngleThreshold) {
                minAngleDelta = angleDelta;
                minAngle = angle;
                minPoint = fullAngleSet[i].point;
            }
        }
        
        /* if we have a solution based on lines at given angles,
         * we return it among with a radial display snapping info */
        if (minAngle != null) {
            minAngle = Webgram.Utils.normalizeAngle(minAngle); /* the angle is now between 0 and 2*PI */
            preferredPoint = null;
            if (Math.abs(minAngle - Math.PI / 2) < 0.000001 || Math.abs(minAngle - 3 * Math.PI / 2) < 0.000001) { /* the angle is odd multiple of PI/2 */
                xValue = minPoint.x;
                yValue = null;
            }
            else if (Math.abs(minAngle) < 0.000001 || Math.abs(minAngle - Math.PI) < 0.000001) { /* the angle is even multiple of PI/2 */
                xValue = null;
                yValue = minPoint.y;
            }
            else {
                m = Math.tan(minAngle);
                n = minPoint.y - m * minPoint.x;
                xValue = function (y) { return (y - n) / m; };
                yValue = function (x) { return m * x + n; };
                preferredPoint = new Webgram.Geometry.Point(
                        (point.y * m + point.x - m * n) / (m * m + 1),
                        (m * m * point.y + m * point.x + n) / (m * m + 1));
            }

            return {
                x: xValue,
                y: yValue,
                preferredPoint: preferredPoint,
                snapVisualFeedback: {
                    type: 'radial',
                    x: minPoint.x,
                    y: minPoint.y,
                    angle: minAngle
                }
            };
        }
    },
    
    _addPoint: function (index, point, rotated, triggerEvents) {
        if (index < 0 || index > this.getShape().points.length) {
            return false;
        }
        
        var controlPoint;
        
        /* update poly point indexes */
        var polyControlPoints = this.getPolyControlPoints();
        for (var i = 0; i < polyControlPoints.length; i++) {
            controlPoint = polyControlPoints[i];
            
            if (controlPoint.polyPointIndex >= index) {
                controlPoint.polyPointIndex += 1;
            }
        }
        
        if (rotated) {
            /* unrotate the point */
            point = this.rotateInverse(point);
        }
        
        /* effectively add the point */
        var points = this.getShape().points;
        points.splice(index, 0, point);
        this.setShape(new Webgram.Geometry.Poly(points));
        
        var ControlPointClass = this.getPolyControlPointClass(index);
        if (ControlPointClass != null) {
            this.addControlPoint(new ControlPointClass(index));
        }
            
        this._recreatePolyControlPoints();
        this.snap(index);
        
        if (triggerEvents) {
            this.onAddPoint.trigger(index, point);
        }
        
        return true;
    },
    
    _remPoint: function (index, triggerEvents) {
        if (index < 0 || index >= this.getShape().points.length) {
            return false;
        }
        
        if (this.getShape().points.length <= 2) { /* we need at least two points in a polyElement */
            return false;
        }
        
        var controlPoint, i;
        
        /* remove the given point & associated control point */
        var polyControlPoints = this.getPolyControlPoints();
        for (i = 0; i < polyControlPoints.length; i++) {
            controlPoint = polyControlPoints[i];
            
            if (controlPoint.polyPointIndex === index) {
                this.remControlPoint(controlPoint);
            }
        }
        
        /* update the polyPointIndices */
        polyControlPoints = this.getPolyControlPoints();
        for (i = 0; i < polyControlPoints.length; i++) {
            controlPoint = polyControlPoints[i];
            
            if (controlPoint.polyPointIndex > index) {
                controlPoint.polyPointIndex -= 1;
            }
        }
        
        /* remove the shape point */
        var point = this.getShapePoint(index);
        var points = this.getShape().points;
        points.splice(index, 1);
        this.setShape(new Webgram.Geometry.Poly(points));
        
        this._recreatePolyControlPoints();
        
        if (triggerEvents) {
            this.onRemovePoint.trigger(index, point);
        }
        
        return true;
    },
    
    _markHoveredPoint: function (point) {
        if (!point) {
            this._hoveredPoint = null;
            this.invalidateDrawing();
            
            return;
        }

        this._hoveredPoint = this._computeHoveredPoint(point);
        
        this.invalidateDrawing();
    },
    
    _addHoveredPoint: function () {
        if (!this._hoveredPoint) {
            return;
        }
        
        var hoveredPointIndex = this._getHoveredPointIndex();
        if (hoveredPointIndex === -1) { /* not found, for some reason */
            return;
        }
        
        var point = this.translateDirect(this._hoveredPoint);    
        
        this.addPoint(hoveredPointIndex, point);
        this.setSelectedPointIndex(hoveredPointIndex);
        
        this._hoveredPoint = null;
        this.invalidateDrawing();
    },
    
    _removeSelectedPoint: function () {
        var selectedPointIndex = this.getSelectedPointIndex();
        if (selectedPointIndex !== -1) {
            this.remPoint(selectedPointIndex);
            this.invalidateDrawing();
        }
    },
    
    _getHoveredPointIndex: function () {
        var point = this.transformDirect(this._hoveredPoint);
        
        /* determine the segment that the point hovers */
        var hoveredPointIndex = -1;
        var points = this.getShape(true).points;
        for (var i = 0; i < points.length; i++) {
            var point1 = points[i];
            var point2;
            if (i < points.length - 1) {
                point2 = points[i + 1];
            }
            else {
                point2 = points[0];
            }
            
            if (Webgram.Utils.pointInSegment(point, point1, point2, 3)) { /* a line tolerance of 3 should suffice */
                
                hoveredPointIndex = i + 1;
                break;
            }
        }
        
        return hoveredPointIndex;
    },

    _computeHoveredPoint: function (mousePoint) {
        /* determine the segment that the point hovers */
        var points = this.translateInverse(this.getShape(false)).points;
        for (var i = 0; i < points.length; i++) {
            if (!this.closed && i === points.length - 1) {
                break;
            }
            
            var point1 = points[i];
            var point2;
            if (i < points.length - 1) {
                point2 = points[i + 1];
            }
            else {
                point2 = points[0];
            }
            
            if (Webgram.Utils.pointInSegment(mousePoint, point1, point2, this.getLineTolerance())) {
                var x, y;
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
                
                var hoveredPoint = new Webgram.Geometry.Point(x, y);
                
                /* don't mark the hovered point if over an existing CP */
                var minDistThresh = this._controlPoints[0].getRadius() * 1.5 / this.getZoomFactor();
                for (i = 0; i < points.length; i++) {
                    if (hoveredPoint.getDistanceTo(points[i]) < minDistThresh) {
                        return null;
                    }
                }
                
                return hoveredPoint;
            }
        }
        
        return null;
    },
    
    _recreatePolyControlPoints: function () {
        var i, controlPoints = this.getPolyControlPoints();
        var controlPointsByIndex = [];
        
        /* gather the existing poly control points */
        for (i = 0; i < controlPoints.length; i++) {
            controlPointsByIndex[controlPoints[i].polyPointIndex] = controlPoints[i];
        }

        /* add the new points */
        for (i = 0; i < this.getShape().points.length; i++) {
            var ControlPointClass = this.getPolyControlPointClass(i);
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
    }
};

Webgram.Class('Webgram.DrawingElements.PolyElement', Webgram.DrawingElement);


/**
 * @class A control point that controls a poly point of a polygonal element.
 * @extends Webgram.ControlPoint
 * @see Webgram.DrawingElements.PolyElement
 * @param {Number} polyPointIndex the index of the polygonal point to control
 */
Webgram.DrawingElements.PolyElement.PolyControlPoint = function (polyPointIndex) {
    Webgram.ControlPoint.call(this);
    
    /**
     * The index of the poly point controlled by this control point.
     */
    this.polyPointIndex = polyPointIndex;
    
    this._removeDistance = 10;
    this._markedForRemoval = null;
    
    this.setSnapToGridEnabled(false);

    this.onEndMove.bind(function () {
        this._removeIfMarked();
    });
};

Webgram.DrawingElements.PolyElement.PolyControlPoint.prototype = {
    getCursor: function () {
        return 'pointer';
    },
    
    draw: function () {
        this.drawBase();
        
        if (this._markedForRemoval != null) {
            this.drawRemovalMark();
        }
    },
    
    /**
     * The drawing procedure for a poly control point is divided into two parts:
     * a base drawing method (this one) and an additional drawing of a removal mark,
     * in case the poly control point is marked for removal.
     * @see Webgram.DrawingElements.PolyElement#drawRemovalMark 
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
     * See {@link Webgram.DrawingElements.PolyElement#drawBase} for an explanation.
     */
    drawRemovalMark: function () {
        var image = this.getImageStore().get('remove-poly-point');
        if (!image) {
            return;
        }
        
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
    },
    
    computeAnchor: function () {
        return this.drawingElement.translateInverse(this.drawingElement.getShapePoint(this.polyPointIndex));
    },
    
    snap: function (point) {
        if (this._markedForRemoval != null) {
            var neighborAnchor = this._markedForRemoval.getAnchor();
            var distance = point.getDistanceTo(neighborAnchor);
            var snapDistance = this.getSetting('snapDistance', this.getRadius());
            if (distance <= snapDistance) {
                return neighborAnchor;
            }
            else {
                return point;
            }
        }
        else {
            return point;
        }
    },
    
    processMove: function (point, vanillaPoint) {
        point = this.drawingElement.transformDirect(point);
        this.drawingElement._setTransformedShapePoint(this.polyPointIndex, point);
        
        if (this.drawingElement.rotationCenterControlPoint) {
            this.drawingElement.rotationCenterControlPoint.reset();
        }
        
        this.drawingElement.snap(this.polyPointIndex);
        
        if (this.drawingElement.isAddRemovePointsEnabled()) {
            this._checkAndMarkForRemoval();
        }
    },
    
    _checkAndMarkForRemoval: function () {
        if (this.drawingElement.isBeingCreated()) {
            return;
        }
        
        this._markedForRemoval = null;
        
        var prevControlPoint = this.drawingElement.getPolyControlPointByIndex(this.polyPointIndex - 1);
        var nextControlPoint = this.drawingElement.getPolyControlPointByIndex(this.polyPointIndex + 1);
        
        if (prevControlPoint && prevControlPoint.getAnchor() &&
                prevControlPoint.getAnchor().getDistanceTo(this.getAnchor()) < this._removeDistance) {
            
            if (this.drawingElement.getPolyControlPoints().length <= this.drawingElement.minPointCount) {
                return;
            }
            
            this._markedForRemoval = prevControlPoint;
        }
        
        if (nextControlPoint && nextControlPoint.getAnchor() &&
                nextControlPoint.getAnchor().getDistanceTo(this.getAnchor()) < this._removeDistance) {
            
            if (this.drawingElement.getPolyControlPoints().length <= this.drawingElement.minPointCount) {
                return;
            }
            
            this._markedForRemoval = nextControlPoint;
        }
    },
    
    _removeIfMarked: function () {
        if (this._markedForRemoval != null) {
            this.drawingElement.remPoint(this.polyPointIndex);
        }
    }
};

Webgram.Class('Webgram.DrawingElements.PolyElement.PolyControlPoint', Webgram.ControlPoint);
