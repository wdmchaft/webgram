
/*
 * De facut:
 *  Reimplementat poly elements - the rotate control point is misplaced when flipped vertically
 *  Reimplementat drawing controls
 *  Reimplementat snapping, bazat pe Geometry.Line()
 *  Reimplementat connectors
 *  Reimplementat MiniWebgram
 *  try "use strict"; - reveals error in code
 *  Redenumit focusType in focus
 *  Redenumit shiftEnabled in shiftActive
 *  Redenumit "webgram" in "Webgram" in jsdocs
 *  setSnapVisualFeedback sa ia argumente separate, nu un singur obiect
 *  Redenumit _noZoom in ceva mai omenesc
 *  all the points in a DE should be untransformed (even method arguments)
 *  "must be overridden" should throw UnimplementedException or so
 *  solve TODOs
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


MyRectangularElement = Webgram.DrawingElements.RectangularElement.extend({
    initialize: function (id, width, height) {
        this.callSuper(id, width, height);
        
        this.text = 'ana';
    },

    draw: function () {
        this.drawRect(this.getBoundingRectangle());
        this.paint();
        
        this.drawText(this.text);
//        var r = 5;
//        var x = 0;
//        var y = 0;
//        
//        this.drawRect(new Webgram.Geometry.Rectangle(x - r, y - r, x + r, y + r));
//        this.paint(this.getStrokeStyle(), this.getFillStyle().replace({colors: ['green']}));
    }
});


MyPolyElement = Webgram.DrawingElements.PolyElement.extend({
    initialize: function (id) {
        var points = [
            new Webgram.Geometry.Point(-100, -100),
            new Webgram.Geometry.Point(100, 100),
            new Webgram.Geometry.Point(40, 210)
        ];
        
        this.callSuper(id, points);
    },

    draw: function () {
        this.drawPoly(this.getPoly(), this.closed);
        this.paint(undefined, null);

        var x = 0;
        var y = 0;
        var r = 5;
      
        this.drawRect(new Webgram.Geometry.Rectangle(x - r, y - r, x + r, y + r));
        this.paint(this.getStrokeStyle(), this.getFillStyle().replace({colors: ['green']}));
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
    
    de = new MyPolyElement('myPolyElement1');
//    de = new MyRectangularElement('myPolyElement1', 300, 200);
    de.setEditEnabled(true);
//    de.addShiftBehavior(de.setAddRemovePointsEnabled, de.isAddRemovePointsEnabled);
    de.setRotateEnabled(true);
    webgram.addDrawingElement(de);
    
//    s.setPreserveAspectRatioEnabled(true);
//    s.setRotationAngle(Math.PI / 4);
//    s.flipHorizontally();
//    de.setFillStyle(Webgram.Styles.createFillStyle({
//        colors: ['red', 'blue'],
//        gradientPoint1: undefined,
//        gradientPoint2: null,
//        gradientRadius1: undefined,
//        gradientRadius2: undefined
//    }));
    
//    de.setGradientEditEnabled(true);
    
    de.onEndChange.bind(function () {
        console.log(arguments);
        console.log(this);
        console.log('----------');
    });
    
//    de.onChange.bind(function () {
//        console.log(arguments);
//        console.log(this);
//        console.log('----------');
//    });
    
    //de._setPoint(1, new Webgram.Geometry.Point(200, 0));
    de.flipHorizontally();
//    de._controlPoints[0].move(new Webgram.Geometry.Point(-406, 0));
    
//    de.setLocation(new Webgram.Geometry.Point(113, 44));
//    webgram.createDrawingControl.setDrawingElementClass(MyPolyElement);
//    webgram.createDrawingControl.activate();
}
