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
    
    this._textInputArea = null;
    this._position = 0;
    
    this._originalDrawElements = null;
    this._saveCheckPoint = false;
    
    this.onDeactivate.bind(function () {
        this._hide();
        this.rootContainer.webgram.onSelectionChange.trigger([]);
    });
    
    this.onActivate.bind(function () {
        this._show();
        this.rootContainer.webgram.onSelectionChange.trigger([this._drawingElement]);
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
        if (this._drawingElement == null || this._textInputArea == null) { /* not configured or not shown */
            return;
        }
        
        if (this._textInputArea.pointInside(point, true)) {
            point = this._textInputArea.transformInverse(point);
            
            var lineCol = this._getLineCol();
            var i, lines = lineCol.layout;
            for (i = 0; i < lines.length; i++) {
                var line = lines[i];
                var textStyle = this._getTextStyle();
                var rect = new Webgram.Geometry.Rectangle(
                        line.left - textStyle.size,
                        line.top,
                        line.right + textStyle.size,
                        line.bottom);
                
                if (rect.pointInside(point)) {
                    var col = this._colFromXCoord(line, point.x);
                    if (col != null) {
                        lineCol.line = i;
                        lineCol.col = col;
                        
                        this._position = this._positionFromLineCol(lineCol);
                        this.invalidate();
                        
                        return true;
                    }
                }
            }
        }
        else {
            this.finish();
            
            return true;
        }
    },
    
    handleMouseMove: function (point, modifiers) {
        if (this._drawingElement == null || this._textInputArea == null) { /* not configured or not shown */
            return;
        }
        
        if (this._textInputArea.pointInside(point, true)) {
            return 'text';
        }
        else {
            return 'default';
        }
    },
    
    handleKeyPress: function (key, modifiers) {
        if (this._drawingElement == null || this._textInputArea == null) { /* not configured or not shown */
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
                
        this.invalidate();
        
        return true;
    },
    
    handleKeyDown: function (key, modifiers) {
        if (this._drawingElement == null || this._textInputArea == null) { /* not configured or not shown */
            return;
        }
        
        var wholeWord = modifiers.ctrl;
        var lineCol = this._getLineCol();
        var text = lineCol.text;
        
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
                    this.invalidate();
                    
                    return true;
                }
                
                break;
            }
            
            case 13: { /* enter */
                text = text.substring(0, this._position) + '\n' + text.substring(this._position);
                this._setText(text);
                this._position++;
                
                this.invalidate();
                
                return true;
            }
            
            case 27: { /* escape */
                this.finish();
                
                return true;
            }
            
            case 35: { /* end */
                if (lineCol.col < lineCol.colCount) {
                    this._position += lineCol.colCount - lineCol.col;
                    
                    this.invalidate();
                    
                    return true;
                }
                
                break;
            }
            
            case 36: { /* home */
                if (lineCol.col > 0) {
                    this._position -= lineCol.col;
                    
                    this.invalidate();
                    
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
                    
                    this.invalidate();
                    
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
                    
                    this.invalidate();
                    
                    return true;
                }
                
                break;
            }
            
            case 38: { /* up arrow */
                if (lineCol.line > 0) {
                    do {
                        this._position--;
                    } while (this._position > 0 && text[this._position] !== '\n');
                    
                    this.invalidate();
                    
                    return true;
                }
                
                break;
            }

            case 40: { /* down arrow */
                if (lineCol.line < lineCol.lineCount - 1) {
                    do {
                        this._position++;
                    } while (this._position < text.length && text[this._position - 1] !== '\n');
                    
                    this.invalidate();
                    
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
                    this.invalidate();
                    
                    return true;
                }
                
                break;
            }
        }
    },
    
    handleFocus: function () {
        if (this._drawingElement == null || this._textInputArea == null) { /* not configured or not shown */
            return;
        }
        
        this.invalidate();
        
        return true;
    },
    
    handleBlur: function () {
        if (this._drawingElement == null || this._textInputArea == null) { /* not configured or not shown */
            return;
        }
        
        this.invalidate();
        
        return true;
    },
    
    
    /* private methods */
    
    _show: function () {
        if (this._textInputArea != null) { /* already shown */
            return;
        }
        
        if (this._drawingElement == null) { /* not configured */
            return;
        }
        
        this._saveCheckPoint = true;

        var parent = this._drawingElement.getParent();
        var that = this;
        
        /* save the original drawElements method of the root container */
        this._originalDrawElements = this.rootContainer.drawElements;
        this.rootContainer.drawElements = function () {
            that._drawElements.call(that);
        };
        
        /* text input area */
        this._textInputArea = new Webgram.DrawingControls.TextDrawingControl._TextInputArea(this);
        
        parent._addDrawingElement(this._textInputArea);
        
        this._position = this._getText().length;
    },
    
    _hide: function () {
        if (this._textInputArea == null) { /* not shown */
            return;
        }
        
        var parent = this._drawingElement.getParent();

        /* text input area */
        if (this._textInputArea != null) {
            parent._remDrawingElement(this._textInputArea);
            this._textInputArea = null;
        }

        /* restore the original drawElements method of the root container */
        this.rootContainer.drawElements = this._originalDrawElements;
        this._originalDrawElements = null;
    },
    
    _drawElements: function () {
        /* this method replaces root container's drawElements,
         * and draws the currently edited drawing element on top */
        
        this._originalDrawElements.call(this.rootContainer);
        
        if (this.rootContainer._mini) {
            /* the mini webgram is not affected by the
             * text drawing control */
            return;
        }
        
        /* draw the background */
        var backgroundFillStyle = Webgram.Styles.getFillStyle('text-input-background');
        this.rootContainer.drawRect(this.getWebgram().getVisibleArea().getShrinked(-1));
        this.rootContainer.paint(null, backgroundFillStyle);
        
        /* draw the selected element and the area again,
         * so that they appear on top of everyone */
        
        /* the normal draw */
        this._drawingElement.draw();
        this.rootContainer._noZoom = true;
        this._drawingElement.drawNoZoom();
        this.rootContainer._noZoom = false;
        
        /* the "on top" draw */
        this._drawingElement.drawTop();
        this.rootContainer._noZoom = true;
        this._drawingElement.drawNoZoomTop();
        this._textInputArea.drawNoZoom();
        this.rootContainer._noZoom = false;
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
        /* create an undo checkpoint right before setting
         * the text for the first time */
        if (this._drawingElement.webgram && this._saveCheckPoint) {
            this._drawingElement.webgram.saveUndoCheckPoint([this._drawingElement], 'change');
            this._saveCheckPoint = false;
        }
        
        Webgram.Utils.setField(this._textField, text, this._textFieldIsAbsolute ? null : this._drawingElement);
        
        this.onTextChange.trigger(this._drawingElement, text);
    },
    
    _getLineCol: function () {
        var text = this._getText();
        var layout = this._textInputArea.layoutText(text, null, this._getTextStyle());
        
        var i, colNo = 0, lineNo = 0;
        
        /* build a text from the layout lines */
        var linedText = '';
        for (i = 0; i < layout.length; i++) {
            linedText += layout[i].text;
            if (i < layout.length - 1) {
                linedText += '\n';
            }
        }
        
        for (i = 0; i < linedText.length && i < this._position; i++) {
            if (linedText[i] === '\n') {
                colNo = 0;
                lineNo++;
            }
            else {
                colNo++;
            }
        }
        
        return {
            line: lineNo,
            col: colNo,
            lineCount: layout.length,
            colCount: layout[lineNo].text.length,
            layout: layout,
            text: linedText
        };
    },
    
    _colFromXCoord: function (lineInfo, x) {
        if (x < lineInfo.left) {
            return 0; /* outside of the text area */
        }
        
        var i, textStyle = this._getTextStyle();
        for (i = 0; i <= lineInfo.text.length; i++) {
            if (x - lineInfo.left < this._textInputArea.getTextSize(lineInfo.text.substring(0, i), textStyle).width) {
                return i - 1;
            }
        }

        return lineInfo.text.length; /* outside of the text area */
    },
    
    _positionFromLineCol: function (lineCol) {
        var text = lineCol.text;
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
 * Represents the area used to edit the text.
 */
Webgram.DrawingControls.TextDrawingControl._TextInputArea = function (textDrawingControl) {
    var de = textDrawingControl._drawingElement;
    var topLeft = textDrawingControl._box.getTopLeft();
    var bottomRight = textDrawingControl._box.getBottomRight();
    var rotationAngle = de.getRotationAngle();
    
    topLeft = de.transformDirect(topLeft);
    bottomRight = de.transformDirect(bottomRight);
    var boxCenter = topLeft.getCenterTo(bottomRight);
    topLeft = topLeft.getRotated(-rotationAngle, boxCenter);
    bottomRight = bottomRight.getRotated(-rotationAngle, boxCenter);
    
    /* the drawing element may be flipped, we need to make sure
     * that the topLeft and bottomRight points form a proper rectangle */
    var rect = new Webgram.Geometry.Rectangle(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
    topLeft = rect.getTopLeft();
    bottomRight = rect.getBottomRight();
    
    this.margin = 5;
    
    var x = topLeft.x;
    var y = topLeft.y;
    var width = bottomRight.x - topLeft.x + 1;
    var height = bottomRight.y - topLeft.y + 1;
    
    Webgram.DrawingElements.RectangularElement.call(this, ':special:text-input-area', x, y, width, height);
    
    this.setStrokeStyle(Webgram.Styles.getStrokeStyle('text-input-area'));
    this.setFillStyle(Webgram.Styles.getFillStyle('text-input-area'));
    
    this.zIndex = Infinity; /* not necessary */
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
        var drawingPoly = this.getShape();
        var radius = 5;
        var topLeft = drawingPoly.points[0];
        var bottomRight = drawingPoly.points[2];
        
        var left = topLeft.x - this.margin;
        var lefti = left + radius;
        var top = topLeft.y - this.margin;
        var topi = top + radius;
        var right = bottomRight.x + this.margin;
        var righti = right - radius;
        var bottom = bottomRight.y + this.margin;
        var bottomi = bottom - radius;
        
        this.drawArc(new Webgram.Geometry.Point(lefti, topi), radius, radius, Math.PI, 3 * Math.PI / 2);
        this.drawLine(new Webgram.Geometry.Point(lefti, top), new Webgram.Geometry.Point(righti, top));
        this.drawArc(new Webgram.Geometry.Point(righti, topi), radius, radius, 3 * Math.PI / 2, 2 * Math.PI);
        this.drawLine(new Webgram.Geometry.Point(right, topi), new Webgram.Geometry.Point(right, bottomi));
        this.drawArc(new Webgram.Geometry.Point(righti, bottomi), radius, radius, 0, Math.PI / 2);
        this.drawLine(new Webgram.Geometry.Point(righti, bottom), new Webgram.Geometry.Point(lefti, bottom));
        this.drawArc(new Webgram.Geometry.Point(lefti, bottomi), radius, radius, Math.PI / 2, Math.PI);
        this.drawLine(new Webgram.Geometry.Point(left, bottomi), new Webgram.Geometry.Point(left, topi));
        
        this.paint();
    },
    
    drawCursor: function () {
        var textStyle = this._textDrawingControl._getTextStyle();
        var lineCol = this._textDrawingControl._getLineCol();
        
        var lineInfo = lineCol.layout[lineCol.line];
        var top = lineInfo.top;
        var bottom = lineInfo.bottom;
        var left = lineInfo.left;
        var right = left + this.getTextSize(lineInfo.text.substring(0, lineCol.col), textStyle).width;
        
        this.drawLine(new Webgram.Geometry.Point(right, top));
        this.drawLine(new Webgram.Geometry.Point(right, bottom));
        
        var strokeStyle = Webgram.Styles.createStrokeStyle({colors: [textStyle.color]});
        
        this.paint(strokeStyle, null);
    },

    /* we override the following couple of methods because we want to prevent
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
    
    pointInside: function (point, transformed) {
        /* we override this method because we want to extend
         * the "inside" area of this element with the margin */
        
        var rect = this.getBaseRectangle().getShrinked(-this.margin);
        var poly = rect.getPoly();
        
        if (transformed) {
            poly = this.transformDirect(poly);
        }

        return poly.pointInside(point);
    },
    
    finishChangeEvents: function () {
        /* we override this method because we don't want 
         * change events to be generated by this element */
    }
};

Webgram.Class('Webgram.DrawingControls.TextDrawingControl._TextInputArea', Webgram.DrawingElements.RectangularElement);

