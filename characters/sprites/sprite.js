let loaded = 0;
const WIDTH = 12; // leaving these here because Sean might use em
const HEIGHT = 27; // these are the dimensions of the normal sprite, not the picture

let paths = [
    'skin/skin', 'skin/shadow',
    'pants/pants0', 'pants/pants1', 'shoes/shoes0', 'shoes/shoes1',
    'shirt/shirt0', 'shirt/shirt1', 'shirt/shirt2',
    'shirt/shirt3', 'shirt/shirt4', 'shirt/shirt5',
    'hair/hair0/hair', 'hair/hair1/hair', 'hair/hair2/hair',
    'hair/hair3/hair', 'hair/hair4/hair', 'hair/hair5/hair',
    'hair/hair0/shadow', 'hair/hair1/shadow', 'hair/hair2/shadow',
    'hair/hair3/shadow', 'hair/hair4/shadow', 'hair/hair5/shadow',
    'hat/hat', 'hat/shadow',
    'picture/picture'
];
let images = {};

function loadImages() {
    return Promise.all(paths.map(path => new Promise(resolve => {
        let img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = new URL(`./images/student/${path}.png`, import.meta.url);
        img.onload = resolve;

        let split = path.split('/');
        let code = split[1];
        if (split[2]) {
            code += split[2] === 'shadow' ? 's' : '';
        } else if (split[0] === 'hat') {
            code = 'hat' + (split[1] === 'shadow' ? 's' : '');
        }
        images[code] = img;
    })));
}

function drawTinted(ctx, image, x, y, w, facing, cuts) {
    cuts.push(23);
    for (let i = 0; i < cuts.length; i++) {
        ctx.drawImage(image, 0, cuts[i - 1] || 0, w, cuts[i] - (cuts[i - 1] || 0) + 1, x, (cuts[i - 1] || 0) + y + i, facing * w, cuts[i] - (cuts[i - 1] || 0) + 1);
    }
}

function getSprite(sprite, picture=false) {
    let width = picture ? 16 : 12;
    let height = picture ? 16 : 27;
    let xOff = picture ? 2 : 0;
    
    // maybe creating a canvas every time is slow, but ill fix that later if it becomes an issue
    let out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    let ctx = out.getContext('2d');
    
    ctx.save();
    ctx.scale(sprite.facing, 1);

    let cuts = [];
    for (let i = 0; i < sprite.height; i++) {
        cuts.push(i === sprite.height - 1 && i !== 0 ? 22 : 15);
    }
    
    if (picture) {
        drawTinted(ctx, images.picture, 0, 0, width, sprite.facing, []);    
    }
    
    drawTinted(ctx, images.skin, xOff, 3 - sprite.height, width, sprite.facing, cuts);
    drawTinted(ctx, images['pants' + sprite.pants.type], xOff, 3 - sprite.height, width, sprite.facing, cuts);
    drawTinted(ctx, images['shoes' + sprite.shoes.type], xOff, 3, width, sprite.facing, []);
    drawTinted(ctx, images['shirt' + sprite.shirt.type], xOff, 3 - sprite.height, width, sprite.facing, cuts);
    drawTinted(ctx, images.shadow, xOff, 3 - sprite.height, width, sprite.facing, cuts);
    drawTinted(ctx, images['hair' + sprite.hair.type], xOff, 3 - sprite.height, width, sprite.facing, cuts);
    drawTinted(ctx, images['hair' + sprite.hair.type + 's'], xOff, 3 - sprite.height, width, sprite.facing, cuts);

    if (sprite.hat.type) {
        drawTinted(ctx, images['hat'], xOff, 3 - sprite.height, width, sprite.facing, []);
    }

    let gid = ctx.getImageData(0, 0, width, height);

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
            } else if (gid.data[i + 1] === 0) { // #x00 (skin)
                // extra check for picture
                id = ['skin', 0];
            } else { // picture
                continue;
            }
        }

        let rgb = sprite[id[0]].tint[id[2] ? id[2] : 0];
        let base = gid.data[i + id[1]];
        gid.data[i] = Math.max(0, rgb[0] - (255 - base));
        gid.data[i + 1] = Math.max(0, rgb[1] - (255 - base));
        gid.data[i + 2] = Math.max(0, rgb[2] - (255 - base));

    }

    ctx.putImageData(gid, 0, 0);
    ctx.restore();

    return out;
}

export {
    WIDTH,
    HEIGHT,
    loadImages,
    getSprite
};
