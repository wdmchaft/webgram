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


    /* pattern stroke workaround */

CanvasRenderingContext2D.prototype._oldMoveTo = CanvasRenderingContext2D.prototype.moveTo;
CanvasRenderingContext2D.prototype.moveTo = function (x, y) {
    this.currentX = x;
    this.currentY = y;
    
    this._oldMoveTo(x, y);
};

CanvasRenderingContext2D.prototype._oldLineTo = CanvasRenderingContext2D.prototype.lineTo;
CanvasRenderingContext2D.prototype.lineTo = function (x, y) {
    if (!this._strokePattern || this._transparentStroke) {
        this._oldLineTo(x, y);
        this.currentX = x;
        this.currentY = y;

        return;
    }
    var angle = Math.atan2(y - this.currentY, x - this.currentX);
    var length = new Webgram.Geometry.Point(x, y).getDistanceTo(new Webgram.Geometry.Point(this.currentX, this.currentY));
    
    this.save();
    this.translate(this.currentX, this.currentY);
    this.rotate(angle);
    
    var pos = 0;
    var off;
    var rem = this._strokePatternPos % this._strokePatternLength;
    if (rem < this._strokePattern[0]) { /* inside an on zone */
        pos += this._strokePattern[0] - rem;
        
        if (pos > length) {
            pos = length;
        }

        this._oldLineTo(pos, 0);
        off = 1;
    }
    else { /* inside an off zone */
        pos += this._strokePatternLength - rem;
        
        if (pos > length) {
            pos = length;
        }

        this._oldMoveTo(pos, 0);
        off = 0;
    }
    
    while (pos < length) {
        pos += this._strokePattern[off];
        
        if (pos > length) {
            pos = length;
        }
        
        if (off) {
            this._oldMoveTo(pos, 0);
        }
        else {
            this._oldLineTo(pos, 0);
        }
        
        off = (off + 1) % 2;
    }
        
    this.restore();

    this._strokePatternPos += length;
    this.currentX = x;
    this.currentY = y;
};


/**
 * @class A class that adapts the drawing/painting routines of the library
 * to the implementation of a <em>HTML Canvas</em> element. This is in fact
 * a wrapper around a <em>HTML Canvas</em> that allows some extensions and
 * the use of other possible drawing backends (like SVG).
 * @param {CanvasRenderingContext2D} context the <em>HTML Canvas</em> context to be wrapped
 * by this canvas.
 */
Webgram.Canvas = function (context) {
    /**
     * The <em>HTML Canvas</em> context wrapped by this canvas.
     * @type CanvasRenderingContext2D
     */
    this.context = context;
    
    /**
     * The width in pixels of this canvas.
     * @type Number
     */
    this.width = context.canvas.width;
    
    /**
     * The height in pixels of this canvas.
     * @type Number
     */
    this.height = context.canvas.height;
    
    this._drawn = true;
    this._pendingPathOps = [];

    this.context._strokePattern = null;
    this.context._strokePatternLength = 0;
    this.context._strokePatternPos = 0;
};

