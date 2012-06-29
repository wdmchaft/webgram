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


Webgram.Styles.setStrokeStyle('default', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: '#6788BF',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setFillStyle('default', {
    colors: '#B5C6FF',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setTextStyle('default', {
    color: '#555',
    font: 'arial',
    size: 14,
    bold: false,
    italic: false,
    justify: 'cc'
});


Webgram.Styles.setStrokeStyle('default-guides', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(0, 0, 0, 0.3)',
    pattern: [ 5 , 2 ],
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setStrokeStyle('default-hovered-decoration', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(0, 0, 0, 0.3)',
    pattern: [ 5 , 2 ],
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setStrokeStyle('default-selected-decoration', Webgram.Styles.getStrokeStyle('default-hovered-decoration'));


Webgram.Styles.setFillStyle('background', null);

Webgram.Styles.setStrokeStyle('main-grid', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: '#E5E5E5',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setStrokeStyle('main-grid-axes', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: '#CCCCCC',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setStrokeStyle('snap-grid', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: '#F7F7F7',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setStrokeStyle('snap-visual-feedback', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(0, 0, 0, 0.3)',
    pattern: [5, 2],
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setTextStyle('snap-visual-feedback', {
    color: 'rgba(0, 0, 0, 0.3)',
    size: 10,
    bold: false,
    italic: false,
    font: 'arial',
    justify: 'cc'
});

Webgram.Styles.setStrokeStyle('rulers', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(120, 120, 120, 0.6)',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setFillStyle('rulers', {
    colors: 'rgba(160, 160, 160, 0.6)',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setTextStyle('rulers', {
    color: 'white',
    size: 10,
    bold: false,
    italic: false,
    font: 'arial',
    justify: 'cc'
});


Webgram.Styles.setStrokeStyle('multiple-selection', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(128, 128, 128, 0.5)',
    pattern: [ 5 , 2 ],
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setFillStyle('multiple-selection', {
    colors: 'rgba(255, 255, 255, 0.20)',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});


Webgram.Styles.setStrokeStyle('text-input-area', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(255, 255, 255, 0.8)',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setFillStyle('text-input-area', {
    colors: 'rgba(255, 255, 255, 0.1)',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setFillStyle('text-input-background', {
    colors: 'rgba(0, 0, 0, 0.4)',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});


Webgram.Styles.setStrokeStyle('action-menu-item', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(0, 0, 0, 0.2)',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setFillStyle('action-menu-item', {
    colors: 'rgba(200, 200, 200, 0.20)',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setStrokeStyle('action-menu-item-hover', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(0, 0, 0, 0.5)',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setFillStyle('action-menu-item-hover', {
    colors: 'rgba(200, 200, 200, 0.70)',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});


Webgram.Styles.setFillStyle('mini-background', {
    colors: 'rgba(96, 96, 96, 0.2)',
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});

Webgram.Styles.setStrokeStyle('mini-background', {
    lineWidth: null,
    lineCap: null,
    lineJoin: null,
    miterLimit: null,
    colors: 'rgba(0, 0, 0, 0.25)',
    pattern: null,
    gradientPoint1: null,
    gradientPoint2: null,
    gradientRadius1: null,
    gradientRadius2: null
});
