
var tests = [];

function TestError(message) {
    this.message = message;
}


function registerTest(component, category, name, kase, funcs) {
    var test = {
        component: component,
        category: category,
        name: name,
        kase: kase,
        setUp: funcs.setUp,
        tearDown: funcs.tearDown,
        run: funcs.run
    };
    
    tests.push(test);
}

function _addTestResult(component, category, name, kase, result, message) {
    var componentSpan = document.createElement('span');
    componentSpan.innerHTML = component;
    
    var categorySpan = document.createElement('span');
    categorySpan.innerHTML = category;
    
    var nameSpan = document.createElement('span');
    nameSpan.innerHTML = name;
    
    var caseSpan = document.createElement('span');
    if (kase) {
        caseSpan.innerHTML = kase;
    }
    
    var resultSpan = document.createElement('span');
    resultSpan.innerHTML = result ? 'passed' : 'failed';
    resultSpan.style.color = result ? 'green' : 'red';
    
    var messageSpan = document.createElement('span');
    if (message) {
        messageSpan.innerHTML = message;
    }
    
    var componentTd = document.createElement('td');
    componentTd.appendChild(componentSpan);
    componentTd.className = 'component';
    
    var categoryTd = document.createElement('td');
    categoryTd.appendChild(categorySpan);
    categoryTd.className = 'category';
    
    var nameTd = document.createElement('td');
    nameTd.appendChild(nameSpan);
    nameTd.className = 'name';
    
    var caseTd = document.createElement('td');
    caseTd.appendChild(caseSpan);
    caseTd.className = 'case';
    
    var resultTd = document.createElement('td');
    resultTd.appendChild(resultSpan);
    resultTd.className = 'result';
    
    var messageTd = document.createElement('td');
    messageTd.appendChild(messageSpan);
    messageTd.className = 'message';
    
    var testResultRow = document.createElement('tr');
    testResultRow.appendChild(componentTd);
    testResultRow.appendChild(categoryTd);
    testResultRow.appendChild(nameTd);
    testResultRow.appendChild(caseTd);
    testResultRow.appendChild(resultTd);
    testResultRow.appendChild(messageTd);
    
    var testResultsTable = document.getElementById('testResultsTable');
    testResultsTable.appendChild(testResultRow);
    
    var testResultsDiv = document.getElementById('testResultsDiv');
    testResultsDiv.parentElement.scrollTop = testResultsDiv.parentElement.scrollHeight;
}

function runTests() {
    var dummyHtmlElement = document.getElementById('dummy');
    
    function runTest() {
        var test = tests.shift();
        var result = false;
        var message = null;
        
        Webgram._dynamicLoad = false;
        
        /* create new mock canvases */
        var mainCanvas = new MockCanvas(600, 400);
        var miniCanvas = new MockCanvas(180, 120);
        
        var mainWebgram = new Webgram(dummyHtmlElement, mainCanvas);
        var miniWebgram = new Webgram.MiniWebgram(dummyHtmlElement, miniCanvas);
        mainWebgram.setMiniWebgram(miniWebgram);
        
        window.webgram = mainWebgram;
        
        if (test.setUp) {
            test.setUp();
        }
        
        if (test.run) {
            try {
                test.run(mainWebgram, miniWebgram);
                result = true;
            }
            catch (e) {
                if (e instanceof TestError) {
                    message = e.message;
                }
                else {
                    message = '' + e;
                    console.trace();
                }
            }
        }
        
        if (test.tearDown) {
            test.tearDown();
        }
        
        _addTestResult(test.component, test.category, test.name, test.kase, result, message);
        
        
        if (tests.length) {
            setTimeout(runTest, 1);
        }
    }
    
    runTest();
}

function onBodyLoad() {
    runTests();
}