Webgram.Canvas.prototype = {
    /**
     * Clears the entire area of the canvas.
     */
    clear: function () {
        this.context.clearRect(0, 0, this.width, this.height);
    },
    
    /**
     * Returns the width of the canvas.
     * @returns {Number} the width of the canvas
     */
    getWidth: function () {
        return this.width;
    },
    
    /**
     * Sets the width of the canvas.
     * @param {Number} width the new width of the canvas
     */
    setWidth: function (width) {
        this.width = width;
        this.context.canvas.width = width;
    },
    
    /**
     * Returns the height of the canvas.
     * @returns {Number} the height of the canvas
     */
    getHeight: function () {
        return this.height;
    },
    
    /**
     * Sets the height of the canvas.
     * @param {Number} height the new height of the canvas
     */
    setHeight: function (height) {
        this.height = height;
        this.context.canvas.height = height;
    },
    
    /**
     * This method must be called after using one or more path-related drawing primitives.
     * It actually commits the path-drawing operations that were previously queued.
     * No path operations should remain "unpainted" (i.e. with no call to <tt>paint</tt> after them).   
     * If <tt>strokeStyle</tt> is specified, a stroke is drawn along the path, using the given style.
     * If <tt>fillStyle</tt> is specified, the shape is first closed and then filled using the given style.
     * @param {Webgram.Styles.StrokeStyle} strokeStyle the stroke style to use when painting the primitives
     * @param {Webgram.Styles.FillStyle} fillStyle the fill style to use when painting the primitives
     */
    paint: function (strokeStyle, fillStyle, transformSet) {
        this.context._strokePattern = null;
        
        if (strokeStyle) {
            if (strokeStyle.lineWidth > 0) {
                this.context.lineWidth = strokeStyle.lineWidth;
                this.context.lineCap = strokeStyle.lineCap;
                this.context.lineJoin = strokeStyle.lineJoin;
                this.context.miterLimit = strokeStyle.miterLimit;
            
                if (strokeStyle.pattern) {
                    this.context._strokePattern = [
                        Math.max(strokeStyle.pattern[0] - strokeStyle.lineWidth, 0.1),
                        Math.max(strokeStyle.pattern[1] + strokeStyle.lineWidth, 0.1)
                    ];
                    
                    this.context._strokePatternLength = strokeStyle.pattern[0] + strokeStyle.pattern[1];
                    this.context._strokePatternPos = 0;
                }
    
                if (strokeStyle.colors.length === 1) { /* single color */
                    this.context.strokeStyle = strokeStyle.colors[0];
                }
                else { /* gradient of colors */
                    this.context.strokeStyle = this._getGradient(strokeStyle.colors, 
                        strokeStyle.gradientPoint1, strokeStyle.gradientPoint2,
                        strokeStyle.gradientRadius1, strokeStyle.gradientRadius2, transformSet);
                }
            }
            else {
                strokeStyle = null;
            }
        }
        
        if (fillStyle) {
            if (fillStyle.colors.length === 1) { /* single color */
                this.context.fillStyle = fillStyle.colors[0];
            }
            else { /* gradient of colors */
                this.context.fillStyle = this._getGradient(fillStyle.colors, 
                    fillStyle.gradientPoint1, fillStyle.gradientPoint2,
                    fillStyle.gradientRadius1, fillStyle.gradientRadius2, transformSet);
            }
        }
        
        transformSet.applyToCanvas(this);
        
    //    var bounds = transformSet.computeBounds(this.context);
        
        var bounds = null;
        var commited;
        
        if (strokeStyle && strokeStyle.pattern && strokeStyle.pattern.length && fillStyle) {
            /* draw a second transparent path to make the fill work, when using pattern stroke */
            
            this.context._transparentStroke = true;
            commited = this._commitPathOps(bounds, transformSet);
            delete this.context._transparentStroke;
            
            var oldStrokeStyle = this.context.strokeStyle;
            this.context.strokeStyle = 'transparent';
            if (commited) {
                this.context.fill();
            }
            this.context.strokeStyle = oldStrokeStyle;
            
            commited = this._commitPathOps(bounds);
            
            if (commited) {
                this.context.stroke();
            }
        }
        else {
            commited = this._commitPathOps(bounds, transformSet);
            
            if (fillStyle && commited) {
                this.context.fill();
            }
            if (strokeStyle && commited) {
                this.context.stroke();
            }
        }
        
        this._pendingPathOps = [];
        
        transformSet.restoreCanvas(this);
    },
    
    /**
     * Draws a straight line between <tt>point1</tt> and <tt>point2</tt>.
     * If the last drawn point differs from <tt>point1</tt>, a straight line is drawn to join them.<br>
     * This is a path-related drawing primitive.
     * Set <tt>point2</tt> to <tt>null</tt> or <tt>undefined</tt> to obtain a "lineTo" effect.
     * @param {Webgram.Geometry.Point} point1 the starting point of the line
     * @param {Webgram.Geometry.Point} point2 the ending point of the line
     */
    drawLine: function (point1, point2) {
        this._pendingPathOps.push([this._actualDrawLine, [point1, point2]]);
    },
    
    /**
     * Draws a polygonal line.
     * If the last drawn point differs from the first point of <tt>poly</tt>, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Poly} poly the poly to draw
     * @param {Boolean} closed set to <tt>true</tt> to join the first and the last points of the poly, <tt>false</tt> otherwise
     */
    drawPoly: function (poly, closed) {
        this._pendingPathOps.push([this._actualDrawPoly, [poly, closed]]);
    },
    
    /**
     * Draws an ellipsoidal arc. All coordinates are relative to the element.
     * If the last drawn point differs from the staring point of the arc, a straight line is drawn to join them.<br>
     * This is a drawing primitive that creates or continues a path.
     * @param {Webgram.Geometry.Point} center the central point of the ellipsoid that the arc is based upon
     * @param {Number} radiusX the X radius of the ellipsoid that the arc is based upon 
     * @param {Number} radiusY the Y radius of the ellipsoid that the arc is based upon
     * @param {Number} startAngle the starting angle of the arc
     * @param {Number} startAngle the ending angle of the arc
     */
    drawArc: function (center, radiusX, radiusY, startAngle, endAngle) {
        this._pendingPathOps.push([this._actualDrawArc, [center, radiusX, radiusY, startAngle, endAngle]]);
    },
    
    /**
     * Draws a quadratic or a cubic Bezier curve.
     * If the last drawn point differs from the staring point of the curve, a straight line is drawn to join them.
     * Set <tt>controlPoint2</tt> to <tt>null</tt> or <tt>undefined</tt> to draw a quadratic curve; a cubic one is drawn, otherwise.<br>
     * This is a drawing primitive that creates or continues a path. 
     * @param {Webgram.Geometry.Point} point1 the starting point of the curve
     * @param {Webgram.Geometry.Point} point2 the starting point of the curve 
     * @param {Webgram.Geometry.Point} controlPoint1 the first control point of the curve
     * @param {Webgram.Geometry.Point} controlPoint2 the second control point of the curve, in case of a cubic Bezier curve
     */
    drawBezier: function (point1, point2, controlPoint1, controlPoint2) {
        this._pendingPathOps.push([this._actualDrawBezier, [point1, point2, controlPoint1, controlPoint2]]);
    },
    
    /**
     * Draws a scalar image.
     * @param {Image} image the JavaScript image object with a loaded image
     * @param {Webgram.Geometry.Point} center the central point of the drawn image
     * @param {Webgram.Geometry.Size} size the size of the drawn image;
     *  use <tt>image.width</tt> and <tt>image.height</tt> to draw the image unscaled
     * @param {Number} rotationAngle the at which the image is rotated when drawn
     * @param {Number} alpha alpha (transparency) value to use when drawing the image (between 0 and 1)
     * @param {Webgram.Canvas.TransformSet} transformSet a set of transforms to apply to the canvas before drawing the image
     */
    drawImage: function (image, center, size, rotationAngle, alpha, transformSet) {
        center = transformSet.roundPoint(center);
        
        transformSet.applyToCanvas(this);
        
        this.context.translate(center.x, center.y);
        this.context.rotate(rotationAngle);
        
        this.context.translate(-size.width / 2, -size.height / 2);
        this.context.globalAlpha = alpha;
        this.context.drawImage(image, 0, 0, size.width, size.height);
        this.context.globalAlpha = 1;
        
        transformSet.restoreCanvas(this);
    },
    
    /**
     * Draws a piece of text.
     * @param {String} text the textual content to draw
     * @param {Webgram.Geometry.Rectangle} box the bounding box of the drawn text
     * @param {Webgram.Styles.TextStyle} textStyle the style to use when drawing the text
     * @param {Webgram.Canvas.TransformSet} transformSet a set of transforms to apply to the canvas before drawing the text
     */
    drawText: function (text, box, textStyle, transformSet) {
        var boxTopLeft = transformSet.roundPoint(box.getTopLeft());
        var boxBottomRight = transformSet.roundPoint(box.getBottomRight());
        box = new Webgram.Geometry.Rectangle(boxTopLeft.x, boxTopLeft.y, boxBottomRight.x, boxBottomRight.y);
        
        transformSet.applyToCanvas(this);
        
        /* set the text alignment */
        switch (textStyle.justify[0]) {
            case 'l':
                this.context.textAlign = 'left';
                
                break;
            
            case 'c':
                this.context.textAlign = 'center';
                
                break;
            
            case 'r':
                this.context.textAlign = 'right';
                
                break;
        }
        
        switch (textStyle.justify[1]) {
            case 't':
                this.context.textBaseline = 'top';
                
                break;
            
            case 'c':
                this.context.textBaseline = 'middle';
                
                break;
            
            case 'b':
                this.context.textBaseline = 'bottom';
                
                break;
        }
        
        /* layout the text */
        var lines = this.layoutText(text, box, textStyle).lines;
        
        /* draw the text lines on the canvas */
        this.context.fillStyle = textStyle.color;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            this.context.fillText(line.text, line.x, line.y);
        }
        
        transformSet.restoreCanvas(this);
    },
    
    /**
     * Measures the size that a given piece of text would have.
     * @param {String} text the textual content to evaluate
     * @param {Webgram.Styles.TextStyle} the style to use when measuring the text
     * @returns {Webgram.Geometry.Size} the size occupied by the given text
     */
    getTextSize: function (text, textStyle) {
        var fontSpec = '';
        if (textStyle.bold) {
            fontSpec += 'bold ';
        }
        if (textStyle.italic) {
            fontSpec += 'italic ';
        }
        if (textStyle.size != null) {
            fontSpec += textStyle.size + 'px ';
        }
        if (textStyle.font != null) {
            fontSpec += textStyle.font;
        }
        
        /* don't change the canvas' font unless necessary to improve the performance a bit */
        if (this.context.font !== fontSpec) {
            this.context.font = fontSpec;
        }

        return new Webgram.Geometry.Size(this.context.measureText(text).width, textStyle.size);
    },
    
    /**
     * Performs a text layout within a given box.
     * It does this by wrapping the text when/if necessary and aligns it as indicated by the style.
     * @param {String} text the textual content to layout
     * @param {Webgram.Geometry.Rectangle} box the bounding box of the text
     * @param {Webgram.Styles.TextStyle} textStyle the style to use when layouting the text
     * @returns {Object} an object with:<ul>
     *  <li><tt>lines</tt> - an array of objects with:<ul>
     *   <li><tt>text</tt> - the textual content of the line</li>
     *   <li><tt>x</tt> and <tt>y</tt> - the coordinates where the text has to be drawn</li>
     *   <li><tt>top</tt>, <tt>right</tt>, <tt>bottom</tt> and <tt>left</tt> - the boundaries of the line</li>
     *  </ul>
     *  <li><tt>text</tt> - the adjusted (with newlines) text that should be used instead of the original one</li>
     * </ul>
     */
    layoutText: function (text, box, textStyle) {
        var fontSpec = '';
        if (textStyle.bold) {
            fontSpec += 'bold ';
        }
        if (textStyle.italic) {
            fontSpec += 'italic ';
        }
        if (textStyle.size != null) {
            fontSpec += textStyle.size + 'px ';
        }
        if (textStyle.font != null) {
            fontSpec += textStyle.font;
        }
        
        /* don't change the canvas' font unless necessary to improve the performance a bit */
        if (this.context.font !== fontSpec) {
            this.context.font = fontSpec;
        }
        
        /* split the text into words for wrapping */
        var regExp = new RegExp('[ \t\r][a-zA-Z]', 'm');
        var i, j, pos;
        var ch, part, word, words = [];
        while (text.length > 0) {
            pos = text.search(regExp);
            if (pos === -1) {
                pos = text.length - 1;
            }
            
            word = text.substring(0, pos + 1);
            part = '';
            for (j = 0; j < word.length; j++) {
                ch = word[j];
                if (ch === '\n') {
                    if (part.length > 0) {
                        words.push(part);
                    }
                    words.push('');
                    part = '';
                }
                else {
                    part += ch;
                }
            }
            if (part.length) {
                words.push(part);
            }
            
            text = text.substring(pos + 1);
        };
        
        /* compute the text widths for each of the words
         * and perform the actual word wrapping */
        var width, widthSoFar = 0, boxWidth = box.getWidth();
        var line = '', lines = [];
        var lineWidths = [];
        for (i = 0; i < words.length; i++) {
            word = words[i];
            if (word.length === 0) { /* newline */
                lines.push(line);
                lineWidths.push(widthSoFar);
                widthSoFar = 0;
                line = '';
                continue;
            }
            
            width = this.context.measureText(word).width;
            if ((widthSoFar + width > boxWidth) && line !== '') { /* exceeds the box width, pass to a new line */
                if (line.length > 0 && line[line.length - 1]) { /* remove the trailing space used for wrapping */
                    line = line.substring(0, line.length - 1);
                    widthSoFar = this.context.measureText(line).width;
                }
                
                lines.push(line);
                lineWidths.push(widthSoFar);
                widthSoFar = 0;
                line = '';
            }
            
            widthSoFar += width;
            line += word;
        }
        if (line.length > 0 || words.length === 0) {
            lines.push(line);
            lineWidths.push(widthSoFar);
        }
        var lastWord = words.length && words[words.length - 1];
        if (lastWord != null && lastWord.length === 0) { /* a terminal newline */
            lines.push('');
            lineWidths.push(0);
        }
        
        /* compute the text alignment */
        var textX = null, textY = null;
        var x, y;
        var top = null, right = null, bottom = null, left = null;
        switch (textStyle.justify[0]) { /* horizontal alignment */
            case 'l':
                textX = box.x1;
                left = box.x1;
                
                break;
            
            case 'c':
                textX = (box.x1 + box.x2) / 2;
                
                break;
            
            case 'r':
                textX = box.x2;
                right = box.x2;
                
                break;
        }
        
        switch (textStyle.justify[1]) { /* vertical alignment */
            case 't':
                textY = box.y1;
                top = box.y1;
                
                break;
            
            case 'c':
                textY = (box.y1 + box.y2) / 2;
                
                break;
            
            case 'b':
                textY = box.y2;
                bottom = box.y2;
                
                break;
        }
        
        var lineList = [];
        var _top, _right, _bottom, _left;
        var center = box.getCenter();
        for (i = 0; i < lines.length; i++) {
            line = lines[i];
            width = lineWidths[i];
            
            x = textX;
            if (left == null) {
                if (right == null) {
                    /* center alignment */
                    _left = center.x - width / 2;
                    _right = center.x + width / 2;
                }
                else {
                    /* right alignment */
                    _right = center.x + right;
                    _left = _right - width;
                }
            }
            else {
                /* left alignment */
                _left = center.x + left;
                _right = _left + width;
            }
            
            if (top == null) {
                if (bottom == null) {
                    /* center alignment */
                    y = textY + (i - lines.length / 2.0 + 0.5) * textStyle.size;
                    _top = y - textStyle.size / 2;
                    _bottom = y + textStyle.size / 2;
                }
                else {
                    /* bottom alignment */
                    y = textY - (lines.length - i - 1)  * textStyle.size;
                    _top = y - textStyle.size;
                    _bottom = y;
                }
            }
            else {
                /* top alignment */
                y = textY + i * textStyle.size;
                _top = y;
                _bottom = y + textStyle.size;
            }
            
            lineList.push({
                text: line,
                x: x,
                y: y,
                top: _top,
                right: _right,
                bottom: _bottom,
                left: _left
            });
            
            text += line;
            if (i < lines.length - 1) {
                text += '\n';
            }
        }
        
        return {
            lines: lineList,
            text: text
        };
    },
    
    _commitPathOps: function (bounds, transformSet) {
        this._drawn = true;
        this.context.beginPath();
        var commited = false;
        
        for (var i = 0; i < this._pendingPathOps.length; i++) {
            var pathOp = this._pendingPathOps[i];
            pathOp[1].push(bounds);
            pathOp[1].push(transformSet);
            commited = pathOp[0].apply(this, pathOp[1]) || commited;
        }
        
        this._drawn = false;
        
        return commited;
    },
    
    _actualDrawLine: function (point1, point2, bounds, transformSet) {
        point1 = transformSet.roundPoint(point1);
        point2 = point2 && transformSet.roundPoint(point2);
        
        if (this._drawn) {
            this.context.moveTo(point1.x, point1.y);
        }
        else {
            this.context.lineTo(point1.x, point1.y);
        }
        
        if (point2 != null) {
            this.context.lineTo(point2.x, point2.y);
        }
        
        this._drawn = false;
        
        return true;
    },
    
    _actualDrawPoly: function (poly, closed, bounds, transformSet) {
        var i, newPoints = [];
        for (i = 0; i < poly.points.length; i++) {
            newPoints.push(transformSet.roundPoint(poly.points[i]));
        }
        
        poly = new Webgram.Geometry.Poly(newPoints);
        
        if (this._drawn) {
            this.context.moveTo(poly.points[0].x, poly.points[0].y);
        }
        else {
            this.context.lineTo(poly.points[0].x, poly.points[0].y);
        }
    
        for (i = 1; i < poly.points.length; i++) {
            var point = poly.points[i];
            this.context.lineTo(point.x, point.y);
        }
        
        if (closed) {
            if (this.context._strokePattern) {
                this.context.lineTo(poly.points[0].x, poly.points[0].y);
            }
            else {
                this.context.closePath();
            }
        }
        
        this._drawn = false;
        
        return true;
    },
    
    _actualDrawArc: function (center, radiusX, radiusY, startAngle, endAngle, bounds, transformSet) {
        center = transformSet.roundPoint(center);
        startAngle = Webgram.Utils.normalizeAngle(startAngle);
        endAngle = Webgram.Utils.normalizeAngle(endAngle);

        // TODO rotationAngle is ignored for now - maybe not needed anymore
        var x = center.x + (radiusX * Math.cos(startAngle));
        var y = center.y + (radiusY * Math.sin(startAngle));
        
        if (this._drawn) {
            this.context.moveTo(x, y);
        }
        else {
            this.context.lineTo(x, y);
        }
        
        var max = Math.max(radiusX, radiusY);
        var step = 0.5 / Math.sqrt(max);
        var angle = startAngle;
        if (startAngle < endAngle) {
            while (angle <= endAngle) {
                x = center.x + (radiusX * Math.cos(angle));
                y = center.y + (radiusY * Math.sin(angle));
                this.context.lineTo(x, y);
                angle += step;
            }
        }
        else {
            /* first slice */
            while (angle < 2 * Math.PI) {
                x = center.x + (radiusX * Math.cos(angle));
                y = center.y + (radiusY * Math.sin(angle));
                this.context.lineTo(x, y);
                angle += step;
            }
            
            /* second slice */
            angle = 0;
            while (angle <= endAngle) {
                x = center.x + (radiusX * Math.cos(angle));
                y = center.y + (radiusY * Math.sin(angle));
                this.context.lineTo(x, y);
                angle += step;
            }
        }
        x = center.x + (radiusX * Math.cos(endAngle));
        y = center.y + (radiusY * Math.sin(endAngle));
        this.context.lineTo(x, y);
        
        if (Webgram.Utils.normalizeAngle(startAngle) === Webgram.Utils.normalizeAngle(endAngle)) { /* a full circle */
            this.context.closePath();
        }
        
        this._drawn = false;
        
        return true;
    },
    
    _actualDrawBezier: function (point1, point2, controlPoint1, controlPoint2, bounds, transformSet) {
        point1 = transformSet.roundPoint(point1);
        point2 = transformSet.roundPoint(point2);
        
        if (this._drawn) {
            this.context.moveTo(point1.x, point1.y);
        }
        else {
            this.context.lineTo(point1.x, point1.y);
        }
        
        if (this.context._strokePattern && !this.context._transparentStroke) { /* must draw the bezier "by hand" */
            if (controlPoint2 != null) { /* cubic bezier curve */
                var totalDistance =
                    point1.getDistanceTo(controlPoint1) + 
                    controlPoint1.getDistanceTo(controlPoint2) +
                    controlPoint2.getDistanceTo(point2);
                var step = 100 / (totalDistance * 10);
                
                for (var t = 0; t < 1; t += step) {
                    var x = 
                        Math.pow(1 - t, 3) * point1.x +
                        3 * Math.pow(1 - t, 2) * t * controlPoint1.x + 
                        3 * (1 - t) * t * t * controlPoint2.x + 
                        Math.pow(t, 3) * point2.x;
                    
                    var y = 
                        Math.pow(1 - t, 3) * point1.y +
                        3 * Math.pow(1 - t, 2) * t * controlPoint1.y + 
                        3 * (1 - t) * t * t * controlPoint2.y + 
                        Math.pow(t, 3) * point2.y;
                    
                    this.context.lineTo(x, y);
                }
            }
            else { /* quadratic bezier curve */
                var totalDistance =
                    point1.getDistanceTo(controlPoint1) + 
                    controlPoint1.getDistanceTo(point2);
                var step = 10 / totalDistance;
                
                for (var t = 0; t < 1; t += step) {
                    var x = 
                        Math.pow(1 - t, 2) * point1.x +
                        2 * (1 - t) * t * controlPoint1.x + 
                        Math.pow(t, 2) * point2.x;
                    
                    var y = 
                        Math.pow(1 - t, 2) * point1.y +
                        2 * (1 - t) * t * controlPoint1.y + 
                        Math.pow(t, 2) * point2.y;
                    
                    this.context.lineTo(x, y);
                }
            }
            
            this.context.lineTo(point2.x, point2.y);
        }
        else { /* use native canvas bezier method */
            if (controlPoint2 != null) { /* cubic bezier curve */ 
                this.context.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, point2.x, point2.y);
            }
            else { /* quadratic bezier curve */
                this.context.quadraticCurveTo(controlPoint1.x, controlPoint1.y, point2.x, point2.y);
            }
        }
    
        this._drawn = false;
        
        return true;
    },

    _getGradient: function (colors, gradientPoint1, gradientPoint2, gradientRadius1, gradientRadius2, transformSet) {
        var i, gradient;
        
        if (gradientRadius1 != null) { /* radial gradient */
            gradient = this.context.createRadialGradient(
                    gradientPoint1.x, gradientPoint1.y, gradientRadius1,
                    gradientPoint1.x, gradientPoint1.y, gradientRadius2);
            
            for (i = 0; i < colors.length; i++) {
                gradient.addColorStop(i / (colors.length - 1), colors[i]);
            }
        }
        else { /* linear gradient */
            gradient = this.context.createLinearGradient(
                    gradientPoint1.x, gradientPoint1.y, gradientPoint2.x, gradientPoint2.y);
            
            for (i = 0; i < colors.length; i++) {
                gradient.addColorStop(i / (colors.length - 1), colors[i]);
            }
        }
    
        return gradient;
    }
};

