/*
 * Copyright (c) 2012 Calin Crisan <ccrisan@gmail.com>
 * 
 * This file is part of Webgram.
 * 
 * Webgram is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Webgram is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with Webgram.  If not, see <http://www.gnu.org/licenses/>.
 */


/**
 * Recursively print the tree of elements of this webgram.
 * @param {Function} printFunc a function to call for each
 *  visited DE, with the following arguments: (level, drawingElement);
 *  set to null to use a default console.log() based function
 */
Webgram.prototype.printElementTree = function (printFunc) {
    if (printFunc == null) {
        printFunc = function (level, drawingElement) {
            var text = '';
            for (var i = 0; i < level; i++) {
                text += '    ';
            }
            
            text += drawingElement;
            
            console.log(text);
        };
    }
    
    function printElementTreeRec(level, drawingElement) {
        printFunc(level, drawingElement);
        
        if (drawingElement.getDrawingElements) {
            var drawingElements = drawingElement.getDrawingElements();
            
            for (var i = 0; i < drawingElements.length; i++) {
                printElementTreeRec(level + 1, drawingElements[i]);
            }
        }
    };
    
    printElementTreeRec(0, this.rootContainer);
};
