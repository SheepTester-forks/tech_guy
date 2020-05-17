import {bindMethods, compareDist} from '../../utils.js';

function friction(speed, amount) {
    if (speed > 0) {
        return Math.max(0, speed - amount);
    } else {
        return Math.min(0, speed + amount);
    }
}

export class Panner {
    constructor({
        width,
        height,
        // A WrappedCanvas
        canvas,
        // Time in milliseconds that the pan pauses at either end of the panning
        edgePause=2000,
        // Time in milliseconds per pixel that the pan moves
        speed=10,
        // Minimum movement in pixels required for a pointer to be considered dragging
        minMovement=10,
        // Acceleration applied by friction (px/ms^2)
        friction=0.1,
        // Delay after a drag until autopan takes over (ms)
        postDragAutoDelay=5000,
        // Run when the user clicks something as opposed to dragging
        onClick=null
    }) {
        bindMethods(this, [
            '_pointerDown',
            '_pointerMove',
            '_pointerUp',
            '_wheel'
        ]);

        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.edgePause = edgePause;
        this.speed = speed;
        this.minMovement = minMovement;
        this.friction = friction;
        this.postDragAutoDelay = postDragAutoDelay;
        this.onClick = onClick;

        this.time = 0;
        this._listening = false;

        // {x, y} of user-set offset. If null, it'll automatically pan.
        this._idealOffset = null;
        this._dragMomentum = null;
        this._untilAuto = null;
    }

    getOffsetBounds() {
        if (this.width / this.height > this.canvas.width / this.canvas.height) {
            // Image is wider than canvas
            let scaledWidth = this.width * this.canvas.height / this.height;
            return {
                direction: 'horizontal',
                maxX: scaledWidth - this.canvas.width,
                maxY: 0
            };
        } else {
            // Image is taller than canvas
            let scaledHeight = this.height * this.canvas.width / this.width;
            return {
                direction: 'vertical',
                maxX: 0,
                maxY: scaledHeight - this.canvas.height
            };
        }
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
            if (!this.idealOffset) {
                let scaledWidth = this.width * scale;
                offsetX = -this._getOffset(scaledWidth - this.canvas.width);
            }
        } else {
            // Image is taller than canvas
            scale = this.canvas.width / this.width;
            if (!this.idealOffset) {
                let scaledHeight = this.height * scale;
                offsetY = -this._getOffset(scaledHeight - this.canvas.height);
            }
        }
        if (this.idealOffset) {
            let {maxX, maxY} = this.getOffsetBounds();
            if (this.idealOffset.x > 0) {
                offsetX = Math.min(this.idealOffset.x, maxX);
            }
            if (this.idealOffset.y > 0) {
                offsetY = Math.min(this.idealOffset.y, maxY);
            }
        }
        return {
            scale,
            // Offsets are in canvas coordinates, so translate BEFORE scaling
            offsetX,
            offsetY
        };
    }

    listen () {
        if (!this._listening) {
            let canvas = this.canvas.canvas;
            canvas.classList.add('touch-interactive');
            canvas.addEventListener('pointerdown', this._pointerDown);
            canvas.addEventListener('pointermove', this._pointerMove);
            canvas.addEventListener('pointerup', this._pointerUp);
            canvas.addEventListener('pointercancel', this._pointerUp);
            canvas.addEventListener('wheel', this._wheel);
            this._dragging = null;

            this._listening = true;
        }
        return this;
    }

    _pointerDown(e) {
        if (!this._dragging) {
            let mouse = {x: e.clientX, y: e.clientY};
            this._dragging = {
                pointerId: e.pointerId,
                start: mouse,
                last: mouse,
                lastTime: Date.now(),
                dragging: false
            };
        }
    }

    _pointerMove(e) {
        if (this._dragging && this._dragging.pointerId === e.pointerId) {
            let mouse = {x: e.clientX, y: e.clientY};
            let {start, last} = this._dragging;
            if (!this._dragging.dragging && compareDist(start, mouse, this.minMovement) > 0) {
                this._dragging.dragging = true;

                let {offsetX, offsetY} = this.getTransform();
                this.idealOffset = {x: offsetX, y: offsetY};
                this._untilAuto = Infinity;
            }
            if (this._dragging.dragging) {
                this.idealOffset.x += mouse.x - last.x;
                this.idealOffset.y += mouse.y - last.y;
            }
            this._dragging.last = mouse;
            this._dragging.lastTime = Date.now();
        }
    }

    _pointerUp(e) {
        if (this._dragging && this._dragging.pointerId === e.pointerId) {
            if (this._dragging.dragging) {
                let mouse = {x: e.clientX, y: e.clientY};
                let {last, lastTime} = this._dragging;
                let timeDiff = Date.now() - lastTime;
                this._dragMomentum = {
                    x: (mouse.x - last.x) / timeDiff,
                    y: (mouse.y - last.y) / timeDiff
                };
                this._untilAuto = this.postDragAutoDelay;
            } else if (this.onClick) {
                this.onClick(e);
            }
            this._dragging = null;
        }
    }

    simulate(time) {
        this.time += time;

        if (this._dragMomentum) {
            if (this._idealOffset) {
                this._idealOffset.x += this._dragMomentum.x;
                this._idealOffset.y += this._dragMomentum.y;
                this._dragMomentum.x = friction(this._dragMomentum.x, this.friction * time);
                this._dragMomentum.y = friction(this._dragMomentum.y, this.friction * time);
                if (this._dragMomentum.x === 0 && this._dragMomentum.y === 0) {
                    this._dragMomentum = null;
                }
            } else {
                this._dragMomentum = null;
            }
        } else if (this._idealOffset) {
            this._untilAuto -= time;
            if (this._untilAuto <= 0) {
                this._untilAuto = null;
                this._idealOffset = null;
            }
        }
    }

    _wheel(e) {
        if (!this._idealOffset) {
            this._idealOffset = {x: 0, y: 0};
        }
        this._idealOffset.x += e.shiftKey ? e.deltaY : e.deltaX;
        this._idealOffset.y += e.deltaY;
        this._untilAuto = this.postDragAutoDelay;
    }
}