Webgram.Class('Webgram.Canvas');


/**
 * @class A class that represents an ordered list of geometric transforms.
 * The supported transforms are: <em>translation</em>, <em>rotation</em> and <em>scaling</em>.
 */
Webgram.Canvas.TransformSet = function () {
    this._transforms = [];
};

Webgram.Canvas.TransformSet.prototype = {
    /**
     * Adds a translation transform to the transform set.
     * @param {Number} dx the amount to translate on the x axis
     * @param {Number} dy the amount to translate on the y axis
     */
    addTranslation: function (dx, dy) {
        if (dx === 0 && dy === 0) {
            return;
        }
        
        this._transforms.unshift(['t', dx, dy]);
    },
    
    /**
     * Adds a rotation transform to the transform set.
     * @param {Number} angle the angle of rotation
     */
    addRotation: function (angle) {
        if (angle === 0) {
            return;
        }
        
        this._transforms.unshift(['r', angle]);
    },
    
    /**
     * Adds a scaling to the transform set.
     * @param {Number} factor the scaling factor (the same for both x and y axes)
     */
    addScaling: function (factor) {
        if (factor === 1) {
            return;
        }
        
        this._transforms.unshift(['s', factor]);
    },
    
    /**
     * Applies the set of transforms, in order, to the specified canvas.
     * @param {Webgram.Canvas} canvas the canvas to apply the transforms to
     */
    applyToCanvas: function (canvas) {
        canvas.context.save();
        
        for (var i = 0; i < this._transforms.length; i++) {
            var transform = this._transforms[i];
            if (transform[0] === 't') {
                canvas.context.translate(transform[1], transform[2]);
            }
            else if (transform[0] === 'r') {
                canvas.context.rotate(transform[1]);
            }
            else if (transform[0] === 's') {
                canvas.context.scale(transform[1], transform[1]);
            }
        }
    },
    
    /**
     * Cancels the transforms that were applied with the last
     * {@link Webgram.TransformSet#applyToCanvas}.
     * @param {Webgram.Canvas} canvas the canvas to restore
     */
    restoreCanvas: function (canvas) {
        canvas.context.restore();
    },
    
    /**
     * Applies the set of transforms, in order, to the specified geometric object.
     * @param {Object} geometry an object that supports the
     * <tt>getTranslated</tt>, <tt>getRotated</tt> or <tt>getScaled</tt> methods.
     * @param {Boolean} reverse <tt>true</tt> to apply the reverse trnsforms, in reverse order, 
     * <tt>false</tt> otherwise
     * @returns {Object} the transformed version of the geometric object
     */
    applyToGeometry: function (geometry, reverse) {
        var i;
        
        if (!reverse) {
            for (i = this._transforms.length - 1; i >= 0; i--) {
                var transform = this._transforms[i];
                if (transform[0] === 't') {
                    geometry = geometry.getTranslated(transform[1], transform[2]);
                }
                else if (transform[0] === 'r') {
                    geometry = geometry.getRotated(transform[1]);
                }
                else if (transform[0] === 's') {
                    geometry = geometry.getScaled(transform[1], transform[1]);
                }
            }
        }
        else {
            for (i = 0; i < this._transforms.length; i++) {
                var transform = this._transforms[i];
                if (transform[0] === 't') {
                    geometry = geometry.getTranslated(-transform[1], -transform[2]);
                }
                else if (transform[0] === 'r') {
                    geometry = geometry.getRotated(-transform[1]);
                }
                else if (transform[0] === 's') {
                    geometry = geometry.getScaled(1 / transform[1], 1 / transform[1]);
                }
            }
        }
        
        return geometry;
    },
    
    /**
     * Returns a point that falls on round coordinates on the canvas,
     * after applying this set of transforms.
     * @param {Webgram.Geometry.Point} point the point to round
     * @returns {Webgram.Geometry.Point} the rounded point
     */
    roundPoint: function (point) {
        point = this.applyToGeometry(point);
        point = point.round().getTranslated(0.5, 0.5);
        point = this.applyToGeometry(point, true);
        
        return point;
    },
    
//    computeBounds: function (context) {
//        var a = new Webgram.Geometry.Point(0, 0);
//        var b = new Webgram.Geometry.Point(context.canvas.width - 1, 0);
//        var c = new Webgram.Geometry.Point(context.canvas.width - 1, context.canvas.height - 1);
//        var d = new Webgram.Geometry.Point(0, context.canvas.height - 1);
//        
//        for (var i = 0; i < this._transforms.length; i++) {
//            var transform = this._transforms[i];
//            if (transform[0] === 't') {
//                a = a.getTranslated(-transform[1], -transform[2]);
//                b = b.getTranslated(-transform[1], -transform[2]);
//                c = c.getTranslated(-transform[1], -transform[2]);
//                d = d.getTranslated(-transform[1], -transform[2]);
//            }
//            else if (transform[0] === 'r') {
//                a = a.getRotated(-transform[1]);
//                b = b.getRotated(-transform[1]);
//                c = c.getRotated(-transform[1]);
//                d = d.getRotated(-transform[1]);
//            }
//            else if (transform[0] === 's') {
//                a = a.getScaled(1 / transform[1], 1 / transform[1]);
//                b = b.getScaled(1 / transform[1], 1 / transform[1]);
//                c = c.getScaled(1 / transform[1], 1 / transform[1]);
//                d = d.getScaled(1 / transform[1], 1 / transform[1]);
//            }
//        }
//        
//        return new Webgram.Geometry.Poly([a, b, c, d]);
//    }
};

Webgram.Class('Webgram.Canvas.TransformSet');
