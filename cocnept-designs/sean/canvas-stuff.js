export class WrappedCanvas {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.wrapper.className = 'canvas-wrapper';

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'wrapped-canvas';
        this.wrapper.appendChild(this.canvas);

        this.context = this.canvas.getContext('2d');
    }

    async resize(then = Promise.resolve()) {
        let { width, height } = this.wrapper.getBoundingClientRect();
        let dpr = window.devicePixelRatio;
        if (this.width !== width || this.height !== height || this.dpr !== dpr) {
            await then;
            this.width = width;
            this.height = height;
            this.dpr = dpr;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.context.scale(dpr, dpr);
        }
    }
}

export function loadImage(url) {
    return new Promise(resolve => {
        let image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.src = url;
    });
}

export function wait(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export function frame() {
    return new Promise(resolve => window.requestAnimationFrame(resolve));
}
