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


Webgram.ImageStore = Webgram.Class.extend( /** @lends Webgram.ImageStore.prototype */ {
    /**
     * A store for JavaScript Image objects.
     * This class has an instance that behaves like a singleton, {@link Webgram.imageStore},
     * that should be used when loading and drawing images with webgram.
     * @constructs Webgram.ImageStore
     */
    initialize: function ImageStore(webgram) {
        this._webgram = webgram;
        this._images = {};
    },

    /**
     * Creates a JavaScript image object inside the store
     * and assigns it a name (an alias). If another image
     * with the given name already exists, it will be overwritten.
     * This method loads the image asynchronously; therefore, the image
     * will not be available right when the call returns.
     * @param {String} name the name to assign to the image
     * @param {String} url the URL of the image to load
     * @param {Function} onLoad a function to be called when the image is loaded,
     * or <tt>null</tt>/<tt>undefined</tt>; the function will be called with
     * <tt>name</tt>, <tt>url</tt> and <tt>image</tt> as arguments
     */
    load: function (name, url, onLoad) {
        var imageStore = this;
        
        this._images[name] = {
            name: name,
            url: url,
            content: null,
            size: null
        };
        
        var image = new Image();
        image.src = url;
        image.onload = function () {
            imageStore._images[name].name = name;
            imageStore._images[name].content = image;
            imageStore._images[name].size = new Webgram.Geometry.Size(image.width, image.height);
            
            if (onLoad) {
                onLoad(name, url, image);
            }
            
            if (imageStore._webgram != null) {
                imageStore._webgram.invalidate();
                imageStore._webgram.invalidateMini();
            }
        };
    },
    
    /**
     * Returns the image having the given name.
     * If no such image exists (whether because it hasn't been
     * loaded yet, or simply because it never was registered with the store),
     * <tt>null</tt> is returned.
     * @param {String} name the name of the image
     * @returns {Image} the image with the given name, or <tt>null</tt> if image was not found 
     */
    get: function (name) {
        /* no such image */
        if (!this._images[name]) {
            return null;
        }
        
        /* image not loaded (yet) */
        if (!this._images[name].content) {
            return null;
        }
        
        return this._images[name];
    }
});
