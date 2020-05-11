import {HSVtoRGB, vary} from '../../utils.js';
import {getTint} from './wardrobe.js';

function randomSkin(color) {
    return getTint('skin', color);
}

function randomHair(color) {
    return getTint('hair', Math.floor(Math.random() * (color === 3 ? 4 : color)));
}

function randomJacket() {
    return vary([[51, 51, 51], [102, 0, 34], [0, 34, 102], [238, 238, 238]][Math.floor(Math.random() * 4)], 4, 8);
}

function randomShirt() {
    return vary(HSVtoRGB(Math.random(), Math.random() * 0.75, Math.random() * 0.8 + 0.2), 0, 0);
}

function randomPants() {
    return vary([[51, 51, 51], [204, 170, 102], [0, 68, 153], [153, 153, 153]][Math.floor(Math.random() * 4)], 8, 8);
}

function randomShoes() {
    return vary([[51, 51, 51], [102, 68, 0], [102, 102, 102], [238, 238, 238]][Math.floor(Math.random() * 4)], 4, 8);
}

function randomSprite() {
    let color = Math.floor(Math.random() * 4);
    return {
        skin: { tint: [randomSkin(color)] },
        pants: { type: Math.floor(Math.random() * 2), tint: [randomPants()] },
        shoes: { type: Math.floor(Math.random() * 2), tint: [randomShoes()] },
        shirt: { type: Math.floor(Math.random() * 6), tint: [randomShirt(), randomJacket()] },
        hair: { type: Math.floor(Math.random() * 6), tint: [randomHair(color)] },
        hat: { type: Math.floor(Math.random() * 100) === 0, tint: [randomJacket()] },
        height: Math.floor(Math.random() * 4),
        facing: Math.floor(Math.random() * 2) * 2 - 1
    };
}

export {
    randomSkin,
    randomHair,
    randomJacket,
    randomShirt,
    randomPants,
    randomShoes,
    randomSprite
};
