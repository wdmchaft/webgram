
    /* events */

registerTest('webgram', 'events', 'onDraw', null, {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        webgram.onDraw.bind(function () {
            called = true;
        });
        
        webgram.redraw(true);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onZoom', 'zoom in with mouse', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        var zoomLevel = webgram.getZoomLevel();

        webgram.onZoom.bind(function (newZoomLevel) {
            if (newZoomLevel <= zoomLevel) {
                throw new TestError('newZoomLevel <= ' + zoomLevel);
            }
            
            called = true;
        });
        
        webgram.handleMouseScroll(new Webgram.Geometry.Point(300, 200), true, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onZoom', 'zoom out with mouse', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        var zoomLevel = webgram.getZoomLevel();

        webgram.onZoom.bind(function newZoomLevel() {
            if (newZoomLevel >= zoomLevel) {
                throw new TestError('newZoomLevel >= ' + zoomLevel);
            }
            
            called = true;
        });
        
        webgram.handleMouseScroll(new Webgram.Geometry.Point(300, 200), false, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onZoom', 'zoom in with setZoomLevel()', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        var zoomLevel = webgram.getZoomLevel();

        webgram.onZoom.bind(function (newZoomLevel) {
            if (newZoomLevel <= zoomLevel) {
                throw new TestError('newZoomLevel <= ' + zoomLevel);
            }
            
            called = true;
        });
        
        webgram.setZoomLevel(webgram.getZoomLevel() + 1);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onZoom', 'zoom out with setZoomLevel()', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        var zoomLevel = webgram.getZoomLevel();

        webgram.onZoom.bind(function (newZoomLevel) {
            if (newZoomLevel >= zoomLevel) {
                throw new TestError('newZoomLevel >= ' + zoomLevel);
            }
            
            called = true;
        });
        
        webgram.setZoomLevel(webgram.getZoomLevel() - 1);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onPan', 'pan with setVisibleCenter()', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        webgram.onPan.bind(function (newCenter) {
            if (newCenter.x !== 100 || newCenter.y !== 100) {
                throw new TestError('newCenter.x !== ' + 100 + ' || newCenter.y !== ' + 100);
            }
            
            called = true;
        });
        
        webgram.setVisibleCenter(new Webgram.Geometry.Point(100, 100));
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onPan', 'pan with mouse', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        webgram.onPan.bind(function (newCenter) {
            if (newCenter.x !== 100 || newCenter.y !== 100) {
                throw new TestError('newCenter.x !== ' + 100 + ' || newCenter.y !== ' + 100);
            }
            
            called = true;
        });
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(300, 200), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(300, 200), 2, {});
        webgram.handleMouseMove(new Webgram.Geometry.Point(200, 100), {});
        webgram.handleMouseUp(new Webgram.Geometry.Point(400, 300), 2, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementAdd', 'one element', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 200, 100);
        var called = false;
        
        webgram.onDrawingElementAdd.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        webgram.addDrawingElement(drawingElement);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementAdd', 'CE/DE, CE added first', {
    run: function (webgram, miniWebgram) {
        var containerElement = new Webgram.DrawingElements.ContainerElement('containerElement', 0, 0, 200, 100);
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        webgram.onDrawingElementAdd.bind(function (de) {
            if (de !== containerElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        webgram.addDrawingElement(containerElement);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
        
        called = false;
        webgram.onDrawingElementAdd.unbind();
        webgram.onDrawingElementAdd.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });

        containerElement.addDrawingElement(drawingElement);

        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementAdd', 'CE/DE, DE added first', {
    run: function (webgram, miniWebgram) {
        var containerElement = new Webgram.DrawingElements.ContainerElement('containerElement', 0, 0, 200, 100);
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var des = [containerElement, drawingElement];
        
        containerElement.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementAdd.bind(function (de) {
            if (de !== des[0]) {
                throw new TestError('de != ' + des[0]);
            }
            
            des.shift();
        });
        
        webgram.addDrawingElement(containerElement);
        
        if (des.length > 0) {
            throw new TestError('event not triggered 2 times');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementRemove', 'one element', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 200, 100);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementRemove.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        webgram.remDrawingElement(drawingElement);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementRemove', 'CE/DE, DE removed first', {
    run: function (webgram, miniWebgram) {
        var containerElement = new Webgram.DrawingElements.ContainerElement('containerElement', 0, 0, 200, 100);
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        webgram.addDrawingElement(containerElement);
        containerElement.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementRemove.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        containerElement.remDrawingElement(drawingElement);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
        
        called = false;
        webgram.onDrawingElementRemove.unbind();
        webgram.onDrawingElementRemove.bind(function (de) {
            if (de !== containerElement) {
                throw new TestError('de != ' + containerElement);
            }
            
            called = true;
        });

        webgram.remDrawingElement(containerElement);

        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementRemove', 'CE/DE, CE removed first', {
    run: function (webgram, miniWebgram) {
        var containerElement = new Webgram.DrawingElements.ContainerElement('containerElement', 0, 0, 200, 100);
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var des = [drawingElement, containerElement];
        
        containerElement.addDrawingElement(drawingElement);
        webgram.addDrawingElement(containerElement);
        
        webgram.onDrawingElementRemove.bind(function (de) {
            if (de !== des[0]) {
                throw new TestError('de != ' + des[0]);
            }
            
            des.shift();
        });
        
        webgram.remDrawingElement(containerElement);
        
        if (des.length > 0) {
            throw new TestError('event not triggered 2 times');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'one element, moveTo', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        drawingElement.moveTo(new Webgram.Geometry.Point(100, 100));
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'CE/DE, moveTo', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var containerElement = new Webgram.DrawingElements.ContainerElement('containerElement', 0, 0, 200, 100);
        var called = false;
        
        webgram.addDrawingElement(containerElement);
        containerElement.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        drawingElement.moveTo(new Webgram.Geometry.Point(100, 100));
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'CE/DE, change a shape point', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var containerElement = new Webgram.DrawingElements.ContainerElement('containerElement', 0, 0, 200, 100);
        var called = false;
        
        webgram.addDrawingElement(containerElement);
        containerElement.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        drawingElement.setBottomRight(new Webgram.Geometry.Point(200, 200));
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'CE/DE, setRotationAngle', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var containerElement = new Webgram.DrawingElements.ContainerElement('containerElement', 0, 0, 200, 100);
        var called = false;
        
        webgram.addDrawingElement(containerElement);
        containerElement.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        drawingElement.setRotationAngle(Math.PI / 3);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'connector, moveTo', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 100, 100);
        var connector = new MockConnector('connector', -100, -100, 50, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        webgram.addDrawingElement(connector);
        
        drawingElement.socket.connect(connector.getEndPoints()[0]);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de == connector) {
                called = true;
            }
        });
        
        drawingElement.moveTo(100, 100);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'connector, setRotationAngle', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 100, 100);
        var connector = new MockConnector('connector', -100, -100, 50, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        webgram.addDrawingElement(connector);
        
        drawingElement.socket.connect(connector.getEndPoints()[0]);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de == connector) {
                called = true;
            }
        });
        
        drawingElement.setRotationAngle(Math.PI / 3);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'setStrokeStyle', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        drawingElement.setStrokeStyle(Webgram.Styles.getStrokeStyle('default'));
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'setFillStyle', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        drawingElement.setFillStyle(Webgram.Styles.getFillStyle('default'));
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementChange', 'setTextStyle', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 50, 50, 100, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        
        webgram.onDrawingElementChange.bind(function (de) {
            if (de !== drawingElement) {
                throw new TestError('de != ' + drawingElement);
            }
            
            called = true;
        });
        
        drawingElement.setTextStyle(Webgram.Styles.getTextStyle('default'));
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementIndexChange', 'addDrawingElement', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement1);
        
        webgram.onDrawingElementIndexChange.bind(function (de, index) {
            if (de !== drawingElement1) {
                throw new TestError('de != ' + drawingElement);
            }
            
            if (index !== 1) {
                throw new TestError('index != 1');
            }
            
            called = true;
        });
        
        webgram.addDrawingElement(drawingElement2, 0);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementIndexChange', 'remDrawingElement', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;
        
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        
        webgram.onDrawingElementIndexChange.bind(function (de, index) {
            if (de !== drawingElement2) {
                throw new TestError('de != ' + drawingElement2);
            }
            
            if (index !== 0) {
                throw new TestError('index != 0');
            }
            
            called = true;
        });
        
        webgram.remDrawingElement(drawingElement1);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementIndexChange', 'setDrawingElementIndex', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var callCount = 0;
        
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        
        webgram.onDrawingElementIndexChange.bind(function (de, index) {
            if (callCount === 0) {
                if (de !== drawingElement2) {
                    throw new TestError('de != ' + drawingElement2);
                }
                
                if (index !== 0) {
                    throw new TestError('index != 0');
                }
            }
            else {
                if (de !== drawingElement1) {
                    throw new TestError('de != ' + drawingElement1);
                }
                
                if (index !== 1) {
                    throw new TestError('index != 1');
                }
            }
            
            callCount++;
        });
        
        webgram.setDrawingElementIndex(drawingElement1, 1);
        
        if (callCount != 2) {
            throw new TestError('event not triggered 2 times');
        }
    }
});

