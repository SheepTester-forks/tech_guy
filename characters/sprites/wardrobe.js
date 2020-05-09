const bases = {
    hat: [[51, 51, 51], [102, 0, 34], [0, 34, 102], [238, 238, 238]],
    jacket: [[51, 51, 51], [102, 0, 34], [0, 34, 102], [238, 238, 238]],
    pants: [[51, 51, 51], [204, 170, 102], [0, 68, 153], [153, 153, 153]],
    shoes: [[51, 51, 51], [102, 68, 0], [102, 102, 102], [238, 238, 238]]
};

function getWardrobe(sprite) {
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

function vary(color, hdeg, bdeg) {
    let brand = Math.random() * (bdeg * 2 + 1) - bdeg;
    return [Math.min(Math.max(color[0] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255),
            Math.min(Math.max(color[1] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255),
            Math.min(Math.max(color[2] + Math.random() * (hdeg * 2 + 1) - hdeg + brand, 0), 255)]
}

function HSVtoRGB(h, s, v) {
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

export {
    getWardrobe
};