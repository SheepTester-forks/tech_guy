import {SPRITE_WIDTH, SPRITE_HEIGHT, PICTURE_WIDTH, PICTURE_HEIGHT, paths} from './sprite-constants.js';
import {loadImage} from '../../cocnept-designs/sean/canvas-stuff.js';
import {receive} from '../../utils.js';

function loadImageData() {
    let canvas = document.createElement('canvas');
    let c = canvas.getContext('2d');
    return Promise.all(paths.map(path =>
        loadImage(new URL(`./images/student/${path}.png`, import.meta.url))
            .then(image => {
                let split = path.split('/');
                let code = split[1];
                if (split[2]) {
                    code += split[2] === 'shadow' ? 's' : '';
                } else if (split[0] === 'hat') {
                    code = 'hat' + (split[1] === 'shadow' ? 's' : '');
                }

                canvas.width = image.width;
                canvas.height = image.height;
                c.drawImage(image, 0, 0);
                return [code, c.getImageData(0, 0, canvas.width, canvas.height)];
            })))
        .then(data => {
            return Object.fromEntries(data);
        });
}

export class WorkerSpriteMaker {
    constructor() {
        this.worker = new Worker(new URL('./sprite.worker.js', import.meta.url));
        this.receiver = receive(this.worker);

        this.ready = loadImageData().then(data => {
            this.worker.postMessage({type: 'images', data});
        });
    }

    async getSprites(sprites, picture=false) {
        this.worker.postMessage({type: 'getSprite', sprites, picture});
        let {value} = await this.receiver.next();
        return value;
    }
}
