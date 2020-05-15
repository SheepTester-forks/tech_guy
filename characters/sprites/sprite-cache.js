import {SPRITE_WIDTH, SPRITE_HEIGHT, PICTURE_WIDTH, PICTURE_HEIGHT} from './sprite.js';

// Add a pixel space between each sprite so thin slices of them don't appear
const ENTRY_WIDTH = WIDTH + 1;

export class SpriteCache {
    constructor(capacity, type='sprite') {
        if (!Number.isInteger(capacity)) {
            throw new TypeError('Capacity should be an integer.');
        }
        if (type === 'sprite') {
            this.width = SPRITE_WIDTH;
            this.height = SPRITE_HEIGHT;
        } else if (type === 'picture') {
            this.width = PICTURE_WIDTH;
            this.height = PICTURE_HEIGHT;
        } else {
            throw new Error('Type should be either "sprite" or "picture".');
        }
        this.entryWidth = this.width + 1;

        this.capacity = capacity;
        this.sprites = 0;

        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');
        this._canvas.width = capacity * this.entryWidth - 1;
        this._canvas.height = this.height;
    }

    canAdd() {
        return this.sprites < this.capacity;
    }

    add(sprite) {
        if (this.sprites >= this.capacity) {
            throw new Error('Cache is full and cannot accept any more students.');
        }
        let spriteId = this.sprites++;
        this._context.drawImage(sprite, spriteId * this.entryWidth, 0);
        return spriteId;
    }

    draw(context, spriteId, x=0, y=0, width=this.width, height=this.height) {
        context.drawImage(
            this._canvas,
            spriteId * this.entryWidth,
            0,
            this.width,
            this.height,
            x,
            y,
            width,
            height
        );
        return this;
    }
}
