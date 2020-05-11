import {HSVtoRGB, vary} from '../../utils.js';

const bases = {
    skin: [[136, 102, 85], [204, 170, 153], [247, 221, 196], [255, 221, 204]],
    hair: [[51, 34, 0], [153, 102, 51], [204, 102, 0], [255, 238, 204]],
    hat: [[51, 51, 51], [102, 0, 34], [0, 34, 102], [238, 238, 238]],
    jacket: [[51, 51, 51], [102, 0, 34], [0, 34, 102], [238, 238, 238]],
    pants: [[51, 51, 51], [204, 170, 102], [0, 68, 153], [153, 153, 153]],
    shoes: [[51, 51, 51], [102, 68, 0], [102, 102, 102], [238, 238, 238]]
};
const varies = {
    skin: 2, hair: 8
}//todo: extend this to the other types

function getTint(type, index) {
    return vary(bases[type][index], varies[type], 8);
}

function getWardrobe() {
    let favorite = {
        hat: {
            chance: Math.random() < 0.9 ? 0 : Math.random() < 0.5 ? 1 : Math.random(),
            color: Math.floor(Math.random() * 4)
        },
        shirt: {
            type: Math.floor(Math.random() * 6),
            tint: HSVtoRGB(Math.random(), Math.random() * 0.75, Math.random() * 0.8 + 0.2)
        },
        jacket: {
            color: Math.floor(Math.random() * 4)
        },
        pants: {
            type: Math.floor(Math.random() * 2),
            color: Math.floor(Math.random() * 4)
        },
        shoes: {
            type: Math.floor(Math.random() * 2),
            color: Math.floor(Math.random() * 4)
        }
    };

    let wardrobe = {
        hat: [], shirt: [], pants: [], shoes: []
    };

    let types = ['hat', 'shirt', 'pants', 'shoes'];
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < Math.floor(Math.random() * 5) + 4; i++) {
            let shirtSwitch = types[j] === 'shirt' ? 'jacket' : types[j];

            let color = Math.random() < 0.75 ?
                bases[shirtSwitch][favorite[shirtSwitch].color] :
            bases[shirtSwitch][Math.floor(Math.random() * 4)];

            let tint = types[j] === 'shirt' ? [vary(favorite.shirt.tint, 4, 8)] : [];
            tint.push(vary(color, 4, 8));

            if (types[j] !== 'hat' || Math.random() < favorite.hat.chance) {
                wardrobe[types[j]].push({
                    type:
                    types[j] === 'hat' || Math.random() < 0.75 ? favorite[types[j]].type || 1 : Math.floor(Math.random() * 6),
                    tint: tint
                });
            }
        }
    }

    return wardrobe;
}

export {
    getWardrobe,
    getTint
};
