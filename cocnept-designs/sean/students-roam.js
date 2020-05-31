import {WrappedCanvas, loadImage} from './canvas-stuff.js';
import {Panner} from './panner.js';

import {SPRITE_WIDTH, SPRITE_HEIGHT} from '../../characters/sprites/sprite-constants.js';
import {getWorkerSpriteMaker} from '../../centralized.js';
import {randomSprite} from '../../characters/sprites/random-sprite.js';
import {SpriteCache} from '../../characters/sprites/sprite-cache.js';

import * as FINDER from '../../pathfinding/finder.js';

import {frame, inRange} from '../../utils.js';

const WIGGLE_RADIUS = 0.5;

let width = 10;
let height = 5;
function isAccessible({x, y}) {
    return x >= 0 && x < width &&
        y >= 0 && y < height &&
        (x < 6 || y > 2);
}
function getRandomPosition() {
    let position;
    do {
        position = {
            x: Math.random() * width | 0,
            y: Math.random() * height | 0
        };
    } while (!isAccessible(position));
    return position;
}

class Student {
    constructor({
        speed=0.002,
        idleMin=1000,
        idleMax=4000
    }={}) {
        this.speed = speed;
        this.idleMin = idleMin;
        this.idleMax = idleMax;

        // The current or old* position of the student (*old if the student is walking between tiles)
        this.current = {x: 0, y: 0, actualX: 0, actualY: 0};
        // List of next tiles to go to
        this._path = [];
        // Distance walked between two tiles
        this._distance = null;
        // Distance to the next tile
        // Use this to determine if it is walking
        this._distanceToNext = null;
        // Time until movement
        this._timeUntilMovement = 0;
        // Sprite ID in a sprite cache
        this.spriteId = null;
        // "Actual" position of the student in motion
        this.visual = {x: 0, y: 0};
    }

    goToRandomPosition() {
        let {x, y} = getRandomPosition();
        this.current = {x, y, actualX: x, actualY: y};
        return this;
    }

    setDestination({x, y}) {
        let {actualX, actualY} = this.current;
        let success = FINDER.simple(
            new FINDER.Node(actualX, actualY),
            new FINDER.Node(x, y),
            isAccessible
        );
        if (success !== -1) {
            this._path = [];
            let temp = success;
            while (temp.parent) {
                this._path.unshift({
                    x: temp.x + 2 * WIGGLE_RADIUS * Math.random() - WIGGLE_RADIUS,
                    y: temp.y + 2 * WIGGLE_RADIUS * Math.random() - WIGGLE_RADIUS,
                    actualX: temp.x,
                    actualY: temp.y
                });
                temp = temp.parent;
            }
        }
        return this;
    }

    simulate(elapsedTime) {
        if (this._distanceToNext === null) {
            this._timeUntilMovement -= elapsedTime;
            if (this._distance !== null) {
                if (this._distance > 0) {
                    this._timeUntilMovement -= this._distance / this.speed;
                }
                this._distance = null;
            }
            if (this._timeUntilMovement < 0) {
                this.setDestination(getRandomPosition());
                // TODO: Better way to set idle time?
                this._timeUntilMovement = Math.random() * (this.idleMax - this.idleMin) + this.idleMin;
            }
        } else {
            this._distance += elapsedTime * this.speed;
        }
        return this;
    }

    updatePath() {
        if (this._distanceToNext !== null) {
            if (this._distance > this._distanceToNext) {
                // The student has finished walking to the next tile.
                this._distance -= this._distanceToNext;
                this.current = this._path.shift();
                this._distanceToNext = null;
            }
        }
        if (this._distanceToNext === null) {
            if (this._path[0]) {
                if (this._distance === null) {
                    this._distance = 0;
                }
                let {x, y} = this.current;
                let next = this._path[0];
                this._distanceToNext = Math.hypot(x - next.x, y - next.y);
            }
        }
        return this;
    }

