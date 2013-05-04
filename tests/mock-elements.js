
MockRectangleElement = Webgram.DrawingElements.RectangularElement.extend({
    initialize: function MockRectangleElement(id, x, y, width, height) {
        this.super(id, x, y, width, height);
        
        this.socket = new Webgram.Connectors.Socket(function () {
            return new Webgram.Geometry.Point(0, 0);
        });
        this.addSocket(this.socket);
        
        this.text = 'Rectangle';
    },

    draw: function () {
        this.drawRect(this.getBaseRectangle());
        this.paint();
        this.drawText(this.text);
    }
});

MockConnector = Webgram.Connectors.Connector.extend({
    initialize: function MockConnector(id, x1, y1, x2, y2) {
        var point1 = new Webgram.Geometry.Point(x1, y1);
        var point2 = new Webgram.Geometry.Point(x2, y2);
        
        this.super(id, [point1, point2]);
    }
});
