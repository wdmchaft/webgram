
/*
 * TO DO:
 *  mscontainer:
 *   * add some kind of change protection when in multiple selection
 *   * merge duplicate din msce?
 *   * parents in json
 *  unicode text support
 *  RectangularElement.fit could still be improved
 *  move min|maxX|Y crappy code to a common function
 *  PolyElement snapping to angle feedback does not take into account the element's rotationAngle 
 *  add a functionality to snap a DE to current location (and use it for connectors)
 *  does fine moving work?
 *  test various events
 *  add support for hatching and texture fill styles
 *  add support for shadows 
 *  make rulers more configurable
 *  solve TODOs
 *  search for //
 *  Replace the :special: and :local: id crap with something more suitable
 *  remove testwg.js and testwg.html
 *  add some icons for common action menu items
 */

var webgram = null;
var miniWebgram = null;
var myAngle = 0;

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
    
    getBoundingRectangle: function (transformed) {
        var rectangle = new Webgram.Geometry.Rectangle(
                this.point1.x, this.point1.y,
                this.point2.x, this.point2.y);
        
        if (transformed) {
            rectangle = this.translateDirect(rectangle);
        }
        
        return rectangle;
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
        
        this.name = '';
//        this.setFillStyle(this.getFillStyle().replace({colors: ['rgba(0,0,0,0.3)']}));
        this.setTextStyle(this.getTextStyle().replace({'justify': 'cc'}));
    },

    draw: function () {
        this.drawRect(this.getBoundingRectangle());
        this.paint();
        
        //var thisIndex = this._parent.getDrawingElementIndex(this);
        //var prevName = this._prevSibling ? this._prevSibling.name : '?';
        
        this.drawText(this.name + '\n' + (this.rotationAngleToJson() * 180 / Math.PI).toFixed(0));
        //this.drawText(this.name + '\n' + (this.locationToJson().x) + ', ' + (this.locationToJson().y));
        //this.drawText(this.name, new Webgram.Geometry.Rectangle(-50, -25, 0, 0), myAngle);

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
        return Webgram.DrawingElements.PolyElement.PolyEndPoint;
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
    var miniCanvasElement = document.getElementById('miniCanvas');
    var miniCanvas = new Webgram.Canvas(miniCanvasElement.getContext('2d'));
    
    webgram = new Webgram(canvasElement, canvas);
    webgram.enableKeyMouseHandlers();
    webgram.setSetting('multipleSelectionEnabled', true);
//    webgram.setSetting('snapGrid', {sizeX: 25, sizeY: 25});
//    webgram.setSetting('snapGrid', {sizeX: 5, sizeY: 5});
    webgram.setSetting('snapGrid', null);
    webgram.setSetting('mainGrid', {sizeX: 25, sizeY: 25});
    webgram.setSetting('snapAngle', Math.PI / 4);
//    webgram.setSetting('snapDistance', null);
    
    letters = ['Abc', 'Bcd', 'C', 'D', 'E', 'F'];
    
    des = []
    for (var i = 0; i < 2; i++) {
        de2 = new MyRectangularElement('myRectangularElement1', 101, 76);
        de2.setEditEnabled(true);
        de2.setRotateEnabled(true);
        de2.setSnapToAngleEnabled(true);
        de2.setSnapExternallyEnabled(true);
        de2.setSnapInternallyEnabled(true);
        de2._setLocation(new Webgram.Geometry.Point(i * 150, i), false);
        de2.name = letters[i];
        
        webgram.addDrawingElement(de2);
        des[i] = de2;
    }
    
    webgram.setMiniWebgram(miniCanvasElement, miniCanvas);
    
    de2.onKeyDown.bind(function (key) {
        if (key === 27) {
            webgram.textDrawingControl.configure(de2, 'name', new Webgram.Geometry.Rectangle(-50, -25, 0, 0), null, myAngle);
            webgram.textDrawingControl.activate();
        }
    });
}
