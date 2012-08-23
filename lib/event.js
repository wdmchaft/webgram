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
 * @class Manages the connection (binding) between a library <em>event</em>
 * and one or more <em>handlers</em>. Events can be of any origin and kind,
 * not only those that come from the mouse or the keyboard.
 * @param {String} name a name given to the event (helps when debugging)
 * @param {Object} object the object that owns and triggers this kind of events
 */
Webgram.Event = function (name, object) {
    /**
     * A name given to the event, mostly for debugging purposes.
     * @type String
     */
    this.name = name;
    
    /**
     * The object that owns and triggers this kind of events
     * @type Object
     */
    this.object = object;
    
    /**
     * A list of functions that will handle the events.
     * @see Webgram.Event#bind
     * @type Array
     */
    this.handlers = [];
};

Webgram.Event.prototype = {
    /**
     * Adds a handler to the event. This function doesn't check
     * for duplicates, so if a handler is bound more times to the same
     * event, it will be called more times when the event is triggered.<br>
     * The handler functions are called with <tt>this</tt> set to the owner
     * object of the event ({@link Webgram.Event#object}).<br>
     * Any additional arguments passed to this method will be passed to
     * the handler function when the event is triggered.
     * @param {Function} handler the function to bind as handler to the event
     */
    bind: function (handler) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        
        this.handlers.push({'func': handler, 'args': args});
    },
    
    /**
     * Removes a handler from the event.
     * @param {Function} handler the handler function to remove
     */
    unbind: function (handler) {
        if (handler) {
            var dontRemove = [];
            for (var i = 0; i < this.handlers.length; i++) {
                var h = this.handlers[i];
                if (h.func !== handler) {
                    dontRemove.push(h);
                }
            }
            
            this.handlers = dontRemove;
        }
        else {
            this.handlers = [];
        }
    },
    
    /**
     * Triggers the event. All the handler functions will be called
     * in the order of binding, until one of them returns <tt>false</tt>.
     * @returns {any} the last non-<tt>false</tt> value returned by the handlers
     */
    trigger: function () {
        var globalResult = undefined;
        
        for (var i = 0; i <  this.handlers.length; i++) {
            var handler = this.handlers[i];
            var args = [];
            for (var j = 0; j < arguments.length; j++) {
                args.push(arguments[j]);
            }
            args = args.concat(handler.args);
            
            var result = handler.func.apply(this.object, args);
            if (result != null) {
                globalResult = result; 
            }
            
            if (result === false) {
                /* returning false from an event handler will stop the event from further being treated */
                break;
            }
        }
        
        return globalResult;
    },
    
    /**
     * Returns a string representation of this event.
     * @returns {String} the string representation of this event
     */
    toString: function () {
        return this.constructor.toString() + '(' + this.name + ')';
    }
};

Webgram.Class('Webgram.Event');
