export class Panner {
    constructor({
        width,
        height,
        canvas,
        // Time in milliseconds that the pan pauses at either end of the panning
        edgePause=2000,
        // Time in milliseconds per pixel that the pan moves
        speed=10
    }) {
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.edgePause = edgePause;
        this.speed = speed;

        this.time = 0;
    }

    _getOffset(difference) {
        let {edgePause, speed, time} = this;
        let state = time % (edgePause * 2 + difference * speed * 2);
        let offset = 0;
        if (state < difference * speed) {
            offset = state / speed;
        } else if (state >= difference * speed && state < difference * speed + edgePause) {
            offset = difference;
        } else if (state >= difference * speed + edgePause && state < (difference * speed) * 2 + edgePause) {
            offset = ((difference * speed) * 2 + edgePause - state) / speed;
        }
        return offset;
    }

    getTransform() {
        let scale;
        let offsetX = 0;
        let offsetY = 0;
        if (this.width / this.height > this.canvas.width / this.canvas.height) {
            // Image is wider than canvas
            scale = this.canvas.height / this.height;
            let scaledWidth = this.width * scale;
            offsetX = -this._getOffset(scaledWidth - this.canvas.width);
        } else {
            // Image is taller than canvas
            scale = this.canvas.width * this.width;
            let scaledHeight = this.height * scale;
            offsetY = -this._getOffset(scaledHeight - this.canvas.height);
        }
        return {
            scale,
            // Offsets are in canvas coordinates, so translate BEFORE scaling
            offsetX,
            offsetY
        };
    }
}
