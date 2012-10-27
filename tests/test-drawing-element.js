
    /* events */

registerTest('drawing element', 'events', 'onKeyPress', 'DE selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        drawingElement.onKeyPress.bind(function (key, modifiers) {
            if (key !== 13) {
                throw new TestError('key != 13');
            }
            if (!modifiers.alt) {
                throw new TestError('modifiers.alt != true');
            }
            if (!modifiers.ctrl) {
                throw new TestError('modifiers.ctrl != true');
            }
            if (!modifiers.shift) {
                throw new TestError('modifiers.shift != true');
            }
            
            called = true;
        });
        
        webgram.addDrawingElement(drawingElement);
        webgram.getActiveDrawingControl().setSelectedDrawingElements([drawingElement]);
        
        webgram.handleKeyPress(13, {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onKeyPress', 'DE not selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        drawingElement.onKeyPress.bind(function (key, modifiers) {
            called = true;
        });
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.handleKeyPress(13, {'alt': true, 'ctrl': true, 'shift': true});
        
        if (called) {
            throw new TestError('event triggered');
        }
    }
});
