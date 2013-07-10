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
 * Contains the main drawing controls used by webgram.
 * @namespace
 * @see Webgram.DrawingControl
 */
Webgram.DrawingControls = {
};


Webgram.DrawingControls.SelectDrawingControl = 
        Webgram.DrawingControl.extend( /** @lends Webgram.DrawingControls.SelectDrawingControl.prototype */ {
            
    /**
     * The main drawing control, used to manipulate the existing drawing elements,
     * as well as for zooming and panning.
     * @constructs Webgram.DrawingControls.SelectDrawingControl
     * @extends Webgram.DrawingControl
     * @param {Webgram.DrawingElements.RootContainer} rootContainer the root container element of the Webgram
     */
    initialize: function SelectDrawingControl(rootContainer) {
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
         * An event that is triggered when the current selection of drawing elements changes.<br>
         * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
         * @type Webgram.Event
         */
        this.onSelectionChange = new Webgram.Event('selection change', this); /* (drawingElements) */
        
        this._mouseDownPoint = null;
        this._panMouseDownPoint = null;
        this._msGroup = null;
        this._noSelectLast = false; /* a lock for controlling the remDrawingElement's behavior */

        this.onDeactivate.bind(function () {
            this.setSelectedDrawingElements(null);
            
            this.hoveredDrawingElement = null;
            this.selectedDrawingElement = null;
            this.hoveredControlPoint = null;
            this.selectedControlPoint = null;
            
            this._mouseDownPoint = null;
            this._msGroup = null;
        });
        
        this.onSelectionChange.bind(function (drawingElements) {
            this.rootContainer.webgram.onSelectionChange.trigger(drawingElements);
        });
    },

    getSelectedDrawingElements: function () {
        if (this._msGroup) {
            return this._msGroup._drawingElements.slice();
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
        if (this._msGroup) {
            this._cancelMultipleSelection();
        }
        
        if (this.selectedDrawingElement) {
            this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
            this.selectedDrawingElement = null;
        }
        
        if (drawingElements && drawingElements.length) {
            if (drawingElements.length === 1) { /* single selected element */
                this.selectedDrawingElement = drawingElements[0];
                if (this.selectedDrawingElement) {
                    this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
                }
                
                this.onSelectionChange.trigger([this.selectedDrawingElement]);
            }
            else { /* multiple selected elements */
                if (this.getSetting('multipleSelectionEnabled')) {
                    for (var i = 0; i < drawingElements.length; i++) {
                        drawingElements[i].setFocus(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                    }
                    
                    this._msGroup = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup();
                    this.rootContainer._addDrawingElement(this._msGroup);
                    this.selectedDrawingElement = this._msGroup;
                    this._finishMultipleSelection(); /* this will trigger the onSelectionChange event */
                }
            }
        }
        else {
            this.onSelectionChange.trigger([]);            
        }
        
        this.selectedControlPoint = null;   
        this.hoveredControlPoint = null;
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
            var json = drawingElement.toJson();
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
            var drawingElement, drawingElements = [];
            
            if (jsonList.length === 0) {
                return false; /* no element was actually pasted */
            }
            
            /* remember the location of the currently selected element */
            var location = null;
            var mainGridSizeX = this.getSetting('mainGrid.sizeX', 25);
            var mainGridSizeY = this.getSetting('mainGrid.sizeY', 25);
            if (this.selectedDrawingElement != null) {
                location = this.selectedDrawingElement.getLocation();
                location = location.getTranslated(mainGridSizeX, mainGridSizeY);
            }
            
            this._cancelMultipleSelection();
            
            for (var i = 0; i < jsonList.length; i++) {
                var json = jsonList[i];
                
                if (jsonList.length === 1) {
                    if (location) {
                        /* if a single element is being pasted,
                         * adjust its location */
                        json['location'] = {
                            x: location.x,
                            y: location.y
                        };
                    }
                    else {
                        json['location'] = {
                            x: json['location'].x + mainGridSizeX,
                            y: json['location'].y + mainGridSizeY
                        };
                    }
                }
                
                var elementClass = Webgram.DrawingElements.findClass(json.cls);
                if (!elementClass) {
                    continue;
                }
                
                drawingElement = new elementClass(); /* create an instance of the class with default properties */
                drawingElement._pasting = true;
                drawingElement.fromJson(json);
                
                this.rootContainer._addDrawingElement(drawingElement, null, true);
                
                drawingElements.push(drawingElement);
                drawingElement.onPaste.trigger();
                
                drawingElement._pasting = false;
            }
            
            this.setSelectedDrawingElements(drawingElements);
            
            if (location != null && this._msGroup != null) {
                this._msGroup.setLocation(location);
            }
            
            this.updateHover();
            
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
        var drawingElements = this.getSelectedDrawingElements();
        var webgram = this.getWebgram();
        
        if (drawingElements.length === 0) {
            return false; /* nothing to do */
        }
        
        /* remember the location of the currently selected element */
        var location = null;
        if (this.selectedDrawingElement != null) {
            location = this.selectedDrawingElement.getLocation();
            
            var mainGridSizeX = this.getSetting('mainGrid.sizeX', 25);
            var mainGridSizeY = this.getSetting('mainGrid.sizeY', 25);
            
            location = location.getTranslated(mainGridSizeX, mainGridSizeY);
        }
        
        if (drawingElements.length > 1) { /* multiple selection */
            this._cancelMultipleSelection();
            
            for (var i = 0; i < drawingElements.length; i++) {
                drawingElements[i] = drawingElements[i].duplicate(false);
                this.rootContainer._addDrawingElement(drawingElements[i], null, true);
            }
            
            this.setSelectedDrawingElements(drawingElements);
        }
        else { /* a single element */
            var drawingElement = drawingElements[0];
            var overrideJson = {};
            
            if (location) {
                overrideJson['location'] = {
                    x: location.x,
                    y: location.y,
                };
            };
            
            drawingElement = drawingElement.duplicate(true, overrideJson);
            this.setSelectedDrawingElements([drawingElement]);
        }
        
        if (location != null && this._msGroup != null) {
            this._msGroup.setLocation(location);
        }
        
        this.updateHover();
        
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
            
            this.updateHover();
            
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
        
        var location;
        if (direction === 'up') {
            location = drawingElement.getLocation().getTranslated(0, -size);
        }
        else if (direction === 'right') {
            location = drawingElement.getLocation().getTranslated(size, 0);
        }
        else if (direction === 'down') {
            location = drawingElement.getLocation().getTranslated(0, size);
        }
        else if (direction === 'left') {
            location = drawingElement.getLocation().getTranslated(-size, 0);
        }
        else {
            return false;
        }
        
        drawingElement._setLocation(location, false, false);
        
        this.updateHover();
        
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
            this.updateHover();
            
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
            this.updateHover();
            
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
            
            this.updateHover();
            
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
            
            this.updateHover();
            
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
            
            this.updateHover();
            
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
            
            this.updateHover();
            
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
                    
                    this.updateHover();
                    
                    webgram.onZoomInAction.trigger(i);
                    
                    return true;
                }
            }
        }
        
        return false;
    },
    
    /**
     * This action sets the maximal zoom level at which all the drawing elements
     * added to the Webgram are still visible.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomFitAction: function () {
        var webgram = this.getWebgram();

        if (webgram.getDrawingElements().length > 0) {
            /* calling the setVisibleDrawingElements() method
             * with no argument will set the optimal zoom level */
            webgram.setVisibleDrawingElements();
            
            this.updateHover();
            
            webgram.onZoomInAction.trigger(webgram.getZoomLevel());
        
            return true;
        }
        
        return false;
    },
    
    /**
     * This action sets the current center of the Webgram to the origin.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doCenterOriginAction: function () {
        var webgram = this.getWebgram();

        webgram.setVisibleCenter(Webgram.Geometry.Point.zero());
        
        this.updateHover();
        
        webgram.onCenterOriginAction.trigger();
        
        return true;
    },
    
    
    /* event handlers */
    
    handleMouseDown: function (point, button, modifiers) {
        /* first try to pass the event to the hovered element */
        if (this.hoveredDrawingElement &&
            this.hoveredDrawingElement.transformedPointInside(point)) {
            
            var result = this.hoveredDrawingElement.onMouseDown.trigger(
                    this.hoveredDrawingElement.transformInverse(point), button, modifiers);
            
            if (result) {
                return true;
            }
        }

        if (button === 1) {
            this.invalidate();
            
            this._mouseDownPoint = point;
            
            /* unselect any previously selected drawing element */
            var prevSelectedDrawingElement = this.selectedDrawingElement; /* remember the previously selected DE */
            if (this.selectedDrawingElement && this.selectedDrawingElement !== this.hoveredDrawingElement) {
                this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
            }
            
            /* unselect any previously selected control point */
            if (this.selectedControlPoint && this.selectedControlPoint !== this.hoveredControlPoint) {
                this.selectedControlPoint.setFocus(Webgram.ControlPoint.FOCUS_NONE);
            }
            
            /* select the hovered drawing element and control point */
            this.selectedControlPoint = this.hoveredControlPoint;
            this.selectedDrawingElement = this.hoveredDrawingElement;
            
            /* trigger the (un)select events for DEs */
            if (this.selectedDrawingElement !== prevSelectedDrawingElement) {
                if (prevSelectedDrawingElement) {
                    prevSelectedDrawingElement.onUnselect.trigger();
                    prevSelectedDrawingElement.deactivateShift();
                }
                if (this.selectedDrawingElement) {
                    this.selectedDrawingElement.onSelect.trigger();
                    this.onSelectionChange.trigger([this.selectedDrawingElement]);
                }
                else {
                    this.onSelectionChange.trigger([]);
                }
            }
            
            if (this.selectedControlPoint) { /* clicked on a CP */
                this.selectedControlPoint.setFocus(Webgram.ControlPoint.FOCUS_HOVERED);
                this.selectedControlPoint.onBeginMove.trigger();
                
                this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
            }
            else if (this.selectedDrawingElement) { /* clicked on a DE */
                /* remember the mouse down coordinates relatively to the selected drawing element */
                var location = this.selectedDrawingElement.getLocation();
                this.selectedDrawingElement._mouseDownPoint = new Webgram.Geometry.Point(point.x - location.x, point.y - location.y);
                
                /* update the selected element's focus */
                this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
                
                if (modifiers.shift && (!this._msGroup || (this._msGroup.getRotationAngle() === 0))) { /* add to current selection */
                    if (this.selectedDrawingElement !== this._msGroup) {
                        if (this._msGroup) { /* existing multiple selection */
                            this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                            this._finishMultipleSelection(point);
                        }
                        else { /* create new multiple selection */
                            if (this.getSetting('multipleSelectionEnabled')) {
                                if (prevSelectedDrawingElement && prevSelectedDrawingElement !== this.selectedDrawingElement) {
                                    prevSelectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                                    this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                                    this._msGroup = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup(point.x, point.y);
                                    this.rootContainer._addDrawingElement(this._msGroup);
                                    this._finishMultipleSelection(point);
                                }
                                else {
                                    this.selectedDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
                                }
                            }
                        }
                    }
                }
                else { /* no modifier pressed, normal click to select */
                    if (this._msGroup && this.selectedDrawingElement !== this._msGroup) {
                        /* clear any existing multiple selection */
                        this._cancelMultipleSelection();
                    }
                }
            }
            else { /* clicked outside of any DE */
                /* clear any existing multiple selection */
                if (this._msGroup) {
                    this._cancelMultipleSelection();
                }
                
                /* start a new multiple selection */
                if (this.getSetting('multipleSelectionEnabled')) {
                    this._msGroup = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup(point.x, point.y);
                    this.rootContainer._addDrawingElement(this._msGroup);
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
        if (this.hoveredDrawingElement &&
            this.hoveredDrawingElement.transformedPointInside(point)) {
            
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
            if (this._msGroup && this._msGroup._drawingElements.length === 0) {
                this._finishMultipleSelection(point);
                this.invalidate();
                
                return true;
            }
        }
        else if (button === 3) { /* right button, used for panning */
            delete this._panMouseDownPoint;
            
            return true;
        } 
    },
    
    handleMouseMove: function (point, modifiers) {
        if (this.hoveredDrawingElement &&
            this.hoveredDrawingElement.transformedPointInside(point)) {
            
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
            this.invalidate(true);
            
            return 'move';
        }
        else if (this._mouseDownPoint) {
            if (this.selectedControlPoint) { /* execute the control point's action */
                this.selectedControlPoint.move(point, true);
                
                this.invalidate();
                
                return this.selectedControlPoint.getCursor();
            }
            else if (this.selectedDrawingElement) {
                this.selectedDrawingElement.onMouseMove.trigger(
                        this.selectedDrawingElement.transformInverse(point), modifiers);
                
                if (this.selectedDrawingElement.isMoveEnabled() && this.selectedDrawingElement._mouseDownPoint) { /* move the whole drawing element */
                    var deltaX = point.x - this._mouseDownPoint.x;
                    var deltaY = point.y - this._mouseDownPoint.y;
                    
                    var x = this._mouseDownPoint.x - this.selectedDrawingElement._mouseDownPoint.x + deltaX;
                    var y = this._mouseDownPoint.y - this.selectedDrawingElement._mouseDownPoint.y + deltaY;
                    
                    this.selectedDrawingElement._setLocation(new Webgram.Geometry.Point(x, y), true, false);
                    
                    return 'move';
                }
            }
            else if (this._msGroup && this._msGroup.isEditEnabled()) {
                /* continue an already started multiple selection */
                
                var relativePoint = this._msGroup.transformInverse(point);
                if (this._mouseDownPoint.x <= point.x) {
                    if (this._mouseDownPoint.y <= point.y) {
                        this._msGroup._setBottomRight(relativePoint, true);
                    }
                    else {
                        this._msGroup._setTopRight(relativePoint, true);
                    }
                }
                else {
                    if (this._mouseDownPoint.y <= point.y) {
                        this._msGroup._setBottomLeft(relativePoint, true);
                    }
                    else {
                        this._msGroup._setTopLeft(relativePoint, true);
                    }
                }
                
                this._markMultipleSelected();
                this.invalidate();
                
                return 'crosshair';
            }
        }
        
        /* determine the hovered drawing element & control point */
        var hoveredDrawingElement = null;
        var hoveredControlPoint = null;
        var drawingElements = this.rootContainer.getDrawingElements();
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            if (!drawingElement.isSelectEnabled()) {
                continue;
            }
            
            if (((this.selectedDrawingElement === drawingElement) || drawingElement.isHoveredControlPointsEnabled())) {
                hoveredControlPoint = drawingElement.pointInsideControlPoint(point);
                if (hoveredControlPoint) {
                    hoveredDrawingElement = drawingElement;
                    break;
                }
            }
            
            if (drawingElement.transformedPointInside(point)) {
                hoveredDrawingElement = drawingElement;
            }
        }
        
        /* by this point we have the hovered control point and drawing element 
         * we can also be sure the hoveredControlPoint belongs to the hoveredDrawingElement */
        
        if (hoveredDrawingElement && hoveredDrawingElement.getFocus() > Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE) { /* selected remotely */
            return 'not-allowed';
        }
        
        var hoverChanged = false;
        
        if (hoveredDrawingElement !== this.hoveredDrawingElement) { /* not the same hovered element */
            /* remove hover from the currently hovered element */
            if (this.hoveredDrawingElement) {
                if (this.hoveredDrawingElement.getFocus() === Webgram.DrawingElement.FOCUS_HOVERED) {
                    this.hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
                }
                this.hoveredDrawingElement.onMouseLeave.trigger(modifiers);
            }
            
            /* hover the new element, unless it's selected */
            if (hoveredDrawingElement) {
                if (hoveredDrawingElement.getFocus() === Webgram.DrawingElement.FOCUS_NONE) {
                    hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_HOVERED);
                }
                hoveredDrawingElement.onMouseEnter.trigger(hoveredDrawingElement.translateInverse(point), modifiers);
            }
            
            /* set the new hovered element */
            this.hoveredDrawingElement = hoveredDrawingElement;

            if (this.hoveredDrawingElement) {
                /* trigger the onMouseMove event on the new hovered element */
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
            if (this.hoveredControlPoint && this.hoveredControlPoint.getFocus() === Webgram.ControlPoint.FOCUS_HOVERED) {
                this.hoveredControlPoint.setFocus(Webgram.ControlPoint.FOCUS_NONE);
                this.hoveredControlPoint.onMouseLeave.trigger(modifiers);
                this.hoveredControlPoint.onRemove.unbind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved);
            }
            
            /* hover the new element, unless it's selected */
            if (hoveredControlPoint && hoveredControlPoint.getFocus() === Webgram.ControlPoint.FOCUS_NONE) {
                hoveredControlPoint.setFocus(Webgram.ControlPoint.FOCUS_HOVERED);
                hoveredControlPoint.onMouseEnter.trigger(point, modifiers);
                hoveredControlPoint.onRemove.bind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved, this);
            }
            
            /* set the new hovered element */
            this.hoveredControlPoint = hoveredControlPoint;
            
            hoverChanged = true;
        }
        
        if (hoverChanged) {
            this.invalidate();
        }
        
        /* decide which cursor to set on the drawing canvas */
        if (hoveredControlPoint) {
            return hoveredControlPoint.getCursor();
        }
        else if (hoveredDrawingElement) {
            return hoveredDrawingElement.getCursor();
        }
        else {
            return 'default';
        }
    },
    
    handleMouseScroll: function (point, up, modifiers) {
        if (this.hoveredDrawingElement &&
            this.hoveredDrawingElement.transformedPointInside(point)) {
            
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
            
            this.invalidate();
            
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
                this.selectedDrawingElement.activateShift();
                this.invalidate();
                
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
                this.selectedDrawingElement.deactivateShift();
                this.invalidate();
                
                return true;
            }
        }
    },
    
    handleBlur: function () {
        /* in case the user moves away from the Webgram's html element,
         * we call deactivateShift on the selected element if it was previously enabled */
        
        if (this.selectedDrawingElement != null && this.selectedDrawingElement.isShiftActive()) {
            this.selectedDrawingElement.deactivateShift();
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
        if (!this._msGroup) {
            return;
        }
        
        var msBoundingRectangle = this._msGroup.getBoundingRectangle(true);
        
        var drawingElements = this.rootContainer.getDrawingElements();
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            
            if (drawingElement === this._msGroup) {
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
                
                drawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                drawingElement.onSelect.trigger();
            }
            else if (drawingElement.getFocus() !== Webgram.DrawingElement.FOCUS_NONE) {
                drawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
                drawingElement.onUnselect.trigger();
                drawingElement.deactivateShift();
            }
        }
    },
    
    _finishMultipleSelection: function (mouseDownPoint) {
         /* mouseDownPoint is the point where
         *  the mouse event that triggered the multiple selection finish occurred;
         *  the coordinates are relative to the root element of this drawing control. */
        
        if (!this._msGroup) {
            return;
        }
        
        this._noSelectLast = true;

        /* remove any deselected elements from the multiple selection */
        var drawingElements = this._msGroup.getDrawingElements();
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            
            if (drawingElement.getFocus() !== Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE) {
                this.rootContainer._addDrawingElement(drawingElement);
            }
        }
        
        this._noSelectLast = false;
        
        /* gather the multiple-selected drawing elements */
        drawingElements = [];
        var firstIndex = null;
        var allDrawingElements = this.rootContainer.getDrawingElements();
        for (i = 0; i < allDrawingElements.length; i++) {
            var drawingElement = allDrawingElements[i];
            
            if (drawingElement.getFocus() !== Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE) {
                continue;
            }
            
            if (firstIndex == null) {
                /* remember the index of the first element in group;
                 * we'll use it for placing the multiple selection group */
                firstIndex = i;
            }
            drawingElements.push(drawingElement);
        }
        
        if (drawingElements.length + this._msGroup._drawingElements.length > 1) {
             /* more than one selected element, keep the multiple selection group */
            
            /* remember each element's previous sibling */
            for (i = 0; i < drawingElements.length; i++) {
                var drawingElement = drawingElements[i];
                var index = this.rootContainer.getDrawingElementIndex(drawingElement);
                if (index > 0) {
                    drawingElement._prevSibling = allDrawingElements[index - 1];
                }
            }
            
            if (firstIndex > 0) {
                drawingElements[0]._prevSibling = allDrawingElements[firstIndex - 1];
                if (drawingElements[0]._prevSibling === this._msGroup) {
                    /* if the first previous sibling is the multiple selection group,
                     * use the last element in the selection instead */
                    
                    drawingElements[0]._prevSibling = 
                            this._msGroup._drawingElements[this._msGroup._drawingElements.length - 1];
                }
            }
            
            this._msGroup.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
            this.selectedDrawingElement = this._msGroup;
            
            if (mouseDownPoint) {
                var location = this.selectedDrawingElement.getLocation();
                this.selectedDrawingElement._mouseDownPoint = new Webgram.Geometry.Point(mouseDownPoint.x - location.x, mouseDownPoint.y - location.y);
            }

            /* add the new elements to the multiple selection group */
            for (i = 0; i < drawingElements.length; i++) {
                this._msGroup._addDrawingElement(drawingElements[i]);
            }
            
            /* place the multiple selection group in the position
             * of the first element of the group */
            this.rootContainer._setDrawingElementIndex(this._msGroup, firstIndex);
            
            this.onSelectionChange.trigger(this._msGroup.getDrawingElements());
        }
        else if (drawingElements.length === 1 /* && this._msGroup._drawingElements.length === 0 */) {
            /* a single selected element, select it directly instead of adding to multiple selection,
             * and destroy the existing multiple selection group */
            
            drawingElements[0].setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
            this.selectedDrawingElement = drawingElements[0];
            
            this.onSelectionChange.trigger([this.selectedDrawingElement]);
            
            this.rootContainer._remDrawingElement(this._msGroup);
            this._msGroup = null;
            
            if (mouseDownPoint) {
                var location = this.selectedDrawingElement.getLocation();
                this.selectedDrawingElement._mouseDownPoint = new Webgram.Geometry.Point(mouseDownPoint.x - location.x, mouseDownPoint.y - location.y);
            }
        }
        else {
            /* no selected elements, cancel the multiple selection */
            
            this._cancelMultipleSelection();
        }
    },

    _cancelMultipleSelection: function () {
        /* destroys the multiple selection by restoring the
         * multiple-selected elements to the root element
         * of this drawing control. */ 
        
        if (!this._msGroup) {
            return;
        }
        
        this._noSelectLast = true;
        
        var drawingElements = this._msGroup.getDrawingElements();
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            
            drawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
            
            /* find the first previous sibling of this element
             * that is not part of the multiple selection */
            var sibling = drawingElement;
            while (sibling && sibling._parent !== this.rootContainer) {
                sibling = sibling._prevSibling;
            }
            
            delete drawingElement._prevSibling;
            
            this.rootContainer._addDrawingElement(drawingElement, sibling || 0);
        }
        
        this._noSelectLast = true;
        
        /* remove the multiple selection group first */
        this.rootContainer._remDrawingElement(this._msGroup);
        this._msGroup = null;
    }
},

