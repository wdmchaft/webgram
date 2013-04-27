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
 * @namespace Contains the main drawing controls used by webgram.
 * @see Webgram.DrawingControl
 */
Webgram.DrawingControls = Webgram.Namespace('Webgram.DrawingControls');


/**
 * @class The main drawing control, used to manipulate the existing drawing elements,
 * as well as for zooming and panning.
 * @extends Webgram.DrawingControl
 * @param {Webgram.DrawingElements.RootContainer} rootContainer the root container element of the webgram
 */
Webgram.DrawingControls.SelectDrawingControl = function (rootContainer) {
    Webgram.DrawingControl.call(this, rootContainer);
    
    /**
     * The currently hovered drawing element, or <tt>null</tt> if no element is hovered.
     * @type Webgram.DrawingElement
     */
    this.hoveredDrawingElement = null;

    /**
     * The currently selected drawing element, or <tt>null</tt> if no element is selected.
     * @type Webgram.DrawingElement
     */
    this.selectedDrawingElement = null;
    
    /**
     * The currently hovered control point, or <tt>null</tt> if no control point is hovered.
     * @type Webgram.ControlPoint
     */
    this.hoveredControlPoint = null;

    /**
     * The currently selected control point, or <tt>null</tt> if no control point is selected.
     * @type Webgram.ControlPoint
     */
    this.selectedControlPoint = null;

    /**
     * The currently hovered action menu item, or <tt>null</tt> if no action menu item is hovered.
     * @type Webgram.ActionMenuItem
     */
    this.hoveredActionMenuItem = null;
    
    /**
     * An event that is triggered when the current selection of drawing elements changes.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @type Webgram.Event
     */
    this.onSelectionChange = new Webgram.Event('selection change', this); /* (drawingElements) */
    
    this._mouseDownPoint = null;
    this._panMouseDownPoint = null;
    this._msContainerElement = null;

    this.onDeactivate.bind(function () {
        this.setSelectedDrawingElements(null);
        
        this.hoveredDrawingElement = null;
        this.selectedDrawingElement = null;
        this.hoveredControlPoint = null;
        this.selectedControlPoint = null;
        this.hoveredActionMenuItem = null;
        
        this._mouseDownPoint = null;
        this._msContainerElement = null;
    });
    
    this.onSelectionChange.bind(function (drawingElements) {
        this.rootContainer.webgram.onSelectionChange.trigger(drawingElements);
    });
};

