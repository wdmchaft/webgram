
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
        this.drawRect(this.getBaseRectangle());
        this.paint();
        this.drawText(this.text);
    }
};

Webgram.Class('MockRectangleElement', Webgram.DrawingElements.RectangularElement);


MockConnector = function (id, x1, y1, x2, y2) {
    var point1 = new Webgram.Geometry.Point(x1, y1);
    var point2 = new Webgram.Geometry.Point(x2, y2);
    
    Webgram.Connectors.Connector.call(this, id, [point1, point2]);
};

MockConnector.prototype = {
};

Webgram.Class('MockConnector', Webgram.Connectors.Connector);
