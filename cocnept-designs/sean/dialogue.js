import {pause, bindMethods} from '../../utils.js';

function getAllDialogue(dialogue, defaultOption) {
    let dialogueItems = [];
    if (!Array.isArray(dialogue)) {
        dialogue = [dialogue];
    }
    for (let item of dialogue) {
        if (typeof item === 'string') {
            item = {say: item};
        }
        let {say = '', options, special = null} = item;
        dialogueItems.push({
            say,
            options: options ? Object.keys(options) : [defaultOption],
            special
        });
        if (options) {
            for (let option of Object.values(options)) {
                dialogueItems.push(...getAllDialogue(option, defaultOption));
            }
        }
    }
    return dialogueItems;
}

function* processDialogue(dialogue, defaultOption) {
    if (!Array.isArray(dialogue)) {
        dialogue = [dialogue];
    }
    for (let item of dialogue) {
        if (typeof item === 'string') {
            item = {say: item};
        }
        let {say = '', options, special = null} = item;
        let chosen = yield {
            say,
            options: options ? Object.keys(options) : [defaultOption],
            special
        };
        if (options && options[chosen]) {
            yield* processDialogue(options[chosen], defaultOption);
        }
    }
}

export class Dialogue {
    constructor({
        width=100,
        height=50,
        penColor='#212121',
        penSize=2,
        penDegradationRate=0.003
    }={}) {
        bindMethods(this, [
            '_pointerStart',
            '_pointerMove',
            '_pointerEnd',
            '_onKeyDown',
            '_addOption'
        ]);

        this.options = {width, height, penColor, penSize, penDegradationRate};
        this._initElems();
    }

    _initElems() {
        let {width, height, penColor, penSize} = this.options;

        let thumbnail = document.createElement('img');
        thumbnail.className = 'speak-thumbnail';

        let spoken = document.createElement('span');
        spoken.className = 'speak-spoken';

        let toSpeak = document.createElement('span');
        toSpeak.className = 'speak-to-speak';

        let dialogue = document.createElement('p');
        dialogue.className = 'speak-dialogue';
        dialogue.appendChild(spoken);
        dialogue.appendChild(toSpeak);

        let canvas = document.createElement('canvas');
        canvas.className = 'speak-canvas speak-remove';
        canvas.width = width;
        canvas.height = height;
        canvas.addEventListener('pointerdown', this._pointerStart);
        canvas.addEventListener('pointermove', this._pointerMove);
        canvas.addEventListener('pointerup', this._pointerEnd);
        canvas.addEventListener('pointercancel', this._pointerEnd);
        let context = canvas.getContext('2d');
        context.fillStyle = penColor;
        context.strokeStyle = penColor;
        context.lineWidth = penSize;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        this.ink = 0;
        this.markings = [];

        let canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'speak-canvas-wrapper';
        canvasWrapper.appendChild(canvas);

        let options = document.createElement('div');
        options.className = 'speak-options';

        let wrapper = document.createElement('div');
        wrapper.className = 'speak-wrapper';
        wrapper.appendChild(thumbnail);
        wrapper.appendChild(dialogue);
        wrapper.appendChild(canvasWrapper);
        wrapper.appendChild(options);

        this.elems = {
            thumbnail,
            spoken,
            toSpeak,
            dialogue,
            canvas,
            context,
            options,
            wrapper
        };
    }

    setThumbnail(url, color) {
        this.elems.thumbnail.src = url;
        if (color !== undefined) {
            this.elems.thumbnail.style.backgroundColor = color;
        }
        return this;
    }

    addTo(parent) {
        parent.appendChild(this.elems.wrapper);
        return this;
    }

    removeFromParent() {
        this.elems.wrapper.remove();
        return this;
    }

    _toCanvasCoords(x, y) {
        if (!this._canvasPointer) return;

        let {canvas} = this.elems;
        let {left, top, width, height} = this._canvasPointer.rect;
        return [
            (x - left) / width * canvas.width,
            (y - top) / height * canvas.height
        ];
    }

    _pointerStart(e) {
        if (!this._canvasPointer) {
            let {canvas, context: c} = this.elems;

            this._canvasPointer = {
                pointerId: e.pointerId,
                rect: canvas.getBoundingClientRect(),
                prevX: e.clientX,
                prevY: e.clientY
            };
            canvas.setPointerCapture(e.pointerId);

            if (this.ink > 0) {
                let [x, y] = this._toCanvasCoords(e.clientX, e.clientY);
                c.globalAlpha = this.ink;
                c.beginPath();
                c.arc(x, y, this.options.penSize / 2, 0, 2 * Math.PI);
                c.fill();
                this.ink -= 0.02;
                this.markings.push([x, y]);
            }
        }
    }

