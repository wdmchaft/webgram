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


Webgram.DrawingControl = Webgram.Class.extend( /** @lends Webgram.DrawingControl.prototype */ {
    /**
     * This is the base class for all drawing controls.
     * A drawing control handles the mouse and keyboard events
     * received by the webgram canvas. A webgram can have many associated drawing controls
     * but only one of them can be active at once.
     * @constructs Webgram.DrawingControl
     * @param {Webgram.DrawingElements.RootContainer} rootContainer the root container element of the webgram
     */
    initialize: function DrawingControl(rootContainer) {
        /**
         * A drawing control operates directly on a root container element.
         * @type Webgram.DrawingElements.RootContainer
         */
        this.rootContainer = rootContainer;
        
        /**
         * An event that is triggered when the drawing control becomes active.<br>
         * Handlers receive no arguments.
         * @type Webgram.Event
         */
        this.onActivate = new Webgram.Event('activate', this); /* () */

        /**
         * An event that is triggered when the drawing control becomes inactive.<br>
         * Handlers receive no arguments.
         * @type Webgram.Event
         */
        this.onDeactivate = new Webgram.Event('deactivate', this); /* () */
    },
    
    /**
     * This tells webgram that something about one of the drawing elements has changed
     * and that a redraw should be issued as soon as possible.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Boolean} mini set to <tt>true</tt> if the mini webgram should
     *  also be redrawn.
     */
    invalidate: function (mini) {
        this.rootContainer.webgram.invalidate(mini);
    },

    /**
     * Returns a webgram setting. These settings are global and are available to each
     * element added to the webgram instance.<br><br>
     * <em>(should not be overridden)</em>
     * @param {String} setting the full name of the setting
     * @param {any} def the default value to return if the setting is not present
     * @returns {any} the value of the setting, or <tt>def</tt> if it is not present
     */
    getSetting: function (setting, def) {
        if (!this.rootContainer) { /* not added yet */
            return null;
        }
        
        return this.rootContainer.webgram.getSetting(setting, def);
    },
    
    /**
     * Returns the webgram that this drawing control is attached to.
     * @returns {Webgram} the webgram that this drawing control is attached to
     */
    getWebgram: function () {
        if (this.rootContainer == null) {
            return null; /* not added yet */
        }
        
        return this.rootContainer.webgram;
    },
    
    /**
     * Activates the drawing control. If this drawing control is already active,
     * this method does nothing. If there's another active drawing control,
     * it will be deactivated first.<br><br>
     * <em>(should not be overridden)</em>
     */
    activate: function () {
        if (this.rootContainer._activeDrawingControl === this) { /* already active */
            return;
        }
        
        if (this.rootContainer._activeDrawingControl) {
            this.rootContainer._activeDrawingControl.onDeactivate.trigger();
        }
        
        this.rootContainer._prevDrawingControl = this.rootContainer._activeDrawingControl;
        this.rootContainer._activeDrawingControl = this;
        
        this.onActivate.trigger();
        
        this.updateHover();
        
        /* make sure the webgram element has canvas */
        var webgram = this.getWebgram();
        if (!webgram.hasFocus()) {
            webgram.htmlElement.focus();
        }
    },
    
    /**
     * Deactivates the drawing control. If this drawing control is not active,
     * this method does nothing.<br><br>
     * <em>(should not be overridden)</em>
     */
    deactivate: function () {
        if (this.rootContainer._activeDrawingControl !== this) { /* not active */
            return;
        }
        
        this.rootContainer._activeDrawingControl = null;
        this.onDeactivate.trigger();
    },
    
    /**
     * Each drawing control remembers the drawing control that was previously active,
     * before it became active. This method reactivates the previous drawing control, if any.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.DrawingControl} the drawing control that was reactivated
     */
    activatePrevious: function () {
        this.deactivate();
        
        var prevDrawingControl = this.rootContainer._prevDrawingControl;
        if (prevDrawingControl == null) { /* no previous DC */
            return null;
        }
        
        prevDrawingControl.activate();
        
        return prevDrawingControl;
    },
    
    keyMatches: function (shortcut, key, modifiers) {
        if (shortcut == null) {
            return false;
        }
        
        if (shortcut.indexOf('alt') >= 0) {
            if (!modifiers.alt) {
                return false;
            }
        }
        else {
            if (modifiers.alt) {
                return false;
            }
        }
        
        if (shortcut.indexOf('ctrl') >= 0) {
            if (!modifiers.ctrl) {
                return false;
            }
        }
        else {
            if (modifiers.ctrl) {
                return false;
            }
        }

        if (shortcut.indexOf('shift') >= 0) {
            if (!modifiers.shift) {
                return false;
            }
        }
        else {
            if (modifiers.shift) {
                return false;
            }
        }
        
        var index = shortcut.lastIndexOf('-');
        if (index >= 0) {
            if (shortcut.substring(index + 1) != key) {
                return false;
            }
        }
        else {
            if (shortcut != key) {
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Returns the point where the mouse was moved the last time.
     * @returns {Webgram.Geometry.Point} the last mouse point,
     * or <tt>null</tt> if the mouse hasn't been moved yet
     */
    getLastMousePoint: function () {
        return this.rootContainer._lastMousePoint;
    },

    /**
     * Calls the mouse move handler to update the drawing control's state
     * according to the currently hovered element(s). Call this whenever
     * a drawing element is programmatically added, removed or simply moved
     * and therefore the control's hovering state (or the displayed cursor)
     * might suffer changes as well.
     */
    updateHover: function () {
        if (this.rootContainer._lastMousePoint) {
            var result = this.handleMouseMove(this.rootContainer._lastMousePoint, {});
            if (result != null) {
                this.rootContainer.webgram.htmlElement.style.cursor = result;
            }
        }
    },
    
    /**
     * Returns the drawing elements that this drawing control considers as selected.<br><br>
     * <em>(should be overridden)</em>
     * @returns {Array} a list with the selected drawing elements
     */
    getSelectedDrawingElements: function () {
        return [];
    },
    
    /**
     * Changes the selected drawing elements, according to the given list.<br><br>
     * <em>(should be overridden)</em>
     * @param {Array} drawingElements a list of drawing elements to be set as selected
     */
    setSelectedDrawingElements: function (drawingElements) {
    },
    
    /**
     * Performs the action corresponding to the mouse down event.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse button was pressed
     * @param {Number} button the mouse button that was pressed (<tt>1</tt> - left, <tt>2</tt> - middle, <tt>3</tt> - right)
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseDown: function (point, button, modifiers) {
    },

    /**
     * Performs the action corresponding to the mouse up event.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse button was released
     * @param {Number} button the mouse button that was released (<tt>1</tt> - left, <tt>2</tt> - middle, <tt>3</tt> - right)
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseUp: function (point, button, modifiers) {
    },

    /**
     * Performs the action corresponding to the mouse move event.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse was moved
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseMove: function (point, modifiers) {
    },

    /**
     * Performs the action corresponding to the mouse scroll event.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse wheel was turned
     * @param {Boolean} up <tt>true</tt> if the mouse wheel was turned up, <tt>false</tt> otherwise
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseScroll: function (point, up, modifiers) {
    },

    /**
     * Performs the action corresponding to the key press event.<br><br>
     * <em>(should be overridden)</em>
     * @param {String} key the character corresponding to the key that was pressed
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyPress: function (key, modifiers) {
    },

    /**
     * Performs the action corresponding to the key down event.<br><br>
     * <em>(should be overridden)</em>
     * @param {Number} key the code corresponding to the key that was pressed
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyDown: function (key, modifiers) {
    },

    /**
     * Performs the action corresponding to the key up event.<br><br>
     * <em>(should be overridden)</em>
     * @param {Number} key the code corresponding to the key that was released
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyUp: function (key, modifiers) {
    },

    /**
     * Performs the action corresponding to the focus event.<br><br>
     * <em>(should be overridden)</em>
     */
    handleFocus: function () {
    },
    
    /**
     * Performs the action corresponding to the blur (focus lost) event.<br><br>
     * <em>(should be overridden)</em>
     */
    handleBlur: function () {
    },
    
    /**
     * Performs an action when a drawing element is added to the root container.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.DrawingElement} drawingElement the drawing element that was added
     */
    handleDrawingElementAdd: function (drawingElement) {
    },

    /**
     * Performs an action when a drawing element is removed from the root container.<br><br>
     * <em>(should be overridden)</em>
     * @param {Webgram.DrawingElement} drawingElement the drawing element that was removed
     */
    handleDrawingElementRemove: function (drawingElement) {
    }
});
