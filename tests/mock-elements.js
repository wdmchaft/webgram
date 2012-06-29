
MockRectangleElement = function (id, x, y, width, height) {
    Webgram.DrawingElements.RectangularElement.call(this, id, x, y, width, height);
    
    this.socket = new Webgram.Connectors.Socket(function () {
        return new Webgram.Geometry.Point(0, 0);
    });
    this.addSocket(this.socket);
    
    this.text = 'Rectangle';
};

MockRectangleElement.prototype = {
    draw: function () {
        this.drawRect(this.getDrawingRectangle());
        this.paint();
        this.drawText(this.text);
    }
};

Webgram.Class('MockRectangleElement', Webgram.DrawingElements.RectangularElement);
