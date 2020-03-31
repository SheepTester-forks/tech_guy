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
        'pants/pants0', 'pants/pants1',
        'shoes/shoes0', 'shoes/shoes1',
        'shirt/shirt0', 'shirt/shirt1', 'shirt/shirt2', 'shirt/shirt3',
        'hair/hair0/hair', 'hair/hair1/hair', 'hair/hair2/hair', 'hair/hair3/hair', 'hair/hair4/hair',
        'hair/hair0/shadow', 'hair/hair1/shadow', 'hair/hair2/shadow', 'hair/hair3/shadow', 'hair/hair4/shadow',
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
                code = 'hat' + split[1] === 'shadow' ? 's' : '';
            }
            images[code] = img;
        }
    }

    function addLoad(onLoad) {
        loaded++;
        if (loaded === paths.length) {
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

    function drawTinted(image, tint, shadow) {
        let ghost = document.createElement('canvas');
        ghost.width = image.width;
        ghost.height = image.height;
        let gctx = ghost.getContext('2d');
        gctx.drawImage(image, 0, 0);
        let gid = gctx.getImageData(0, 0, image.width, image.height);

        for (let i = 0; i < gid.data.length; i += 4) {
            if (gid.data[i + 3] === 255 && gid.data[i] !== 0) {
                let index = -gid.data[i] / 51 + 5;

                let rgb = hexToRgb(tint[index]);
                gid.data[i] = rgb[0];
                gid.data[i + 1] = rgb[1];
                gid.data[i + 2] = rgb[2];
            }
        }

        gctx.putImageData(gid, 0, 0);
        ctx.drawImage(ghost, 0, 0);

        if (shadow) {
            ctx.drawImage(shadow, 0, 0);
        }
        
        return out;
    }
    
    function getSprite(sprite) {
        ctx.clearRect(0, 0, 12, 24);
        
        drawTinted(images.skin, sprite.skin.tint);
        drawTinted(images['pants' + sprite.pants.type], sprite.pants.tint);
        drawTinted(images['shoes' + sprite.shoes.type], sprite.shoes.tint);
        drawTinted(images['shirt' + sprite.shirt.type], sprite.shirt.tint, images.shadow);
        return drawTinted(images['hair' + sprite.hair.type], sprite.hair.tint, images['hair' + sprite.hair.type + 's']);
    }
    
    exports.loadImages = loadImages;
    exports.getSprite = getSprite;
    
})));