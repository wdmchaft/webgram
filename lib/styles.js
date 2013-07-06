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
 * Contains style classes and related functions
 * that determine how <em>stroke</em>, <em>fill</em> and <em>text</em> are drawn on the canvas.
 * This namespace behaves like a factory for these styles.
 * @namespace
 */
Webgram.Styles = {
    _strokeStyles: {},
    _fillStyles: {},
    _textStyles: {},

    /**
     * Adds a stroke style to the store. If a style with the given name
     * already exists, it is replaced by the new style.
     * @param {String} name the name of the style
     * @param {Webgram.Styles.StrokeStyle} strokeStyle the stroke style to set
     */
    setStrokeStyle: function (name, strokeStyle) {
        if (!(strokeStyle instanceof Webgram.Styles.StrokeStyle) && strokeStyle != null) {
            strokeStyle = this.createStrokeStyle(strokeStyle);
        }
        
        this._strokeStyles[name] = strokeStyle;
    },
    
    /**
     * Adds a fill style to the store. If a style with the given name
     * already exists, it is replaced by the new style.
     * @param {String} name the name of the style
     * @param {Webgram.Styles.FillStyle} fillStyle the fill style to set
     */
    setFillStyle: function (name, fillStyle) {
        if (!(fillStyle instanceof Webgram.Styles.FillStyle) && fillStyle != null) {
            fillStyle = this.createFillStyle(fillStyle);
        }
        
        this._fillStyles[name] = fillStyle;
    },
    
    /**
     * Adds a text style to the store. If a style with the given name
     * already exists, it is replaced by the new style.
     * @param {String} name the name of the style
     * @param {Webgram.Styles.TextStyle} textStyle the text style to set
     */
    setTextStyle: function (name, textStyle) {
        if (!(textStyle instanceof Webgram.Styles.TextStyle) && textStyle != null) {
            textStyle = this.createTextStyle(textStyle);
        }
        
        this._textStyles[name] = textStyle;
    },
    
    /**
     * Retrieves the stroke style with the given name
     * from the store.
     * @param {String} name the name of the style
     * @returns {Webgram.Styles.StrokeStyle} the stroke style having the given name
     *  or <tt>null</tt> if no style with this name is found
     */
    getStrokeStyle: function (name) {
        var style = this._strokeStyles[name];
        if (style == null) {
            return null;
        }
            
        return style.clone();
    },
    
    /**
     * Retrieves the fill style with the given name
     * from the store.
     * @param {String} name the name of the style
     * @returns {Webgram.Styles.FillStyle} the fill style having the given name
     *  or <tt>null</tt> if no style with this name is found
     */
    getFillStyle: function (name) {
        var style = this._fillStyles[name];
        if (style == null) {
            return null;
        }
        
        return style.clone();
    },
    
    /**
     * Retrieves the text style with the given name
     * from the store.
     * @param {String} name the name of the style
     * @returns {Webgram.Styles.TextStyle} the text style having the given name
     *  or <tt>null</tt> if no style with this name is found
     */
    getTextStyle: function (name) {
        var style = this._textStyles[name];
        if (style == null) {
            return null;
        }
        
        return style.clone();
    },
    
    /**
     * Creates a stroke style from attributes. This method does not
     * add the newly created style to the store.
     * For a full descriptions of these attributes,
     * see {@link Webgram.Styles.StrokeStyle}.
     * @param {Object} attributes the attributes of the style
     * @returns {Webgram.Styles.StrokeStyle} the newly created style
     */
    createStrokeStyle: function (attributes) {
        var gradientPoint1 = attributes.gradientPoint1;
        var gradientPoint2 = attributes.gradientPoint2;
        
        /* make sure the gradient points are instances of Point */
        if (gradientPoint1 != null) {
            gradientPoint1 = new Webgram.Geometry.Point(gradientPoint1.x, gradientPoint1.y);
        }
        if (gradientPoint2 != null) {
            gradientPoint2 = new Webgram.Geometry.Point(gradientPoint2.x, gradientPoint2.y);
        }
                
        return new Webgram.Styles.StrokeStyle(
                attributes.lineWidth,
                attributes.lineCap,
                attributes.lineJoin,
                attributes.miterLimit,
                attributes.colors,
                attributes.pattern,
                gradientPoint1,
                gradientPoint2,
                attributes.gradientRadius1,
                attributes.gradientRadius2);
    },
    
    /**
     * Creates a fill style from attributes. This method does not
     * add the newly created style to the store.
     * For a full descriptions of these attributes,
     * see {@link Webgram.Styles.FillStyle}.
     * @param {Object} attributes the attributes of the style
     * @returns {Webgram.Styles.FillStyle} the newly created style
     */
    createFillStyle: function (attributes) {
        var gradientPoint1 = attributes.gradientPoint1;
        var gradientPoint2 = attributes.gradientPoint2;
        
        /* make sure the gradient points are instances of Point */
        if (gradientPoint1 != null) {
            gradientPoint1 = new Webgram.Geometry.Point(gradientPoint1.x, gradientPoint1.y);
        }
        if (gradientPoint2 != null) {
            gradientPoint2 = new Webgram.Geometry.Point(gradientPoint2.x, gradientPoint2.y);
        }
                
        return new Webgram.Styles.FillStyle(
                attributes.colors,
                gradientPoint1,
                gradientPoint2,
                attributes.gradientRadius1,
                attributes.gradientRadius2);
    },

    /**
     * Creates a text style from attributes. This method does not
     * add the newly created style to the store.
     * For a full descriptions of these attributes,
     * see {@link Webgram.Styles.TextStyle}.
     * @param {Object} attributes the attributes of the style
     * @returns {Webgram.Styles.TextStyle} the newly created style
     */
    createTextStyle: function (attributes) {
        return new Webgram.Styles.TextStyle(
                attributes.color,
                attributes.font,
                attributes.size,
                attributes.bold,
                attributes.italic,
                attributes.justify);
    }
};


