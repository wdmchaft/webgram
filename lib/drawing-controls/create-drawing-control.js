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


Webgram.Namespace('Webgram.DrawingControls');

/**
 * @class A drawing control used to interactively create drawing elements on the canvas.
 * @extends Webgram.DrawingControl
 * @param {Webgram.DrawingElements.RootContainer} rootContainer the root container element of the webgram
 */
Webgram.DrawingControls.CreateDrawingControl = function (rootContainer) {
    Webgram.DrawingControl.call(this, rootContainer);
    
    /**
     * The currently creating drawing element, or <tt>null</tt> if no element is currently being created.
     * @type Webgram.DrawingElement
     */
    this.drawingElement = null;
    
    /**
     * The drawing element class to be used to create instances.
     * @type Function
     */
    this.drawingElementClass = null;
    
    this._initialMouseDownPoint = null;
    
    this.onDeactivate.bind(function () {
        this.drawingElement = null;
        this.drawingElementClass = null;
        this._initialMouseDownPoint = null;
    });
};

Webgram.DrawingControls.CreateDrawingControl.prototype = {
    /**
     * Sets the drawing element class to be used to create new drawing element instances.
     * @param {Function} drawingElementClass the drawing element class to use
     */
    setDrawingElementClass: function (drawingElementClass) {
        if (this.drawingElement != null) { /* a creation session was active */
            this.finish();
        }
        
        this.drawingElementClass = drawingElementClass;
        
        this.invalidateDrawing(true);
    },
    
    /**
     * Ends the creation process, if started.
     */
    finish: function () {
        if (this.drawingElement == null) {
            return;
        }
        
        var drawingElement = this.drawingElement;
        
        this.drawingElement = null;
        this._initialMouseDownPoint = null;
        this._mouseDownPoint = null;
        
        if (drawingElement.endCreate()) {
            var drawingControl = this.activatePrevious();
            if (drawingControl != null && drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl) { 
                drawingControl.setSelectedDrawingElements([drawingElement]);
            }
            
            drawingElement.onAdd.trigger();
            this.rootContainer.webgram.onDrawingElementAdd.trigger(drawingElement);
            this.rootContainer.webgram.saveUndoCheckPoint([drawingElement], 'add');
        }
        else {
            this.rootContainer._remDrawingElement(drawingElement);
            this.activatePrevious(); /* if the creation failed, activate the previous drawing control */
        }
        
        drawingElement._creating = false;
        drawingElement.disableShift();

        this.invalidateDrawing(true);
    },
    
    getSelectedDrawingElements: function () {
        if (this.drawingElement) {
            return [this.drawingElement];
        }
        else {
            return [];
        }
    },
    
    handleMouseDown: function (point, button, modifiers) {
        if (button !== 1) {
            return;
        }
        
        if (modifiers.doubleClick) {
            this.finish();
            
            return true;
        }
        
        this._mouseDownPoint = point;
        if (!this._initialMouseDownPoint) {
            this._initialMouseDownPoint = point;
        }
        
        if (!this.drawingElement) { /* first click */
            this.drawingElement = new this.drawingElementClass(); /* create an element with default attributes */
            this.drawingElement.setFocusType(Webgram.DrawingElement.FOCUS_SELECTED);
            
            this.drawingElement._creating = true;
            this.rootContainer._addDrawingElement(this.drawingElement);
            
            this.rootContainer.webgram.onDrawingElementCreate.trigger(this.drawingElement);
            this.rootContainer.webgram.onSelectionChange.trigger([this.drawingElement]);
            
            if (!this.drawingElement.beginCreate(point)) { /* creation ended after first click */
                this.finish();
            }
        }
        else { /* subsequent click */
            var size = new Webgram.Geometry.Size(point.x - this._initialMouseDownPoint.x, point.y - this._initialMouseDownPoint.y);
            if (modifiers.shift) {
                this.drawingElement.enableShift();
            }
            if (!this.drawingElement.continueCreate(point, size, true, true)) {
                this.finish();
            }
        }
        
        this.handleMouseMove(point, modifiers);
        
        this.invalidateDrawing();
        
        return true;
    },
    
    handleMouseUp: function (point, button, modifiers) {
        if (button !== 1) {
            return;
        }
        
        if (this._mouseDownPoint != null && point.getDistanceTo(this._mouseDownPoint) > 25) {
            this.handleMouseDown(point, button, modifiers);
        }
        
        this._mouseDownPoint = null;
        
        /* this calls the continueCreate() method of the DE
         * that could end the creation process */
        this.handleMouseMove(point, modifiers);
        
        return true;
    },
    
    handleMouseMove: function (point, modifiers) {
        if (!this.drawingElement) {
            return;
        }
        
        var size = new Webgram.Geometry.Size(point.x - this._initialMouseDownPoint.x, point.y - this._initialMouseDownPoint.y);
        
        var result = this.drawingElement.continueCreate(point, size, (this._mouseDownPoint != null), false);
        if (!result) {
            this.finish();
        }
        
        this.invalidateDrawing();
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
        if (key === 27) {
            this.finish();
            
            return true;
        }
        
        if (this.drawingElement) {
            var result = this.drawingElement.onKeyDown.trigger(key, modifiers);
            if (result) {
                return resukt;
            }
            
            if (key === 16) { /* shift */
                this.drawingElement.enableShift();
                this.invalidateDrawing();
                
                return true;
            }
            
        }
    },
    
    handleKeyUp: function (key, modifiers) {
        if (this.drawingElement) {
            var result = this.drawingElement.onKeyUp.trigger(key, modifiers);
            if (result) {
                return result;
            }
            
            if (key === 16) { /* shift */
                this.drawingElement.disableShift();
                this.invalidateDrawing();
                
                return true;
            }
        }
    },

    handleBlur: function () {
        /* in case the user moves away from the webgram html element,
         * we call disableShift on the current element if it was previously enabled */
        
        if (this.drawingElement != null && this.drawingElement.isShiftEnabled()) {
            this.drawingElement.disableShift();
            
            return true;
        }
    }    
};

Webgram.Class('Webgram.DrawingControls.CreateDrawingControl', Webgram.DrawingControl);
