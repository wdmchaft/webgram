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
 * @class A drawing control that enables interactive text editing on the canvas.
 */
Webgram.DrawingControls.TextDrawingControl = function (rootContainer) {
    Webgram.DrawingControl.call(this, rootContainer);

    /**
     * An event that is triggered when the edited text changes.<br>
     * Handlers receive the following arguments: <tt>(drawingElement, text)</tt>.
     * @type Webgram.Event
     */
    this.onTextChange = new Webgram.Event('text change', this); /* (drawingElement, text) */
    
    this._drawingElement = null;
    this._area = null;
    this._angle = null;
    this._textField = null;
    this._textFieldIsAbsolute = false;
    this._textStyle = null;
    
    this._originalDrawingElementIndex = null;
    this._originalDrawingElementZIndex = null;
    
    this._textInputArea = null;
    this._textInputBackground = null;
    this._position = 0;
    
    this.onDeactivate.bind(function () {
        this._hide();
    });
    
    this.onActivate.bind(function () {
        this._show();
    });
    
    /* call the onChange event of the DE whenever its text changes */
    this.onTextChange.bind(function (drawingElement, text) {
        drawingElement.onChange.trigger();
    });
};

Webgram.DrawingControls.TextDrawingControl.prototype = {
    /**
     * Sets up the environment for editing the text on a drawing element.
     * @param {Webgram.DrawingElement} drawingElement the drawing element on which the text editing will be done
     * @param {String} textField the name of a field of the drawing element to read/write the edited text from/to 
     * @param {Webgram.Geometry.Rectangle} box the text editing area
     * @param {Webgram.Styles.TextStyle} textStyle the text style to use
     * @param {Number} angle the absolute angle at which the text editing will be done
     */
    configure: function (drawingElement, textField, box, textStyle, angle) {
        /* drawing element */
        this._drawingElement = drawingElement;
        
        /* text field */
        this._textField = textField;
        this._textFieldIsAbsolute = (Webgram.Utils.getField(textField, undefined, drawingElement) === undefined);
        
        /* text style */
        this._textStyle = textStyle;

        /* box */
        this._box = box;

        /* angle */
        this._angle = drawingElement.getRotationAngle();
        if (angle != null) {
            this._angle += angle;
        }
    },
    
    /**
     * Ends the text editing process.
     */
    finish: function () {
        var drawingElement = this._drawingElement;
        
        var drawingControl = this.activatePrevious();
        if (drawingControl instanceof Webgram.DrawingControls.SelectDrawingControl) {
            drawingControl.setSelectedDrawingElements([drawingElement]);
        }
    },
    
    getSelectedDrawingElements: function () {
        if (this._drawingElement) {
            return [this._drawingElement];
        }
        else {
            return [];
        }
    },
        
    handleMouseDown: function (point, button, modifiers) {
        if (this._drawingElement == null || this._textInputBackground == null) { /* not configured or not shown */
            return;
        }
        
        if (this._textInputArea.pointInside(point)) {
            point = this._textInputArea.transformInverse(point);
            
            var lineCol = this._getLineCol();
            var i, lines = lineCol.layout.lines;
            for (i = 0; i < lines.length; i++) {
                var line = lines[i];
                var textStyle = this._getTextStyle();
                var rect = new Webgram.Geometry.Rectangle(
                        line.left - textStyle.size,
                        line.top,
                        line.right + textStyle.size,
                        line.bottom);
                
                if (rect.pointInside(point)) {
                    var col = this._colFromXCoord(lineCol, point.x);
                    if (col != null) {
                        lineCol.line = i;
                        lineCol.col = col;
                        
                        this._position = this._positionFromLineCol(lineCol);
                        this.invalidateDrawing();
                        
                        return true;
                    }
                }
            }
        }
    },
    
    handleMouseUp: function (point, button, modifiers) {
        if (this._drawingElement == null || this._textInputBackground == null) { /* not configured or not shown */
            return;
        }
        
        if (!this._textInputArea.pointInside(point)) {
            this.finish();
            
            return true;
        }
    },
    
    handleMouseMove: function (point, modifiers) {
        if (this._drawingElement == null || this._textInputBackground == null) { /* not configured or not shown */
            return;
        }
        
        if (this._textInputArea.pointInside(point)) {
            return 'text';
        }
        else {
            return 'default';
        }
    },
    
    handleKeyPress: function (key, modifiers) {
        if (this._drawingElement == null || this._textInputBackground == null) { /* not configured or not shown */
            return;
        }
        
        if (key < 32 || key > 126) {
            return;
        }
        
        var ch = String.fromCharCode(key);
        
        var text = this._getText();
        text = text.substring(0, this._position) + ch + text.substring(this._position);
        this._setText(text);
        this._position++;
                
        this.invalidateDrawing();
        
        return true;
    },
    
    handleKeyDown: function (key, modifiers) {
        if (this._drawingElement == null || this._textInputBackground == null) { /* not configured or not shown */
            return;
        }
        
        var wholeWord = modifiers.ctrl;
        var lineCol = this._getLineCol();
        var text = lineCol.layout.text;
        
        switch (key) {
            case 8: { /* backspace */
                if (this._position > 0) {
                    if (wholeWord) {
                        do {
                            text = text.substring(0, this._position - 1) + text.substring(this._position);
                            this._position--;
                        } while (this._position > 0 && this._isAlNum(text[this._position - 1]));
                    }
                    else {
                        text = text.substring(0, this._position - 1) + text.substring(this._position);
                        this._position--;
                    }
                    
                    this._setText(text);
                    this.invalidateDrawing();
                    
                    return true;
                }
                
                break;
            }
            
            case 13: { /* enter */
                text = text.substring(0, this._position) + '\n' + text.substring(this._position);
                this._setText(text);
                this._position++;
                
                this.invalidateDrawing();
                
                return true;
            }
            
            case 27: { /* escape */
                this.finish();
                
                return true;
            }
            
            case 35: { /* end */
                if (lineCol.col < lineCol.colCount) {
                    this._position += lineCol.colCount - lineCol.col;
                    
                    this.invalidateDrawing();
                    
                    return true;
                }
                
                break;
            }
            
            case 36: { /* home */
                if (lineCol.col > 0) {
                    this._position -= lineCol.col;
                    
                    this.invalidateDrawing();
                    
                    return true;
                }
                
                break;
            }
            
            case 37: { /* left arrow */
                if (this._position > 0) {
                    if (wholeWord) {
                        do {
                            this._position--;
                        } while (this._position > 0 && this._isAlNum(text[this._position]));
                    }
                    else {
                        this._position--;
                    }
                    
                    this.invalidateDrawing();
                    
                    return true;
                }
                
                break;
            }

            case 39: { /* right arrow */
                if (this._position < text.length) {
                    if (wholeWord) {
                        do {
                            this._position++;
                        } while (this._position < text.length && this._isAlNum(text[this._position]));
                    }
                    else {
                        this._position++;
                    }
                    
                    this.invalidateDrawing();
                    
                    return true;
                }
                
                break;
            }
            
            case 38: { /* up arrow */
                if (lineCol.line > 0) {
                    do {
                        this._position--;
                    } while (this._position > 0 && text[this._position] !== '\n');
                    
                    this.invalidateDrawing();
                    
                    return true;
                }
                
                break;
            }

            case 40: { /* down arrow */
                if (lineCol.line < lineCol.lineCount - 1) {
                    do {
                        this._position++;
                    } while (this._position < text.length && text[this._position - 1] !== '\n');
                    
                    this.invalidateDrawing();
                    
                    return true;
                }
            
                break;
            }
                
            case 46: { /* delete */
                if (this._position < text.length) {
                    if (wholeWord) {
                        do {
                            text = text.substring(0, this._position) + text.substring(this._position + 1);
                        } while (this._isAlNum(text[this._position]));
                        
                    }
                    else {
                        text = text.substring(0, this._position) + text.substring(this._position + 1);
                    }

                    this._setText(text);
                    this.invalidateDrawing();
                    
                    return true;
                }
                
                break;
            }
        }
    },
    
    handleFocus: function () {
        if (this._drawingElement == null || this._textInputBackground == null) { /* not configured or not shown */
            return;
        }
        
        this.invalidateDrawing();
        
        return true;
    },
    
    handleBlur: function () {
        if (this._drawingElement == null || this._textInputBackground == null) { /* not configured or not shown */
            return;
        }
        
        this.invalidateDrawing();
        
        return true;
    },
    
    
    /* private methods */
    
    _show: function () {
        if (this._textInputBackground != null) { /* already shown */
            return;
        }
        
        if (this._drawingElement == null) { /* not configured */
            return;
        }
        
        var parent = this._drawingElement.getParent();
        
        /* save the element`s current position and move it to front */
        this._originalDrawingElementIndex = parent.getDrawingElementIndex(this._drawingElement);
        this._originalDrawingElementZIndex = this._drawingElement.zIndex;
        
        /* text input background */
        this._textInputBackground = new Webgram.DrawingControls.TextDrawingControl._TextInputBackground(this);
        
        /* text input area */
        this._textInputArea = new Webgram.DrawingControls.TextDrawingControl._TextInputArea(this);
        
        parent._addDrawingElement(this._textInputBackground);
        this._drawingElement.zIndex = Infinity;
        parent._setDrawingElementIndex(this._drawingElement, Infinity);
        parent._addDrawingElement(this._textInputArea);
        
        this._position = this._getText().length;
    },
    
    _hide: function () {
        if (this._textInputBackground == null) { /* not shown */
            return;
        }
        
        var parent = this._drawingElement.getParent();

        /* text input background */
        parent._remDrawingElement(this._textInputBackground);
        this._textInputBackground = null;
        
        /* text input area */
        if (this._textInputArea != null) {
            parent._remDrawingElement(this._textInputArea);
            this._textInputArea = null;
        }

        /* restore the element`s position */
        this._drawingElement.zIndex = this._originalDrawingElementZIndex;
        parent._setDrawingElementIndex(this._drawingElement, this._originalDrawingElementIndex);
        this._originalDrawingElementZIndex = null;
        this._originalDrawingElementIndex = null;
    },
    
    _getTextStyle: function () {
        if (this._textStyle != null) {
            return this._textStyle;
        }
        
        var textStyle = this._drawingElement.getTextStyle();
        if (textStyle != null) {
            return textStyle;
        }
        
        return Webgram.Styles.getTextStyle('default');
    },
    
    _getText: function () {
        var text = Webgram.Utils.getField(this._textField, undefined, this._textFieldIsAbsolute ? null : this._drawingElement);
        if (text === undefined) {
            text = '';
        }
        
        return text;
    },
    
    _setText: function (text) {
        Webgram.Utils.setField(this._textField, text, this._textFieldIsAbsolute ? null : this._drawingElement);
        
        this.onTextChange.trigger(this._drawingElement, text);
    },
    
    _getLineCol: function () {
        var text = this._getText();
        var textLayout = this._textInputArea.layoutText(text, null, this._getTextStyle());
        
        var i, colNo = 0, lineNo = 0, lineCount = 0, text = textLayout.text;
        for (i = 0; i < text.length; i++) {
            if (text[i] === '\n') {
                lineCount++;
                if (i < this._position) {
                    colNo = 0;
                    lineNo++;
                }
            }
            else {
                if (i < this._position) {
                    colNo++;
                }
            }
        }
        
        return {
            line: lineNo,
            col: colNo,
            lineCount: lineCount + 1,
            colCount: textLayout.lines[lineNo].text.length,
            layout: textLayout
        };
    },
    
    _colFromXCoord: function (lineCol, x) {
        var lineInfo = lineCol.layout.lines[lineCol.line];
        if (x < lineInfo.left) {
            return 0; /* outside of the text area */
        }
        
        var i, textStyle = this._getTextStyle();
        for (i = 0; i < lineInfo.text.length; i++) {
            if (x < lineInfo.left + this._textInputArea.getTextSize(lineInfo.text.substring(0, i), textStyle).width) {
                return i;
            }
        }
        
        return lineInfo.text.length; /* outside of the text area */
    },
    
    _positionFromLineCol: function (lineCol) {
        var text = lineCol.layout.text;
        var position = 0;
        var line = 0, col = 0;
        
        while (position < text.length && line < lineCol.line) {
            if (text[position] === '\n') {
                line++;
            }
            
            position++;
        }
        
        while (position < text.length && col < lineCol.col) {
            position++;
            col++;
        }
        
        return position;
    },
    
    _isAlNum: function (ch) {
        return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9');
    }
};