Webgram.DrawingControls.SelectDrawingControl.prototype = {
    getSelectedDrawingElements: function () {
        if (this._msContainerElement) {
            return this._msContainerElement.drawingElements.slice(0);
        }
        else if (this.selectedDrawingElement) {
            return [this.selectedDrawingElement];
        }
        else {
            return [];
        }
    },
    
    setSelectedDrawingElements: function (drawingElements) {
        /* clear the multiple selection, if any */
        if (this._msContainerElement) {
            this._remFromMultipleSelection();
        }
        
        if (this.selectedDrawingElement) {
            this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
            this.selectedDrawingElement = null;
        }
        
        if (drawingElements && drawingElements.length) {
            if (drawingElements.length === 1) { /* single selected element */
                this.selectedDrawingElement = drawingElements[0];
                if (this.selectedDrawingElement) {
                    this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
                }
                
                this.onSelectionChange.trigger([this.selectedDrawingElement]);
            }
            else { /* multiple selected elements */
                if (this.getSetting('multipleSelectionEnabled')) {
                    for (var i = 0; i < drawingElements.length; i++) {
                        drawingElements[i].setFocusType(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                    }
                    
                    this._msContainerElement = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer(0, 0, 1, 1);
                    this.rootContainer._addDrawingElement(this._msContainerElement);
                    this.selectedDrawingElement = this._msContainerElement;
                    this._finishMultipleSelection(); /* this will trigger the onSelectionChange event */
                }
                else {
                    this.onSelectionChange.trigger([]);
                }
            }
        }
        else {
            this.onSelectionChange.trigger([]);            
        }
        
        this.selectedControlPoint = null;   
        this.hoveredControlPoint = null;
        this.hoveredActionMenuItem = null;
    },
    
    
    /* actions */
    
    /**
     * This action copies the current selection of drawing elements into the clipboard.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doCopyAction: function () {
        var drawingElements = this.getSelectedDrawingElements();
        var jsonList = [];
        
        if (drawingElements.length === 0) {
            return false; /* nothing to do */
        }
        
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            var json = drawingElement.toJson(true);
            jsonList.push(json);
            
            drawingElement.onCopy.trigger();
        }
        
        var webgram = this.getWebgram();
        webgram.setClipboard('json/drawing-elements', jsonList);

        webgram.onCopyAction.trigger(drawingElements.slice(0));
        
        return true;
    },
    
    /**
     * This action pastes the contents of the clipboard onto the root container.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doPasteAction: function () {
        var webgram = this.getWebgram();
        var clipboard = webgram.getClipboard();
        
        if (clipboard.type === 'json/drawing-elements') {
            var jsonList = clipboard.content;
            var i, drawingElement, drawingElements = [];
            
            for (i = 0; i < jsonList.length; i++) {
                var json = jsonList[i];
                var klass = json.cls || Webgram.Utils.getField(json.className);
                if (klass == null) { /* no such class, ignoring */
                    continue;
                }
                
                drawingElement = new klass(); /* create an instance of klass with default properties */
                drawingElement._pasting = true;
                drawingElement.fromJson(json);
                
                this.rootContainer._addDrawingElement(drawingElement, null, true);
                
                drawingElements.push(drawingElement);
                drawingElement.onPaste.trigger();
                
                drawingElement._pasting = false;
            }
            
            if (drawingElements.length === 0) {
                return false; /* no DE was actually pasted */
            }
            
            /* move the newly created DEs next to the currently selected DE */
            var selectedDrawingElements = this.getSelectedDrawingElements();
            var center = null;
            if (selectedDrawingElements.length > 0) {
                center = selectedDrawingElements[0].getCenter();
            }
            
            var delta = this.getSetting('mainGrid.sizeX', 25);
            var deltaX = delta, deltaY = delta;
            if (center != null) {
                var oldCenter = drawingElements[0].getCenter();
                deltaX += center.x - oldCenter.x;
                deltaY += center.y - oldCenter.y;
            }
            
            for (i = 0; i < drawingElements.length; i++) {
                drawingElement = drawingElements[i];
                drawingElement.moveTo(drawingElement.getCenter().getTranslated(deltaX, deltaY));
            }
            
            this.setSelectedDrawingElements(drawingElements);
            
            webgram.onPasteAction.trigger(drawingElements.slice(0));
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action duplicates the current selection of drawing elements on the root container.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doDuplicateAction: function () {
        var drawingElement, drawingElements = this.getSelectedDrawingElements();
        var i, json, jsonList = [];
        var webgram = this.getWebgram();
        
        if (drawingElements.length === 0) {
            return false; /* nothing to do */
        }
        
        for (i = 0; i < drawingElements.length; i++) {
            drawingElement = drawingElements[i];
            json = drawingElement.toJson(true);
            jsonList.push(json);
        }
        
        drawingElements = [];
        
        for (i = 0; i < jsonList.length; i++) {
            json = jsonList[i];
            var klass = json.cls || Webgram.Utils.getField(json.className);
            if (klass == null) { /* no such class, ignoring */
                continue;
            }
            
            drawingElement = new klass(); /* create an instance of klass with default properties */
            drawingElement._duplicating = true;
            drawingElement.fromJson(json);
            
            this.rootContainer._addDrawingElement(drawingElement, null, true);
            
            drawingElements.push(drawingElement);
            drawingElement.onDuplicate.trigger();
            
            drawingElement._duplicating = false;
        }
        
        if (drawingElements.length === 0) {
            return false; /* no DE was actually duplicated */
        }
        
        /* move the newly created DEs next to the currently selected DE */
        var center = null;
        if (this.selectedDrawingElement != null) {
            center = this.selectedDrawingElement.getCenter();
        }
        
        var mainGridSize = this.getSetting('mainGrid.sizeX', 25);
        var snapDistance = this.getSetting('snapDistance', 10) + 1;
        var delta = Math.max(mainGridSize, snapDistance);
        
        var deltaX = delta, deltaY = delta;
        if (center != null) {
            var oldCenter = drawingElements[0].getCenter();
            deltaX += center.x - oldCenter.x;
            deltaY += center.y - oldCenter.y;
        }
        
        for (i = 0; i < drawingElements.length; i++) {
            drawingElement = drawingElements[i];
            drawingElement.moveTo(drawingElement.getCenter().getTranslated(deltaX, deltaY));
        }
        
        this.setSelectedDrawingElements(drawingElements);
        
        webgram.onDuplicateAction.trigger(drawingElements.slice(0));
        
        return true;
    },
    
    /**
     * This action deletes the current selection of drawing elements from the root container.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doDeleteAction: function () {
        var drawingElements = this.getSelectedDrawingElements();
        if (drawingElements.length > 0) {
            if (drawingElements.length > 1) { /* multiple selection */
                this.setSelectedDrawingElements();
                
                for (var i = 0; i < drawingElements.length; i++) {
                    this.rootContainer.remDrawingElement(drawingElements[i]);
                }
            }
            else { /* single element selection */
                this.rootContainer.remDrawingElement(drawingElements[0]);
            }
            
            this.getWebgram().onDeleteAction.trigger(drawingElements.slice(0));
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action moves the current selection of drawing elements on the root container.
     * The move distance is determined by the <tt>snapGrid</tt> global setting if the <tt>fine</tt>
     * argument is <tt>true</tt>, and by the <tt>mainGrid</tt> global setting otherwise.
     * @param {String} direction a string indicating the direction:
     *  <tt>'top'</tt>, <tt>'right'</tt>, <tt>'bottom'</tt> or <tt>'left'</tt>
     * @param {Boolean} fine set to <tt>true</tt> to perform a fine moving,
     *  or <tt>false</tt>/<tt>undefined</tt> to perform a coarse moving
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doMoveAction: function (direction, fine) {
        var size;
        if (fine) {
            size = this.getSetting('snapGrid.sizeX', 5);
        }
        else {
            size = this.getSetting('mainGrid.sizeX', 25);
        }
        
        var drawingElement = this.selectedDrawingElement;
        if (drawingElement == null) {
            return false;
        }
        
        var center;
        if (direction === 'up') {
            center = drawingElement.getCenter().getTranslated(0, -size);
        }
        else if (direction === 'right') {
            center = drawingElement.getCenter().getTranslated(size, 0);
        }
        else if (direction === 'down') {
            center = drawingElement.getCenter().getTranslated(0, size);
        }
        else if (direction === 'left') {
            center = drawingElement.getCenter().getTranslated(-size, 0);
        }
        else {
            return false;
        }
        
        drawingElement.moveTo(center);
        
        this.invalidateDrawing(true);
        
        this.getWebgram().onMoveAction.trigger(this.getSelectedDrawingElements().slice(0), direction);
        
        return true;
    },
    
    /**
     * This action brings the current selection of drawing elements to front with one position.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doBringToFrontAction: function () {
        var drawingElement = this.selectedDrawingElement;
        if (drawingElement == null) {
            return false;
        }
        
        var index = this.rootContainer.getDrawingElementIndex(drawingElement);
        this.rootContainer._setDrawingElementIndex(drawingElement, index + 1, true);
        if (index !== this.rootContainer.getDrawingElementIndex(drawingElement)) {
            this.getWebgram().onBringToFrontAction.trigger(this.getSelectedDrawingElements().slice(0));
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action sends the current selection of drawing elements to back with one position.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doSendToBackAction: function () {
        var drawingElement = this.selectedDrawingElement;
        if (drawingElement == null) {
            return false;
        }
        
        var index = this.rootContainer.getDrawingElementIndex(drawingElement);
        this.rootContainer._setDrawingElementIndex(drawingElement, index - 1, true);
        if (index !== this.rootContainer.getDrawingElementIndex(drawingElement)) {
            this.getWebgram().onSendToBackAction.trigger(this.getSelectedDrawingElements().slice(0));
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action applies a horizontal flipping on the current selection of drawing elements.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doFlipHorizontallyAction: function () {
        var drawingElement = this.selectedDrawingElement;
        if (drawingElement == null) {
            return false;
        }
        
        if (drawingElement.isFlipEnabled()) {
            drawingElement.flipHorizontally();
            this.getWebgram().onFlipHorizontallyAction.trigger(this.getSelectedDrawingElements().slice(0));
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action applies a vertical flipping on the current selection of drawing elements.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doFlipVerticallyAction: function () {
        var drawingElement = this.selectedDrawingElement;
        if (drawingElement == null) {
            return false;
        }
        
        if (drawingElement.isFlipEnabled()) {
            drawingElement.flipVertically();
            this.getWebgram().onFlipVerticallyAction.trigger(this.getSelectedDrawingElements().slice(0));
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action increases the zoom level if the maximum zoom level
     * hasn't been reached yet.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomInAction: function () {
        var webgram = this.getWebgram();
        var zoomLevel = webgram.getZoomLevel();
        var zoomFactors = this.getSetting('zoomFactors');
        var zoomLevelCount = zoomFactors.length;
        
        if (zoomLevel < zoomLevelCount - 1) {
            webgram.setZoomLevel(zoomLevel + 1);
            webgram.onZoomInAction.trigger(zoomLevel + 1);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action decreases the zoom level if the minimum zoom level
     * hasn't been reached yet.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomOutAction: function () {
        var webgram = this.getWebgram();
        var zoomLevel = webgram.getZoomLevel();
        
        if (zoomLevel > 0) {
            webgram.setZoomLevel(zoomLevel - 1);
            webgram.onZoomOutAction.trigger(zoomLevel - 1);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action sets the zoom level to 1:1.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomOneAction: function () {
        var webgram = this.getWebgram();
        var zoomFactor = webgram.getZoomFactor();
        var zoomFactors = this.getSetting('zoomFactors');
        
        if (zoomFactor !== 1) {
            for (var i = 0; i < zoomFactors.length; i++) {
                if (zoomFactors[i] === 1) {
                    webgram.setZoomLevel(i);
                    webgram.onZoomInAction.trigger(i);
                    
                    return true;
                }
            }
        }
        
        return false;
    },
    
    /**
     * This action sets the maximal zoom level at which all the drawing elements
     * added to the webgram are still visible.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomFitAction: function () {
        var webgram = this.getWebgram();

        if (webgram.getDrawingElements().length > 0) {
            /* calling the setVisibleDrawingElements() method
             * with no argument will set the optimal zoom level */
            webgram.setVisibleDrawingElements();
            webgram.onZoomInAction.trigger(webgram.getZoomLevel());
        
            return true;
        }
        
        return false;
    },
    
    /**
     * This action sets the current center of the webgram to the origin.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doCenterOriginAction: function () {
        var webgram = this.getWebgram();

        webgram.setVisibleCenter(Webgram.Geometry.Point.zero());
        
        return true;
    },
    
    
    /* event handlers */
    
    handleMouseDown: function (point, button, modifiers) {
        /* first try to pass the event to the hovered element */
        if (this.hoveredDrawingElement && this.hoveredDrawingElement.pointInside(point, true)) {
            var result = this.hoveredDrawingElement.onMouseDown.trigger(
                    this.hoveredDrawingElement.transformInverse(point), button, modifiers);
            
            if (result) {
                return true;
            }
        }

        if (button === 1) {
            this.invalidateDrawing();
            
            this._mouseDownPoint = point;
            
            /* unselect any previously selected drawing element */
            var prevSelectedDrawingElement = this.selectedDrawingElement; /* remember the previously selected DE */
            if (this.selectedDrawingElement && this.selectedDrawingElement !== this.hoveredDrawingElement) {
                this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
            }
            
            /* unselect any previously selected control point */
            var prevSelectedControlPoint = this.selectedControlPoint; /* remember the previously selected CP */
            if (this.selectedControlPoint && this.selectedControlPoint !== this.hoveredControlPoint) {
                this.selectedControlPoint.setFocusType(Webgram.ControlPoint.FOCUS_NONE);
            }
            
            /* select the hovered drawing element and control point */
            this.selectedControlPoint = this.hoveredControlPoint;
            this.selectedDrawingElement = this.hoveredDrawingElement;
            
            /* trigger the (un)select events for DEs */
            if (this.selectedDrawingElement !== prevSelectedDrawingElement) {
                if (prevSelectedDrawingElement) {
                    prevSelectedDrawingElement.onUnselect.trigger();
                    prevSelectedDrawingElement.disableShift();
                }
                if (this.selectedDrawingElement) {
                    this.selectedDrawingElement.onSelect.trigger();
                    this.onSelectionChange.trigger([this.selectedDrawingElement]);
                }
                else {
                    this.onSelectionChange.trigger([]);
                }
            }
            
            /* trigger the (un)select events for CPs */
            if (this.selectedControlPoint !== prevSelectedControlPoint) {
                if (prevSelectedControlPoint) {
                    prevSelectedControlPoint.onUnselect.trigger();
                }
                if (this.selectedControlPoint) {
                    this.selectedControlPoint.onSelect.trigger();
                }
            }
            
            if (this.selectedControlPoint) { /* clicked on a CP */
                this.selectedControlPoint.setFocusType(Webgram.ControlPoint.FOCUS_SELECTED);
                this.selectedControlPoint.onBeginMove.trigger();
                
                this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
            }
            else if (this.hoveredActionMenuItem) { /* clicked on an AMI */
                this.hoveredActionMenuItem.activate();
                
                this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
            }
            else if (this.selectedDrawingElement) { /* clicked on a DE */
                /* remember the mouse down coordinates relatively to the selected drawing element */
                var center = this.selectedDrawingElement.getCenter();
                this.selectedDrawingElement._mouseDownPoint = new Webgram.Geometry.Point(point.x - center.x, point.y - center.y);
                
                /* update the selected element's focus */
                this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
                
                if (modifiers.shift &&
                        (!this._msContainerElement || (this._msContainerElement.getRotationAngle() === 0))) { /* add/remove to/from current selection */

                    if (this.selectedDrawingElement !== this._msContainerElement) {
                        if (this._msContainerElement) { /* existing multiple selection */
                            this._remFromMultipleSelection(true);
                            this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                            this._finishMultipleSelection(point);
                        }
                        else { /* create new multiple selection */
                            if (this.getSetting('multipleSelectionEnabled')) {
                                if (prevSelectedDrawingElement && prevSelectedDrawingElement !== this.selectedDrawingElement) {
                                    prevSelectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                                    this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                                    this._msContainerElement = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer(point.x, point.y, 1, 1);
                                    this.rootContainer._addDrawingElement(this._msContainerElement);
                                    this._finishMultipleSelection(point);
                                }
                                else {
                                    this.selectedDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
                                }
                            }
                        }
                    }
                }
                else { /* no modifier pressed, normal click to select */
                    if (this._msContainerElement && this.selectedDrawingElement !== this._msContainerElement) {
                        /* clear any existing multiple selection */
                        this._remFromMultipleSelection();
                    }
                }
            }
            else { /* clicked outside of any DE */
                /* clear any existing multiple selection */
                if (this._msContainerElement) {
                    this._remFromMultipleSelection();
                }
                
                /* start a new multiple selection */
                if (this.getSetting('multipleSelectionEnabled')) {
                    /* snap the point to grid */
                    
                    /* snap the point */
                    var snapGrid = this.getSetting('snapGrid');
                    if (snapGrid != null) {
                        point = new Webgram.Geometry.Point(
                                Math.round(point.x / snapGrid.sizeX) * snapGrid.sizeX,
                                Math.round(point.y / snapGrid.sizeY) * snapGrid.sizeY);
                    }

                    this._msContainerElement = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer(point.x, point.y, 1, 1);
                    this.rootContainer._addDrawingElement(this._msContainerElement);
                }
                
                return true;
            }
        }
        else if (button === 3 && this.getSetting('panEnabled')) { /* right button, used for panning */
            this._panMouseDownPoint = point;
            
            return true;
        } 
    },
    
    handleMouseUp: function (point, button, modifiers) {
        /* first try to pass the event to the hovered element */
        if (this.hoveredDrawingElement && this.hoveredDrawingElement.pointInside(point, true)) {
            var result = this.hoveredDrawingElement.onMouseUp.trigger(
                    this.hoveredDrawingElement.transformInverse(point), button, modifiers);
            
            if (result) {
                return true;
            }
        }
        
        if (button === 1) {
            this._mouseDownPoint = null;
            
            if (this.selectedControlPoint) {
                this.selectedControlPoint.onEndMove.trigger();
                
                return true;
            }
            
            if (this.selectedDrawingElement) {
                this.selectedDrawingElement._mouseDownPoint = null;
            }
            
            /* stop the multiple selection, if started */
            if (this._msContainerElement && this._msContainerElement.drawingElements.length === 0) {
                this._finishMultipleSelection(point);
                this.invalidateDrawing();
                
                return true;
            }
        }
        else if (button === 3) { /* right button, used for panning */
            delete this._panMouseDownPoint;
            
            return true;
        } 
    },
    
    handleMouseMove: function (point, modifiers) {
        if (this.hoveredDrawingElement && this.hoveredDrawingElement.pointInside(point, true)) {
            var result = this.hoveredDrawingElement.onMouseMove.trigger(
                    this.hoveredDrawingElement.transformInverse(point), modifiers);
            
            if (result) {
                return result;
            }
        }

        if (this._panMouseDownPoint) { /* used for panning */
            var deltaX = point.x - this._panMouseDownPoint.x;
            var deltaY = point.y - this._panMouseDownPoint.y;
            var offset = this.rootContainer.getOffset();
            
            this.rootContainer.setOffset(new Webgram.Geometry.Point(offset.x - deltaX, offset.y - deltaY));
            this.invalidateDrawing(true);
            
            return 'move';
        }
        else if (this._mouseDownPoint) {
            if (this.selectedControlPoint) { /* execute the control point's action */
                this.selectedControlPoint.move(point, true);
                
                this.invalidateDrawing();
                
                return this.selectedControlPoint.getCursor();
            }
            else if (this.selectedDrawingElement) {
                this.selectedDrawingElement.onMouseMove.trigger(
                        this.selectedDrawingElement.transformInverse(point), modifiers);
                
                if (this.selectedDrawingElement.isMoveEnabled()) { /* move the whole drawing element */
                    var deltaX = point.x - this._mouseDownPoint.x;
                    var deltaY = point.y - this._mouseDownPoint.y;
                    
                    var x = this._mouseDownPoint.x - this.selectedDrawingElement._mouseDownPoint.x + deltaX;
                    var y = this._mouseDownPoint.y - this.selectedDrawingElement._mouseDownPoint.y + deltaY;
                    
                    this.selectedDrawingElement.moveTo(new Webgram.Geometry.Point(x, y));
                    
                    this.invalidateDrawing();
                    
                    return 'move';
                }
            }
            else if (this._msContainerElement && this._msContainerElement.isResizeEnabled()) {
                /* continue an already started multiple selection */
                if (this._mouseDownPoint.x <= point.x) {
                    if (this._mouseDownPoint.y <= point.y) {
                        this._msContainerElement._setBottomRight(point, true);
                    }
                    else {
                        this._msContainerElement._setTopRight(point, true);
                    }
                }
                else {
                    if (this._mouseDownPoint.y <= point.y) {
                        this._msContainerElement._setBottomLeft(point, true);
                    }
                    else {
                        this._msContainerElement._setTopLeft(point, true);
                    }
                }
                
                this._markMultipleSelected();
                this.invalidateDrawing();
                
                return 'crosshair';
            }
        }
        
        /* determine the hovered drawing element & control point */
        var hoveredDrawingElement = null;
        var hoveredControlPoint = null;
        var hoveredActionMenuItem = null;
        for (var i = 0; i < this.rootContainer.drawingElements.length; i++) {
            var drawingElement = this.rootContainer.drawingElements[i];
            if (!drawingElement.isSelectEnabled()) {
                continue;
            }
            
            if (((this.selectedDrawingElement === drawingElement) || drawingElement.isHoveredControlPointsEnabled())) {
                hoveredControlPoint = drawingElement.pointInsideControlPoint(point);
                if (hoveredControlPoint) {
                    hoveredDrawingElement = drawingElement;
                    break;
                }
                hoveredActionMenuItem = drawingElement.pointInsideActionMenuItem(point);
                if (hoveredActionMenuItem) {
                    hoveredDrawingElement = drawingElement;
                    break;
                }
            }
            
            if (drawingElement.pointInside(point, true)) {
                hoveredDrawingElement = drawingElement;
            }
        }
        
        /* by this point we have the hovered control point and drawing element 
         * we can also be sure the hoveredControlPoint and hoveredActionMenuItem both belong to the hoveredDrawingElement */
        
        if (hoveredDrawingElement && hoveredDrawingElement.getFocusType() > Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE) { /* selected remotely */
            return 'not-allowed';
        }
        
        var hoverChanged = false;
        
        if (hoveredDrawingElement !== this.hoveredDrawingElement) { /* not the same hovered element */
            /* remove hover from the currently hovered element */
            if (this.hoveredDrawingElement) {
                if (this.hoveredDrawingElement.getFocusType() === Webgram.DrawingElement.FOCUS_HOVERED) {
                    this.hoveredDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
                }
                this.hoveredDrawingElement.onMouseLeave.trigger(modifiers);
            }
            
            /* hover the new element, unless it's selected */
            if (hoveredDrawingElement) {
                if (hoveredDrawingElement.getFocusType() === Webgram.DrawingElement.FOCUS_NONE) {
                    hoveredDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_HOVERED);
                }
                hoveredDrawingElement.onMouseEnter.trigger(hoveredDrawingElement.translateInverse(point), modifiers);
            }
            
            /* set the new hovered element */
            this.hoveredDrawingElement = hoveredDrawingElement;

            if (this.hoveredDrawingElement) {
                /* trigger the onMouseMove event on the new howered element */
                var result = this.hoveredDrawingElement.onMouseMove.trigger(
                        this.hoveredDrawingElement.transformInverse(point), modifiers);
                
                if (result) {
                    return result;
                }
            }
            
            hoverChanged = true;
        }
        
        if (hoveredControlPoint !== this.hoveredControlPoint) { /* not the same hovered control point */
            /* remove hover from the currently hovered element */
            if (this.hoveredControlPoint && this.hoveredControlPoint.getFocusType() === Webgram.ControlPoint.FOCUS_HOVERED) {
                this.hoveredControlPoint.setFocusType(Webgram.ControlPoint.FOCUS_NONE);
                this.hoveredControlPoint.onMouseLeave.trigger(modifiers);
                this.hoveredControlPoint.onRemove.unbind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved);
            }
            
            /* hover the new element, unless it's selected */
            if (hoveredControlPoint && hoveredControlPoint.getFocusType() === Webgram.ControlPoint.FOCUS_NONE) {
                hoveredControlPoint.setFocusType(Webgram.ControlPoint.FOCUS_HOVERED);
                hoveredControlPoint.onMouseEnter.trigger(point, modifiers);
                hoveredControlPoint.onRemove.bind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved, this);
            }
            
            /* set the new hovered element */
            this.hoveredControlPoint = hoveredControlPoint;
            
            hoverChanged = true;
        }
        
        if (hoveredActionMenuItem !== this.hoveredActionMenuItem) { /* not the same hovered action menu item */
            /* remove hover from the currently hovered element */
            if (this.hoveredActionMenuItem && this.hoveredActionMenuItem.getFocusType() === Webgram.ActionMenuItem.FOCUS_HOVERED) {
                this.hoveredActionMenuItem.setFocusType(Webgram.ActionMenuItem.FOCUS_NONE);
                this.hoveredActionMenuItem.onRemove.unbind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved);
            }
            
            /* hover the new CP , unless it's selected */
            if (hoveredActionMenuItem && hoveredActionMenuItem.getFocusType() === Webgram.ActionMenuItem.FOCUS_NONE) {
                hoveredActionMenuItem.setFocusType(Webgram.ActionMenuItem.FOCUS_HOVERED);
                hoveredActionMenuItem.onRemove.bind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved, this);
            }
            
            /* set the new hovered action menu item */
            this.hoveredActionMenuItem = hoveredActionMenuItem;
            
            hoverChanged = true;
        }
        
        if (hoverChanged) {
            this.invalidateDrawing();
        }
        
        /* decide which cursor to set on the drawing canvas */
        if (hoveredControlPoint) {
            return hoveredControlPoint.getCursor();
        }
        if (hoveredActionMenuItem) {
            return hoveredActionMenuItem.getCursor();
        }
        else if (hoveredDrawingElement) {
            return hoveredDrawingElement.getCursor();
        }
        else {
            return 'default';
        }
    },
    
    handleMouseScroll: function (point, up, modifiers) {
        if (this.hoveredDrawingElement && this.hoveredDrawingElement.pointInside(point, true)) {
            var result = this.hoveredDrawingElement.onMouseScroll.trigger(
                    this.hoveredDrawingElement.transformInverse(point), up, modifiers);
            
            if (result) {
                return result;
            }
        }
        
        if (this.getSetting('zoomEnabled')) { /* used for zoom */
            point = this.rootContainer.transformZoomOffsetDirect(point);
            
            if (up) {
                this.rootContainer.setZoomLevel(this.rootContainer.getZoomLevel() + 1, point);
            }
            else {
                this.rootContainer.setZoomLevel(this.rootContainer.getZoomLevel() - 1, point);
            }
            
            this.invalidateDrawing();
            
            return true;
        }
    },
    
    handleKeyPress: function (key, modifiers) {
        if (this.selectedDrawingElement) {
            result = this.selectedDrawingElement.onKeyPress.trigger(key, modifiers);
            if (result) {
                return result;
            }
        }
    },
        
    handleKeyDown: function (key, modifiers) {
        var result;
        
        if (this.selectedDrawingElement) {
            result = this.selectedDrawingElement.onKeyDown.trigger(key, modifiers);
            if (result) {
                return result;
            }
            
            if (key === 16) { /* shift */
                this.selectedDrawingElement.enableShift();
                this.invalidateDrawing();
                
                return true;
            }
        }
        
        if (this.getSetting('actionsEnabled')) {
            if (this.keyMatches(this.getSetting('keyboardShortcuts.copy'), key, modifiers)) {
                if (this.doCopyAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.paste'), key, modifiers)) {
                if (this.doPasteAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.duplicate'), key, modifiers)) {
                if (this.doDuplicateAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.delete'), key, modifiers)) {
                if (this.doDeleteAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.moveUp'), key, modifiers)) {
                if (this.doMoveAction('up', false)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.moveRight'), key, modifiers)) {
                if (this.doMoveAction('right', false)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.moveDown'), key, modifiers)) {
                if (this.doMoveAction('down', false)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.moveLeft'), key, modifiers)) {
                if (this.doMoveAction('left', false)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.fineMoveUp'), key, modifiers)) {
                if (this.doMoveAction('up', true)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.fineMoveRight'), key, modifiers)) {
                if (this.doMoveAction('right', true)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.fineMoveDown'), key, modifiers)) {
                if (this.doMoveAction('down', true)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.fineMoveLeft'), key, modifiers)) {
                if (this.doMoveAction('left', true)) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.bringToFront'), key, modifiers)) {
                if (this.doBringToFrontAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.sendToBack'), key, modifiers)) {
                if (this.doSendToBackAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.flipHorizontally'), key, modifiers)) {
                if (this.doFlipHorizontallyAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.flipVertically'), key, modifiers)) {
                if (this.doFlipVerticallyAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.undo'), key, modifiers)) {
                if (this.getWebgram().doUndoAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.redo'), key, modifiers)) {
                if (this.getWebgram().doRedoAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.zoomIn'), key, modifiers)) {
                if (this.doZoomInAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.zoomOut'), key, modifiers)) {
                if (this.doZoomOutAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.zoomOne'), key, modifiers)) {
                if (this.doZoomOneAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.zoomFit'), key, modifiers)) {
                if (this.doZoomFitAction()) {
                    return true;
                }
            }
            else if (this.keyMatches(this.getSetting('keyboardShortcuts.centerOrigin'), key, modifiers)) {
                if (this.doCenterOriginAction()) {
                    return true;
                }
            }
        }
    },
    
    handleKeyUp: function (key, modifiers) {
        if (this.selectedDrawingElement) {
            var result = this.selectedDrawingElement.onKeyUp.trigger(key, modifiers);
            if (result) {
                return result;
            }
            
            if (key === 16) { /* shift */
                this.selectedDrawingElement.disableShift();
                this.invalidateDrawing();
                
                return true;
            }
        }
    },
    
    handleBlur: function () {
        /* in case the user moves away from the webgram html element,
         * we call disableShift on the selected element if it was previously enabled */
        
        if (this.selectedDrawingElement != null && this.selectedDrawingElement.isShiftEnabled()) {
            this.selectedDrawingElement.disableShift();
        }
    },
    
    handleDrawingElementRemove: function (drawingElement) {
        if (this.selectedDrawingElement === drawingElement) {
            this.selectedDrawingElement = null;
        }

        if (this.hoveredDrawingElement === drawingElement) {
            this.hoveredDrawingElement = null;
        }
        
        if (this.selectedControlPoint != null &&
            this.selectedControlPoint.drawingElement === drawingElement) {
            
            this.selectedControlPoint = null;
        }

        if (this.hoveredControlPoint != null &&
            this.hoveredControlPoint.drawingElement === drawingElement) {
            
            this.hoveredControlPoint = null;
        }
    },
    
    
    /* private methods */
    
    _markMultipleSelected: function (drawingElements) {
        if (!this._msContainerElement) {
            return;
        }
        
        var drawingElement, i;
        
        if (drawingElements) {
            for (i = 0; i < drawingElements.length; i++) {
                drawingElement = drawingElements[i];
                
                if (drawingElement === this._msContainerElement) {
                    continue;
                }
                
                if (!drawingElement.isSelectEnabled()) {
                    continue;
                }
                
                drawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                drawingElement.onSelect.trigger();
            }
        }
        else {
            var msBoundingRectangle = this._msContainerElement.getBoundingRectangle(true);
            for (i = 0; i < this.rootContainer.drawingElements.length; i++) {
                drawingElement = this.rootContainer.drawingElements[i];
                
                if (drawingElement === this._msContainerElement) {
                    continue;
                }
                
                if (!drawingElement.isSelectEnabled()) {
                    continue;
                }
                
                var boundingRectangle = drawingElement.getBoundingRectangle(true);
                
                if ((msBoundingRectangle.x1 <= boundingRectangle.x1) &&
                        (msBoundingRectangle.x2 >= boundingRectangle.x2) &&
                        (msBoundingRectangle.y1 <= boundingRectangle.y1) &&
                        (msBoundingRectangle.y2 >= boundingRectangle.y2)) { /* we have a completely hovered element */
                    
                    drawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                    drawingElement.onSelect.trigger();
                }
                else {
                    drawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
                    drawingElement.onUnselect.trigger();
                    drawingElement.disableShift();
                }
            }
        }
    },
    
    /**
     * @param {Webgram.Geometry.Point} mouseDownPoint the point where
     *  the mouse event that triggered the multiple selection finish occured;
     *  the coordinates are relative to the block element of this drawing control.
     */
    _finishMultipleSelection: function (mouseDownPoint) {
        if (!this._msContainerElement) {
            return;
        }

        /* gather the multiple-selected drawing elements */
        var drawingElements = [];
        for (var i = 0; i < this.rootContainer.drawingElements.length; i++) {
            var drawingElement = this.rootContainer.drawingElements[i];
            
            if (drawingElement.getFocusType() !== Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE) {
                continue;
            }
            
            drawingElements.push(drawingElement);
        }
        
        if (drawingElements.length > 1) { /* more than one selected element, shrink the _msContainerElement */
            /* remember each element's index */
            var index, indexes = [];
            for (i = 0; i < drawingElements.length; i++) {
                index = this.rootContainer.getDrawingElementIndex(drawingElements[i]);
                indexes.push(index);
            }
            this._msContainerElement._drawingElementIndexes = indexes;
            
            /* place the MSCE right before the first selected element */
            this.rootContainer._setDrawingElementIndex(this._msContainerElement, indexes[0]);
            
            this._msContainerElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
            this.selectedDrawingElement = this._msContainerElement;
            
            this.onSelectionChange.trigger(drawingElements.slice(0));
            
            if (mouseDownPoint) {
                var center = this.selectedDrawingElement.getCenter();
                this.selectedDrawingElement._mouseDownPoint = new Webgram.Geometry.Point(mouseDownPoint.x - center.x, mouseDownPoint.y - center.y);
            }

            /* create and configure the multiple selection */
            this._msContainerElement.setDrawingElements(drawingElements);
        }
        else if (drawingElements.length === 1) { /* a single selected element, select it directly instead of adding to multiple selection */
            drawingElements[0].setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
            this.selectedDrawingElement = drawingElements[0];
            
            this.onSelectionChange.trigger([this.selectedDrawingElement]);
            
            this.rootContainer._remDrawingElement(this._msContainerElement);
            this._msContainerElement = null;
            
            if (mouseDownPoint) {
                var center = this.selectedDrawingElement.getCenter();
                this.selectedDrawingElement._mouseDownPoint = new Webgram.Geometry.Point(mouseDownPoint.x - center.x, mouseDownPoint.y - center.y);
            }
        }
        else { /* no selected elements, cancel the multiple selection */
            this.rootContainer._remDrawingElement(this._msContainerElement);
            this._msContainerElement = null;
        }
    },

    /**
     * Destroys the multiple selection by restoring the
     * multiple-selected elements to the block element
     * of this drawing control. 
     * @param {Boolean} temporary indicates if this is a
     *  temporary multiple-selection removal, in which case
     *  the multiple-selection block element is not removed
     */
    _remFromMultipleSelection: function (temporary) {
        if (!this._msContainerElement) {
            return;
        }
        
        var i, pendingToRem = [];
        
        /* create a copy of the list of children in the multiple selection block element */
        for (i = 0; i < this._msContainerElement.drawingElements.length; i++) {
            pendingToRem.push(this._msContainerElement.drawingElements[i]);
        }
        
        for (i = 0; i < pendingToRem.length; i++) {
            pendingToRem[i]._leaveContainerElement();
            
            if (temporary) {
                pendingToRem[i].setFocusType(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
            }
        }
        
        var indexes = this._msContainerElement._drawingElementIndexes;
        var index = this.rootContainer.getDrawingElementIndex(this._msContainerElement); 
        
        /* remove the MSCE first */
        this.rootContainer._remDrawingElement(this._msContainerElement);
        
        if (indexes != null) {
            /* restore the initial order of DEs */
            for (i = 0; i < pendingToRem.length; i++) {
                var drawingElement = pendingToRem[i];
                drawingElement._parent._setDrawingElementIndex(drawingElement, indexes[i]);
            }
        }
        else {
            /* place all the DEs right after the MSCE */
            for (i = 0; i < pendingToRem.length; i++) {
                var drawingElement = pendingToRem[i];
                drawingElement._parent._setDrawingElementIndex(drawingElement, index + i);
            }
        }

        if (temporary) {
            this.rootContainer._addDrawingElement(this._msContainerElement);
        }
        else {
            this._msContainerElement = null;
        }
    }
};

Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved = function (drawingElement, selectDrawingControl) {
    if (selectDrawingControl.hoveredControlPoint === this) {
        selectDrawingControl.hoveredControlPoint = null;
    }
    if (selectDrawingControl.selectedControlPoint === this) {
        selectDrawingControl.selectedControlPoint = null;
    }
    if (selectDrawingControl.hoveredActionMenuItem === this) {
        selectDrawingControl.hoveredActionMenuItem = null;
    }
};

Webgram.Class('Webgram.DrawingControls.SelectDrawingControl', Webgram.DrawingControl);


/*
 * A class that represents a multiple selection container to be used
 * with the select drawing control.
 */
Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer = function (x, y, width, height) {
    Webgram.DrawingElements.ContainerElement.call(this, ':special:multiple-selection-container', x, y, width, height);
    
    this.setStrokeStyle(Webgram.Styles.getStrokeStyle('multiple-selection'));
    this.setFillStyle(Webgram.Styles.getFillStyle('multiple-selection'));
    
    this.setMinSize(new Webgram.Geometry.Size(1, 1));
    this.setRotateEnabled(true);
    
    this._drawingElementIndexes = null;
    
    this.onMouseDown.bind(this.handleMouseDown);
    
    this.onIndexChange.bind(function () {
        /* forget the DE indexes if index changes on MSCE */
        this._drawingElementIndexes = null; 
    });
};

Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer.prototype = {
    drawNoZoom: function() {
        this.drawRect(this.getDrawingRectangle());
        this.paint();
    },
    
    setFocusType: function (focusType) {
        /* we override this method because we don't want it to
         * recursively unfocus the children - they must remain multiple-selected */
        
        Webgram.DrawingElement.prototype.setFocusType.call(this, focusType);
    },
    
    handleMouseDown: function (point, button, modifiers) {
        /* we add this handler because we want to detect clicks on
         * an inner element (for deselecting it with the "shift" modifier)
         * without enabling the select drawing control on this block element */
        
        var transformedPoint = this.transformInverse(point);
        var hoveredDrawingElement = null;
        
        for (var i = this.drawingElements.length - 1; i >= 0; i--) {
            var drawingElement = this.drawingElements[i];
            
            if (drawingElement.pointInside(transformedPoint, true)) {
                hoveredDrawingElement = drawingElement;
                break;
            }
        }
        
        /* if clicked on a child drawing element with shift pressed,
         * remove the child from the selection */
        if (hoveredDrawingElement && modifiers.shift && (this.getRotationAngle() === 0)) {
            var selectDrawingControl = this._parent.getActiveDrawingControl();
            selectDrawingControl._remFromMultipleSelection(true);
            hoveredDrawingElement.setFocusType(Webgram.DrawingElement.FOCUS_NONE);
            selectDrawingControl._finishMultipleSelection(point);
            selectDrawingControl._mouseDownPoint = null;
            
            return true;
        }
    },
    
    pointInside: function (point, transformed) {
        /* we override this function because we want to return false
         * when the mouse is not over a child of this block element */
        
        if (transformed) {
            point = this.transformInverse(point);
        }
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            var drawingElement = this.drawingElements[i];
            
            if (drawingElement.pointInside(point, true)) {
                return true;
            }
        }
        
        return false;
    },
    
    /* we override the following methods because we want to prevent
     * any change-related events from triggering on this type of elements */
    
    setStrokeStyle: function (strokeStyle) {
        this._strokeStyle = strokeStyle;
    
        this.invalidateDrawing(true);
    },

    setFillStyle: function (fillStyle) {
        this._fillStyle = fillStyle;
    
        this.invalidateDrawing(true);
    },

    setTextStyle: function (textStyle) {
        this._textStyle = textStyle;

        this.invalidateDrawing(true);
    },

    isSnapExternallyEnabled: function () {
        return this.drawingElements.length > 0;
    },
    
    finishShapeEvents: function (force) {
        /* we override this method because we don't want any onShapeChange events
         * on the MS CE, but we want them triggered on the contained elements */
        
        for (var i = 0; i < this.drawingElements.length; i++) {
            this.drawingElements[i].finishShapeEvents(force);
        }
    },

    _triggerAdded: function () {
    },

    _triggerRemoved: function () {
    }
};

Webgram.Class('Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionContainer', Webgram.DrawingElements.ContainerElement);
