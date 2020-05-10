import {WrappedCanvas} from './canvas-stuff.js';
import {Panner} from './panner.js';

import {WIDTH, HEIGHT, loadImages, getSprite} from '../../characters/sprites/sprite.js';
import {randomSprite} from '../../characters/sprites/random-sprite.js';
import {SpriteCache} from '../../characters/sprites/sprite-cache.js';

import {frame} from '../../utils.js';

export default async function main(wrapper) {
    let wrappedCanvas = new WrappedCanvas(wrapper);

    let panner = new Panner({
        canvas: wrappedCanvas,
        width: 130,
        height: 56
    });
    let c = wrappedCanvas.context;
    let lastTime;
    let ready = false;

    let students = [];
    let spriteCache;
    for (let x = 0; x < panner.width; x += WIDTH + 1) {
        for (let y = 0; y < panner.height; y += HEIGHT + 1) {
            students.push({x, y});
        }
    }
    spriteCache = new SpriteCache(students.length);

    function paint() {
        let now = Date.now();
        let elapsedTime = now - lastTime;
        if (elapsedTime < 500) {
            panner.time += elapsedTime;
        }
        lastTime = now;

        let {offsetX, offsetY, scale} = panner.getTransform();
        c.clearRect(0, 0, wrappedCanvas.width, wrappedCanvas.height);
        c.save();
        c.imageSmoothingEnabled = false;
        c.translate(offsetX, offsetY);
        c.scale(scale, scale);

        for (let {spriteId, x, y} of students) {
            spriteCache.draw(c, spriteId, x, y);
        }

        c.restore();
    }

    window.addEventListener('resize', async e => {
        await wrappedCanvas.resize();
        if (ready) paint();
    });

    await Promise.all([
        wrappedCanvas.resize(),
        loadImages()
    ]);

    for (let student of students) {
        student.spriteId = spriteCache.add(getSprite(randomSprite()));
    }

    lastTime = Date.now();

    ready = true;
    while (true) {
        paint();
        await frame();
    }
}
