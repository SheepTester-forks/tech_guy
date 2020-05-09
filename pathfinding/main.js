for (let i = 0; i < 15; i++) {
    let row = document.createElement('div');
    row.classList.add('row');
    for (let j = 0; j < 15; j++) {
        let col = document.createElement('p');
        row.appendChild(col);
    }
    document.getElementById('test').appendChild(row);
}