registerTest('webgram', 'events', 'onDrawingElementInteract', 'connect', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 50, 50);
        var connector = new Webgram.Connectors.Connector('connector', [new Webgram.Geometry.Point(-100, -100), new Webgram.Geometry.Point(25, 25)]);
        var called = false;
        
        webgram.addDrawingElement(drawingElement);
        webgram.addDrawingElement(connector);
        
        webgram.onDrawingElementInteract.bind(function (de1, de2, type) {
            if (de1 !== connector) {
                throw new TestError('de1 != ' + connector);
            }
            
            if (de2 !== drawingElement) {
                throw new TestError('de2 != ' + drawingElement);
            }
            
            if (type !== 'connect') {
                throw new TestError('type != "connect"');
            }
            
            called = true;
        });
        
        /* connect */
        var polyControlPoint = connector.getPolyControlPoints()[1];
        polyControlPoint.move(polyControlPoint.getAnchor());
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'select one element', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 100, 100);
        var called = false;

        webgram.addDrawingElement(drawingElement);
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 1) {
                throw new TestError('des.length != 1');
            }
            
            if (des[0] !== drawingElement) {
                throw new TestError('des[0] != ' + drawingElement);
            }
            
            called = true;
        });
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(320, 220), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(320, 220), 1, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'deselect one element', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 100, 100);
        var called = false;

        webgram.addDrawingElement(drawingElement);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(320, 220), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(320, 220), 1, {});
        webgram.handleMouseUp(new Webgram.Geometry.Point(320, 220), 1, {});
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 0) {
                throw new TestError('des.length != 0');
            }
            
            called = true;
        });
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(0, 0), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(0, 0), 1, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'select multiple elements', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('multipleSelectionEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            
            if (des[0] !== drawingElement1) {
                throw new TestError('des[0] != ' + drawingElement1);
            }
            
            if (des[1] !== drawingElement2) {
                throw new TestError('des[0] != ' + drawingElement2);
            }
            
            called = true;
        });
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(200, 200), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(200, 200), 1, {});
        webgram.handleMouseMove(new Webgram.Geometry.Point(500, 500), {});
        webgram.handleMouseUp(new Webgram.Geometry.Point(500, 500), 1, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'deselect multiple elements', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('multipleSelectionEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(200, 200), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(200, 200), 1, {});
        webgram.handleMouseMove(new Webgram.Geometry.Point(500, 500), {});
        webgram.handleMouseUp(new Webgram.Geometry.Point(500, 500), 1, {});
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 0) {
                throw new TestError('des.length != 0');
            }
            
            called = true;
        });
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(0, 0), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(0, 0), 1, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'remove single element', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 100, 100);
        var called = false;

        webgram.addDrawingElement(drawingElement);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(320, 220), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(320, 220), 1, {});
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 0) {
                throw new TestError('des.length != 0');
            }
            
            called = true;
        });
        
        webgram.remDrawingElement(drawingElement);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'remove multiple elements', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('multipleSelectionEnabled', true);
        webgram.setSetting('actionsEnabled', true);
        
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        
        webgram.handleMouseMove(new Webgram.Geometry.Point(200, 200), {});
        webgram.handleMouseDown(new Webgram.Geometry.Point(200, 200), 1, {});
        webgram.handleMouseMove(new Webgram.Geometry.Point(500, 500), {});
        webgram.handleMouseUp(new Webgram.Geometry.Point(500, 500), 1, {});
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 0) {
                throw new TestError('des.length != 0');
            }
            
            called = true;
        });
        
        webgram.handleKeyDown(46, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'setSelectedDrawingElements([de])', {
    run: function (webgram, miniWebgram) {
        var drawingElement = new MockRectangleElement('drawingElement', 0, 0, 50, 50);
        var called = false;

        webgram.addDrawingElement(drawingElement);
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 1) {
                throw new TestError('des.length != 1');
            }
            
            if (des[0] !== drawingElement) {
                throw new TestError('des[0] != ' + drawingElement);
            }
            
            called = true;
        });
        
        webgram.setSelectedDrawingElements([drawingElement]);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'setSelectedDrawingElements([de1, de2])', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('multipleSelectionEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 2) {
                throw new TestError(des.length + ' != ' + 2);
            }
            
            if (des[0] !== drawingElement1) {
                throw new TestError('des[0] != ' + drawingElement1);
            }
            
            if (des[1] !== drawingElement2) {
                throw new TestError('des[1] != ' + drawingElement2);
            }
            
            called = true;
        });
        
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onSelectionChange', 'setSelectedDrawingElements([])', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('multipleSelectionEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        webgram.onSelectionChange.bind(function (des) {
            if (des.length !== 0) {
                throw new TestError('des.length != 0');
            }
            
            called = true;
        });
        
        webgram.setSelectedDrawingElements([]);
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onClipboardChange', 'setClipboard', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        webgram.onClipboardChange.bind(function (clipboard) {
            if (clipboard.type != 'text') {
                throw new TestError('clipboard.type != "text"');
            }
            if (clipboard.content != 'dummy text') {
                throw new TestError('clipboard.content != "dummy text"');
            }
            
            called = true;
        });
        
        webgram.setClipboard('text', 'dummy text');
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onClipboardChange', 'clearClipboard', {
    run: function (webgram, miniWebgram) {
        var called = false;
        
        webgram.onClipboardChange.bind(function (clipboard) {
            if (clipboard.type != null) {
                throw new TestError('clipboard.type != null');
            }
            if (clipboard.content != null) {
                throw new TestError('clipboard.content != null');
            }
            
            called = true;
        });
        
        webgram.clearClipboard();
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onCopyAction', 'by keyboard', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        webgram.onCopyAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (des[0] !== drawingElement1) {
                throw new TestError('des[0] != ' + drawingElement1);
            }
            if (des[1] !== drawingElement2) {
                throw new TestError('des[1] != ' + drawingElement2);
            }
            if (!byKeyboard) {
                throw new TestError('byKeyboard is false');
            }
            
            called = true;
        });
        
        webgram.handleKeyDown(67, {ctrl: true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onCopyAction', 'by program', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        webgram.onCopyAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (des[0] !== drawingElement1) {
                throw new TestError('des[0] != ' + drawingElement1);
            }
            if (des[1] !== drawingElement2) {
                throw new TestError('des[1] != ' + drawingElement2);
            }
            if (byKeyboard) {
                throw new TestError('byKeyboard is true');
            }
            
            called = true;
        });
        
        webgram.doCopyAction();
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onPasteAction', 'by keyboard', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        webgram.doCopyAction();
        
        webgram.onPasteAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (!byKeyboard) {
                throw new TestError('byKeyboard is false');
            }
            
            called = true;
        });
        
        webgram.handleKeyDown(86, {ctrl: true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onPasteAction', 'by program', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        webgram.doCopyAction();
        
        webgram.onPasteAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (byKeyboard) {
                throw new TestError('byKeyboard is true');
            }
            
            called = true;
        });
        
        webgram.doPasteAction();
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDuplicateAction', 'by keyboard', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        webgram.onDuplicateAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (!byKeyboard) {
                throw new TestError('byKeyboard is false');
            }
            
            called = true;
        });
        
        webgram.handleKeyDown(68, {ctrl: true});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDuplicateAction', 'by program', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        webgram.onDuplicateAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (byKeyboard) {
                throw new TestError('byKeyboard is true');
            }
            
            called = true;
        });
        
        webgram.doDuplicateAction();
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDeleteAction', 'by keyboard', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        webgram.onDeleteAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (des[0] !== drawingElement1) {
                throw new TestError('des[0] != ' + drawingElement1);
            }
            if (des[1] !== drawingElement2) {
                throw new TestError('des[1] != ' + drawingElement2);
            }
            if (!byKeyboard) {
                throw new TestError('byKeyboard is false');
            }
            
            called = true;
        });
        
        webgram.handleKeyDown(46, {});
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

registerTest('webgram', 'events', 'onDeleteAction', 'by program', {
    run: function (webgram, miniWebgram) {
        var drawingElement1 = new MockRectangleElement('drawingElement1', 0, 0, 50, 50);
        var drawingElement2 = new MockRectangleElement('drawingElement2', 100, 0, 50, 50);
        var called = false;

        webgram.setSetting('actionsEnabled', true);
        webgram.addDrawingElement(drawingElement1);
        webgram.addDrawingElement(drawingElement2);
        webgram.setSelectedDrawingElements([drawingElement1, drawingElement2]);
        
        webgram.onDeleteAction.bind(function (des, byKeyboard) {
            if (des.length !== 2) {
                throw new TestError('des.length != 2');
            }
            if (des[0] !== drawingElement1) {
                throw new TestError('des[0] != ' + drawingElement1);
            }
            if (des[1] !== drawingElement2) {
                throw new TestError('des[1] != ' + drawingElement2);
            }
            if (byKeyboard) {
                throw new TestError('byKeyboard is true');
            }
            
            called = true;
        });
        
        webgram.doDeleteAction();
        
        if (!called) {
            throw new TestError('event not triggered');
        }
    }
});

