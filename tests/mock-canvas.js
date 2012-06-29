
MockCanvas = function (width, height, callback) {
    this.width = width;
    this.height = height;
    this.callback = callback;
}

MockCanvas.prototype = {
    clear: function () {
        this._callback(this.clear, arguments);
    },
    
    getWidth: function () {
        return this.width;
    },
    
    setWidth: function (width) {
        this.width = width;
        this._callback(this.clear, arguments);
    },
    
    getHeight: function () {
        return this.height;
    },
    
    setHeight: function (height) {
        this.height = height;
        this._callback(this.clear, arguments);
    },
    
    paint: function (strokeStyle, fillStyle, transformSet) {
        this._callback(this.clear, arguments);
    },

    drawLine: function (point1, point2) {
        this._callback(this.clear, arguments);
    },
    
    drawPoly: function (poly, closed) {
        this._callback(this.clear, arguments);
    },
    
    drawArc: function (center, radiusX, radiusY, startAngle, endAngle) {
        this._callback(this.clear, arguments);
    },
    
    drawBezier: function (point1, point2, controlPoint1, controlPoint2) {
        this._callback(this.clear, arguments);
    },
    
    drawImage: function (image, center, size, rotationAngle, alpha, transformSet) {
        this._callback(this.clear, arguments);
    },
    
    drawText: function (text, box, textStyle, transformSet) {
        this._callback(this.clear, arguments);
    },
    
    getTextSize: function (text, textStyle) {
        
    },
    
    layoutText: function (text, box, textStyle) {
        this._callback(this.clear, arguments);
    },
    
    _callback: function (method, args) {
        if (!this.callback) {
            return;
        }
        
        var i, argList = [];
        for (i = 0; i < args.length; i++) {
            argList.push(args[i]);
        }
        
        argList.unshift(method);
        this.callback.apply(this, argList);
    }
};

Webgram.Class('MockCanvas');
