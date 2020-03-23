let map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 1, 3, 1, 0, 0, 1, 2, 1, 0, 0, 1, 3, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 2, 1, 0, 0, 1, 3, 1, 0, 0, 1, 2, 1, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
let doors = {
    'classes': {
        'A1': [3, 1],
        'A2': [0, 1],
        'A3': [0, 2],
        'A4': [0, 3],
        'A5': [3, 3],
        'B1': [3, 6],
        'B2': [0, 6],
        'B3': [0, 7],
        'B4': [0, 8],
        'B5': [3, 8],
        'C1': [3, 11],
        'C2': [0, 11],
        'C3': [0, 12],
        'C4': [0, 13],
        'C5': [3, 13],
        'D1': [4, 13],
        'D2': [7, 13],
        'D3': [7, 12],
        'D4': [7, 11],
        'D5': [4, 11],
        'E1': [4, 8],
        'E2': [7, 8],
        'E3': [7, 7],
        'E4': [7, 6],
        'E5': [4, 6],
        'F1': [4, 3],
        'F2': [7, 3],
        'F3': [7, 2],
        'F4': [7, 1],
        'F5': [4, 1]
    },
    'bathrooms': [
        [3, 2],
        [3, 7],
        [3, 12],
        [4, 12],
        [4, 7],
        [4, 2]
    ]
};

for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 15; j++) {
        document.getElementById('test').children[i].children[j].innerHTML = map[i][j];
        if (map[i][j] !== 0) {
            document.getElementById('test').children[i].children[j].style.backgroundColor = '#333';
        }
    }
}

function getNeighbors(node) {
    let poss = [new Node(node.x - 1, node.y), new Node(node.x, node.y - 1), new Node(node.x + 1, node.y), new Node(node.x, node.y + 1)];
    let neighbors = [];
    for (let i = 0; i < 4; i++) {
        if (poss[i].x > -1 && poss[i].x < 8 && poss[i].y > -1 && poss[i].y < 15 && map[poss[i].x][poss[i].y] === 0) {
            neighbors.push(poss[i]);
        }
    }
    neighbors.sort(() => Math.random() - 0.5);
    return neighbors;
}

class Node {
    constructor(x, y, parent) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.str = x + ',' + y;
    }
}

function simple(start, end) {
    let queue = [];
    let seen = [];
    
    queue.push(start);
    seen.push(start.str);

    while (queue.length) {
        let curr = queue.shift();

        if (curr.str === end.str) {
            return curr;
        }

        let neighbors = getNeighbors(curr);
        for (let k = 0; k < neighbors.length; k++) {
            let neighbor = neighbors[k];
            
            if (!seen.includes(neighbor.str)) {
                queue.push(neighbor);
                seen.push(neighbor.str);
                neighbor.parent = curr;
            }
        }
    }
    
    return -1;
}

let doorList = Object.values(doors.classes);
doorList = doorList.concat(doors.bathrooms);

let thing = [];
for (let i = 0; i < 8; i++) {
    let row = [];
    for (let j = 0; j < 15; j++) {
        row.push(0);
    }
    thing.push(row);
}

let iter = 1000;
for (let i = 0; i < iter; i++) {
    let randS = doorList[Math.floor(Math.random() * doorList.length)];
    let randE = doorList[Math.floor(Math.random() * doorList.length)];
    let path = simple(new Node(randS[0], randS[1]), new Node(randE[0], randE[1]));
    thing[path.x][path.y]++;
    while (path.parent) {
        path = path.parent;
        thing[path.x][path.y]++;
    }
}

for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
        let value = thing[i][j] * iter / 800;
        let color = 'rgb(' + ((value - 127) * 2) + ',' + 0 + ',' + ((127 - Math.abs(127 - value)) * 2) + ')';
        document.getElementById('test').children[i].children[j].style.backgroundColor = color;
        document.getElementById('test').children[i].children[j].style.color = color;
    }
}