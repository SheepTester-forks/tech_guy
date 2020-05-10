function getNeighbors(node, isValid) {
    let poss = [new Node(node.x - 1, node.y), new Node(node.x, node.y - 1), new Node(node.x + 1, node.y), new Node(node.x, node.y + 1)];
    let neighbors = [];
    for (let i = 0; i < 4; i++) {
        if (isValid(poss[i])) {
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

function simple(start, end, isValid) {
    let queue = [];
    let seen = [];

    queue.push(start);
    seen.push(start.str);

    while (queue.length) {
        let curr = queue.shift();

        if (curr.str === end.str) {
            return curr;
        }

        let neighbors = getNeighbors(curr, isValid);
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

export {
    Node,
    simple
};
