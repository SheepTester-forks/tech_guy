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
