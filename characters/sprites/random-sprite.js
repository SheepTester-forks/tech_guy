import {HSVtoRGB} from '../../utils.js';

function randomSkin(color) {
    return vary([[136, 102, 85], [204, 170, 153], [247, 221, 196], [255, 221, 204]][color], 2, 8);
}

function randomHair(color) {
    return vary([[51, 34, 0], [153, 102, 51], [204, 102, 0], [255, 238, 204]][Math.floor(Math.random() * (color === 3 ? 4 : color))], 8, 8);
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

function vary(color, hdeg, bdeg) {
    let brand = Math.random() * (bdeg * 2 + 1) - bdeg;
    return [Math.min(Math.max(color[0] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255),
            Math.min(Math.max(color[1] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255),
            Math.min(Math.max(color[2] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255)]
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