/** @lends Webgram.DrawingControls.SelectDrawingControl */ {
    _whenPointRemoved: function (drawingElement, selectDrawingControl) {
        if (selectDrawingControl.hoveredControlPoint === this) {
            selectDrawingControl.hoveredControlPoint = null;
        }
        if (selectDrawingControl.selectedControlPoint === this) {
            selectDrawingControl.selectedControlPoint = null;
        }
    }
});


/* A class that represents a multiple selection group to be used
 * with the select drawing control. */
Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup =
        Webgram.DrawingElements.GroupElement.extend({

    initialize: function _MultipleSelectionGroup(x, y) {
        Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.parentClass.call(this);
        
        this.setId('@multiple-selection-group');
        
        this.setStrokeStyle(Webgram.Styles.getStrokeStyle('multiple-selection'));
        this.setFillStyle(Webgram.Styles.getFillStyle('multiple-selection'));
        this._emptyFillStyle = Webgram.Styles.getFillStyle('multiple-selection-empty');
        
        this.setRotateEnabled(true);
        this.setEditEnabled(true);
        this.setSnapExternallyEnabled(true);
        this.setSnapToAngleEnabled(true);
        
        this.onMouseDown.bind(this.handleMouseDown);
        
        this.onIndexChange.bind(function () {
             /* when changing the index of the multiple selection group,
              * we lose the original ordering and place all the elements
              * of the selection one after another */
            
            var drawingElements = this.getDrawingElements();
            for (var i = 1; i < drawingElements.length; i++) {
                drawingElements[i]._prevSibling = drawingElements[i - 1];
            }
            
            var thisIndex = this._parent.getDrawingElementIndex(this);
            if (thisIndex > 0) {
                drawingElements[0]._prevSibling = this._parent.getDrawingElements()[thisIndex - 1];
            }
            else {
                drawingElements[0]._prevSibling = null;
            }
        });
        
        if (x != null && y != null) {
            this._setLocation(new Webgram.Geometry.Point(x, y));
        }
    },
    
    drawSelf: function () {
        if (this._parent.isMini()) {
            this.drawNoZoom();
        }
    },
    
    drawNoZoom: function() {
        this.drawRect(this.getBoundingRectangle());
        
        var strokeStyle = this.getStrokeStyle();
        var fillStyle = this._drawingElements.length ? this.getFillStyle() : this._emptyFillStyle;
        
        this.paint(strokeStyle, fillStyle);
    },
    
    setFocus: function (focus) {
        /* we override this method because we don't want it to
         * recursively unfocus the children - they must remain multiple-selected */
        
        Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.parent.setFocus.call(this, focus);
    },
    
    handleMouseDown: function (point, button, modifiers) {
        /* we add this handler because we want to detect clicks on
         * an inner element (for unselecting it with the "shift" modifier)
         * without enabling the select drawing control on this block element */
        
        var hoveredDrawingElement = null;
        for (var i = this._drawingElements.length - 1; i >= 0; i--) {
            var drawingElement = this._drawingElements[i];
            
            if (drawingElement.transformedPointInside(point)) {
                hoveredDrawingElement = drawingElement;
                break;
            }
        }
        
        /* if clicked on a child drawing element with shift pressed,
         * remove the child from the selection */
        if (hoveredDrawingElement && modifiers.shift && (this.getRotationAngle() === 0)) {
            var selectDrawingControl = this._parent.getActiveDrawingControl();
            hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
            selectDrawingControl._finishMultipleSelection(point);
            selectDrawingControl._mouseDownPoint = null;
            
            return true;
        }
    },
    
    /* we override the following methods because we want to prevent
     * any change-related events from triggering on this type of elements */
    
    setStrokeStyle: function (strokeStyle) {
        this._strokeStyle = strokeStyle;
    
        this.invalidate(true);
    },

    setFillStyle: function (fillStyle) {
        this._fillStyle = fillStyle;
    
        this.invalidate(true);
    },

    setTextStyle: function (textStyle) {
        this._textStyle = textStyle;

        this.invalidate(true);
    },

    isSnapExternallyEnabled: function () {
        return (Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.parent.isSnapExternallyEnabled.call(this) &&
                this._drawingElements.length > 0);
    },
    
    finishShapeEvents: function (force) {
        /* we override this method because we don't want any onShapeChange events
         * on the MS CE, but we want them triggered on the contained elements */
        
        for (var i = 0; i < this._drawingElements.length; i++) {
            this._drawingElements[i].finishShapeEvents(force);
        }
    },
    
    _addDrawingElement: function (drawingElement, where, triggerEvents) {
        Webgram.DrawingElements.GroupElement.prototype._addDrawingElement.call(this, drawingElement, where, triggerEvents);
        
        if (this.webgram) {
            this.webgram.selectDrawingControl._mouseDownPoint = null;
        }
        
        this._overrideChildMembers(drawingElement);
    },
    
    _remDrawingElement: function (drawingElement, triggerEvents) {
        Webgram.DrawingElements.GroupElement.prototype._remDrawingElement.call(this, drawingElement, triggerEvents);
        
        this._restoreChildMembers(drawingElement);
        
        /* if only one element remained in the multiple selection,
         * select it individually */
        var children = this.getDrawingElements();
        var selectDrawingControl = this._parent.getActiveDrawingControl();
        if (children.length === 1 && !selectDrawingControl._noSelectLast) {
            this._parent.getActiveDrawingControl().setSelectedDrawingElements(children);
        }
    },
    
    _triggerAdded: function () {
    },

    _triggerRemoved: function () {
    },
    
    _overrideChildMembers: function (drawingElement) {
        drawingElement.locationToJson = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msLocationToJson;
        drawingElement.locationFromJson = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msLocationFromJson;
        drawingElement.rotationAngleToJson = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msRotationAngleToJson;
        drawingElement.rotationAngleFromJson = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msRotationAngleFromJson;
        drawingElement.flipToJson = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msFlipToJson;
        drawingElement.flipFromJson = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msFlipFromJson;
    },
    
    _restoreChildMembers: function (drawingElement) {
        delete drawingElement.locationToJson;
        delete drawingElement.locationFromJson;
        delete drawingElement.rotationAngleToJson;
        delete drawingElement.rotationAngleFromJson;
        delete drawingElement.flipToJson;
        delete drawingElement.flipFromJson;
    },
    
    _setWebgram: function (webgram) {
        Webgram.DrawingElements.GroupElement.prototype._setWebgram.call(this, webgram);
        
        this.webgram.getDrawingElements = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msWebgramGetDrawingElements;
        this.webgram.remDrawingElement = Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.msWebgramRemDrawingElement;
    },
    
    _clearWebgram: function () {
        delete this.webgram.getDrawingElements;
        delete this.webgram.remDrawingElement;
        
        Webgram.DrawingElements.GroupElement.prototype._clearWebgram.call(this);
    }
}, 

/* static members */ {
    
    /* temporary replacements for elements that are part of a multiple selection */
    
    msLocationToJson: function () {
        var location = this._parent.transformDirect(this.getLocation());
        
        return {
            x: location.x,
            y: location.y
        };
    },
    
    msLocationFromJson: function (json) {
        this._location = this._parent.transformInverse(new Webgram.Geometry.Point(json.x, json.y));
    },
    
    
    msRotationAngleToJson: function () {
        return this._rotationAngle + this._parent.getRotationAngle();
    },
    
    msRotationAngleFromJson: function (json) {
        this._rotationAngle = json - this._parent.getRotationAngle();
    },

    msFlipToJson: function () {
        return {
            vert: Boolean(this._flippedVertically ^ this._parent.flippedVertically),
            horiz: Boolean(this._flippedHorizontally ^ this._parent.flippedHorizontally)
        };
    },
    
    msFlipFromJson: function (json) {
        this._flippedVertically = Boolean(json.vert ^ this._parent.flippedVertically);
        this._flippedHorizontally = Boolean(json.horiz ^ this._parent.flippedHorizontally);
    },
    
    msWebgramGetDrawingElements: function () {
        return this.selectDrawingControl._msGroup.getDrawingElements();
    },

    msWebgramRemDrawingElement: function (drawingElement) {
        Webgram.prototype.remDrawingElement.call(this, drawingElement);
        
        return this.selectDrawingControl._msGroup.remDrawingElement(drawingElement);
    }
});
