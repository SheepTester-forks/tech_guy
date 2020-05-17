import {bindMethods, compareDist, clamp} from '../../utils.js';

const MIN_SPEED = 0.1;

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
        // Friction... idk what this means so don't touch lol
        friction=0.99,
        // Boosts the flick speed thing
        boost=10,
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
        this.boost = boost;
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
                minX: this.canvas.width - scaledWidth,
                minY: 0
            };
        } else {
            // Image is taller than canvas
            let scaledHeight = this.height * this.canvas.width / this.width;
            return {
                direction: 'vertical',
                minX: 0,
                minY: this.canvas.height - scaledHeight
            };
        }
    }

    setTimeFromOffset(offset) {
        this.time = -offset * this.speed;
        return this;
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
            if (!this._idealOffset) {
                let scaledWidth = this.width * scale;
                offsetX = -this._getOffset(scaledWidth - this.canvas.width);
            }
        } else {
            // Image is taller than canvas
            scale = this.canvas.width / this.width;
            if (!this._idealOffset) {
                let scaledHeight = this.height * scale;
                offsetY = -this._getOffset(scaledHeight - this.canvas.height);
            }
        }
        if (this._idealOffset) {
            let {minX, minY} = this.getOffsetBounds();
            this._idealOffset.x = clamp(this._idealOffset.x, {min: minX, max: 0});
            this._idealOffset.y = clamp(this._idealOffset.y, {min: minY, max: 0});
            offsetX = this._idealOffset.x;
            offsetY = this._idealOffset.y;
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
                history: [[mouse, Date.now()]],
                dragging: false
            };
            this.canvas.canvas.setPointerCapture(e.pointerId);
            if (this._dragMomentum) this._dragMomentum = null;
        }
    }

    _pointerMove(e) {
        if (this._dragging && this._dragging.pointerId === e.pointerId) {
            let mouse = {x: e.clientX, y: e.clientY};
            let {start, history: [[last]]} = this._dragging;
            if (!this._dragging.dragging && compareDist(start, mouse, this.minMovement) > 0) {
                this._dragging.dragging = true;

                let {offsetX, offsetY} = this.getTransform();
                this._idealOffset = {x: offsetX, y: offsetY};
                this._untilAuto = Infinity;
            }
            if (this._dragging.dragging) {
                this._idealOffset.x += mouse.x - last.x;
                this._idealOffset.y += mouse.y - last.y;
            }
            this._dragging.history.unshift([mouse, Date.now()]);
            if (this._dragging.history.length > 2) {
                this._dragging.history.pop();
            }
        }
    }

    _pointerUp(e) {
        if (this._dragging && this._dragging.pointerId === e.pointerId) {
            if (this._dragging.dragging) {
                let [current] = this._dragging.history[0];
                let [last, lastTime] = this._dragging.history[this._dragging.history.length - 1];
                let timeDiff = Date.now() - lastTime;
                if (timeDiff !== 0) {
                    this._dragMomentum = {
                        x: (current.x - last.x) / timeDiff * this.boost,
                        y: (current.y - last.y) / timeDiff * this.boost
                    };
                }
                this._untilAuto = this.postDragAutoDelay;
            } else if (this.onClick) {
                this.onClick(e);
            }
            this._dragging = null;
        }
    }

    simulate(time) {
        this.time += time;

        // Momentum might be a misnomer, but after the AP Physics exam I forgot
        // all the physics I learned
        if (this._dragMomentum) {
            if (this._idealOffset) {
                this._idealOffset.x += this._dragMomentum.x;
                this._idealOffset.y += this._dragMomentum.y;

                // Bounce the camera off the sides lol
                let {minX, minY} = this.getOffsetBounds();
                if (this._idealOffset.x > 0 || this._idealOffset.x < minX) {
                    this._idealOffset.x = clamp(this._idealOffset.x, {min: minX, max: 0});
                    this._dragMomentum.x *= -1;
                }
                if (this._idealOffset.y > 0 || this._idealOffset.y < minX) {
                    this._idealOffset.y = clamp(this._idealOffset.y, {min: minY, max: 0});
                    this._dragMomentum.y *= -1;
                }

                // Apply friction
                this._dragMomentum.x *= this.friction ** time;
                this._dragMomentum.y *= this.friction ** time;

                // Stop applying momentum when it's too small
                if (Math.abs(this._dragMomentum.x) < MIN_SPEED && Math.abs(this._dragMomentum.y) < MIN_SPEED) {
                    this._dragMomentum = null;
                }
            } else {
                this._dragMomentum = null;
            }
        } else if (this._idealOffset) {
            this._untilAuto -= time;
            if (this._untilAuto <= 0) {
                let {direction} = this.getOffsetBounds();
                this.setTimeFromOffset(direction === 'horizontal' ? this._idealOffset.x : this._idealOffset.y);

                this._untilAuto = null;
                this._idealOffset = null;
            }
        }

        return this;
    }

    _wheel(e) {
        if (!this._idealOffset) {
            this._idealOffset = {x: 0, y: 0};
        }
        // It only can go in one direction, so the direction of the scroll
        // wheel doesn't really matter
        this._idealOffset.x -= e.deltaX || e.deltaY;
        this._idealOffset.y -= e.deltaY || e.deltaX;
        this._untilAuto = this.postDragAutoDelay;
        if (this._dragMomentum) this._dragMomentum = null;
    }
}