Webgram.Class('Webgram.DrawingControls.TextDrawingControl', Webgram.DrawingControl);


/*
 * A special drawing element used to opacify the whole canvas
 * when editing text.
 */
Webgram.DrawingControls.TextDrawingControl._TextInputBackground = function (textDrawingControl) {
    /* at least one point is necessary for the element to be drawn */
    Webgram.DrawingElement.call(this, ':special:text-input-background', [Webgram.Geometry.Point.zero()]);
    
    this.setFillStyle(Webgram.Styles.getFillStyle('text-input-background'));
    this.setStrokeStyle(null);
    
    this.zIndex = Infinity;
    this._textDrawingControl = textDrawingControl;
};

Webgram.DrawingControls.TextDrawingControl._TextInputBackground.prototype = {
    drawNoZoom: function () {
        this.drawRect(this.webgram.getVisibleArea().getShrinked(-1));
        this.paint();
    }
};

Webgram.Class('Webgram.DrawingControls.TextDrawingControl._TextInputBackground', Webgram.DrawingElement);


/*
 * Represents the area used to edit the text.
 */
Webgram.DrawingControls.TextDrawingControl._TextInputArea = function (textDrawingControl) {
    var de = textDrawingControl._drawingElement;
    var topLeft = textDrawingControl._box.getTopLeft();
    var bottomRight = textDrawingControl._box.getBottomRight();
    var center = textDrawingControl._box.getCenter();
    var rotationAngle = de.getRotationAngle();
    
    center = de.transformDirect(center);
    topLeft = de.transformDirect(topLeft).getRotated(-rotationAngle, center);
    bottomRight = de.transformDirect(bottomRight).getRotated(-rotationAngle, center);
    
    var x = topLeft.x;
    var y = topLeft.y;
    var width = bottomRight.x - topLeft.x + 1;
    var height = bottomRight.y - topLeft.y + 1;
    
    Webgram.DrawingElements.RectangularElement.call(this, ':special:text-input-area', x, y, width, height);
    
    this.setStrokeStyle(Webgram.Styles.getStrokeStyle('text-input-area'));
    this.setFillStyle(Webgram.Styles.getFillStyle('text-input-area'));
    
    this.zIndex = Infinity;
    this.setRotationAngle(rotationAngle);
    this._textDrawingControl = textDrawingControl;
};

