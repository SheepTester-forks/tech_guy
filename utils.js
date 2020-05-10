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
