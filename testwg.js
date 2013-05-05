
/*
 * De facut:
 *  Refacut gradient editing
 *  Reimplementat connectors
 *  Reimplementat rectangular elements
 *  Reimplementat poly elements
 *  Reimplementat snapping, bazat pe Geometry.Line()
 *  try "use strict"; - reveals error in code
 *  Redenumit focusType in focus
 *  Redenumit shiftEnabled in shiftActive
 *  Redenumit "webgram" in "Webgram" in jsdocs
 *  setSnapVisualFeedback sa ia argumente separate, nu un singur obiect
 *  Redenumit _noZoom in ceva mai omenesc
 *  "must be overridden" should throw UnimplementedException or so
 *  Replace the :special: and :local: id crap with something more suitable
 *  remove testwg.js and testwg.html
 */

var webgram = null;
var miniWebgram = null;

MyControlPoint = Webgram.ControlPoint.extend({
    initialize: function (index) {
        this.index = index;
        
        this.callSuper();
    },
    
    draw: function () {
        var image = this.getImageStore().get('diamond-control-point');

        if (!image) {
            return;
        }
        
        this.drawImage(image.content, Webgram.Geometry.Point.zero(), image.size, 0);
    },
    
    computeAnchor: function () {
        if (this.index == 1) {
            return this.drawingElement.point1;
        }
        else {
            return this.drawingElement.point2;
        }
    },
    
    processMove: function (point) {
        if (this.index == 1) {
            this.drawingElement._setPoint(point, 1);
        }
        else {
            this.drawingElement._setPoint(point, 2);
        }
    }
});

MyElement = Webgram.DrawingElement.extend({
    initialize: function MyElement(id, x1, y1, x2, y2) {
        this.callSuper(id);
        
        this.point1 = new Webgram.Geometry.Point(x1, y1);
        this.point2 = new Webgram.Geometry.Point(x2, y2);
        
        this.controlPoint1 = new MyControlPoint(1);
        this.controlPoint2 = new MyControlPoint(2);
        this.addControlPoint(this.controlPoint1);
        this.addControlPoint(this.controlPoint2);
    },

    draw: function () {
        this.drawRect(this.getBoundingRectangle());
        this.paint();
        
        r = 5;
        x = 0;
        y = 0;
        this.drawRect(new Webgram.Geometry.Rectangle(x - r, y - r, x + r, y + r));
        this.paint(this.getStrokeStyle(), this.getFillStyle().replace({colors: ['green']}));
    },
    
    pointInside: function (point) {
        point = this.transformInverse(point);
        
        return this.getBoundingRectangle().pointInside(point);
    },
    
    getBoundingRectangle: function () {
        return new Webgram.Geometry.Rectangle(
                this.point1.x, this.point1.y,
                this.point2.x, this.point2.y);
    },
    
    setPoint: function (point, index) {
        this._setPoint(point, index);
        this.finishShapeEvents();
    },

    _setPoint: function (point, index) {
        this.beginShapeChange();
        if (index == 1) {
            this.point1 = point;
        }
        else {
            this.point2 = point;
        }

        this.invalidate(true);
        this.updateDependentElements();
    }
});


function onBodyLoad() {
    var canvasElement = document.getElementById('mainCanvas');
    var canvas = new Webgram.Canvas(canvasElement.getContext('2d'));
    webgram = new Webgram(canvasElement, canvas);
    webgram.attachHandlers();
    webgram.setSetting('multipleSelectionEnabled', false);
    webgram.setSetting('snapGrid', null);
    webgram.setSetting('snapAngle', null);
//    webgram.setSetting('snapDistance', null);
    
    s = new MyElement('myElement1', -100, -50, 100, 50);
    webgram.addDrawingElement(s);
    
    s.setRotateEnabled(true);
//    s.flipHorizontally();
    s.setFillStyle(Webgram.Styles.createFillStyle({
        colors: ['red', 'blue'],
        gradientPoint1: undefined,
        gradientPoint2: undefined,
        gradientRadius1: null,
        gradientRadius2: null
    }));
    
//    s.setGradientEditEnabled(true);
    
    s.onEndChange.bind(function () {
        console.log(arguments);
        console.log(this);
        console.log('----------');
    });
}
