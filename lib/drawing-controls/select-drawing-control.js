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
         * An event that is triggered when the current selection of drawing elements changes.<br>
         * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
         * @type Webgram.Event
         */
        this.onSelectionChange = new Webgram.Event('selection change', this); /* (drawingElements) */
        
        this._hoveredDrawingElement = null;
        this._selectedDrawingElements = [];
        this._hoveredControlPoint = null;
        this._selectedControlPoint = null;
        
        this._mouseDownPoint = null;
        this._panMouseDownPoint = null;
        this._initialLocations = {}; /* initial locations for the selected elements */ 
        this._msGroup = null;

        this.onDeactivate.bind(function () {
            this.setSelectedDrawingElements(null);
            
            this._hoveredDrawingElement = null;
            this._selectedDrawingElements = [];
            this._initialLocations = {};
            this._hoveredControlPoint = null;
            this._selectedControlPoint = null;
            
            this._mouseDownPoint = null;
            this._panMouseDownPoint = null;
            this._msGroup = null;
            this._initialLocations = {};
        });
        
        this.onSelectionChange.bind(function (drawingElements) {
            this.rootContainer.webgram.onSelectionChange.trigger(drawingElements);
        });
    },

    getSelectedDrawingElements: function () {
        return this._selectedDrawingElements.slice();
    },
    
    setSelectedDrawingElements: function (drawingElements) {
        /* clear the multiple selection group, if any */
        if (this._msGroup) {
            this.rootContainer._remDrawingElement(this._msGroup);
            this._msGroup = null;
        }
        
        /* remove the existing selection */
        if (this._selectedDrawingElements.length) {
            Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                drawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
            });

            this._selectedDrawingElements = [];
        }

        this._initialLocations = {};
        
        if (drawingElements && drawingElements.length) {
            /* if multiple selection disabled, select only the first element */
            if (!this.getSetting('multipleSelectionEnabled')) {
                drawingElements = drawingElements.slice(0, 1);
            }
            
            this._selectedDrawingElements = drawingElements.slice();
            Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                drawingElement.setFocus(this._selectedDrawingElements.length > 1 ?
                        Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE : Webgram.DrawingElement.FOCUS_SELECTED);
            }, this);
            
            if (this.getSetting('multipleSelectionEnabled') && drawingElements.length > 1) {
                this._createMultipleSelectionGroup();
            }
        }
        
        this.onSelectionChange.trigger(this._selectedDrawingElements.slice());
        
        this._selectedControlPoint = null;   
        this._hoveredControlPoint = null;
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
            
            /* find the location of the currently selected element */
            var originX = this.getSetting('mainGrid.sizeX', 25);
            var originY = this.getSetting('mainGrid.sizeY', 25);
            if (this._selectedDrawingElements.length) {
                var location = this._selectedDrawingElements[0].getLocation();
                originX += location.x;
                originY += location.y;
            }
            
            /* find the minimal location coordinates */
            var minX = Infinity;
            var minY = Infinity;
            for (var i = 0; i < jsonList.length; i++) {
                var json = jsonList[i];
                
                if (json.location.x < minX) {
                    minX = json.location.x;
                }
                if (json.location.y < minY) {
                    minY = json.location.y;
                }
            }
            
            for (i = 0; i < jsonList.length; i++) {
                var json = jsonList[i];
                
                json.location.x = json.location.x - minX + originX;
                json.location.y = json.location.y - minY + originY;
                
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
            
            this.updateHover();
            
            webgram.onPasteAction.trigger(drawingElements.slice());
            
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
        
        /* find the location of the currently selected element */
        var originX = 0;
        var originY = 0;
        if (this._selectedDrawingElements.length) {
            var location = this._selectedDrawingElements[0].getLocation();
            originX = this.getSetting('mainGrid.sizeX', 25) + location.x;
            originY = this.getSetting('mainGrid.sizeY', 25) + location.y;
        }
        
        /* find the minimal location coordinates */
        var minX = Infinity;
        var minY = Infinity;
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            var location = drawingElement.getLocation();
            
            if (location.x < minX) {
                minX = location.x;
            }
            if (location.y < minY) {
                minY = location.y;
            }
        }
            
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            var location = drawingElement.getLocation();

            var overrideJson = {
                location: {
                    x: location.x - minX + originX,
                    y: location.y - minY + originY
                }
            };
            
            drawingElement = drawingElement.duplicate(true, overrideJson);
            
            drawingElements[i] = drawingElement;
        }
        
        this.setSelectedDrawingElements(drawingElements);
        
        this.updateHover();
        
        webgram.onDuplicateAction.trigger(drawingElements);
        
        return true;
    },
    
    /**
     * This action deletes the current selection of drawing elements from the root container.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doDeleteAction: function () {
        var drawingElements = this.getSelectedDrawingElements();
        if (drawingElements.length > 0) {
            this.setSelectedDrawingElements();
                
            Webgram.Utils.forEach(drawingElements, function(drawingElement) {
                this.rootContainer.remDrawingElement(drawingElement);
            }, this);
            
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
        
        var drawingElements = [];
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var drawingElement = this._selectedDrawingElements[i];
            if (!drawingElement.isMoveEnabled()) {
                continue;
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
                continue;
            }
            
            drawingElement._setLocation(location, false);
            
            drawingElements.push(drawingElement);
        }
        
        this.updateHover();
        
        if (drawingElements.length) {
            this.getWebgram().onMoveAction.trigger(drawingElements, direction, fine);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action brings the current selection of drawing elements to front with one position.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doBringToFrontAction: function () {
        var drawingElements = [];
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var drawingElement = this._selectedDrawingElements[i];
            var index = this.rootContainer.getDrawingElementIndex(drawingElement);
            this.rootContainer._setDrawingElementIndex(drawingElement, index + 1, true);
            
            if (index !== this.rootContainer.getDrawingElementIndex(drawingElement)) {
                drawingElements.push(drawingElement);
            }
        }
        
        this.updateHover();
        
        if (drawingElements.length) {
            this.getWebgram().onBringToFrontAction.trigger(drawingElements);
            
            return true;
        }
        
        
        return false;
    },
    
    /**
     * This action sends the current selection of drawing elements to back with one position.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doSendToBackAction: function () {
        var drawingElements = [];
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var drawingElement = this._selectedDrawingElements[i];
            var index = this.rootContainer.getDrawingElementIndex(drawingElement);
            this.rootContainer._setDrawingElementIndex(drawingElement, index - 1, true);
            
            if (index !== this.rootContainer.getDrawingElementIndex(drawingElement)) {
                drawingElements.push(drawingElement);
            }
        }
        
        this.updateHover();
        
        if (drawingElements.length) {
            this.getWebgram().onSendToBackAction.trigger(drawingElements);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action applies a horizontal flipping on the current selection of drawing elements.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doFlipHorizontallyAction: function () {
        var drawingElements = [];
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var drawingElement = this._selectedDrawingElements[i];
            if (!drawingElement.isFlipEnabled()) {
                continue;
            }
            
            drawingElement.flipHorizontally();
            drawingElements.push(drawingElement);
        }
        
        this.updateHover();
        
        if (drawingElements.length) {
            this.getWebgram().onFlipHorizontallyAction.trigger(drawingElements);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * This action applies a vertical flipping on the current selection of drawing elements.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doFlipVerticallyAction: function () {
        var drawingElements = [];
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var drawingElement = this._selectedDrawingElements[i];
            if (!drawingElement.isFlipEnabled()) {
                continue;
            }
            
            drawingElement.flipVertically();
            drawingElements.push(drawingElement);
        }
        
        this.updateHover();
        
        if (drawingElements.length) {
            this.getWebgram().onFlipVerticallyAction.trigger(drawingElements);
            
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
        // TODO move to webgram
        
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
        // TODO move to webgram
        
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
        // TODO move to webgram
        
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
        // TODO move to webgram
        
        var webgram = this.getWebgram();

        if (webgram.rootContainer.getDrawingElements().length > 0) {
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
        // TODO move to webgram
        
        var webgram = this.getWebgram();

        webgram.setVisibleCenter(Webgram.Geometry.Point.zero());
        
        this.updateHover();
        
        webgram.onCenterOriginAction.trigger();
        
        return true;
    },
    
    
    /* event handlers */
    
    handleMouseDown: function (point, button, modifiers) {
        /* first try to pass the event to the hovered element */
        if (this._hoveredDrawingElement &&
            this._hoveredDrawingElement.transformedPointInside(point)) {
            
            var result = this._hoveredDrawingElement.onMouseDown.trigger(
                    this._hoveredDrawingElement.transformInverse(point), button, modifiers);
            
            if (result) {
                return true;
            }
        }

        if (button === 1) {
            this._mouseDownPoint = point;
            
            /* change the focus of the the selected control point if different than the hovered control point */
            if (this._selectedControlPoint && this._selectedControlPoint !== this._hoveredControlPoint) {
                this._selectedControlPoint.setFocus(Webgram.ControlPoint.FOCUS_NONE);
            }
            
            /* change the focus of the the hovered control point if different than the selected control point */
            if (this._hoveredControlPoint && this._selectedControlPoint !== this._hoveredControlPoint) {
                this._hoveredControlPoint.setFocus(Webgram.ControlPoint.FOCUS_HOVERED);
            }
            
            /* update the selected control point */
            this._selectedControlPoint = this._hoveredControlPoint;
            
            /* if a multiple selection group control point is selected,
             * leave the selection unchanged */
            if (this._hoveredControlPoint && this._hoveredControlPoint.drawingElement == this._msGroup) {
                return true;
            }
            
            /* determine if the hovered element is already part of the selection */
            var hoveredAlreadySelected = this._hoveredDrawingElement &&
                    (Webgram.Utils.indexOf(this._selectedDrawingElements, this._hoveredDrawingElement) >= 0) || false;
            
            if (hoveredAlreadySelected) {
                /* hovered is part of selection */
                
                if (modifiers.shift && this.getSetting('multipleSelectionEnabled')) {
                    /* remove the hovered element from selection */

                    this._hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
                    this._hoveredDrawingElement.onUnselect.trigger();
                    
                    this._selectedDrawingElements.splice(Webgram.Utils.indexOf(this._selectedDrawingElements, this._hoveredDrawingElement), 1);
                    
                    if (this._selectedDrawingElements.length === 1) {
                        Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                            drawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
                        });
                    }
                }
            }
            else {
                /* hovered is not part of selection */
                
                if (this._hoveredDrawingElement && modifiers.shift && this.getSetting('multipleSelectionEnabled')) {
                    /* add the hovered element to selection */

                    if (this._selectedDrawingElements.length > 0) {
                        this._hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                        Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                            drawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE);
                        });
                    }
                    else {
                        this._hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
                    }
                    
                    this._hoveredDrawingElement.onSelect.trigger();
                    
                    this._selectedDrawingElements.push(this._hoveredDrawingElement);
                }
                else {
                    /* replace the current selection with the hovered element */
                    
                    /* unselect any previously selected drawing elements */
                    Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                        drawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
                        drawingElement.onUnselect.trigger();
                        drawingElement.deactivateShift();
                    }, this);
                    
                    /* select the hovered drawing element */
                    if (this._hoveredDrawingElement) {
                        this._hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
                        this._hoveredDrawingElement.onSelect.trigger();
                        
                        this._selectedDrawingElements = [this._hoveredDrawingElement];
                    }
                    else {
                        this._selectedDrawingElements = [];
                    }
                }
                
                this.onSelectionChange.trigger(this._selectedDrawingElements.slice());
            }
            
            if (this._selectedControlPoint) { /* clicked on a control point */
                this._selectedControlPoint.onBeginMove.trigger();
            }
            
            /* remember the initial locations of the selected elements */
            this._initialLocations = {};
            Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                this._initialLocations[drawingElement.getId()] = drawingElement.getLocation();
            }, this);
            
            if (!this._hoveredDrawingElement) { 
                /* clicked outside of any drawing element,
                 * start a new multiple selection */
                if (this._msGroup) {
                    // TODO destroy old msGroup
                }
                
                if (this.getSetting('multipleSelectionEnabled')) {
//                    this._msGroup = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup(point.x, point.y);
//                    this.rootContainer._addDrawingElement(this._msGroup);
                    // TODO create new msgroup
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
        if (this._hoveredDrawingElement &&
            this._hoveredDrawingElement.transformedPointInside(point)) {
            
            var result = this._hoveredDrawingElement.onMouseUp.trigger(
                    this._hoveredDrawingElement.transformInverse(point), button, modifiers);
            
            if (result) {
                return true;
            }
        }
        
        if (button === 1) {
            this._mouseDownPoint = null;
            this._initialLocations = {};
            
            if (this._selectedControlPoint) {
                this._selectedControlPoint.onEndMove.trigger();
                
                return true;
            }
            
            /* stop the multiple selection, if started */
            if (this._msGroup) {
                // TODO finish ms group
                
                return true;
            }
        }
        else if (button === 3) { /* right button, used for panning */
            this._panMouseDownPoint = null;
            
            return true;
        } 
    },
    
    handleMouseMove: function (point, modifiers) {
        if (this._hoveredDrawingElement &&
            this._hoveredDrawingElement.transformedPointInside(point)) {
            
            var result = this._hoveredDrawingElement.onMouseMove.trigger(
                    this._hoveredDrawingElement.transformInverse(point), modifiers);
            
            if (result) {
                return result;
            }
        }

        if (this._panMouseDownPoint) { /* used for panning */
            var deltaX = point.x - this._panMouseDownPoint.x;
            var deltaY = point.y - this._panMouseDownPoint.y;
            var offset = this.rootContainer.getOffset();
            
            this.rootContainer.setOffset(new Webgram.Geometry.Point(offset.x - deltaX, offset.y - deltaY));
            
            return 'move';
        }
        else if (this._mouseDownPoint) {
            /* mouse button is pressed */
            
            if (this._selectedControlPoint) { /* execute the control point's action */
                this._selectedControlPoint.move(point, true);
                
                return this._selectedControlPoint.getCursor();
            }
            else if (this._selectedDrawingElements.length) {
                /* trigger onMouseMove on selected elements */
                Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                    drawingElement.onMouseMove.trigger(drawingElement.transformInverse(point), modifiers);
                });
                
                /* move the selected elements */
                var moved = false;
                var deltaX = point.x - this._mouseDownPoint.x;
                var deltaY = point.y - this._mouseDownPoint.y;
                Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
                    var initialLocation = this._initialLocations[drawingElement.getId()];
                    
                    if (drawingElement.isMoveEnabled() && initialLocation) {
                        var location = initialLocation.getTranslated(deltaX, deltaY);
                        
                        drawingElement._setLocation(location, this._selectedDrawingElements.length === 1);
                        moved = true;
                    }
                }, this);
                
                if (moved) {
                    return 'move';
                }
                else {
                    return 'default';
                }
            }
            else if (this._msGroup) {
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
                
                return 'crosshair';
            }
            else { /* clicked outside of any element, multiple selection disabled, nothing to do */
                this._mouseDownPoint = null;
                
                return 'default';
            }
        }
        else {
            /* mouse button is not pressed */
            
            /* determine the hovered drawing element and control point */
            var hoveredDrawingElement = null;
            var hoveredControlPoint = null;
            
            /* first consider the multiple selection group */
            if (this._msGroup) {
                hoveredControlPoint = this._msGroup.pointInsideControlPoint(point);
            }

            /* then consider the rest of the selected elements */
            if (!hoveredControlPoint) {
                var drawingElements = this.rootContainer.getDrawingElements();
                for (var i = 0; i < drawingElements.length; i++) {
                    var drawingElement = drawingElements[i];
                    if (!drawingElement.isSelectEnabled()) {
                        continue;
                    }
                    
                    if ((this._selectedDrawingElements.length === 1 && this._selectedDrawingElements[0] === drawingElement) ||
                        (this._selectedDrawingElements.length <= 1 && drawingElement.isHoveredControlPointsEnabled())) {
    
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
            }
            
            /* by this point we have the hovered control point and drawing element; 
             * we can also be sure the hoveredControlPoint belongs to the hoveredDrawingElement,
             * with the exception of the multiple selection group */
            
            if (hoveredDrawingElement && hoveredDrawingElement.getFocus() > Webgram.DrawingElement.FOCUS_SELECTED_MULTIPLE) { /* selected externally */
                // TODO implement this feature (i.e. block access to a DE based on its focus
                return 'not-allowed';
            }
            
            if (hoveredDrawingElement !== this._hoveredDrawingElement) { /* hovered element changed */
                /* remove hover from the currently hovered element */
                if (this._hoveredDrawingElement) {
                    if (this._hoveredDrawingElement.getFocus() === Webgram.DrawingElement.FOCUS_HOVERED) {
                        this._hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_NONE);
                    }
                    
                    this._hoveredDrawingElement.onMouseLeave.trigger(modifiers);
                }
                
                /* update the focus of the new hover element */
                if (hoveredDrawingElement) {
                    if (hoveredDrawingElement.getFocus() === Webgram.DrawingElement.FOCUS_NONE) {
                        hoveredDrawingElement.setFocus(Webgram.DrawingElement.FOCUS_HOVERED);
                    }
                    
                    hoveredDrawingElement.onMouseEnter.trigger(hoveredDrawingElement.translateInverse(point), modifiers);
                }
                
                /* set the new hovered element */
                this._hoveredDrawingElement = hoveredDrawingElement;
    
                if (this._hoveredDrawingElement) {
                    /* trigger the onMouseMove event on the new hovered element */
                    var result = this._hoveredDrawingElement.onMouseMove.trigger(
                            this._hoveredDrawingElement.transformInverse(point), modifiers);
                    
                    if (result) {
                        return result;
                    }
                }
            }
            
            if (hoveredControlPoint !== this._hoveredControlPoint) { /* hovered control point changed */
                /* remove hover from the currently hovered control point */
                if (this._hoveredControlPoint) {
                    if (this._hoveredControlPoint.getFocus() === Webgram.ControlPoint.FOCUS_HOVERED) {
                        this._hoveredControlPoint.setFocus(Webgram.ControlPoint.FOCUS_NONE);
                    }
                    
                    this._hoveredControlPoint.onMouseLeave.trigger(modifiers);
                    this._hoveredControlPoint.onRemove.unbind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved);
                }
                
                /* update the focus of the new hover control point */
                if (hoveredControlPoint) {
                    if (hoveredControlPoint.getFocus() === Webgram.ControlPoint.FOCUS_NONE) {
                        hoveredControlPoint.setFocus(Webgram.ControlPoint.FOCUS_HOVERED);
                    }
                 
                    hoveredControlPoint.onMouseEnter.trigger(point, modifiers);
                    hoveredControlPoint.onRemove.bind(Webgram.DrawingControls.SelectDrawingControl._whenPointRemoved, this);
                    
                }
                
                /* set the new hovered control point */
                this._hoveredControlPoint = hoveredControlPoint;
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
        }
    },
    
    handleMouseScroll: function (point, up, modifiers) {
        if (this._hoveredDrawingElement &&
            this._hoveredDrawingElement.transformedPointInside(point)) {
            
            var result = this._hoveredDrawingElement.onMouseScroll.trigger(
                    this._hoveredDrawingElement.transformInverse(point), up, modifiers);
            
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
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var result = this._selectedDrawingElements[i].onKeyPress.trigger(key, modifiers);
            if (result) {
                return result;
            }
        }
    },
        
    handleKeyDown: function (key, modifiers) {
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var result = this._selectedDrawingElements[i].onKeyDown.trigger(key, modifiers);
            if (result) {
                return result;
            }
            
            if (key === 16) { /* shift */
                this._selectedDrawingElements[i].activateShift();
            }
        }
        
        if (key === 16 && this._selectedDrawingElements.length) { /* shift */
            this.invalidate();
            
            return true;
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
        for (var i = 0; i < this._selectedDrawingElements.length; i++) {
            var result = this._selectedDrawingElements[i].onKeyUp.trigger(key, modifiers);
            if (result) {
                return result;
            }
            
            if (key === 16) { /* shift */
                this._selectedDrawingElements[i].deactivateShift();
            }
        }
        
        if (key === 16 && this._selectedDrawingElements.length) { /* shift */
            this.invalidate();
            
            return true;
        }
    },
    
    handleBlur: function () {
        /* in case the user moves away from the Webgram's html element,
         * we call deactivateShift on the selected element if it was previously enabled */
        
        Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
            if (drawingElement.isShiftActive()) {
                drawingElement.deactivateShift();
            }
        });
    },
    
    handleDrawingElementRemove: function (drawingElement) {
        /* remove the element from selection, if part of it */
        var index = Webgram.Utils.indexOf(this._selectedDrawingElements, drawingElement);
        if (index >= 0) {
            this._selectedDrawingElements.splice(index, 1);
            this.onSelectionChange.trigger(this._selectedDrawingElements.slice());
        }

        /* invalidate the hovered element if removed */
        if (this._hoveredDrawingElement === drawingElement) {
            this._hoveredDrawingElement = null;
        }
        
        /* invalidate the selected control point if its drawing element was removed */
        if (this._selectedControlPoint != null &&
            this._selectedControlPoint.drawingElement === drawingElement) {
            
            this._selectedControlPoint = null;
        }

        /* invalidate the hovered control point if its drawing element was removed */
        if (this._hoveredControlPoint != null &&
            this._hoveredControlPoint.drawingElement === drawingElement) {
            
            this._hoveredControlPoint = null;
        }
    },
    
    
    /* multiple selection group */
    
    _createMultipleSelectionGroup: function () {
        /* remove the existing multiple selection group */
        if (this._msGroup) {
            this.rootContainer._remDrawingElement(this._msGroup);
            this._msGroup = null;
        }
        
        if (this._selectedDrawingElements.length < 2) {
            return; /* nothing to do for less than two selected elements */
        }
        
        this._msGroup = new Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup(webgram.selectDrawingControl);
        
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        Webgram.Utils.forEach(this._selectedDrawingElements, function (drawingElement) {
            var boundingRectangle = drawingElement.getBoundingRectangle(true);
            
            if (boundingRectangle.x1 < minX) {
                minX = boundingRectangle.x1;
            }
            if (boundingRectangle.y1 < minY) {
                minY = boundingRectangle.y1;
            }
            if (boundingRectangle.x2 > maxX) {
                maxX = boundingRectangle.x2;
            }
            if (boundingRectangle.y2 > maxY) {
                maxY = boundingRectangle.y2;
            }
        });
    
        var width = maxX - minX + 1;
        var height = maxY - minY + 1;
        var location = new Webgram.Geometry.Point(
                (maxX + minX) / 2, (maxY + minY) / 2);

        this._msGroup._setLocation(location);
        this._msGroup._setWidth(width);
        this._msGroup._setHeight(height);
        
        this.rootContainer._addDrawingElement(this._msGroup);
    }
},

