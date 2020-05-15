import {WIDTH, HEIGHT} from './sprite.js';

// Add a pixel space between each sprite so thin slices of them don't appear
const ENTRY_WIDTH = WIDTH + 1;

export class SpriteCache {
    constructor(capacity) {
        if (!Number.isInteger(capacity)) {
            throw new TypeError('Capacity should be an integer.');
        }

        this.capacity = capacity;
        this.sprites = 0;

        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');
        this._canvas.width = capacity * ENTRY_WIDTH - 1;
        this._canvas.height = HEIGHT;
    }

    canAdd() {
        return this.sprites < this.capacity;
    }

    add(sprite) {
        if (this.sprites >= this.capacity) {
            throw new Error('Cache is full and cannot accept any more students.');
        }
        let spriteId = this.sprites++;
        if (sprite instanceof ImageData) {
            this._context.putImageData(sprite, spriteId * ENTRY_WIDTH, 0);
        } else {
            this._context.drawImage(sprite, spriteId * ENTRY_WIDTH, 0);
        }
        return spriteId;
    }

    draw(context, spriteId, x=0, y=0, width=WIDTH, height=HEIGHT) {
        context.drawImage(
            this._canvas,
            spriteId * ENTRY_WIDTH,
            0,
            WIDTH,
            HEIGHT,
            x,
            y,
            width,
            height
        );
        return this;
    }
}
