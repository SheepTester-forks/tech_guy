export function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function bindMethods(instance, methods) {
    for (const methodName of methods) {
        instance[methodName] = instance[methodName].bind(instance);
    }
}

export function frame() {
    return new Promise(resolve => window.requestAnimationFrame(resolve));
}

export function vary(color, hdeg, bdeg) {
    let brand = Math.random() * (bdeg * 2 + 1) - bdeg;
    return [Math.min(Math.max(color[0] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255),
            Math.min(Math.max(color[1] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255),
            Math.min(Math.max(color[2] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255)]
}

export function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6); f = h * 6 - i; p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

export function inRange(num, {min=-Infinity, max=Infinity}={}) {
    return num >= min && num <= max;
}

// Has a copy in sprite.worker.js
export async function* receive(worker=self) {
    let nextDone;
    let next = [];
    function newNext() {
        next.push(new Promise(resolve => (nextDone = resolve)));
    }
    newNext();
    worker.addEventListener('message', ({data}) => {
        nextDone(data);
        newNext();
    });
    for (;;) {
        yield await next.shift();
    }
}
