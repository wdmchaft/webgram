
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
        
        drawingElement.onKeyPress.bind(function (key, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.handleKeyPress(13, {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onKeyDown', 'DE selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        drawingElement.onKeyDown.bind(function (key, modifiers) {
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
        
        webgram.handleKeyDown(13, {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onKeyDown', 'DE not selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        
        drawingElement.onKeyDown.bind(function (key, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.handleKeyDown(13, {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onKeyUp', 'DE selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        drawingElement.onKeyUp.bind(function (key, modifiers) {
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
        
        webgram.handleKeyUp(13, {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onKeyUp', 'DE not selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        
        drawingElement.onKeyUp.bind(function (key, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.handleKeyUp(13, {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onMouseDown', 'DE hovered', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseDown.bind(function (point, button, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
            }
            if (button !== 1) {
                throw new TestError('button != 1');
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
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50));
        webgram.handleMouseDown(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50), 1,
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseDown', 'DE selected, mouse outside', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        
        drawingElement.onMouseDown.bind(function (point, button, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        webgram.getActiveDrawingControl().setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseDown(new Webgram.Geometry.Point(50, 50), 1,
                {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onMouseDown', 'DE not hovered', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        
        drawingElement.onMouseDown.bind(function (point, button, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(0, 0));
        webgram.handleMouseDown(new Webgram.Geometry.Point(0, 0), 1,
                {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onMouseUp', 'DE hovered', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseUp.bind(function (point, button, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
            }
            if (button !== 1) {
                throw new TestError('button != 1');
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
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50));
        webgram.handleMouseUp(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50), 1,
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseUp', 'DE selected, mouse outside', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        
        drawingElement.onMouseUp.bind(function (point, button, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        webgram.getActiveDrawingControl().setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseUp(new Webgram.Geometry.Point(50, 50), 1,
                {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onMouseUp', 'DE not hovered', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        
        drawingElement.onMouseUp.bind(function (point, button, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(0, 0));
        webgram.handleMouseUp(new Webgram.Geometry.Point(0, 0), 1,
                {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onMouseMove', 'DE selected, mouse inside', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseMove.bind(function (point, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
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
        webgram.setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50),
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseMove', 'DE selected, mouse outside', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        
        drawingElement.onMouseMove.bind(function (point, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        webgram.setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(0, 0),
                {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onMouseMove', 'DE not selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseMove.bind(function (point, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
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
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50),
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseScroll', 'DE selected, mouse inside', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseScroll.bind(function (point, up, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
            }
            if (up !== true) {
                throw new TestError('up != true');
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
        webgram.setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50));
        webgram.handleMouseScroll(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50), true,
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseScroll', 'DE selected, mouse outside', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        
        drawingElement.onMouseScroll.bind(function (point, up, modifiers) {
            throw new TestError('event triggered');
        });
        
        webgram.addDrawingElement(drawingElement);
        webgram.setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseScroll(new Webgram.Geometry.Point(0, 0), true,
                {'alt': true, 'ctrl': true, 'shift': true});
    }
});

registerTest('drawing element', 'events', 'onMouseScroll', 'DE not selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseScroll.bind(function (point, up, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
            }
            if (up !== true) {
                throw new TestError('up != true');
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
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50));
        webgram.handleMouseScroll(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50), true,
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseEnter', 'DE not selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseEnter.bind(function (point, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
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
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50),
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseEnter', 'DE selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseEnter.bind(function (point, modifiers) {
            if (point.x !== 0) {
                throw new TestError('point.x != 0');
            }
            if (point.y !== 0) {
                throw new TestError('point.y != 0');
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
        webgram.setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50),
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseLeave', 'DE not selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseLeave.bind(function (modifiers) {
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
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50));
        webgram.handleMouseMove(new Webgram.Geometry.Point(0, 0),
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('drawing element', 'events', 'onMouseLeave', 'DE selected', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 201, 101);
        var called = false;
        
        drawingElement.onMouseLeave.bind(function (modifiers) {
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
        webgram.setSelectedDrawingElements([drawingElement]);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(webgram.getWidth() / 2 + 100, webgram.getHeight() / 2 + 50));
        webgram.handleMouseMove(new Webgram.Geometry.Point(0, 0),
                {'alt': true, 'ctrl': true, 'shift': true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