/** @lends Webgram.DrawingControls.SelectDrawingControl */ {
    
    _whenPointRemoved: function (drawingElement, selectDrawingControl) {
        /* invalidate the hovered control point if removed */
        if (selectDrawingControl._hoveredControlPoint === this) {
            selectDrawingControl._hoveredControlPoint = null;
        }
        
        /* invalidate the selected control point if removed */
        if (selectDrawingControl._selectedControlPoint === this) {
            selectDrawingControl._selectedControlPoint = null;
        }
    }
});


/* A class that represents a multiple selection group to be used
 * with the select drawing control. */
Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup =
        Webgram.DrawingElements.RectangularElement.extend({

    initialize: function _MultipleSelectionGroup(selectDrawingControl) {
        Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.parentClass.call(this);
        
        this.setId('@multiple-selection-group');
        
        this.zIndex = -10000;
        
        this.setStrokeStyle(Webgram.Styles.getStrokeStyle('multiple-selection'));
        this.setFillStyle(Webgram.Styles.getFillStyle('multiple-selection'));
        this._emptyFillStyle = Webgram.Styles.getFillStyle('multiple-selection-empty');
        
        this.setRotateEnabled(true);
        this.setEditEnabled(true);
        this.setSnapExternallyEnabled(true);
        this.setSnapToAngleEnabled(true);
        
        this._selectDrawingControl = selectDrawingControl;
        this.setFocus(Webgram.DrawingElement.FOCUS_SELECTED);
    },
    
    drawSelf: function () {
        if (this._parent.isMini()) {
            this.drawNoZoom();
        }
    },
    
    drawNoZoom: function() {
        this.drawRect(this.getBoundingRectangle());
        
        var strokeStyle = this.getStrokeStyle();
        var fillStyle = this._hasSelectedElements() ? this.getFillStyle() : this._emptyFillStyle;
        
        this.paint(strokeStyle, fillStyle);
    },
    
    drawDecoration: function () {
        /* no decoration */
    },
    
    pointInside: function (point) {
        return false;
    },
    
    getSiblings: function (excludeDependent) {
        /* we override this method because we need to filter out
         * all the selected elements */
        var siblings = [];
        
        Webgram.Utils.forEach( Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.parent.getSiblings.call(this, excludeDependent),
            function (sibling) {
                if (Webgram.Utils.indexOf(this._selectDrawingControl._selectedDrawingElements, sibling) >= 0) {
                    return;
                }
                
                siblings.push(sibling);
            }, this
        );
        
        return siblings;
    },
    
    isSnapExternallyEnabled: function () {
        return (Webgram.DrawingControls.SelectDrawingControl._MultipleSelectionGroup.parent.isSnapExternallyEnabled.call(this) &&
                this._hasSelectedElements());
    },
    
    _hasSelectedElements: function () {
        return this._selectDrawingControl._selectedDrawingElements.length > 0;
    }
}, 

/* static members */ {
});