Webgram.Styles.StrokeStyle = Webgram.Class.extend( /** @lends Webgram.Styles.StrokeStyle.prototype */ {
    /**
     * Represents a style used to draw the lines on the canvas.
     * Any of the following arguments can be omitted (or passed as <tt>null</tt>),
     * in which case the default values will be used for that attribute.
     * @constructs Webgram.Styles.StrokeStyle
     * @param {Number} lineWidth the width (thickness) of the line
     * @param {String} lineCap one of <tt>'butt'</tt>, <tt>'round'</tt> or <tt>'square'</tt>
     * @param {String} lineJoin one of <tt>'round'</tt>, <tt>'bevel'</tt> or <tt>'miter'</tt>
     * @param {Number} miterLimit the miter limit, when <tt>lineJoin</tt> is set to <tt>'miter'</tt>
     * @param {Array} colors a list of colors to use; even if a single color is used, it must be passed in an array
     * @param {Array} pattern a list of two numbers that form the pattern;
     * the first is the "pencil on" length, the second is the "pencil off" length;
     * if omitted, no stroke pattern will be used
     * @param {Webgram.Geometry.Point} gradientPoint1 the starting gradient point;
     * no gradient will be used if this is not given; if the point coordinates end with a '%' percent sign,
     * they are treated as percents of the size of the drawn element 
     * @param {Webgram.Geometry.Point} gradientPoint2 the ending gradient point, for a linear gradient;
     * if given, a <em>linear</em> gradient will be used;
     * otherwise, if <tt>gradientRadius1</tt> is specified, a <em>radial</em>
     * gradient will be used; if the point coordinates end with a '%' percent sign,
     * they are treated as percents of the size of the drawn element
     * @param {Number} gradientRadius1 the starting radius of the radial gradient;
     * if the radius ends with a '%' percent sign, it is treated as percent of the width of the drawn element
     * @param {Number} gradientRadius2 the ending radius of the radial gradient;
     * if the radius ends with a '%' percent sign, it is treated as percent of the width of the drawn element
     */
     initialize: function StrokeStyle(lineWidth, lineCap, lineJoin, miterLimit, 
            colors, pattern, gradientPoint1, gradientPoint2, gradientRadius1, gradientRadius2) {
        
        if (lineWidth == null) {
            lineWidth = 1;
        }
        if (lineCap == null) {
            lineCap = 'square';
        }
        if (lineJoin == null) {
            lineJoin = 'miter';
        }
        if (miterLimit == null) {
            miterLimit = 10;
        }
        if (colors == null) {
            colors = ['black'];
        }
        
        /**
         * The width (thickness) of the line.
         * @type Number
         */
        this.lineWidth = lineWidth;
        
        /**
         * One of <tt>'butt'</tt>, <tt>'round'</tt> or <tt>'square'</tt>.
         * @type String
         */
        this.lineCap = lineCap;
        
        /**
         * One of <tt>'round'</tt>, <tt>'bevel'</tt> or <tt>'miter'</tt>.
         * @type String
         */
        this.lineJoin = lineJoin;
        
        /**
         * The miter limit, when <tt>lineJoin</tt> is set to <tt>'miter'</tt>.
         * @type Number
         */
        this.miterLimit = miterLimit;
        
        /**
         * A list of colors to use. Even if a single color is used, this field
         * is set to an array containing that color.
         * @type Array 
         */
        this.colors = colors;
        
        /**
         * A list of two numbers that form the pattern.
         * The first is the "pencil on" length, the second is the "pencil off" length.
         * This is set to <tt>null</tt> if no pattern is used.
         * @type Array
         */
        this.pattern = pattern;
        
        /**
         * The start gradient point. This is set to <tt>null</tt> if no gradient is used.
         * @type Webgram.Geometry.Point
         */
        this.gradientPoint1 = gradientPoint1;
        
        /**
         * The end gradient point. This is set to a non-<tt>null</tt> point, if a <em>linear</em> gradient is used.
         * @type Webgram.Geometry.Point
         */
        this.gradientPoint2 = gradientPoint2;
        
        /**
         * The start radius of the radial gradient. This is set to <tt>null</tt> if a <em>linear</em> gradient
         * or no gradient is used.
         * @type Number
         */
        this.gradientRadius1 = gradientRadius1;
        
        /**
         * The end radius of the radial gradient. This is set to <tt>null</tt> if a <em>linear</em> gradient
         * or no gradient is used.
         * @type Number
         */
        this.gradientRadius2 = gradientRadius2;
    },

    /**
     * Creates an identical copy of this stroke style.
     * @returns {Webgram.Styles.StrokeStyle} the clone of this stroke style
     */
    clone: function () {
        return new Webgram.Styles.StrokeStyle(
                this.lineWidth,
                this.lineCap,
                this.lineJoin,
                this.miterLimit,
                Webgram.Utils.clone(this.colors),
                Webgram.Utils.clone(this.pattern),
                Webgram.Utils.clone(this.gradientPoint1),
                Webgram.Utils.clone(this.gradientPoint2),
                this.gradientRadius1,
                this.gradientRadius2);
    },
    
    /**
     * Creates a copy of this stroke style by selectively modifying some attributes.
     * This method does not affect the original style.
     * @param {Object} attributes the attributes to change;
     * for more details on these attributes, see {@link Webgram.Styles.StrokeStyle}
     * @returns {Webgram.Styles.StrokeStyle} the modified stroke style
     */
    replace: function (attributes) {
        if (attributes.lineWidth === undefined) {
            attributes.lineWidth = this.lineWidth;
        }
        if (attributes.lineCap === undefined) {
            attributes.lineCap = this.lineCap;
        }
        if (attributes.lineJoin === undefined) {
            attributes.lineJoin = this.lineJoin;
        }
        if (attributes.miterLimit === undefined) {
            attributes.miterLimit = this.miterLimit;
        }
        if (attributes.colors === undefined) {
            attributes.colors = Webgram.Utils.clone(this.colors);
        }
        if (attributes.pattern === undefined) {
            attributes.pattern = Webgram.Utils.clone(this.pattern);
        }
        if (attributes.gradientPoint1 === undefined) {
            attributes.gradientPoint1 = Webgram.Utils.clone(this.gradientPoint1);
        }
        if (attributes.gradientPoint2 === undefined) {
            attributes.gradientPoint2 = Webgram.Utils.clone(this.gradientPoint2);
        }
        if (attributes.gradientRadius1 === undefined) {
            attributes.gradientRadius1 = this.gradientRadius1;
        }
        if (attributes.gradientRadius2 === undefined) {
            attributes.gradientRadius2 = this.gradientRadius2;
        }
        
        return Webgram.Styles.createStrokeStyle(attributes);
    },
    
    /**
     * Tells whether this style has a linear gradient or not.
     * @returns {Boolean} <tt>true</tt> if the style has a linear gradient, <tt>false</tt> otherwise
     */
    hasLinearGradient: function () {
        return this.gradientPoint1 != null && this.gradientPoint2 != null;
    },
    
    /**
     * Tells whether this style has a radial gradient or not.
     * @returns {Boolean} <tt>true</tt> if the style has a radial gradient, <tt>false</tt> otherwise
     */
    hasRadialGradient: function () {
        return this.gradientPoint1 != null && this.gradientPoint2 == null && this.gradientRadius1 != null;
    },
    
    /**
     * Generates a json object that completely characterizes this style.
     * The result should be enough to restore the style using
     * {@link Webgram.Styles.StrokeStyle#fromJson}.
     * @returns {Object} the json object
     */
    toJson: function () {
        return {
            lineWidth: this.lineWidth,
            lineCap: this.lineCap,
            lineJoin: this.lineJoin,
            miterLimit: this.miterLimit,
            colors: this.colors,
            pattern: this.pattern,
            gradientPoint1: ((this.gradientPoint1 != null) ? ({
                x: this.gradientPoint1.x,
                y: this.gradientPoint1.y,
            }) : null),
            gradientPoint2: ((this.gradientPoint2 != null) ? ({
                x: this.gradientPoint2.x,
                y: this.gradientPoint2.y,
            }) : null),
            gradientRadius1: this.gradientRadius1,
            gradientRadius2: this.gradientRadius2
        };
    },
    
    /**
     * Restores the style from a json object. This method is the opposite
     * of {@link Webgram.Styles.StrokeStyle#toJson}.
     * @param {Object} json the json object to restore the style from
     */
    fromJson: function (json) {
        if (json.lineWidth !== undefined) {
            this.lineWidth = json.lineWidth;
        }
        
        if (json.lineCap !== undefined) {
            this.lineCap = json.lineCap;
        }
        
        if (json.lineJoin !== undefined) {
            this.lineJoin = json.lineJoin;
        }
        
        if (json.miterLimit !== undefined) {
            this.miterLimit = json.miterLimit;
        }
        
        if (json.colors !== undefined) {
            this.colors = Webgram.Utils.clone(json.colors);
        }
        
        if (json.pattern !== undefined) {
            this.pattern = Webgram.Utils.clone(json.pattern);
        }
        
        if (json.gradientPoint1 !== undefined) {
            this.gradientPoint1 = json.gradientPoint1;
            if (this.gradientPoint1 != null) {
                this.gradientPoint1 = new Webgram.Geometry.Point(this.gradientPoint1.x, this.gradientPoint1.y);
            }
        }
        
        if (json.gradientPoint2 !== undefined) {
            this.gradientPoint2 = json.gradientPoint2;
            if (this.gradientPoint2 != null) {
                this.gradientPoint2 = new Webgram.Geometry.Point(this.gradientPoint2.x, this.gradientPoint2.y);
            }
        }
        
        if (json.gradientRadius1 !== undefined) {
            this.gradientRadius1 = json.gradientRadius1;
        }
        
        if (json.gradientRadius2 !== undefined) {
            this.gradientRadius2 = json.gradientRadius2;
        }
    }
});

    
Webgram.Styles.FillStyle = Webgram.Class.extend( /** @lends Webgram.Styles.FillStyle.prototype */ {
    /**
     * Represents a style used to fill the shapes on the canvas.
     * Any of the following arguments can be omitted (or passed as <tt>null</tt>),
     * in which case the default values will be used for that attribute.
     * @constructs Webgram.Styles.FillStyle
     * @param {Array} colors a list of colors to use; even if a single color is used, it must be passed as an array
     * @param {Webgram.Geometry.Point} gradientPoint1 the starting gradient point;
     * no gradient will be used if this is not given; if the point coordinates end with a '%' percent sign,
     * they are treated as percents of the size of the drawn element 
     * @param {Webgram.Geometry.Point} gradientPoint2 the ending gradient point, for a linear gradient;
     * if given, a <em>linear</em> gradient will be used;
     * otherwise, if <tt>gradientRadius1</tt> is specified, a <em>radial</em>
     * gradient will be used; if the point coordinates end with a '%' percent sign,
     * they are treated as percents of the size of the drawn element
     * @param {Number} gradientRadius1 the starting radius of the radial gradient;
     * if the radius ends with a '%' percent sign, it is treated as percent of the width of the drawn element
     * @param {Number} gradientRadius2 the ending radius of the radial gradient;
     * if the radius ends with a '%' percent sign, it is treated as percent of the width of the drawn element
     */
    initialize: function FillStyle(colors, gradientPoint1, gradientPoint2, gradientRadius1, gradientRadius2) {
        if (!colors) {
            colors = ['white'];
        }
        
        /**
         * A list of colors to use. Even if a single color is used, this field
         * is set to an array containing that color.
         * @type Array
         */
        this.colors = colors;
        
        /**
         * The start gradient point. This is set to <tt>null</tt> if no gradient is used.
         * @type Webgram.Geometry.Point
         */
        this.gradientPoint1 = gradientPoint1;
        
        /**
         * The end gradient point. This is set to a non-<tt>null</tt> point, if a <em>linear</em> gradient is used.
         * @type Webgram.Geometry.Point
         */
        this.gradientPoint2 = gradientPoint2;
        
        /**
         * The start radius of the radial gradient. This is set to <tt>null</tt> if a <em>linear</em> gradient
         * or no gradient is used.
         * @type Number
         */
        this.gradientRadius1 = gradientRadius1;
        
        /**
         * The end radius of the radial gradient. This is set to <tt>null</tt> if a <em>linear</em> gradient
         * or no gradient is used.
         * @type Number
         */
        this.gradientRadius2 = gradientRadius2;
    },

    /**
     * Creates an identical copy of this fill style.
     * @returns {Webgram.Styles.FillStyle} the clone of this fill style
     */
    clone: function () {
        return new Webgram.Styles.FillStyle(
                Webgram.Utils.clone(this.colors),
                Webgram.Utils.clone(this.gradientPoint1),
                Webgram.Utils.clone(this.gradientPoint2),
                this.gradientRadius1,
                this.gradientRadius2);
    },
    
    /**
     * Creates a copy of this fill style by selectively modifying some attributes.
     * This method does not affect the original style.
     * @param {Object} attributes the attributes to change;
     * for more details on these attributes, see {@link Webgram.Styles.FillStyle}
     * @returns {Webgram.Styles.FillStyle} the modified fill style
     */
    replace: function (attributes) {
        if (attributes.colors === undefined) {
            attributes.colors = Webgram.Utils.clone(this.colors);
        }
        if (attributes.gradientPoint1 === undefined) {
            attributes.gradientPoint1 = Webgram.Utils.clone(this.gradientPoint1);
        }
        if (attributes.gradientPoint2 === undefined) {
            attributes.gradientPoint2 = Webgram.Utils.clone(this.gradientPoint2);
        }
        if (attributes.gradientRadius1 === undefined) {
            attributes.gradientRadius1 = this.gradientRadius1;
        }
        if (attributes.gradientRadius2 === undefined) {
            attributes.gradientRadius2 = this.gradientRadius2;
        }
      
        return Webgram.Styles.createFillStyle(attributes);
    },
    
    /**
     * Tells whether this style has a linear gradient or not.
     * @returns {Boolean} <tt>true</tt> if the style has a linear gradient, <tt>false</tt> otherwise
     */
    hasLinearGradient: function () {
        return this.gradientPoint1 != null && this.gradientPoint2 != null;
    },
    
    /**
     * Tells whether this style has a radial gradient or not.
     * @returns {Boolean} <tt>true</tt> if the style has a radial gradient, <tt>false</tt> otherwise
     */
    hasRadialGradient: function () {
        return this.gradientPoint1 != null && this.gradientPoint2 == null && this.gradientRadius1 != null;
    },
    
    /**
     * Generates a json object that completely characterizes this style.
     * The result should be enough to restore the style using
     * {@link Webgram.Styles.FillStyle#fromJson}.
     * @returns {Object} the json object
     */
    toJson: function () {
        return {
            colors: this.colors,
            gradientPoint1: ((this.gradientPoint1 != null) ? ({
                x: this.gradientPoint1.x,
                y: this.gradientPoint1.y,
            }) : null),
            gradientPoint2: ((this.gradientPoint2 != null) ? ({
                x: this.gradientPoint2.x,
                y: this.gradientPoint2.y,
            }) : null),
            gradientRadius1: this.gradientRadius1,
            gradientRadius2: this.gradientRadius2
        };
    },

    /**
     * Restores the style from a json object. This method is the opposite
     * of {@link Webgram.Styles.FillStyle#toJson}.
     * @param {Object} json the json object to restore the style from
     */
    fromJson: function (json) {
        if (json.colors !== undefined) {
            this.colors = Webgram.Utils.clone(json.colors);
        }
        
        if (json.gradientPoint1 !== undefined) {
            this.gradientPoint1 = json.gradientPoint1;
            if (this.gradientPoint1 != null) {
                this.gradientPoint1 = new Webgram.Geometry.Point(this.gradientPoint1.x, this.gradientPoint1.y);
            }
        }
        
        if (json.gradientPoint2 !== undefined) {
            this.gradientPoint2 = json.gradientPoint2;
            if (this.gradientPoint2 != null) {
                this.gradientPoint2 = new Webgram.Geometry.Point(this.gradientPoint2.x, this.gradientPoint2.y);
            }
        }
        
        if (json.gradientRadius1 !== undefined) {
            this.gradientRadius1 = json.gradientRadius1;
        }
        
        if (json.gradientRadius2 !== undefined) {
            this.gradientRadius2 = json.gradientRadius2;
        }
    }
});


