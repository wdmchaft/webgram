/*!
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
 * @class The root class of this library.
 * @param {HtmlElement} htmlElement the <em>HTML</em> element to be used to receive the mouse and keyboard events;
 *  this is normally the <em>HTML Canvas</em> element whose 2D context is used to create the canvas object passed as the second argument
 * @param {Webgram.Canvas} canvas the canvas to be used
 *  by this instance of webgram to paint everything.
 * @param {Object} settings an object with settings that will replace the default ones
 */
Webgram = function (htmlElement, canvas, settings) {
    /**
     * The webgram library holds a reference to an object with the
     * so-called global settings, manipulable using
     * the {@link Webgram#getSetting} and {@link Webgram#setSetting} methods.
     * These settings are accessible in all drawing elements, control points and
     * drawing controls, using their corresponding methods with the same names
     * as the ones described above.
     * @type Object 
     */
    this.settings = {
        zoomFactors: [0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.9, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        zoomLevel: 9,
        
        mainGrid: {
            sizeX: 25,
            sizeY: 25
        },
        
        snapGrid: {
            sizeX: 5,
            sizeY: 5
        },
        
        snapAngle: Math.PI / 8,
        snapAngleThreshold: Math.PI / 12,
        snapDistance: 10,
        snapVisualFeedback: true,
        
        decorationOffset: 5,
        
        doubleClickThreshold: 200,
        
        maxUndoLevels: 1024,
        
        showRulers: true,
        showZoom: true,
        
        panEnabled: true,
        zoomEnabled: true,
        multipleSelectionEnabled: true,
        actionsEnabled: true,
        
        fonts: {
            'arial': 'arial,helvetica'
        },
        
        keyboardShortcuts: {
            'copy': 'ctrl-67', /* control + 'c' key */
            'paste': 'ctrl-86', /* control + 'v' key */
            'delete': '46', /* delete key */
            'duplicate': 'ctrl-68', /* control + 'd' key */
            'moveUp': '38', /* up */
            'moveRight': '39', /* right */
            'moveDown': '40', /* down */
            'moveLeft': '37', /* left */
            'fineMoveUp': 'shift-38', /* shift-up */
            'fineMoveRight': 'shift-39', /* shift-right */
            'fineMoveDown': 'shift-40', /* shift-down */
            'fineMoveLeft': 'shift-37', /* shift-left */
            'bringToFront': 'ctrl-38', /* control + up */
            'sendToBack': 'ctrl-40', /* control + down */
            'flipHorizontally': '72', /* 'h' key */
            'flipVertically': '86', /* 'v' key */
            'undo': 'ctrl-90' /* control + 'z' key */,
            'redo': 'ctrl-89' /* control + 'y' key */,
            'zoomIn': 'ctrl-187', /* control + equal */
            'zoomOut': 'ctrl-189', /* control + minus */
            'zoomOne': '49', /* '1' key */
            'zoomFit': '50', /* '2' key */
            'centerOrigin': '48' /* '0' key */
        }
    };
    
    if (settings) {
        for (var key in settings) {
            this.settings[key] = settings[key];
        }
    }
    
    /**
     * The <em>HTML</em> element used to receive the JavaScript keyboard and mouse events.
     * This is usually the <em>HTML Canvas</em> element whose 2D context was used to create the canvas.
     * @type HTMLElement
     */
    this.htmlElement = htmlElement;
    
    /**
     * A webgram instance has one root container which
     * is the parent of all the drawing elements added to the webgram.
     * @type Webgram.DrawingElements.RootContainer
     */
    this.rootContainer = new Webgram.DrawingElements.RootContainer(this, canvas);
    
    /**
     * The canvas used to paint everything.
     * This is basically a wrapper around the <em>HTML Canvas</em> element.
     * @type Webgram.Canvas
     */
    this.canvas = canvas;
    this.canvas._fonts = this.getSetting('fonts');
   
    /**
     * A webgram instance automatically gets a select drawing control.
     * @type Webgram.DrawingControls.SelectDrawingControl
     */
    this.selectDrawingControl = new Webgram.DrawingControls.SelectDrawingControl(this.rootContainer);

    /**
     * A webgram instance automatically gets a creation drawing control.
     * @type Webgram.DrawingControls.CreateDrawingControl
     */
    this.createDrawingControl = new Webgram.DrawingControls.CreateDrawingControl(this.rootContainer);

    /**
     * A webgram instance automatically gets a text drawing control.
     * @type Webgram.DrawingControls.TextDrawingControl
     */
    this.textDrawingControl = new Webgram.DrawingControls.TextDrawingControl(this.rootContainer);

    /* the initial default drawing control is the select drawing control */
    this.selectDrawingControl.activate();
    
    
    /* events */
    
    
    /**
     * An event that is triggered whenever a key is pressed while the webgram is focused.
     * This is the equivalent of <tt>onKeyPress</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(key, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onKeyPress = new Webgram.Event('key press', this); /* (key, modifiers) */

    /**
     * An event that is triggered whenever a key is pressed while the webgram is focused.<br>
     * This is the equivalent of <tt>onKeyDown</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(key, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onKeyDown = new Webgram.Event('key down', this); /* (key, modifiers) */
    
    /**
     * An event that is triggered whenever a key is released while the webgram is focused.<br>
     * This is the equivalent of <tt>onKeyUp</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(key, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onKeyUp = new Webgram.Event('key up', this); /* (key, modifiers) */
    
    /**
     * An event that is triggered whenever a mouse button is pressed on the webgram.<br>
     * This is the equivalent of <tt>onMouseDown</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, button, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseDown = new Webgram.Event('mouse down', this); /* (point, button, modifiers) */

    /**
     * An event that is triggered whenever a mouse button is released on the webgram.<br>
     * This is the equivalent of <tt>onMouseUp</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, button, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseUp = new Webgram.Event('mouse up', this); /* (point, button, modifiers) */
    
    /**
     * An event that is triggered whenever the mouse is moved over the webgram.<br>
     * This is the equivalent of <tt>onMouseMove</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseMove = new Webgram.Event('mouse move', this); /* (point, modifiers) */
    
    /**
     * An event that is triggered whenever the mouse whell is turned while on the webgram.<br>
     * Handlers receive the following arguments: <tt>(point, up, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseScroll = new Webgram.Event('mouse scroll', this); /* (point, up, modifiers) */
    
    /**
     * An event that is triggered whenever the mouse enters the area of the webgram.
     * This is the equivalent of <tt>onMouseOver</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(point, modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseEnter = new Webgram.Event('mouse enter', this); /* (point, modifiers) */
    
    /**
     * An event that is triggered whenever the mouse leaves the area of the webgram.
     * This is the equivalent of <tt>onMouseOut</tt> JavaScript event.<br>
     * Handlers receive the following arguments: <tt>(modifiers)</tt> 
     * @type Webgram.Event
     */
    this.onMouseLeave = new Webgram.Event('mouse leave', this); /* (modifiers) */

    /**
     * An event that is triggered whenever webgram gains the focus.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onFocus = new Webgram.Event('focus', this); /* () */
    
    /**
     * An event that is triggered whenever webgram loses the focus.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onBlur = new Webgram.Event('blur', this); /* () */
    
    /**
     * An event that is triggered when the webgram is drawn on the canvas.<br>
     * Handlers receive no arguments. 
     * @type Webgram.Event
     */
    this.onDraw = new Webgram.Event('draw', this); /* () */
    
    /**
     * An event that is triggered when the webgram changes its current zoom factor.
     * This can happen either by a zoom-in/zoom-out action with the mouse wheel,
     * or by an explicit call to {@link Webgram#setZoomLevel}.<br>
     * Handlers receive the following arguments: <tt>(zoomLevel)</tt>. 
     * @type Webgram.Event
     */
    this.onZoom = new Webgram.Event('zoom', this); /* (zoomLevel) */

    /**
     * An event that is triggered when the webgram changes its display offset
     * (i.e. when the content is panned).
     * This can happen either by a pan action with the mouse middle click,
     * or by an explicit call to one of the following methods:
     *  {@link Webgram#setVisibleCenter},
     *  {@link Webgram#setVisibleArea} or
     *  {@link Webgram#setVisibleDrawingElements}.<br>
     * Handlers receive the following arguments: <tt>(visibleCenter)</tt>. 
     * @type Webgram.Event
     */
    this.onPan = new Webgram.Event('pan', this); /* (visibleCenter) */
    
    /**
     * An event that is triggered when a drawing element is added to the webgram,
     * either directly using {@link Webgram#addDrawingElement} or indirectly,
     * by calling the {@link Webgram.DrawingElements.ContainerElement#addDrawingElement}
     * on a container element already added to the webgram.
     * Handlers receive the following arguments: <tt>(drawingElement)</tt>. 
     * @type Webgram.Event
     */
    this.onDrawingElementAdd = new Webgram.Event('drawing element add', this); /* (drawingElement) */

    /**
     * An event that is triggered when a drawing element is removed from the webgram,
     * either directly using {@link Webgram#remDrawingElement} or indirectly,
     * by removing a drawing element with {@link Webgram.DrawingElements.ContainerElement#remDrawingElement}
     * from a container element added to the webgram.
     * Handlers receive the following arguments: <tt>(drawingElement)</tt>. 
     * @type Webgram.Event
     */
    this.onDrawingElementRemove = new Webgram.Event('drawing element remove', this); /* (drawingElement) */

    /**
     * An event that is triggered when a drawing element's style, shape or rotation angle is changed.
     * Any additional attribute that contributes to the json form of an element
     * should trigger this event upon modification.
     * Handlers receive the following arguments: <tt>(drawingElement)</tt>. 
     * @type Webgram.Event
     */
    this.onDrawingElementChange = new Webgram.Event('drawing element change', this); /* (drawingElement) */
    
    /**
     * An event that is triggered when a drawing element's position inside its parent changes,
     * either by calling {@link Webgram#setDrawingElementIndex}/{@link Webgram.DrawingElements.ContainerElement#setDrawingElementIndex} or
     * by adding/removing other drawing elements to/from a container element added to the webgram. 
     * Handlers receive the following arguments: <tt>(drawingElement, index)</tt>. 
     * @type Webgram.Event
     */
    this.onDrawingElementIndexChange = new Webgram.Event('drawing element index change', this); /* (drawingElement, index) */
    
    /**
     * An event that is triggered when a {@link Webgram.Connectors.Connector} is connected/disconnected to/from a drawing element.<br>
     * Handlers receive the following arguments: <tt>(connector, drawingElement, type)</tt>, where
     * <tt>type</tt> is either <tt>'connect'</tt> or <tt>'disconnect'</tt>. 
     * @type Webgram.Event
     */
    this.onDrawingElementInteract = new Webgram.Event('drawing element interact', this); /* (connector, drawingElement, type) */
    
    /**
     * An event that is triggered right after a drawing element was created using the
     * {@link Webgram.DrawingControls.CreateDrawingControl}.<br>
     * Handlers receive the following arguments: <tt>(drawingElement)</tt>. 
     * @type Webgram.Event
     */
    this.onDrawingElementCreate = new Webgram.Event('drawing element create', this); /* (drawingElement) */
    
    /**
     * An event that is triggered when the current selection is changed.
     * The current selection is made of zero, one or more drawing elements.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>. 
     * @type Webgram.Event
     */
    this.onSelectionChange = new Webgram.Event('selection change', this); /* (drawingElements) */

    /**
     * An event that is triggered when the clipboard contents changed.
     * Webgram uses an internal clipboard object, completely independed of the
     * operating system's one.<br>
     * Handlers receive the following arguments: <tt>(clipboard)</tt>.
     * @see Webgram#setClipboard 
     * @type Webgram.Event
     */
    this.onClipboardChange = new Webgram.Event('clipboard change', this); /* (clipboard) */
    
    /**
     * An event that is triggered when the <em>copy</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doCopy
     * @type Webgram.Event
     */
    this.onCopyAction = new Webgram.Event('copy action', this); /* (drawingElements) */

    /**
     * An event that is triggered when the <em>paste</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doPaste
     * @type Webgram.Event
     */
    this.onPasteAction = new Webgram.Event('paste action', this); /* (drawingElements) */

    /**
     * An event that is triggered when the <em>duplicate</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doDuplicate
     * @type Webgram.Event
     */
    this.onDuplicateAction = new Webgram.Event('duplicate action', this); /* (drawingElements) */

    /**
     * An event that is triggered when the <em>delete</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doDelete
     * @type Webgram.Event
     */
    this.onDeleteAction = new Webgram.Event('delete action', this); /* (drawingElements) */
    
    /**
     * An event that is triggered when the <em>undo</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElement, operation)</tt>.
     * @see Webgram#doUndo
     * @type Webgram.Event
     */
    this.onUndoAction = new Webgram.Event('undo action', this); /* (drawingElements, operation) */
    
    /**
     * An event that is triggered when the <em>redo</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElement, operation)</tt>.
     * @see Webgram#doRedo
     * @type Webgram.Event
     */
    this.onRedoAction = new Webgram.Event('redo action', this); /* (drawingElements, operation) */
    
    /**
     * An event that is triggered when the <em>move</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements, direction)</tt>.
     * @see Webgram#doMove
     * @type Webgram.Event
     */
    this.onMoveAction = new Webgram.Event('move action', this); /* (drawingElements, direction) */
    
    /**
     * An event that is triggered when the <em>bring-to-front</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doBringToFront
     * @type Webgram.Event
     */
    this.onBringToFrontAction = new Webgram.Event('bring to front action', this); /* (drawingElements) */
    
    /**
     * An event that is triggered when the <em>send-to-back</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doSendToBack
     * @type Webgram.Event
     */
    this.onSendToBackAction = new Webgram.Event('send to back action', this); /* (drawingElements) */
    
    /**
     * An event that is triggered when the <em>flip-horizontally</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doFlipHorizontally
     * @type Webgram.Event
     */
    this.onFlipHorizontallyAction = new Webgram.Event('flip horizontally action', this); /* (drawingElements) */
    
    /**
     * An event that is triggered when the <em>flip-vertically</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(drawingElements)</tt>.
     * @see Webgram#doFlipVertically
     * @type Webgram.Event
     */
    this.onFlipVerticallyAction = new Webgram.Event('flip vertically action', this); /* (drawingElements) */
    
    /**
     * An event that is triggered when the <em>zoom-in</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(zoomLevel)</tt>.
     * @see Webgram#doZoomIn
     * @type Webgram.Event
     */
    this.onZoomInAction = new Webgram.Event('zoom in action', this); /* (zoomLevel) */
    
    /**
     * An event that is triggered when the <em>zoom-out</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(zoomLevel)</tt>.
     * @see Webgram#doZoomOut
     * @type Webgram.Event
     */
    this.onZoomOutAction = new Webgram.Event('zoom out action', this); /* (zoomLevel) */
    
    /**
     * An event that is triggered when the <em>zoom-one</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(zoomLevel)</tt>.
     * @see Webgram#doZoomOne
     * @type Webgram.Event
     */
    this.onZoomOneAction = new Webgram.Event('zoom one action', this); /* (zoomLevel) */
    
    /**
     * An event that is triggered when the <em>zoom-fit</em> action takes place.<br>
     * Handlers receive the following arguments: <tt>(zoomLevel)</tt>.
     * @see Webgram#doZoomFit
     * @type Webgram.Event
     */
    this.onZoomFitAction = new Webgram.Event('zoom fit action', this); /* (zoomLevel) */
    
    /**
     * An event that is triggered when the <em>center-origin</em> action takes place.<br>
     * Handlers receive no arguments.
     * @see Webgram#doCenterOrigin
     * @type Webgram.Event
     */
    this.onCenterOriginAction = new Webgram.Event('center origin action', this); /* () */
    
    this._clipboard = {
        type: null,
        content: null
    };

    this._needsRedraw = true;
    this._miniNeedsRedraw = true;
    this._lastClickTimestamp = null;
    this._miniWebgram = null;
    this._hasFocus = false;
    this._keyboardEvent = false;
    this._mouseEvent = false;
    this._focusEvent = false;
    this._actionEvent = false;
    this._imageStore = new Webgram.ImageStore(this);
    this._lastIdSequence = 0;
    this._undoCheckPoints = [];
    this._undoPosition = 0;
    this._undoCheckPointsDisabled = 0;
    
    var style = getComputedStyle(htmlElement);
    var borderStr = style.getPropertyValue('border-left-width');
    if (borderStr) {
        this._border = parseInt(borderStr, 10);
    }
    else {
        this._border = 0;
    }
    
    /* load the images into the image store */
    this._imageStore.load('end-point-connected', Webgram.jsPath + 'images/diamond-control-point.png');
    this._imageStore.load('socket', Webgram.jsPath + 'images/diamond-empty-control-point.png');
    this._imageStore.load('gradient-point', Webgram.jsPath + 'images/gradient-point.png');
    this._imageStore.load('rotate', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('rotation-center', Webgram.jsPath + 'images/rotation-center.png');
    this._imageStore.load('poly-point', Webgram.jsPath + 'images/round-control-point.png');
    this._imageStore.load('remove-poly-point', Webgram.jsPath + 'images/remove-poly-point.png');
    this._imageStore.load('resize-top-left', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('resize-top', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('resize-top-right', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('resize-right', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('resize-bottom-right', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('resize-bottom', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('resize-bottom-left', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('resize-left', Webgram.jsPath + 'images/square-control-point.png');
    
    this._imageStore.load('round-control-point', Webgram.jsPath + 'images/round-control-point.png');
    this._imageStore.load('round-empty-control-point', Webgram.jsPath + 'images/round-empty-control-point.png');
    this._imageStore.load('square-control-point', Webgram.jsPath + 'images/square-control-point.png');
    this._imageStore.load('square-empty-control-point', Webgram.jsPath + 'images/square-empty-control-point.png');
    this._imageStore.load('diamond-control-point', Webgram.jsPath + 'images/diamond-control-point.png');
    this._imageStore.load('diamond-empty-control-point', Webgram.jsPath + 'images/diamond-empty-control-point.png');
    
    this._imageStore.load('arrow-horiz-control-point', Webgram.jsPath + 'images/arrow-horiz-control-point.png');
    this._imageStore.load('arrow-vert-control-point', Webgram.jsPath + 'images/arrow-vert-control-point.png');
    
    /* start the redraw loop */
    this._setRedrawLoop();
};

Webgram.VERSION = '0.1';

Webgram.prototype = {
    /**
     * Returns a webgram setting. These settings are global and are available to each
     * element added to the webgram instance.<br><br>
     * <em>(should not be overridden)</em>
     * @param {String} setting the full name of the setting
     * @param {any} def the default value to return if the setting is not present
     * @returns {any} the value of the setting, or <tt>def</tt> if it is not present
     */
    getSetting: function (setting, def) {
        return Webgram.Utils.getField(setting, def, this.settings);
    },
    
    /**
     * Changes one of the global webgram settings.<br><br>
     * <em>(should not be overridden)</em>
     * @param {String} setting the full name of the setting
     * @param {any} value the new value for the setting
     */
    setSetting: function (setting, value) {
        Webgram.Utils.setField(setting, value, this.settings);
        this.invalidateDrawing();
    },
    
    /**
     * Selectively updates the global settings,
     * as indicated by the <tt>settings</tt> argument.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Object} settings an object containing the part of the settings to be changed
     */
    setSettings: function (settings) {
        Webgram.Utils.update(this.settings, settings);
        this.invalidateDrawing();
    },

    /**
     * Generates an incremental sequence of numbers,
     * used for giving default ids to drawing elements that are added to the webgram.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Number} the next unique id in the sequence
     */
    getNextIdSequence: function () {
        return ++this._lastIdSequence;
    },
    
    /**
     * Every webgram instance has one image store that allows an efficient
     * management of images that are painted on the canvas.
     * @see Webgram.DrawingElement#getImageStore
     * @returns {Webgram.ImageStore} the image store of this webgram instance
     */
    getImageStore: function () {
        return this._imageStore;
    },
    
    
    /* drawing elements */
    
    /**
     * Adds a drawing element to the root container of the webgram.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.DrawingElement} drawingElement the drawing element to add
     * @param {any} where indicates where to add the element:<ul>
     *  <li>if a {@link Webgram.DrawingElement} is given, the element is added after that element</li>
     *  <li>if a number is given, the element is added at that position</li>
     *  <li>if <tt>null</tt> or <tt>undefined</tt> is given, the element is added at the end</li>
     * </ul>
     */
    addDrawingElement: function (drawingElement, where) {
        this.rootContainer.addDrawingElement(drawingElement, where);
    },

    /**
     * Removes a drawing element from the root container of the webgram.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.DrawingElement} drawingElement the drawing element to remove
     */
    remDrawingElement: function (drawingElement) {
        this.rootContainer.remDrawingElement(drawingElement);
    },

    /**
     * Returns the index (position) of the given drawing element
     * in the list of children of this webgram's root container. <br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.DrawingElement} drawingElement the drawing element of interest
     * @returns {Number} the position of the drawing element if found, <tt>-1</tt> otherwise
     */
    getDrawingElementIndex: function (drawingElement) {
        return this.rootContainer.getDrawingElementIndex(drawingElement);
    },

    /**
     * Returns a list of all the children.
     * <em>(should not be overridden)</em>
     * @returns {Array} a list with all the children
     */
    getDrawingElements: function () {
        return this.rootContainer.getDrawingElements();
    },

    /**
     * Returns the drawing element with the given id.
     * <em>(should not be overridden)</em>
     * @returns {Webgram.DrawingElement} the drawing element with
     * the given id or <tt>null</tt> if no such element exists.
     */
    getDrawingElementById: function (id) {
        var drawingElements = this.rootContainer.getDrawingElements();
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            if (drawingElement.getId() === id) {
                return drawingElement;
            }
        }
        
        return null;
    },

    /**
     * Changes the position of a drawing element in the list of children of the webgram's root container.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.DrawingElement} drawingElement the drawing element to reposition
     * @param {Number} index the new position for the drawing element
     */
    setDrawingElementIndex: function (drawingElement, index) {
        this.rootContainer.setDrawingElementIndex(drawingElement, index);
    },
    
    /**
     * Returns a list with the selected drawing elements,
     * as indicated by the active {@link Webgram.DrawingControl}.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Array} a list with the selected drawing elements
     */
    getSelectedDrawingElements: function () {
        var drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null) {
            return drawingControl.getSelectedDrawingElements();
        }
        else {
            return [];
        }
    },
    
    /**
     * Changes the currently selected drawing elements.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Array} drawingElements the list of drawing elements to be selected
     */
    setSelectedDrawingElements: function (drawingElements) {
        var drawingControl = this.getActiveDrawingControl();
        if (drawingControl != null) {
            return drawingControl.setSelectedDrawingElements(drawingElements);
        }
    },
    
    
    /* drawing controls */
    
    /**
     * Returns the active drawing control. To activate a drawing control,
     * use {@link Webgram.DrawingControl#activate}.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.DrawingControl} the active drawing control,
     * or <tt>null</tt> if no drawing control is currently active
     */
    getActiveDrawingControl: function () {
        return this.rootContainer.getActiveDrawingControl();
    },
    
    
    /* actions */
    
    /**
     * This action copies the current selection of drawing elements into the clipboard.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doCopyAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doCopyAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action pastes the contents of the clipboard onto the root container.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doPasteAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
            
        var result = drawingControl.doPasteAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action duplicates the current selection of drawing elements on the root container.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doDuplicateAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
            
        var result = drawingControl.doDuplicateAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action deletes the current selection of drawing elements from the root container.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doDeleteAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doDeleteAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action undoes the last operation performed on a drawing element.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doUndoAction: function () {
        if (this.getSetting('maxUndoLevels') > 0) { /* undo enabled */
            if (this._undoPosition > 0) {
                this._actionEvent = true;
                
                /* temporarily disable the creation of undo check points
                 * during the undo procedure */
                this.disableUndoCheckPoints();
                
                var checkPoint = this._undoCheckPoints[--this._undoPosition];
                var drawingElements = [];
                
                switch (checkPoint.operation) {
                    case 'add':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            var parent = info.drawingElement.getParent();
                            
                            parent.remDrawingElement(info.drawingElement);
                            info.parent = parent; /* remember the parent for a future redo action */
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                       
                    case 'remove':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            
                            info.parent.addDrawingElement(info.drawingElement, info.index);
                            info.drawingElement.fromJson(info.json);
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                    
                    case 'index-change':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            var parent = info.drawingElement.getParent();
                            var index = parent.getDrawingElementIndex(info.drawingElement);
                            
                            parent.setDrawingElementIndex(info.drawingElement, info.index);
                            info.index = index; /* remember the index for a future redo action */
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                    
                    case 'change':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            var json = info.drawingElement.toJson(true);
                            
                            info.drawingElement.fromJson(info.json);
                            info.json = json; /* remember the json for a future redo action */
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                }
                
                this.finishChangeEvents();
                
                this.enableUndoCheckPoints();
                
                this.onUndoAction.trigger(drawingElements, checkPoint.operation);
                
                this._actionEvent = false;
                
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * This action redoes the last undone operation.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doRedoAction: function () {
        if (this.getSetting('maxUndoLevels') > 0) { /* undo enabled */
            if (this._undoPosition < this._undoCheckPoints.length) {
                this._actionEvent = true;
                
                /* temporarily disable the creation of undo check points
                 * during the undo procedure */
                this.disableUndoCheckPoints();
                
                var checkPoint = this._undoCheckPoints[this._undoPosition++];
                var drawingElements = [];
                
                switch (checkPoint.operation) {
                    case 'add':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            
                            info.parent.addDrawingElement(info.drawingElement, info.index);
                            info.drawingElement.fromJson(info.json);
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                       
                    case 'remove':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            
                            info.parent.remDrawingElement(info.drawingElement);
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                    
                    case 'index-change':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            var parent = info.drawingElement.getParent();
                            var index = parent.getDrawingElementIndex(info.drawingElement);
                            
                            parent.setDrawingElementIndex(info.drawingElement, info.index);
                            info.index = index; /* remember the index for a future undo action */
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                    
                    case 'change':
                        for (var i = 0; i < checkPoint.elementInfoList.length; i++) {
                            var info = checkPoint.elementInfoList[i];
                            var json = info.drawingElement.toJson(true);
                            
                            info.drawingElement.fromJson(info.json);
                            info.json = json; /* remember the json for a future undo action */
                            drawingElements.push(info.drawingElement);
                        }
                        
                        break;
                }
                
                this.finishChangeEvents();
                
                this.enableUndoCheckPoints();
                
                this.onRedoAction.trigger(drawingElements, checkPoint.operation);
                
                this._actionEvent = false;
                
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * This action moves the current selection of drawing elements on the root container.
     * The move distance is determined by the <tt>snapGrid</tt> global setting if the <tt>fine</tt>
     * argument is <tt>true</tt>, and by the <tt>mainGrid</tt> global setting otherwise.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @param {String} direction a string indicating the direction:
     *  <tt>'top'</tt>, <tt>'right'</tt>, <tt>'bottom'</tt> or <tt>'left'</tt>
     * @param {Boolean} fine pass <tt>true</tt> to perform a fine moving,
     *  or <tt>false</tt><tt>undefined</tt> to perform a coarse moving
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doMoveAction: function (direction, fine) {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doMoveAction(direction, fine);
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action brings the current selection of drawing elements to front with one position.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doBringToFrontAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doBringToFrontAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action sends the current selection of drawing elements to back with one position.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doSendToBackAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doSendToBackAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action applies a horizontal flipping on the current selection of drawing elements.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doFlipHorizontallyAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doFlipHorizontallyAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action applies a vertical flipping on the current selection of drawing elements.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doFlipVerticallyAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doFlipVerticallyAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action increases the zoom level if the maximum zoom level
     * hasn't been reached yet.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomInAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doZoomInAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action decreases the zoom level if the minimum zoom level
     * hasn't been reached yet.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomOutAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doZoomOutAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action sets the zoom level to 1:1.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomOneAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doZoomOneAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action sets the maximal zoom level at which all the drawing elements
     * added to the webgram are still visible.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doZoomFitAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doZoomFitAction();
        
        this._actionEvent = false;

        return result;
    },
    
    /**
     * This action sets the current center of the webgram to the origin.
     * This action is available only when a {@link Webgram.DrawingControls.SelectDrawingControl} is active.
     * @returns {Boolean} <tt>true</tt> if the action succeeded, <tt>false</tt> otherwise
     */
    doCenterOriginAction: function () {
        var drawingControl = this.getActiveDrawingControl();
        
        /* this action only works on a select drawing control */
        if (!(drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl)) {
            return false;
        }
        
        this._actionEvent = true;
        
        var result = drawingControl.doCenterOriginAction();
        
        this._actionEvent = false;

        return result;
    },
    
    
    /* size, visible area & zoom */
    
    /**
     * Returns the current zoom factor of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the current zoom factor
     */
    getZoomFactor: function () {
        return this.getSetting('zoomFactors')[this.rootContainer._zoomLevel];
    },
    
    /**
     * Returns the current zoom level of the root container.
     * The zoom <em>level</em> is different from the <em>zoom</em> factor in that
     * the zoom level is an integer number representing an index in a list
     * of predefined zoom factors, while the zoom factor is effectively the
     * ratio at which the scaling is being done.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the current zoom level
     */
    getZoomLevel: function () {
        return this.rootContainer._zoomLevel;
    },
    
    /**
     * Sets the zoom level of the root container. 
     * The list of the available zoom levels is defined through the <tt>zoomLevels</tt> global setting.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} zoomLevel the zoom level to set
     * @param {Webgram.Geometry.Point} point the mouse point with coordinates
     *  relative to the window, not to webgram
     */
    setZoomLevel: function (zoomLevel, point) {
        if (!point) {
            point = new Webgram.Geometry.Point(this.getWidth() / 2, this.getHeight() / 2);
        }
        
        this.rootContainer.setZoomLevel(zoomLevel, point);
    },
    
    /**
     * Returns the current visible center of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Point} the visible center
     */
    getVisibleCenter: function () {
        return this.rootContainer.getVisibleCenter();
    },
    
    /**
     * Recenters the root container without affecting the zoom.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} center the new visible center
     */
    setVisibleCenter: function (center) {
        this.rootContainer.setVisibleCenter(center);
    },
    
    /**
     * Determines the visible portion of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Webgram.Geometry.Rectangle} the currently visible area
     */
    getVisibleArea: function () {
        var topLeft = new Webgram.Geometry.Point(0, 0);
        var bottomRight = new Webgram.Geometry.Point(this.getWidth() - 1, this.getHeight() - 1);
        
        topLeft = this.rootContainer.transformZoomOffsetInverse(topLeft);
        bottomRight = this.rootContainer.transformZoomOffsetInverse(bottomRight);
        
        return new Webgram.Geometry.Rectangle(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
    },
    
    /**
     * Changes the visible area according to the two <tt>topLeft</tt> and <tt>bottomRight</tt> points.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} topLeft the top-left corner of the desired visible area
     * @param {Webgram.Geometry.Point} bottomRight the bottom-right corner of the desired visible area
     */
    setVisibleArea: function (topLeft, bottomRight) {
        var width = this.rootContainer.getWidth();
        var height = this.rootContainer.getHeight();
        
        var zoomWidth = width / (bottomRight.x - topLeft.x + 1);
        var zoomHeight = height / (bottomRight.y - topLeft.y + 1);
        var zoomFactor = Math.min(zoomWidth, zoomHeight);
        var minZoomDif = Infinity;
        var closestZoomLevel = null;
        for (var i = 0; i < this.settings.zoomFactors.length; i++) {
            var zf = this.settings.zoomFactors[i];
            var dif = Math.abs(zoomFactor - zf);
            if (dif < minZoomDif) {
                minZoomDif = dif;
                closestZoomLevel = i;
            }
        }
        
        var centerX = (topLeft.x + bottomRight.x) / 2;
        var centerY = (topLeft.y + bottomRight.y) / 2;
        
        this.rootContainer.setZoomLevel(closestZoomLevel);
        this.rootContainer.setVisibleCenter(new Webgram.Geometry.Point(centerX, centerY));
        
        this.invalidateDrawing();
        this.invalidateDrawingMini();
    },
    
    /**
     * Pans and zooms to such values that the given list of
     * drawing elements fits completely into the visible area. <br><br>
     * <em>(should not be overridden)</em>
     * @param {Array} drawingElements the list of elements;
     *  set to <tt>null</tt> to make all the elements fit into the
     *  visible area.
     */
    setVisibleDrawingElements: function (drawingElements) {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        
        if (drawingElements == null) {
            drawingElements = this.rootContainer.getDrawingElements();
        }
        
        if (drawingElements.length === 0) {
            return; /* nothing to do */
        }
        
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            if (drawingElement._parent !== this.rootContainer) {
                continue;
            }
            
            var boundingRectangle = drawingElement.getBoundingRectangle();
            
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
        }
        
        var width = maxX - minX + 1;
        var height = maxY - minY + 1;
        
        minX -= 0.1 * width;
        minY -= 0.1 * height;
        maxX += 0.1 * width;
        maxY += 0.1 * height;
        
        this.setVisibleArea(new Webgram.Geometry.Point(minX, minY), new Webgram.Geometry.Point(maxX, maxY));
    },
    
    /**
     * Returns the visible width of the root container.
     * This is normally the width of the <em>HTML Canvas</em> element.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the width of the root container
     */
    getWidth: function () {
        return this.rootContainer.getWidth();
    },
    
    /**
     * Returns the visible height of the root container.
     * This is normally the height of the <em>HTML Canvas</em> element.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Number} the height of the root container
     */
    getHeight: function () {
        return this.rootContainer.getHeight();
    },
    
    /**
     * Changes the width of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} width the new width of the root container
     */
    setWidth: function (width) {
        this.rootContainer.setWidth(width);
        this.invalidateDrawing();
        this.invalidateDrawingMini();
    },
    
    /**
     * Changes the height of the root container.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} height the new height of the root container
     */
    setHeight: function (height) {
        this.rootContainer.setHeight(height);
        this.invalidateDrawing();
        this.invalidateDrawingMini();
    },
    
    
    /* invalidate/draw */
    
    /**
     * This tells webgram that something about one of the drawing elements has changed
     * and that a redraw should be issued as soon as possible.<br><br>
     * <em>(should not be overridden)</em>
     */
    invalidateDrawing: function () {
        this._needsRedraw = true;
    },
    
    /**
     * This tells webgram that something about one of the drawing elements has changed
     * and that a redraw of the mini webgram should be issued as soon as possible.<br><br>
     * <em>(should not be overridden)</em>
     * @see Webgram.MiniWebgram
     */
    invalidateDrawingMini: function () {
        this._miniNeedsRedraw = true;
    },
    
    /**
     * Makes sure all the elements together with their control points
     * are up-to-date and calls their respective drawing routines.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Boolean} force set to <tt>true</tt> if you want to force a redraw
     *  even if it is not necessary (i.e. no calls to <tt>invalidate</tt> have been made since the last redraw).
     */
    redraw: function (force) {
        if (this._needsRedraw || force) {
            this._needsRedraw = false;
            this.rootContainer.draw();
            this.onDraw.trigger();
        }

        if (this._miniNeedsRedraw || force) {
            this._miniNeedsRedraw = false;
            this._updateMini();
        }
    },
    
    /**
     * Associates this webgram with a mini webgram.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.MiniWebgram} miniWebgram the mini webgram to associate with this webgram
     */
    setMiniWebgram: function (miniWebgram) {
        this._miniWebgram = miniWebgram;
        miniWebgram.bigWebgram = this;
        miniWebgram.canvas._fonts = this.getSetting('fonts');
        miniWebgram._initDrawingElements();
        this._updateMini();
    },
    
    /**
     * Registers the various handler functions for the JavaScript events.
     * You must explicitly call this method after creating a webgram instance
     * if you want it to be interactive (i.e. to respond to user mouse/keyboard events).<br><br>
     * <em>(should not be overridden)</em>
     */
    attachHandlers: function () {
        var webgram = this;
        var htmlElement = this.htmlElement;
        var html = document.getElementsByTagName('html')[0];
        
        htmlElement.tabIndex = 0; /* makes htmlElement focusable */
        
        htmlElement.oncontextmenu = function () {
            /* disable context menu on htmlElement;
             * we use right click for panning */
            return false;
        };
        
        var borderWidth = this._border;
        
        function onClick(e) {
            e.preventDefault();
            
            return false;
        }
        
        function onMouseDown(e) {
            var offset = webgram._computeAbsCoords(htmlElement);
            
            var point = new Webgram.Geometry.Point(
                    e.pageX - offset.left - borderWidth,
                    e.pageY - offset.top - borderWidth);
            
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            this.focus();
            
            /* install temporary HTML mouse event handlers */
            webgram._addEventListener(html, 'mousemove', onMouseMove);
            webgram._addEventListener(html, 'mouseup', onMouseUp);
            
            webgram._mouseEvent = true;
            var result = webgram.handleMouseDown(point, e.which, modifiers);
            webgram._mouseEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onMouseUp(e) {
            var offset = webgram._computeAbsCoords(htmlElement);
            
            var point = new Webgram.Geometry.Point(
                    e.pageX - offset.left - borderWidth,
                    e.pageY - offset.top - borderWidth);
            
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            /* remove the temporary HTML mouse event handlers */
            webgram._removeEventListener(html, 'mousemove', onMouseMove);
            webgram._removeEventListener(html, 'mouseup', onMouseUp);
            
            webgram._mouseEvent = true;
            var result = webgram.handleMouseUp(point, e.which, modifiers);
            webgram._mouseEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onMouseMove(e) {
            var offset = webgram._computeAbsCoords(htmlElement);
            
            var point = new Webgram.Geometry.Point(
                    e.pageX - offset.left - borderWidth,
                    e.pageY - offset.top - borderWidth);
            
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            webgram._mouseEvent = true;
            var result = webgram.handleMouseMove(point, modifiers);
            webgram._mouseEvent = false;
            if (result) {
                if (typeof result === 'string') {
                    htmlElement.style.cursor = result;
                }

                e.preventDefault();
                    
                return false;
            }
            else {
                htmlElement.style.cursor = 'default';
            }
        }
        
        function onMouseOver(e) {
            var offset = webgram._computeAbsCoords(htmlElement);
            
            var point = new Webgram.Geometry.Point(
                    e.pageX - offset.left - borderWidth,
                    e.pageY - offset.top - borderWidth);
            
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            webgram._mouseEvent = true;
            var result = webgram.onMouseEnter.trigger(point, modifiers);
            webgram._mouseEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onMouseOut(e) {
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            webgram._mouseEvent = true;
            var result = webgram.onMouseLeave.trigger(modifiers);
            webgram._mouseEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onMouseWheel(e) {
            htmlElement.focus();
            
            var wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40;
            
            var offset = webgram._computeAbsCoords(htmlElement);
            
            var point = new Webgram.Geometry.Point(
                    e.pageX - offset.left - borderWidth,
                    e.pageY - offset.top - borderWidth);
            
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            webgram._mouseEvent = true;
            var result = webgram.handleMouseScroll(point, wheelData > 0 ? true: false, modifiers);
            webgram._mouseEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onKeyPress(e) {
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            webgram._keyboardEvent = true;
            var result = webgram.handleKeyPress(e.which, modifiers);
            webgram._keyboardEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onKeyDown(e) {
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey};
            
            webgram._keyboardEvent = true;
            var result = webgram.handleKeyDown(e.which, modifiers);
            webgram._keyboardEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onKeyUp(e) {
            var caps = (e.which >= 97 && e.which <= 122 && e.shiftKey) || (e.which >= 65 && e.which <= 90 && !e.shiftKey);
            var modifiers = {'alt': e.altKey, 'ctrl': e.ctrlKey, 'shift': e.shiftKey, 'caps': caps};
            
            webgram._keyboardEvent = true;
            var result = webgram.handleKeyUp(e.which, modifiers);
            webgram._keyboardEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onFocus(e) {
            webgram._focusEvent = true;
            var result = webgram.handleFocus();
            webgram._focusEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        function onBlur(e) {
            webgram._focusEvent = true;
            var result = webgram.handleBlur();
            webgram._focusEvent = false;
            if (result) {
                e.preventDefault();
                
                return false;
            };
        }
        
        this._addEventListener(htmlElement, 'click', onClick);
        this._addEventListener(htmlElement, 'mousedown', onMouseDown);
        this._addEventListener(htmlElement, 'mouseup', onMouseUp);
        this._addEventListener(htmlElement, 'mousemove', onMouseMove);
        this._addEventListener(htmlElement, 'mouseover', onMouseOver);
        this._addEventListener(htmlElement, 'mouseout', onMouseOut);
        this._addEventListener(htmlElement, 'mousewheel', onMouseWheel);
        this._addEventListener(htmlElement, 'DOMMouseScroll', onMouseWheel);
        this._addEventListener(htmlElement, 'keypress', onKeyPress);
        this._addEventListener(htmlElement, 'keydown', onKeyDown);
        this._addEventListener(htmlElement, 'keyup', onKeyUp);
        this._addEventListener(htmlElement, 'focus', onFocus);
        this._addEventListener(htmlElement, 'blur', onBlur);
        
        htmlElement.onmousedown = function() {return false;}; /* prevent selecting around elements with the mouse */

        /* focus the canvas element */
        this.htmlElement.focus();
    },
    
    
    /* clipboard */
    
    /**
     * Returns the current content of the webgram clipboard.
     * This clipboard is internal to the webgram and has nothing
     * to do with the operating system's clipboard.<br><br>
     * <em>(could be overridden)</em>
     * @returns {Object} an object with:<ul>
     *  <li><tt>type</tt> - a string indicating the type of the clipboard content</li>
     *  <li><tt>content</tt> - the content clipboard content</li>
     * </ul> 
     */
    getClipboard: function () {
        return {
            type: this._clipboard.type,
            content: this._clipboard.content
        };
    },
    
    /**
     * Sets the content of the webgram's clipboard.
     * This clipboard has nothing to do with the
     * operating system's clipboard.<br><br>
     * <em>(could be overridden)</em>
     * @param {String} type a string indicating the type of the content
     * @param {any} content the content to be added to the clipboard
     */
    setClipboard: function (type, content) {
        this._clipboard = {
            type: type,
            content: content
        };
        
        this.onClipboardChange.trigger(this._clipboard);
    },
    
    /**
     * Clears the webgram's clipboard, leaving it empty.<br><br>
     * <em>(could be overridden)</em>
     */
    clearClipboard: function () {
        this._clipboard = {
            type: null,
            content: null
        };
        
        this.onClipboardChange.trigger(this._clipboard);
    },
    
    /* undo mechanism */
    
    /**
     * Adds an <em>undo check point</em> by saving the state of a list of
     * drawing elements just before an operation is applied to it.
     * @param {Array} drawingElements the elements that will be modified
     * @param {String} operation the operation that will be applied to the element
     * (<tt>add</tt>, <tt>remove</tt>, <tt>index-change</tt> or <tt>change</tt>)
     */
    saveUndoCheckPoint: function (drawingElements, operation) {
        /* don't add a check point if the mechanism is temporarily disabled */
        if (this._undoCheckPointsDisabled) {
            return;
        }
        
        /* gather the undo check point information */
        var infoList = [];
        for (var i = 0; i < drawingElements.length; i++) {
            var drawingElement = drawingElements[i];
            var id = drawingElement.getId();
            
            /* don't add a check point for special drawing elements */
            if (id != null && id.indexOf(':') === 0) {
                continue;
            }
            
            var parent = drawingElement.getParent();
            
            infoList.push({
                'drawingElement': drawingElement,
                'json': drawingElement.toJson(true),
                'index': parent ? parent.getDrawingElementIndex(drawingElement) : -1,
                'parent': parent
            });
        }
        
        if (infoList.length === 0) {
            return;
        }
        
        /* we lose all the check points that are ahead of the current position */
        if (this._undoPosition < this._undoCheckPoints.length) {
            this._undoCheckPoints.splice(this._undoPosition, this._undoCheckPoints.length);
        }
        
        /* don't allow more than maxUndoLevels check points */
        while (this._undoCheckPoints.length >= this.getSetting('maxUndoLevels')) {
            this._undoCheckPoints.shift();
            this._undoPosition--;
        }
        
        this._undoCheckPoints.push({
            'elementInfoList': infoList,
            'operation': operation
        });
        
        this._undoPosition++;
    },
    
    /**
     * Use this method to reenable the 
     * creation of <em>undo check points</em>.
     * @see {Webgram#disableUndoCheckPoints}
     */
    enableUndoCheckPoints: function () {
        this._undoCheckPointsDisabled--;
    },
    
    /**
     * Use this method if you want to temporarily disable the
     * creation of <em>undo check points</em>.<br>
     * If you wish to completely disable the undo mechanism,
     * set the <tt>maxUndoLevels</tt> setting to <tt>0</tt>.
     * @see {Webgram#enableUndoCheckPoints}
     */
    disableUndoCheckPoints: function () {
        this._undoCheckPointsDisabled++;
    },
    
    /**
     * Returns the current position inside the undo stack.
     * If this position is <tt>0</tt>, then the <em>undo</em> action
     * is not available. If this position equals to the
     * number of undo levels returned by {@link Webgram#getUndoCount},
     * then the <em>redo</em> action is not available.
     * @returns {Number}
     */
    getUndoPosition: function () {
        return this._undoPosition;
    },
    
    /**
     * Returns the current number of undo levels available.
     * @returns {Number}
     */
    getUndoCount: function () {
        return this._undoCheckPoints.length;
    },
    
    /**
     * Resets the undo mechanism by clearing all the
     * undo check points and setting the current undo position
     * to <tt>0</tt>.
     */
    resetUndo: function () {
        this._undoPosition = 0;
        this._undoCheckPoints = [];
    },
    
    /**
     * Removes any undo check point that references
     * a given drawing element. This is particularly useful
     * when removing an element from the webgram using external methods.
     * @param {Webgram.DrawingElement} drawingElement the referenced drawing element
     */
    purgeUndoCheckPoints: function (drawingElement) {
        for (var i = 0; i < this._undoCheckPoints.length; i++) {
            var checkPoint = this._undoCheckPoints[i];
            
            var checkPointByeBye = Webgram.Utils.visit(checkPoint, function (path, parent, type, value) {
                if (value === drawingElement) {
                    return true;
                }
                
                if (value instanceof Webgram.DrawingElement) {
                    return false; /* never visit a drawing element */
                }
            });
            
            if (checkPointByeBye) {
                this._undoCheckPoints.splice(i, 1);
                i--;
            }
        }
    },
    

    /* JavaScript events & handlers */
    
    /**
     * Determines whether the {@link Webgram#htmlElement} is currently focused.<br><br>
     * <em>(should not be overridden)</em>
     * @returns {Boolean} <tt>true</tt> if the webgram's element is focused, <tt>false</tt> otherwise
     */
    hasFocus: function () {
        return this._hasFocus;
    },
    
    /**
     * Tells if an event triggered by the user is being processed.
     * Such events include keyboard, mouse and focus events.
     * This method can be used to decide if the current code path
     * is due to the user's interaction or due to another (external)
     * webgram function call.
     * @returns {Boolean}
     */
    userInteraction: function () {
        return this._keyboardEvent || this._mouseEvent || this._focusEvent || this._actionEvent;
    },
    
    /**
     * Handles the <em>key press</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {String} key the character corresponding to the key that was pressed
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyPress: function (key, modifiers) {
        var result = 
                this.onKeyPress.trigger(key, modifiers) ||
                this.rootContainer.handleKeyPress(key, modifiers);
        
        return result;
    },
    
    /**
     * Handles the <em>key down</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} key the code corresponding to the key that was pressed
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyDown: function (key, modifiers) {
        var result = 
                this.onKeyDown.trigger(key, modifiers) ||
                this.rootContainer.handleKeyDown(key, modifiers);
        
        return result;
    },
    
    /**
     * Handles the <em>key up</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Number} key the code corresponding to the key that was released
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleKeyUp: function (key, modifiers) {
        var result = 
                this.onKeyUp.trigger(key, modifiers) ||
                this.rootContainer.handleKeyUp(key, modifiers);
        
        this.finishChangeEvents();
        
        return result;
    },
    
    /**
     * Handles the <em>mouse down</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse button was pressed
     * @param {Number} button the mouse button that was pressed (<tt>1</tt> - left, <tt>2</tt> - middle, <tt>3</tt> - right)
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseDown: function (point, button, modifiers) {
        var timestamp = new Date().getTime();
        var threshold = this.getSetting('doubleClickThreshold');
        modifiers.doubleClick = this._lastClickTimestamp && (timestamp - this._lastClickTimestamp < threshold);
        this._lastClickTimestamp = timestamp;
        
        var result = 
                this.onMouseDown.trigger(point, button, modifiers) ||
                this.rootContainer.handleMouseDown(point, button, modifiers);
        
        return result;
    },
    
    /**
     * Handles the <em>mouse up</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse button was released
     * @param {Number} button the mouse button that was released (<tt>1</tt> - left, <tt>2</tt> - middle, <tt>3</tt> - right)
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseUp: function (point, button, modifiers) {
        var result = 
                this.onMouseUp.trigger(point, button, modifiers) ||
                this.rootContainer.handleMouseUp(point, button, modifiers);
        
        this.finishChangeEvents();
        
        return result;
    },
    
    /**
     * Handles the <em>mouse move</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse was moved
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseMove: function (point, modifiers) {
        var result =
                this.onMouseMove.trigger(point, modifiers) || 
                this.rootContainer.handleMouseMove(point, modifiers);
        
        return result;
    },
    
    /**
     * Handles the <em>mouse wheel</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     * @param {Webgram.Geometry.Point} point the point where the mouse wheel was turned
     * @param {Boolean} up <tt>true</tt> if the mouse wheel was turned up, <tt>false</tt> otherwise
     * @param {Object} modifiers the modifiers (<tt>alt</tt>, <tt>ctrl</tt> and <tt>shift</tt>)
     */
    handleMouseScroll: function (point, up, modifiers) {
        var result =
                this.onMouseScroll.trigger(point, up, modifiers) ||
                this.rootContainer.handleMouseScroll(point, up, modifiers);
        
        return result;
    },
    
    /**
     * Handles the <em>focus</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     */
    handleFocus: function () {
        this._hasFocus = true;
        
        return this.onFocus.trigger() || this.rootContainer.handleFocus();
    },
    
    /**
     * Handles the <em>blur</em> JavaScript events.<br><br>
     * <em>(should not be overridden)</em>
     */
    handleBlur: function () {
        this._hasFocus = false;
        var result = 
                this.onBlur.trigger() ||
                this.rootContainer.handleBlur();
        
        this.finishChangeEvents();
        
        return result;
    },
    
    /**
     * Finishes the triggering of all the change events that
     * are made of a <tt>begin*Change</tt>, a <tt>change</tt> and
     * an <tt>end*Change</tt> part.
     * @see {Webgram.DrawingElement#finishShapeEvents}
     * @see {Webgram.DrawingElement#finishRotationAngleEvents}
     * @see {Webgram.DrawingElement#finishStyleEvents}
     */
    finishChangeEvents: function () {
        var drawingElements = this.getDrawingElements();
        
        for (var i = 0; i < drawingElements.length; i++) {
            drawingElements[i].finishChangeEvents();
        }
    },
    
    
    /* private methods */
    
    _getMiniParams: function () {
        var marginFactor = this._miniWebgram.marginFactor;
        var thisMargins = this.rootContainer.getMargins();
        
        var center = thisMargins.getCenter();
        var thisWidth = this.rootContainer.getWidth();
        var thisHeight = this.rootContainer.getHeight();
        var fullWidth = (thisMargins.x2 - thisMargins.x1 + 1) / (1 - marginFactor);
        var fullHeight = (thisMargins.y2 - thisMargins.y1 + 1) / (1 - marginFactor);
        if (fullWidth / thisWidth > fullHeight / thisHeight) {
            fullHeight = thisHeight * fullWidth / thisWidth;
        }
        else {
            fullWidth = thisWidth * fullHeight / thisHeight;
        }
        
        var miniWidth = this._miniWebgram.getWidth();
        var miniHeight = this._miniWebgram.getHeight();
        
        return {
            'center': center,
            'thisWidth': thisWidth,
            'thisHeight': thisHeight,
            'fullWidth': fullWidth,
            'fullHeight': fullHeight,
            'miniWidth': miniWidth,
            'miniHeight': miniHeight
        };
    },
    
    _setRedrawLoop: function () {
        var requestAnimFrame = (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            function (callback, element) {
                window.setTimeout(callback, 1000 / 60);
            }
        );
        
        var webgram = this;
        
        (function redrawLoop() {
            requestAnimFrame(redrawLoop, webgram.htmlElement);
            webgram.redraw();
        })();
    },
    
    _drawMini: function () {
        var miniParams = this._getMiniParams();
        var zoomWidth = miniParams.miniWidth / miniParams.fullWidth;
        var zoomHeight = miniParams.miniHeight / miniParams.fullHeight;
        var zoomFactor = Math.min(zoomWidth, zoomHeight);
        
        var oldCanvas = this.rootContainer.canvas;
        var oldZoom = this.rootContainer._zoomFactor;
        var oldOffsetX = this.rootContainer._offsetX;
        var oldOffsetY = this.rootContainer._offsetY;
        
        this.rootContainer.canvas = this._miniWebgram.rootContainer.canvas;
        this.rootContainer._zoomFactor = zoomFactor;
        this.rootContainer._offsetX = Math.round(miniParams.center.x - miniParams.fullWidth / 2);
        this.rootContainer._offsetY = Math.round(miniParams.center.y - miniParams.fullHeight / 2);

        this.rootContainer._mini = true;
        this.rootContainer.draw();
        delete this.rootContainer._mini;
        
        this.rootContainer.canvas = oldCanvas;
        this.rootContainer._zoomFactor = oldZoom;
        this.rootContainer._offsetX = oldOffsetX;
        this.rootContainer._offsetY = oldOffsetY;
    },
    
    _updateMini: function () {
        if (!this._miniWebgram) {
            return;
        }
        
        var miniParams = this._getMiniParams();
        
        var topLeft = this.rootContainer.transformZoomOffsetInverse(Webgram.Geometry.Point.zero());
        var bottomRight = this.rootContainer.transformZoomOffsetInverse(
                new Webgram.Geometry.Point(miniParams.thisWidth - 1, miniParams.thisHeight - 1));
        
        topLeft.x -= miniParams.center.x;
        topLeft.y -= miniParams.center.y;
        bottomRight.x -= miniParams.center.x;
        bottomRight.y -= miniParams.center.y;
        
        topLeft.x *= miniParams.miniWidth / miniParams.fullWidth;
        topLeft.y *= miniParams.miniHeight / miniParams.fullHeight;
        bottomRight.x *= miniParams.miniWidth / miniParams.fullWidth;
        bottomRight.y *= miniParams.miniHeight / miniParams.fullHeight;
        
        this._miniWebgram.setVisibleArea(topLeft, bottomRight);
        this._miniWebgram.redraw(true);
    },
    
    _updateFromMini: function () {
        if (!this._miniWebgram) {
            return;
        }
        
        var miniParams = this._getMiniParams();
        
        var visibleBounds = this._miniWebgram.visibleArea.getBounds(true);
        var topLeft = visibleBounds.topLeft.clone();
        var bottomRight = visibleBounds.bottomRight.clone();
        
        topLeft.x *=  miniParams.fullWidth / miniParams.miniWidth;
        topLeft.y *= miniParams.fullHeight / miniParams.miniHeight;
        bottomRight.x *= miniParams.fullWidth / miniParams.miniWidth;
        bottomRight.y *= miniParams.fullHeight / miniParams.miniHeight;
        
        topLeft.x += miniParams.center.x;
        topLeft.y += miniParams.center.y;
        bottomRight.x += miniParams.center.x;
        bottomRight.y += miniParams.center.y;
        
        this.setVisibleArea(topLeft, bottomRight);
    },
    
    _computeAbsCoords: function (element) {
        var left = 0, top = 0;
        
        while (element != null) {
            left += element.offsetLeft;
            top += element.offsetTop;
            element = element.offsetParent;
        }
        
        return {'left': left, 'top': top};
    },
    
    _addEventListener: function (element, name, handler) {
        if (element.addEventListener) {
            element.addEventListener(name, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent(name, handler);
        }
    },

    _removeEventListener: function (element, name, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(name, handler, false);
        }
        else if (element.detachEvent) {
            element.detachEvent(name, handler);
        }
    }
};


    /* OOP-related functions */

/**
 * This function provides standard prototypal inheritance.
 * @param {Object} obj the object to inherit from (the future prototype).
 * @returns {Object} the newly created object with the given prototype.
 */
Webgram.Inherit = function (obj) {
    function Inherited() {}
    Inherited.prototype = obj;
    
    var inherited = new Inherited();
    
    return inherited;
};

/**
 * Use this to create a namespace (i.e. an object with the role
 * of encapsulating other classes and more).
 * @param {String} fullName the full name of the namespace to create
 * @param {Object} members a dictionary with members for the new namespace
 * @returns {Object} the newly created namespace
 */
Webgram.Namespace = function (fullName, members) {
    var parts = fullName.split('.');
    var parent = window;
    var fullName = '';
    for (var i = 0; i < parts.length; i++) {
        var name = parts[i];
        if (fullName.length) {
            fullName += '.';
        }
        fullName += name;
        if (parent[name] == null) {
            parent[name] = {};
        }
        
        if (parent[name].__fullName__ === undefined) {
            parent[name].__name__ = name;
            parent[name].__fullName__ = fullName;
            parent[name].toString = function () {
                return this.__fullName__;
            };
        }
        
        parent = parent[name];
    }
    
    /* add the supplied members to the namespace */
    for (var key in members) {
        if (members.hasOwnProperty(key)) {
            parent[key] = members[key];
        }
    }
    
    return parent;
};

/**
 * Use this to create a class.
 * @param {String} fullName the full name of the class to create
 * @param {Function} parentClass the class to inherit from
 * @param {Object} instanceMembers a dictionary with instance members for the new class
 * @param {Object} classMembers a dictionary with class members for the new class
 * @returns {Function} the newly created class
 */
Webgram.Class = function (fullName, parentClass, instanceMembers, classMembers) {
    /* split the fully qualified name and obtain the class and namespace */
    var key = null;
    var parts = fullName.split('.');
    var className = parts[parts.length - 1];
    var namespaceFullName = fullName.substring(0, fullName.length - className.length - 1);
    
    var namespace;
    if (namespaceFullName) {
        namespace = this.Namespace(namespaceFullName);
    }
    else {
        namespace = null;
    }
    
    var childClass = Webgram.Utils.getField(fullName);
    
    if (!childClass) { /* constructor not defined explicitly before */
        childClass = instanceMembers.initialize;
    }
    
    if (!childClass) { /* constructor not supplied at all, adding a default one */
        childClass = function () {
            /* call the parent's constructor, if available */
            if (parentClass) {
                parentClass.apply(this, arguments);
            }
        };
    }

    /* create the new prototype */
    var newPrototype;
    if (parentClass) {
        newPrototype = this.Inherit(parentClass.prototype);

        /* add the supplied instance members to the new prototype */
        for (key in instanceMembers) {
            if (instanceMembers.hasOwnProperty(key)) {
                newPrototype[key] = instanceMembers[key];
            }
        }
    }
    else {
        newPrototype = this.Inherit(instanceMembers ? instanceMembers : {});
    }
    
    /* add the old child's prototype members to the new prototype */
    for (key in childClass.prototype) {
        if (childClass.prototype.hasOwnProperty(key) && !newPrototype.hasOwnProperty(key)) {
            newPrototype[key] = childClass.prototype[key];
        }
    }

    /* set the right constructor function of the new prototype */
    newPrototype.constructor = childClass;

    /* assign the new prototype to the child class */
    childClass.prototype = newPrototype;
    
    /* add the class members of the parent to the child */
    for (key in parentClass) {
        if (parentClass.hasOwnProperty(key) && !childClass.hasOwnProperty(key)) {
            childClass[key] = parentClass[key];
        }
    }
    
    /* add the supplied class members */
    for (key in classMembers) {
        if (classMembers.hasOwnProperty(key)) {
            childClass[key] = classMembers[key];
        }
    }
    
    /* set the child class internal details */
    childClass.__name__ = className;
    childClass.__fullName__ = fullName;
    childClass.__namespace__ = namespace;
    childClass.toString = function () {
        return this.__fullName__;
    };
    if (!childClass.prototype.toString) {
        childClass.prototype.toString = function () {
            return this.constructor.__fullName__ + '()';
        };
    }
    
    return childClass;
};

/**
 * This function provides a pseudo multiple inheritance. It does not create
 * a new class, but rather augments an existing one.
 * The <tt>instanceof</tt> operator will only work properly for the
 * classes inherited with the <tt>Class</tt> function, defined above.
 * @param {String} fullName the full name of the class to augment
 * @param {Function} parentClass the class to take the primary augmenting attributes from
 * @param {Object} instanceMembers a dictionary with instance members to add to the class
 * @param {Object} classMembers a dictionary with class members to add to the class
 * @returns {Function} the augmented class
 */
Webgram.Augment = function (fullName, parentClass, instanceMembers, classMembers) {
    var key = null;
    var childClass = Webgram.Utils.getField(fullName);
    if (!childClass) {
        return;
    }
    
    /* add the instance members of the parent to the child */
    for (key in parentClass.prototype) {
        if (!childClass.prototype.hasOwnProperty(key)) {
            childClass.prototype[key] = parentClass.prototype[key];
        }
    }
    
    /* add the additional instance members to the child */
    for (key in instanceMembers) {
        if (!instanceMembers.hasOwnProperty(key)) {
            childClass.prototype[key] = instanceMembers[key];
        }
    }
    
    /* add the class members of the parent to the child */
    for (key in parentClass) {
        if (parentClass.hasOwnProperty(key) && !childClass.hasOwnProperty(key)) {
            childClass[key] = parentClass[key];
        }
    }

    /* add the supplied class members the child */
    for (key in classMembers) {
        if (classMembers.hasOwnProperty(key)) {
            childClass[key] = classMembers[key];
        }
    }
    
    return childClass;
};


Webgram.Namespace('Webgram');


    /* some utilities that must be available directly from this script */

/**
 * @namespace Various utilities.
 */
Webgram.Utils = Webgram.Namespace('Webgram.Utils', {
    /** @lends Webgram.Utils */
    
    /* javascript objects manipulation utilities */
    
    /**
     * Evaluates the JavaScript path expression given in <tt>fieldPath</tt>
     * and returns the resulted value.
     * @param {String} fieldPath the path expression to evaluate
     * @param {any} def the value to return in case the path does not evaluate to an existing value
     * @param {Object} obj if specified, will be used as the root object instead of <tt>window</tt>
     */
    getField: function (fieldPath, def, obj) {
        if (typeof fieldPath === 'string') {
            fieldPath = fieldPath.split('.');
        }

        if (obj == null) {
            obj = window;
        }
        for (var i = 0; i < fieldPath.length; i++) {
            var key = fieldPath[i];
            
            if (obj[key] === undefined) {
                return def;
            }
            else if (obj[key] === null) {
                return null;
            }
            
            obj = obj[key];
        }
        
        return obj;
    },

    /**
     * Evaluates the JavaScript path expression given in <tt>fieldPath</tt> and modifies the value
     * that resides at the result of the evaluation.
     * @param {String} fieldPath the path expression to evaluate
     * @param {any} value the new value to set
     * @param {Object} obj if specified, will be used as the root object instead of <tt>window</tt>
     */
    setField: function (fieldPath, value, obj) {
        if (typeof fieldPath === 'string') {
            fieldPath = fieldPath.split('.');
        }

        if (obj == null) {
            obj = window;
        }
        for (var i = 0; i < fieldPath.length - 1; i++) {
            var key = fieldPath[i];
            if (obj[key] == null) {
                obj[key] = {};
            }
            
            obj = obj[key];
        }
        
        obj[fieldPath[fieldPath.length - 1]] = value;
    },

    /**
     * A deep equals() operator that will recursively compare
     * any non-primitive objects to validate the equality.
     * @param {Object} obj1 the first object of the comparison
     * @param {Object} obj2 the second object of the comparison
     * @returns {Boolean} <tt>true</tt> if the two objects are deeply equal,
     * <tt>false</tt>othwerwise
     */
    equals: function (obj1, obj2) {
        if (obj1 === obj2) {
            return true;
        }
        
        if (typeof obj1 !== typeof obj2) {
            return false;
        }
        
        if (obj1.equals) {
            return obj1.equals(obj2);
        }
        
        if (obj1 instanceof Array) {
            if (!(obj2 instanceof Array)) {
                return false;
            }
            
            if (obj1.length !== obj2.length) {
                return false;
            }
            
            for (var i = 0; i < obj1.length; i++) {
                if (obj1[i] !== obj2[i]) {
                    return false;
                }
            }
            
            return true;
        }
        else if (obj1 instanceof Object) {
            if (!(obj2 instanceof Object)) {
                return false;
            }
            
            for (var key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    if (!obj2.hasOwnProperty(key)) {
                        return false;
                    }
                    
                    if (obj1[key] !== obj2[key]) {
                        return false;
                    }
                }
            }
            
            for (key in obj2) {
                if (obj2.hasOwnProperty(key)) {
                    if (!obj1.hasOwnProperty(key)) {
                        return false;
                    }
                }
            }
            
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * A deep clone function that will recursively
     * parse any non-primitive objects to deeply duplicate
     * all the values.
     * @param {Object} original the original object to be duplicated
     * @returns {Object} the cloned object
     */
    clone: function (original) {
        if (original === undefined ||
            original === null ||
            typeof original === 'number' || 
            typeof original === 'string' || 
            typeof original === 'boolean') {
            
            return original;
        }
        else if (original instanceof Array) {
            var cloned = [];
            
            for (var i = 0; i < original.length; i++) {
                cloned.push(this.clone(original[i]));
            }
            
            return cloned;
        }
        else if (original instanceof Function) {
            return original;
        }
        else if (original instanceof Object) {
            if (original.clone) {
                return original.clone();
            }
            
            var cloned = {};
            
            for (var key in original) {
                if (original.hasOwnProperty(key)) {
                    cloned[key] = this.clone(original[key]);
                }
            }
            
            return cloned;
        }
        else { /* what other JS type do we have? */
            return original;
        }
    },
    
    /** TODO jsdoc me
     * Recursively updates the values in a destination object
     * with the values present in a source object.
     * @param {Object} dest the object to be updated
     * @param {Object} source the source object
     */
    update: function (dest, source) {
        function updateRec(destParent, source, fieldName) {
            if (source instanceof Array) {
                if (!(destParent[fieldName] instanceof Array)) {
                    destParent[fieldName] = [];
                }
                
                for (var i = 0; i < source.length; i++) {
                    updateRec(destParent[fieldName], source[i], i);
                }
            }
            else if (source instanceof Object) {
                if (!(destParent[fieldName] instanceof Object)) {
                    destParent[fieldName] = {};
                }
                
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        updateRec(destParent[fieldName], source[key], key);
                    }
                }
            }
            else { /* a scalar type */
                destParent[fieldName] = source;
            }
        }    
        
        updateRec({'dest': dest}, source, 'dest');
    },
        
    /**
     * Visits the given value by recursively parsing the arrays
     * and object keys.
     * @param {Object} value the value to visit
     * @param {Object} callback a function to be called
     *  for each visited value; the function will be passed
     *  the field path (array of index/name), the parent object, the type and the value;
     *  if the callback function returns <tt>false</tt>, the current value's children won't be visited;
     *  otherwise, if the callback function returns anything but <tt>undefined</tt>, the visit stops;
     * @returns {any} the value returned by the last call to <tt>callback</tt>
     */
    visit: function (value, callback) {
        function visitRec(value, fieldPath, parent) {
            var result = undefined;

            if (value === undefined) {
                result = callback(fieldPath, parent, undefined, value);
            }
            else if (value === null) {
                result = callback(fieldPath, parent, null, value);
            }
            else if (typeof value === 'number') {
                result = callback(fieldPath, parent, Number, value);
            }
            else if (typeof value === 'string') {
                result = callback(fieldPath, parent, String, value);
            }
            else if (typeof value === 'boolean') {
                result = callback(fieldPath, parent, Boolean, value);
            }
            else if (value instanceof Array) {
                result = callback(fieldPath, parent, Array, value);
                if (result === undefined) {
                    for (var i = 0; i < value.length && (result === undefined || result === false); i++) {
                        result = visitRec(value[i], fieldPath.concat(i), value);
                    }
                }
            }
            else if (value instanceof Function) {
                result = callback(fieldPath, parent, Function, value);
            }
            else if (value instanceof Object) {
                result = callback(fieldPath, parent, Object, value);
                
                if (result === undefined) {
                    for (var key in value) {
                        if (result !== undefined && result !== false) {
                            break;
                        }
                        
                        if (value.hasOwnProperty(key)) {
                            result = visitRec(value[key], fieldPath.concat(key), value);
                        }
                    }
                }
            }
            else { /* what other JS types do we have? */
            }
            
            return result;
        }    
        
        return visitRec(value, [], undefined);
    },
        
    
    /* dynamic script loading utilities */

    /**
     * Tells if a script file is loaded or not.
     * @param {String} src the source url of the script file
     * @returns {HTMLScriptElement} the script elemement if the script is loaded, <tt>null</tt> otherwise
     */
    scriptLoaded: function (src) {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src === src) {
                return scripts[i];
            }
        }
        
        return null;
    },

    /**
     * Asynchronously loads a script file and optionally calls a supplied function
     * after the script has been loaded.
     * @param {String} the source url of the script file
     * @param {Function} onLoad the function to call after the script has been loaded;
     * the function will be called with the script element as argument
     * @param {Boolean} reload set to <tt>true</tt> to reload the script if it has already been loaded
     * @returns {HTMLScriptElement} the loaded script element
     */
    loadScript: function (src, onLoad, reload) {
        /* check if the script is already loaded */
        var script = this.scriptLoaded(src);
        if (script != null) {
            if (!reload) {
                if (onLoad) {
                    onLoad(script);
                }
                
                return script;
            }
            
            script.parentElement.removeChild(script);
        } 
        
        var script = document.createElement('script');
        var loaded = false;
        script.onload = script.onreadystatechange = function () {
            if ((script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded') || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            if (onLoad) {
                onLoad(script);
            }
            loaded = true;
        };
        script.async = true;
        script.src = src;
        
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(script);
        
        return script;
    },

    /**
     * Sequentially loads a list of scripts, calling a supplied function
     * when the whole loading process completes.
     * @param {Array} srcList the list of scripts to be loaded
     * @param {Function} onLoad a function to call when the loading
     * completes
     * @param {Boolean} sync set to <tt>true</tt> to load the scripts synchronously
     * (i.e. one by one, in the respective order)
     * @param {Boolean} reload set to <tt>true</tt> to reload the scripts that have already been loaded
     */
    loadScripts: function (srcList, onLoad, sync, reload) {
        if (sync) {
            function loadFirst() {
                if (srcList.length) {
                    Webgram.Utils.loadScript(srcList.shift(), loadFirst, reload);
                }
                else {
                    if (onLoad) {
                        onLoad();
                    }
                }
            }
            
            loadFirst();
        }
        else {
            var html = '';
            for (var i = 0; i < srcList.length; i++) {
                html += '<script type="text/javascript" src="' + srcList[i] + '"></script>';
            }
            if (html) {
                document.write(html);
            }
        }
    }
});


/**
 * The path (url) to the main webgram JavaScript file.
 * The value of this field is determined automatically
 * and should not be altered.
 * @type String
 */
Webgram.jsPath = (function () {
    var isWG = new RegExp("(^|(.*?\\/))(" + 'webgram(\.min)?.js' + ")(\\?|$)");
    
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src;
        if (src) {
            var match = src.match(isWG);
            if (match) {
                return match[1];
            }
        }
    }
    
    return '/'; /* defaults to the root, but should never be the case */
})();


Webgram._singleScript = false; /* flag that indicate the way the webgram library is loaded */

Webgram._scriptSrcList = (function () {
    var srcList = [
        'utils.js',
        'geometry.js',
        'styles.js',
        'default-styles.js',
        'event.js',
        'image-store.js',
        'canvas.js',
        'control-point.js',
        'action-menu-item.js',
        'drawing-element.js',
        'drawing-control.js',
        
        'control-points/absolute-control-point.js',
        'control-points/proportional-control-point.js',
        'control-points/gradient-control-points.js',
        'control-points/rotate-control-points.js',
        
        'drawing-elements/simple-element.js',
        'drawing-elements/rectangular-element.js',
        'drawing-elements/container-element.js',
        'drawing-elements/poly-element.js',
        'drawing-elements/root-container.js',
        
        'connectors/connector.js',
        'connectors/socket.js',
        'connectors/end-point.js',
        
        'drawing-controls/select-drawing-control.js',
        'drawing-controls/create-drawing-control.js',
        'drawing-controls/text-drawing-control.js',
        
        'mini-webgram.js',
        'debug.js' /* this script must be the last in the list */
    ];

    for (var i = 0; i < srcList.length; i++) {
        srcList[i] = Webgram.jsPath + srcList[i];
    }

    return srcList;
})();

if (!Webgram._singleScript) {
    Webgram.Utils.loadScripts(Webgram._scriptSrcList);
}
