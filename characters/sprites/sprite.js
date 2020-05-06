let out = document.createElement('canvas');
out.width = 12;
out.height = 27;
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
        img.src = `./images/student/${paths[i]}.png`;
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
        onLoad();
    }
}

function drawTinted(image, y, facing, cuts) {
    cuts.push(23);
    for (let i = 0; i < cuts.length; i++) {
        ctx.drawImage(image, 0, cuts[i - 1] || 0, 12, cuts[i] - (cuts[i - 1] || 0) + 1, 0, (cuts[i - 1] || 0) + y + i, facing * 12, cuts[i] - (cuts[i - 1] || 0) + 1);
    }
}

function getSprite(sprite) {
    ctx.save();
    ctx.clearRect(0, 0, 12, 27);
    ctx.scale(sprite.facing, 1);

    let cuts = [[], [15], [15, 22], [15, 15, 22]][sprite.height];

    drawTinted(images.skin, 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images['pants' + sprite.pants.type], 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images['shoes' + sprite.shoes.type], 3, sprite.facing, []);
    drawTinted(images['shirt' + sprite.shirt.type], 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images.shadow, 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images['hair' + sprite.hair.type], 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images['hair' + sprite.hair.type + 's'], 3 - sprite.height, sprite.facing, cuts);

    if (sprite.hat.type) {
        drawTinted(images['hat'], 3 - sprite.height, sprite.facing, []);
    }

    let gid = ctx.getImageData(0, 0, 12, 27);

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
    loadImages,
    getSprite
};
