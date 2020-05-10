import {WIDTH, HEIGHT} from './sprite.js';

export class SpriteCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.sprites = 0;

        this._canvas = document.createElement('canvas')
        this._context = this._canvas.getContext('2d');
        this._canvas.width = capacity * WIDTH;
        this._canvas.height = HEIGHT;
    }

    canAdd() {
        return this.sprites < this.capacity;
    }

    add(sprite) {
        let spriteId = this.sprites++;
        this._context.drawImage(sprite, spriteId * WIDTH, 0);
        return spriteId;
    }

    draw(context, spriteId, x=0, y=0, width=WIDTH, height=HEIGHT) {
        context.drawImage(
            this._canvas,
            spriteId * WIDTH,
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