Webgram.DrawingControls.TextDrawingControl._TextInputArea.prototype = {
    drawNoZoom: function () {
        if (this._textDrawingControl._box != null) {
            this.drawArea();
        }
        
        if (this.webgram.hasFocus()) {
            this.drawCursor();
        }
    },
    
    drawArea: function () {
        var drawingPoly = this.getDrawingPoly();
        var radiusX = 3;
        var radiusY = 3;
        var topLeft = drawingPoly.points[0];
        var bottomRight = drawingPoly.points[2];
        
        var left = topLeft.x - 5;
        var lefti = left + radiusX;
        var top = topLeft.y - 5;
        var topi = top + radiusY;
        var right = bottomRight.x + 5;
        var righti = right - radiusX;
        var bottom = bottomRight.y + 5;
        var bottomi = bottom - radiusY;
        
        this.drawArc(new Webgram.Geometry.Point(lefti, topi), radiusX, radiusY, Math.PI, 3 * Math.PI / 2);
        this.drawLine(new Webgram.Geometry.Point(lefti, top), new Webgram.Geometry.Point(righti, top));
        this.drawArc(new Webgram.Geometry.Point(righti, topi), radiusX, radiusY, 3 * Math.PI / 2, 2 * Math.PI);
        this.drawLine(new Webgram.Geometry.Point(right, topi), new Webgram.Geometry.Point(right, bottomi));
        this.drawArc(new Webgram.Geometry.Point(righti, bottomi), radiusX, radiusY, 0, Math.PI / 2);
        this.drawLine(new Webgram.Geometry.Point(righti, bottom), new Webgram.Geometry.Point(lefti, bottom));
        this.drawArc(new Webgram.Geometry.Point(lefti, bottomi), radiusX, radiusY, Math.PI / 2, Math.PI);
        this.drawLine(new Webgram.Geometry.Point(left, bottomi), new Webgram.Geometry.Point(left, topi));
        
        this.paint();
    },
    
    drawCursor: function () {
        var textStyle = this._textDrawingControl._getTextStyle();
        var lineCol = this._textDrawingControl._getLineCol();
        
        var lineInfo = lineCol.layout.lines[lineCol.line];
        var top = lineInfo.top;
        var bottom = lineInfo.bottom;
        var left = lineInfo.left;
        var right = left + this.getTextSize(lineInfo.text.substring(0, lineCol.col), textStyle).width;
        
        this.drawLine(new Webgram.Geometry.Point(right, top));
        this.drawLine(new Webgram.Geometry.Point(right, bottom));
        
        var strokeStyle = Webgram.Styles.createStrokeStyle({
            colors: textStyle.color,
            lineWidth: 1
        });
        
        this.paint(strokeStyle, null);
    }
};

Webgram.Class('Webgram.DrawingControls.TextDrawingControl._TextInputArea', Webgram.DrawingElements.RectangularElement);