    _pointerMove(e) {
        if (this._canvasPointer && this._canvasPointer.pointerId === e.pointerId) {
            let {canvas, context: c} = this.elems;

            if (this.ink > 0) {
                let {prevX, prevY} = this._canvasPointer;
                let [x1, y1] = this._toCanvasCoords(prevX, prevY);
                let [x2, y2] = this._toCanvasCoords(e.clientX, e.clientY);
                c.globalAlpha = this.ink;
                c.beginPath();
                c.moveTo(x1, y1);
                c.lineTo(x2, y2);
                c.stroke();
                this.ink -= Math.hypot(x1 - x2, y1 - y2) * this.options.penDegradationRate;
                this.markings.push([x1, y1, x2, y2]);
            }

            this._canvasPointer.prevX = e.clientX;
            this._canvasPointer.prevY = e.clientY;
        }
    }

    _pointerEnd(e) {
        if (this._canvasPointer && this._canvasPointer.pointerId === e.pointerId) {
            this._canvasPointer = null;
        }
    }

    _clearOptions() {
        let options = this.elems.options;
        while (options.firstChild) options.removeChild(options.firstChild);
    }

    _addOption(label) {
        let button = document.createElement('button');
        button.className = 'speak-option';
        button.textContent = label;
        this.elems.options.appendChild(button);

        return new Promise(resolve => button.addEventListener('click', e => resolve(label)));
    }

    async _animateSpeak(text, delay=20) {
        let {spoken, toSpeak} = this.elems;
        for (let i = 0; i < text.length; i++) {
            if (this.skipDialog) break;

            spoken.textContent = text.slice(0, i);
            toSpeak.textContent = text.slice(i);
            await pause(delay);
        }
        spoken.textContent = text;
        toSpeak.textContent = '';
    }

    _onKeyDown(e) {
        if (e.key === 'Enter') {
            this.skipDialog = true;
        }
    }

    _setMaxHeight(dialogueData) {
        let {
            wrapper,
            dialogue: dialogueText,
            spoken,
            toSpeak,
            canvas,
            options: optionsWrapper
        } = this.elems;

        let old = {
            spoken: spoken.textContent,
            toSpeak: toSpeak.textContent,
            buttons: [...optionsWrapper.children],
            showingCanvas: !canvas.classList.contains('speak-remove')
        };

        wrapper.style.height = null;
        toSpeak.textContent = '';

        let maxHeight = 0;
        for (let {say, options, special} of getAllDialogue(dialogueData, 'OK')) {
            this._clearOptions();
            for (let option of options) {
                this._addOption(option);
            }
            spoken.textContent = say;
            let height;
            switch (special && special.type) {
                case 'canvas': {
                    dialogueText.classList.add('speak-remove');
                    canvas.classList.remove('speak-remove');

                    ({height} = wrapper.getBoundingClientRect());

                    dialogueText.classList.remove('speak-remove');
                    canvas.classList.add('speak-remove');
                    break;
                }
                default: {
                    ({height} = wrapper.getBoundingClientRect());
                }
            }
            if (height > maxHeight) maxHeight = height;
        }

        wrapper.style.height = maxHeight + 'px';

        // Recover old state if was in the middle of a conversation
        ({
            spoken: spoken.textContent,
            toSpeak: toSpeak.textContent
        } = old);

        this._clearOptions();
        for (let button of old.buttons) {
            optionsWrapper.appendChild(button);
        }

        if (old.showingCanvas) {
            canvas.classList.remove('speak-remove');
        }
    }

    async start(dialogueData) {
        let {
            dialogue: dialogueText,
            canvas,
            context,
            options: optionsWrapper
        } = this.elems;

        this._setMaxHeight(dialogueData);
        let remeasure = () => {
            this._setMaxHeight(dialogueData)
        };
        window.addEventListener('resize', remeasure);

        let dialogue = processDialogue(dialogueData, 'OK');
        let data = {};
        let done = false;
        let value;
        let lastChoice;

        document.addEventListener('keydown', this._onKeyDown);

        while (({done, value} = dialogue.next(lastChoice)) && !done) {
            let {say, options, special} = value;

            this._clearOptions();
            let selectedOption = Promise.race(options.map(this._addOption));

            switch (special && special.type) {
                case 'canvas': {
                    let {saveTo} = special;

                    this.ink = 1;
                    this.markings = [];
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    dialogueText.classList.add('speak-remove');
                    canvas.classList.remove('speak-remove');

                    optionsWrapper.children[0].focus();
                    lastChoice = await selectedOption;

                    data[saveTo] = this.markings;
                    dialogueText.classList.remove('speak-remove');
                    canvas.classList.add('speak-remove');
                    break;
                }
                default: {
                    optionsWrapper.classList.add('speak-hide-options');

                    this.skipDialog = false;
                    await this._animateSpeak(say, options);

                    optionsWrapper.classList.remove('speak-hide-options');

                    optionsWrapper.children[0].focus();
                    lastChoice = await selectedOption;
                }
            }

        }

        window.removeEventListener('resize', remeasure);
        document.removeEventListener('keydown', this._onKeyDown);

        return data;
    }
}