    calculateVisualPosition() {
        let {x, y} = this.current;
        if (this._distanceToNext !== null) {
            let next = this._path[0];
            let progress = this._distance / this._distanceToNext;
            x += (next.x - x) * progress;
            y += (next.y - y) * progress;
        }
        y += 0.5 - SPRITE_HEIGHT / SPRITE_WIDTH;
        this.visual = {x, y};
    }
}

export default async function main(wrapper, debug=false) {
    let wrappedCanvas = new WrappedCanvas(wrapper);

    let leftPadding = 1;
    let topPadding = 3;
    let panner = new Panner({
        canvas: wrappedCanvas,
        width: width + leftPadding * 2, // 12
        height: height + topPadding, // 8
        postDragAutoDelay: Infinity,
        beginAuto: false,
        onClick: e => {
            if (debug) {
                for (let student of getStudents(e)) {
                    student.lastTouched = Date.now();
                }
            }
        }
    })
        .listen();
    let c = wrappedCanvas.context;
    let lastTime;
    let ready = false;
    let transform;
    console.log(panner);

    let students = [];
    let spriteCache;
    for (let i = 0; i < 50; i++) {
        students.push(new Student({
            speed: Math.random() * 0.003 + 0.0002
        }).goToRandomPosition());
    }
    spriteCache = new SpriteCache(students.length);

    function getStudents({clientX, clientY}) {
        const selectX = (clientX - wrappedCanvas.x - transform.offsetX) / transform.scale - leftPadding;
        const selectY = (clientY - wrappedCanvas.y - transform.offsetY) / transform.scale - topPadding;
        const width = 1;
        const height = SPRITE_HEIGHT / SPRITE_WIDTH;
        return students
            .filter(({visual: {x, y}}) => {
                return inRange(selectX, {min: x, max: x + width}) &&
                    inRange(selectY, {min: y, max: y + height});
            });
    }

    function paint() {
        let now = Date.now();
        let elapsedTime = now - lastTime;
        lastTime = now;
        let simulate = elapsedTime < 500;
        if (simulate) {
            panner.simulate(elapsedTime);
        }

        transform = panner.getTransform();
        let {offsetX, offsetY, scale} = transform;
        c.clearRect(0, 0, wrappedCanvas.width, wrappedCanvas.height);
        c.save();
        c.imageSmoothingEnabled = false;
        c.translate(offsetX + leftPadding * scale, offsetY + topPadding * scale);
        c.scale(scale, scale);

        let backgroundHeight = background.height / background.width * panner.width;
        c.drawImage(
            background,
            -leftPadding,
            (panner.height - topPadding) - backgroundHeight,
            panner.width,
            backgroundHeight
        );

        if (debug) {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    c.fillStyle = isAccessible({x, y}) ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
                    c.fillRect(x + 0.01, y + 0.01, 0.98, 0.98);
                }
            }
        }

        for (let student of students) {
            if (simulate) {
                student
                    .simulate(elapsedTime)
                    .updatePath();
            }
            student.calculateVisualPosition();
        }
        students.sort((a, b) => a.visual.y - b.visual.y);
        c.lineWidth = 0.05;
        for (let {spriteId, visual: {x, y}, lastTouched} of students) {
            spriteCache.draw(c, spriteId, x, y, 1, SPRITE_HEIGHT / SPRITE_WIDTH);
            if (now - lastTouched < 200) {
                c.strokeStyle = `rgba(255, 0, 0, ${1 - (now - lastTouched) / 200})`;
                c.strokeRect(x, y, 1, SPRITE_HEIGHT / SPRITE_WIDTH);
            }
        }

        c.restore();
    }

    window.addEventListener('resize', async () => {
        await wrappedCanvas.resize();
        if (ready) paint();
    });

    let [background, spriteData] = await Promise.all([
        loadImage(new URL('./campus.png', import.meta.url)),
        getWorkerSpriteMaker().getSprites(students.map(() => randomSprite())),
        wrappedCanvas.resize()
    ]);

    for (let i = 0; i < students.length; i++) {
        students[i].spriteId = spriteCache.add(spriteData[i]);
    }

    lastTime = Date.now();

    ready = true;
    for (;;) {
        paint();
        await frame();
    }
}