Webgram.Styles.TextStyle = Webgram.Class.extend( /** @lends Webgram.Styles.TextStyle.prototype */ {
    /**
     * Represents a style used to draw the text on the canvas.
     * Any of the following arguments can be omitted (or passed as <tt>null</tt>),
     * in which case the default values will be used for that attribute.
     * @constructs Webgram.Styles.TextStyle
     * @param {String} color the color to be used to draw the text
     * @param {String} font the font name to be used to draw the text
     * @param {Number} size the size of the text
     * @param {Boolean} bold whether to draw a bold text or not
     * @param {Boolean} italic whether to draw the text in italics or not
     * @param {String} justify a string of two letters; the first one indicates the horizontal
     * alignment and is one of <tt>'l'</tt>, <tt>'c'</tt> or <tt>'r'</tt>,
     * for left, center or right alignment, respectively;
     * the second one indicates the vertical
     * alignment and is one of <tt>'t'</tt>, <tt>'c'</tt> or <tt>'b'</tt>,
     * for top, center or bottom alignment, respectively
     */
    initialize: function TextStyle(color, font, size, bold, italic, justify) {
        /**
         * The color used to draw the text.
         * @type String
         */
        this.color = color;
        
        /**
         * The font name used to draw the text.
         * @type String
         */
        this.font = font;
        
        /**
         * The size of the text.
         * @type Number
         */
        this.size = size;
        
        /**
         * Whether the text is drawn bold or not.
         * @type Boolean
         */
        this.bold = bold;
        
        /**
         * Whether the text is drawn in italics or not.
         * @type Boolean
         */
        this.italic = italic;
        
        /**
         * A string of two letters. The first one indicates the horizontal
         * alignment and is one of <tt>'l'</tt>, <tt>'c'</tt> or <tt>'r'</tt>,
         * for left, center or right alignment, respectively.
         * The second one indicates the vertical
         * alignment and is one of <tt>'t'</tt>, <tt>'c'</tt> or <tt>'b'</tt>,
         * for top, center or bottom alignment, respectively.
         * @type String
         */
        this.justify = justify;
    },
    
    /**
     * Creates an identical copy of this text style.
     * @returns {Webgram.Styles.TextStyle} the clone of this text style
     */
    clone: function () {
        return new Webgram.Styles.TextStyle(
                this.color,
                this.font,
                this.size,
                this.bold,
                this.italic,
                this.justify);
    },
    
    /**
     * Creates a copy of this text style by selectively modifying some attributes.
     * This method does not affect the original style.
     * @param {Object} attributes the attributes to change;
     * for more details on these attributes, see {@link Webgram.Styles.TextStyle}
     * @returns {Webgram.Styles.TextStyle} the modified text style
     */
    replace: function (attributes) {
        if (attributes.color === undefined) {
            attributes.color = this.color;
        }
        if (attributes.font === undefined) {
            attributes.font = this.font;
        }
        if (attributes.size === undefined) {
            attributes.size = this.size;
        }
        if (attributes.bold === undefined) {
            attributes.bold = this.bold;
        }
        if (attributes.italic === undefined) {
            attributes.italic = this.italic;
        }
        if (attributes.justify === undefined) {
            attributes.justify = this.justify;
        }

        return Webgram.Styles.createTextStyle(attributes);
    },
    
    /**
     * Flips the justification (alignment) of this text style
     * horizontally and returns the new text style.
     * @returns {Webgram.Styles.TextStyle} the flipped text style
     */
    flipHorizontally: function () {
        if (this.justify[0] === 'l') {
            return this.replace({justify: 'r' + this.justify[1]});
        }
        else if (this.justify[0] === 'r') {
            return this.replace({justify: 'l' + this.justify[1]});
        }
        else {
            return this.clone();
        }
    },
    
    /**
     * Flips the justification (alignment) of this text style
     * vertically and returns the new text style.
     * @returns {Webgram.Styles.TextStyle} the flipped text style
     */
    flipVertically: function () {
        if (this.justify[1] === 't') {
            return this.replace({justify: this.justify[0] + 'b'});
        }
        else if (this.justify[1] === 'b') {
            return this.replace({justify: this.justify[0] + 't'});
        }
        else {
            return this.clone();
        }
    },
    
    /**
     * Generates a json object that completely characterizes this style.
     * The result should be enough to restore the style using
     * {@link Webgram.Styles.TextStyle#fromJson}.
     * @returns {Object} the json object
     */
    toJson: function () {
        return {
            color: this.color,
            font: this.font,
            size: this.size,
            bold: this.bold,
            italic: this.italic,
            justify: this.justify
        };
    },
    
    /**
     * Restores the style from a json object. This method is the opposite
     * of {@link Webgram.Styles.TextStyle#toJson}.
     * @param {Object} json the json object to restore the style from
     */
    fromJson: function (json) {
        if (json.color !== undefined) {
            this.color = json.color;
        }
        
        if (json.font !== undefined) {
            this.font = json.font;
        }
        
        if (json.size !== undefined) {
            this.size = json.size;
        }
        
        if (json.bold !== undefined) {
            this.bold = json.bold;
        }

        if (json.italic !== undefined) {
            this.italic = json.italic;
        }

        if (json.justify !== undefined) {
            this.justify = json.justify;
        }
    }
});
