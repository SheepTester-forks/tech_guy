(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.SPRITES = global.SPRITES || {})));
} (this, (function (exports) {
    'use strict';
    
    let out = document.createElement('canvas');
    out.width = 12;
    out.height = 24;
    let ctx = out.getContext('2d');

    let loaded = 0;

    let paths = [
        'skin/skin', 'skin/shadow',
        'pants/pants0', 'pants/pants1', 'shoes/shoes0', 'shoes/shoes1',
        'shirt/shirt0', 'shirt/shirt1', 'shirt/shirt2',
        'shirt/shirt3', 'shirt/shirt4', 'shirt/shirt5',
        'hair/hair0/hair', 'hair/hair1/hair', 'hair/hair2/hair',
        'hair/hair3/hair', 'hair/hair4/hair', 'hair/hair5/hair',
        'hair/hair0/shadow', 'hair/hair1/shadow', 'hair/hair2/shadow',
        'hair/hair3/shadow', 'hair/hair4/shadow', 'hair/hair5/shadow',
        'hat/hat', 'hat/shadow'
    ];
    let images = {};

    function loadImages(onLoad) {
        for (let i = 0; i < paths.length; i++) {
            let img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = `https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/student/${paths[i]}.png`;
            img.onload = function() {
                addLoad(onLoad);
            };

            let split = paths[i].split('/');
            let code = split[1];
            if (split[2]) {
                code += split[2] === 'shadow' ? 's' : '';
            } else if (split[0] === 'hat') {
                code = 'hat' + (split[1] === 'shadow' ? 's' : '');
            }
            images[code] = img;
        }
    }

    function addLoad(onLoad) {
        loaded++;
        if (loaded === paths.length) {
            console.log(images);
            onLoad();
        }
    }

    function hexToRgb(hex) {
        hex = hex[0] === '#' ? hex.substr(1) : hex;
        hex = hex.length === 3 ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] : hex;

        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return [r, g, b];
    }

    function drawTinted(image, shadow) {
        ctx.drawImage(image, 0, 0);

        if (shadow) {
            ctx.drawImage(shadow, 0, 0);
        }
    }
    
    function getSprite(sprite) {
        ctx.clearRect(0, 0, 12, 24);
        
        drawTinted(images.skin);
        drawTinted(images['pants' + sprite.pants.type]);
        drawTinted(images['shoes' + sprite.shoes.type]);
        drawTinted(images['shirt' + sprite.shirt.type], images.shadow);
        drawTinted(images['hair' + sprite.hair.type], images['hair' + sprite.hair.type + 's']);
        if (sprite.hat.type) {
            drawTinted(images['hat']);
        }
        
        let gid = ctx.getImageData(0, 0, 12, 24);
        
        for (let i = 0; i < gid.data.length; i += 4) {
            let id = [];
            
            // this method is so messy but it works
            if (gid.data[i] + gid.data[i + 1] + gid.data[i + 2] === 0 || gid.data[i + 3] === 0) {
                // #000 (eyes and mouth) or transparent
                gid.data[i] = 102;
                id = ['skin', 0];
            } else if (gid.data[i] === 51) { // #333 (hat mask)
                gid.data[i + 3] = 0; // erase pixels
                continue;
            } else if (gid.data[i] === gid.data[i + 1]) {
                if (gid.data[i] === gid.data[i + 2]) { // #xxx (hat)
                    id = ['hat', 0];
                } else if (gid.data[i + 2] === 0) { // #xx0 (pants)
                    id = ['pants', 0];
                } else { // #00x (shirt 2)
                    id = ['shirt', 2, 1];
                }
            } else if (gid.data[i] === gid.data[i + 2]) {
                if (gid.data[i + 1] === 0) { // #x0x (hair)
                    id = ['hair', 0];
                } else { // #0x0 (shoes)
                    id = ['shoes', 1];
                }
            } else {
                if (gid.data[i] === 0) { // #0xx (shirt 1)
                    id = ['shirt', 1, 0];
                } else { // #x00 (skin)
                    id = ['skin', 0];
                }
            }
            
            let rgb = hexToRgb(sprite[id[0]].tint[id[2] ? id[2] : 0]);
            let base = gid.data[i + id[1]];
            gid.data[i] = Math.max(0, rgb[0] - (255 - base));
            gid.data[i + 1] = Math.max(0, rgb[1] - (255 - base));
            gid.data[i + 2] = Math.max(0, rgb[2] - (255 - base));
            
            ctx.putImageData(gid, 0, 0);
        }
        
        return out;
    }
    
    exports.loadImages = loadImages;
    exports.getSprite = getSprite;
    
})));