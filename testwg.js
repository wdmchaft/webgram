
/*
 * De facut:
 *  la connectori, de verificat ce se intampla daca stergi unul din elemente
 *  add PolyEndPoint
 *  Reimplementat connectors
 *  snapping bug with rectangle rotated at pi/2 and a poly element
 *  interact event should include snapping and connecting/disconnecting
 *  Reimplementat MiniWebgram
 *  try "use strict"; - reveals error in code
 *  Redenumit focusType in focus
 *  Redenumit shiftEnabled in shiftActive
 *  Redenumit "webgram" in "Webgram" in jsdocs
 *  Redenumit _noZoom in ceva mai omenesc
 *  ActionMenuItems should become simple control points
 *  add a functionality to snap a DE to current location (and use it for connectors)
 *  solve TODOs
 *  remove console.log()s
 *  Replace the :special: and :local: id crap with something more suitable
 *  remove testwg.js and testwg.html
 */

var webgram = null;
var miniWebgram = null;

MyControlPoint = Webgram.ControlPoint.extend({
    initialize: function MyControlPoint(index) {
        this.index = index;
        
        MyControlPoint.parentClass.call(this);
    },
    
    draw: function () {
        var image = this.getImageStore().get('diamond-control-point');

        if (!image) {
            return;
        }
        
        this.drawImage(image);
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

PolyEndPoint = Webgram.DrawingElements.PolyElement.PolyControlPoint.augment(Webgram.Connectors.EndPoint, {
    initialize: function PolyEndPoint(polyPointIndex) {
        PolyEndPoint.parentClass.call(this, polyPointIndex);
    }
});

MyElement = Webgram.DrawingElement.extend({
    initialize: function MyElement(id, x1, y1, x2, y2) {
        MyElement.parentClass.call(this, id);
        
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
    initialize: function MyRectangularElement(id, width, height) {
        MyRectangularElement.parentClass.call(this, id, width, height);
        
        this.text = 'Bunica';
    },

    draw: function () {
        this.drawRect(this.getBoundingRectangle());
        this.paint();
        
//        this.drawText(this.text, new Webgram.Geometry.Rectangle(-100, -100, 0, 0), Math.PI / 6);
//        var r = 5;
//        var x = 0;
//        var y = 0;
//        
//        this.drawRect(new Webgram.Geometry.Rectangle(x - r, y - r, x + r, y + r));
//        this.paint(this.getStrokeStyle(), this.getFillStyle().replace({colors: ['green']}));
    }
});


MyPolyElement = Webgram.DrawingElements.PolyElement.extend({
    initialize: function MyPolyElement(id) {
        var points = [
            new Webgram.Geometry.Point(-100, -100),
            new Webgram.Geometry.Point(100, 100),
            new Webgram.Geometry.Point(100, 200)
        ];
        
        MyPolyElement.parentClass.call(this, id, points);
        
        this.zIndex = 1;
    },

    draw: function () {
        this.drawPoly(this.getPoly(), this.closed);
        this.paint(undefined, null);

        var x = 0;
        var y = 0;
        var r = 5;
      
        this.drawRect(new Webgram.Geometry.Rectangle(x - r, y - r, x + r, y + r));
        this.paint(this.getStrokeStyle(), this.getFillStyle().replace({colors: ['green']}));
    },
    
    getPolyControlPointClass: function (index) {
        return PolyEndPoint;
    }
});

var TestPoint = Webgram.Geometry.Point.extend({
    nothing: function () {
        window.a = 44;
    }
});

function benchmark(cls, n) {
    var before = new Date();
    for (var i = 0; i < n; i++) {
        window.tp = new cls(34,45);
        //tp.nothing();
    }
    var after = new Date();
    var diff = after.getTime() - before.getTime();
    return diff;
}

function actualbench() {
    var max = 1000;
    for (var n = max; n < max * 10; n += max) {
        var d1 = benchmark(Webgram.Geometry.Point, n);
        var d2 = benchmark(TestPoint, n);
        console.log(Math.max(0, Math.round(100 - d1 / d2 * 100)) + '%');
    }
}

function onBodyLoad() {
    var canvasElement = document.getElementById('mainCanvas');
    var canvas = new Webgram.Canvas(canvasElement.getContext('2d'));
    webgram = new Webgram(canvasElement, canvas);
    webgram.attachHandlers();
    webgram.setSetting('multipleSelectionEnabled', false);
//    webgram.setSetting('snapGrid', {sizeX: 25, sizeY: 25});
//    webgram.setSetting('snapGrid', {sizeX: 5, sizeY: 5});
    webgram.setSetting('snapGrid', null);
    webgram.setSetting('mainGrid', {sizeX: 25, sizeY: 25});
    webgram.setSetting('snapAngle', Math.PI / 4);
//    webgram.setSetting('snapDistance', null);
    
    de = new MyPolyElement('myPolyElement1');
    
//    de = new MyRectangularElement('myPolyElement1', 101, 101);
    de.setEditEnabled(true);
    de.setSnapToAngleEnabled(true);
    de.setSnapExternallyEnabled(true);
    de.setSnapInternallyEnabled(true);
    de.setSnapToGridEnabled(true);
//    de.setAddRemovePointsEnabled(true);
    de.addShiftBehavior(de.setAddRemovePointsEnabled, de.isAddRemovePointsEnabled);
    de.setRotateEnabled(true);
//    de.setRotationAngle(Math.PI / 4);
    webgram.addDrawingElement(de);

    socket = new Webgram.Connectors.Socket(function (socket) {
        return new Webgram.Geometry.Point(-10, -20);
    });
    socket.radius = 20;
    
    socket2 = new Webgram.Connectors.Socket(function (socket) {
        return new Webgram.Geometry.Point(-10, -20);
    });
    socket2.radius = 20;
    
    de2 = new MyRectangularElement('myRectangularElement1', 101, 101);
//    webgram.addDrawingElement(de2);
    de2.setEditEnabled(true);
    de2.setSnapToAngleEnabled(true);
    de2.setSnapExternallyEnabled(true);
    de2.setSnapInternallyEnabled(true);
    de2.setRotateEnabled(true);
    de2.addControlPoint(socket);
    
    de3 = new MyRectangularElement('myRectangularElement2', 101, 101);
//    webgram.addDrawingElement(de3);
    de3.setEditEnabled(true);
    de3.setSnapToAngleEnabled(true);
    de3.setSnapExternallyEnabled(true);
    de3.setSnapInternallyEnabled(true);
    de3.setRotateEnabled(true);
    de3._setLocation(new Webgram.Geometry.Point(140, 100), false);
    //de3.addControlPoint(socket2);
    
    //de.getControlPoints()[0].connect(socket);
    //de.getControlPoints()[2].connect(socket2);
    
//    de.setPreserveAspectRatioEnabled(true);
//    s.flipHorizontally();
//    de.setFillStyle(Webgram.Styles.createFillStyle({
//        colors: ['red', 'blue'],
//        gradientPoint1: undefined,
//        gradientPoint2: null,
//        gradientRadius1: undefined,
//        gradientRadius2: undefined
//    }));
    
//    de.setGradientEditEnabled(true);
    
    de2._setLocation(new Webgram.Geometry.Point(0, 200), false);

//    webgram.createDrawingControl.setDrawingElementClass(MyRectangularElement);
//    webgram.createDrawingControl.activate();
    
    de._setPoint(1, de.getPoints()[1], true);
    
    pep = new PolyEndPoint();
    
    line1 = new Webgram.Geometry.Line(1, 0);
    line2 = new Webgram.Geometry.Line(Infinity, 100);
    inters = line1.intersectLine(line2);
}
