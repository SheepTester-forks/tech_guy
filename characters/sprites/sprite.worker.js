// TODO: Unfortunately only Chrome supports module type workers. When we use
// Rollup, I think we'll be able to import other JS files

const SPRITE_WIDTH = 12;
const SPRITE_HEIGHT = 27;

const PICTURE_WIDTH = 16;
const PICTURE_HEIGHT = 16;

let images;
let ctx;

// https://en.wikipedia.org/wiki/Alpha_compositing
function applyAlphaOverlay(under, over, opacity) {
    return over * opacity + under * (1 - opacity);
}

function applyPixelFrom(target, source, {destX=0, destY=0, srcX=0, srcY=0}) {
    let sourceIndex = (srcY * source.width + srcX) * 4;
    let destIndex = (destY * target.width + destX) * 4;
    if (source.data[sourceIndex + 3] === 255) {
        target.data[destIndex] = source.data[sourceIndex];
        target.data[destIndex + 1] = source.data[sourceIndex + 1];
        target.data[destIndex + 2] = source.data[sourceIndex + 2];
        target.data[destIndex + 3] = 255;
    } else if (source.data[sourceIndex + 3] !== 0) {
        // Assumes that the target has alpha value 255
        // result = under * (1 - opacity) + over * opacity
        let opacity = source.data[sourceIndex + 3] / 255;
        target.data[destIndex] = applyAlphaOverlay(target.data[destIndex], source.data[sourceIndex], opacity);
        target.data[destIndex + 1] = applyAlphaOverlay(target.data[destIndex + 1], source.data[sourceIndex + 1], opacity);
        target.data[destIndex + 2] = applyAlphaOverlay(target.data[destIndex + 2], source.data[sourceIndex + 2], opacity);
        target.data[destIndex + 3] = Math.max(target.data[destIndex + 3], source.data[sourceIndex + 3]);
    }
}

function copyImageData(target, source, {
    destX=0,
    destY=0,
    srcX=0,
    srcY=0,
    srcWidth=source.width,
    srcHeight=source.height,
    flipX=false
}={}) {
    for (let x = 0; x < srcWidth; x++) {
        for (let y = 0; y < srcHeight; y++) {
            applyPixelFrom(target, source, {
                destX: destX + x,
                destY: destY + y,
                srcX: srcX + (flipX ? srcWidth - 1 - x : x),
                srcY: srcY + y
            });
        }
    }
}

function drawTinted(image, y, facing, cuts) {
    cuts.push(23);
    for (let i = 0; i < cuts.length; i++) {
        copyImageData(ctx, image, {
            destX: 0,
            destY: (cuts[i - 1] || 0) + y + i,
            srcX: 0,
            srcY: cuts[i - 1] || 0,
            srcWidth: SPRITE_WIDTH,
            srcHeight: cuts[i] - (cuts[i - 1] || 0) + 1,
            flipX: facing === -1
        });
    }
}

function getSprite(sprite, picture=false) {
    ctx = new ImageData(SPRITE_WIDTH, SPRITE_HEIGHT);

    let cuts = [];
    for (let i = 0; i < sprite.height; i++) {
        cuts.push(i === sprite.height - 1 && i !== 0 ? 22 : 15);
    }

    drawTinted(images.skin, 3 - sprite.height, sprite.facing, cuts);
    if (!picture) {
        drawTinted(images['pants' + sprite.pants.type], 3 - sprite.height, sprite.facing, cuts);
        drawTinted(images['shoes' + sprite.shoes.type], 3, sprite.facing, []);
    }
    drawTinted(images['shirt' + sprite.shirt.type], 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images.shadow, 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images['hair' + sprite.hair.type], 3 - sprite.height, sprite.facing, cuts);
    drawTinted(images['hair' + sprite.hair.type + 's'], 3 - sprite.height, sprite.facing, cuts);

    if (sprite.hat.type) {
        drawTinted(images.hat, 3 - sprite.height, sprite.facing, []);
        drawTinted(images.hats, 3 - sprite.height, sprite.facing, []);
    }

    let gid = ctx;

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

    if (picture) {
        let pctx = new ImageData(PICTURE_WIDTH, PICTURE_HEIGHT);
        copyImageData(pctx, images.picture);
        copyImageData(pctx, ctx, {destX: 2, destY: 0});
        return pctx;
    }
    return ctx;
}

// From utils.js
async function* receive(worker=self) {
    let nextDone;
    let next = [];
    function newNext() {
        next.push(new Promise(resolve => (nextDone = resolve)));
    }
    newNext();
    worker.addEventListener('message', ({data}) => {
        nextDone(data);
        newNext();
    });
    for (;;) {
        yield await next.shift();
    }
}

async function main() {
    for await (const {type, ...data} of receive()) {
        switch (type) {
            case 'images': {
                images = data.data;
                break;
            }
            case 'getSprite': {
                self.postMessage(data.sprites.map(sprite => getSprite(sprite, data.picture)));
                break;
            }
        }
    }
}

main();
