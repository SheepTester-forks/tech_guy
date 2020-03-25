let canvas = document.getElementsByTagName('canvas')[0];
canvas.style.width = '500px';
canvas.style.height = '500px';
canvas.width = 500 * window.devicePixelRatio;
canvas.height = 500 * window.devicePixelRatio;
let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

let loaded = 0;

let skin = new Image();
skin.crossOrigin = "Anonymous";
skin.src = 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/skin/skin.png';
skin.onload = addLoad;

let skinShadow = new Image();
skinShadow.src = 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/skin/shadow.png';
skinShadow.onload = addLoad;

let pants = new Image();
pants.crossOrigin = "Anonymous";
pants.src = 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/pants/pants1.png';
pants.onload = addLoad;

let shoes = new Image();
shoes.crossOrigin = "Anonymous";
shoes.src = 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/shoes/shoes1.png';
shoes.onload = addLoad;

let shirt = new Image();
shirt.crossOrigin = "Anonymous";
shirt.src = 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/shirt/shirt1.png';
shirt.onload = addLoad;

let hair = new Image();
hair.crossOrigin = "Anonymous";
hair.src = 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/hair/hair1/hair.png';
hair.onload = addLoad;

let hairShadow = new Image();
hairShadow.crossOrigin = "Anonymous";
hairShadow.src = 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/sprites/images/hair/hair1/shadow.png';
hairShadow.onload = addLoad;

function addLoad() {
    loaded++;
    if (loaded === 7) {
        drawTinted(skin, ['#fdc', '#ca9'], ['#fff', '#ccc'], 0, 0);
        drawTinted(skin, ['#ca9', '#976'], ['#fff', '#ccc'], 110, 0);
        drawTinted(skin, ['#976', '#643'], ['#fff', '#ccc'], 220, 0);
        
        drawTinted(pants, ['#36f', '#03c'], ['#fff', '#ccc'], 0, 0);
        drawTinted(pants, ['#fff', '#ccc'], ['#fff', '#ccc'], 110, 0);
        drawTinted(pants, ['#333', '#000'], ['#fff', '#ccc'], 220, 0);
        
        drawTinted(shoes, ['#333'], ['#ccc'], 0, 0);
        drawTinted(shoes, ['#999'], ['#ccc'], 110, 0);
        drawTinted(shoes, ['#eee'], ['#ccc'], 220, 0);
        
        drawTinted(shirt, ['#c36', '#fff', '#903'], ['#fff', '#999', '#666'], 0, 0, skinShadow);
        drawTinted(shirt, ['#fff', '#09c', '#069'], ['#fff', '#999', '#666'], 110, 0, skinShadow);
        drawTinted(shirt, ['#fff', '#eee', '#ccc'], ['#fff', '#999', '#666'], 220, 0, skinShadow);
        
        drawTinted(hair, ['#fec', '#cb9'], ['#fff', '#ccc'], 0, 0, hairShadow);
        drawTinted(hair, ['#333', '#000'], ['#fff', '#ccc'], 220, 0, hairShadow);
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

function drawTinted(image, tint, base, x, y, shadow) {
    let ghost = document.createElement('canvas');
    ghost.width = image.width;
    ghost.height = image.height;
    let gctx = ghost.getContext('2d');
    gctx.drawImage(image, 0, 0);
    let gid = gctx.getImageData(0, 0, image.width, image.height);

    for (let i = 0; i < gid.data.length; i += 4) {
        let value = gid.data[i];
        
        for (let j = 0; j < base.length; j++) {
            if (hexToRgb(base[j]).includes(value)) {
                let rgb = hexToRgb(tint[j]);
                gid.data[i] = rgb[0];
                gid.data[i + 1] = rgb[1];
                gid.data[i + 2] = rgb[2];
            }
        }
    }

    gctx.putImageData(gid, 0, 0);
    ctx.drawImage(ghost, x, y, 100, 200);
    
    if (shadow) {
        ctx.drawImage(shadow, x, y, 100, 200);
    }
}