// Centralize some things so that a page only creates one instance of it.
// This could be used for a shared audio context, for example.

import {WorkerSpriteMaker} from './characters/sprites/worker-sprite-maker.js';

let workerSpriteMaker;
export function getWorkerSpriteMaker() {
    if (!workerSpriteMaker) {
        workerSpriteMaker = new WorkerSpriteMaker();
    }
    return workerSpriteMaker;
}

let params;
export function param(key) {
    if (!params) {
        params = new URL(window.location).searchParams;
    }
    return params.get(key);
}
