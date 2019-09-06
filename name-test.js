const alphabet = 'abcdefghijklmnopqrstuvwxyz';

function getData(link) {
    let request = new XMLHttpRequest();
    //request.open('GET', '../json/surnames.json', false);  // `false` makes the request synchronous
    request.open('GET', link, false);  // `false` makes the request synchronous
    request.send(null);

    let big_list = JSON.parse(request.responseText).boys || JSON.parse(request.responseText).surnames;

    let data = [];
    let starts = [];
    let first = [];

    for (let i = 0; i < big_list.length; i++) {
        let name = big_list[i].toLowerCase();
        let start1 = alphabet.indexOf(name[0]);
        let start2 = alphabet.indexOf(name[1]);
        starts[start1] = starts[start1] ? starts[start1] : [];
        starts[start1][start2] = starts[start1][start2] ? starts[start1][start2] + 1 : 1;

        first[start1] = first[start1] ? first[start1] + 1 : 1;

        for (let j = 2; j < name.length; j++) {
            let letter1 = alphabet.indexOf(name[j - 2]);
            let letter2 = alphabet.indexOf(name[j - 1]);
            let letter3 = alphabet.indexOf(name[j]);
            data[letter1] = data[letter1] ? data[letter1] : [];
            data[letter1][letter2] = data[letter1][letter2] ? data[letter1][letter2] : [];
            data[letter1][letter2][letter3] = data[letter1][letter2][letter3] ? data[letter1][letter2][letter3] + 1 : 1;
            if (j === name.length - 1) {
                data[letter2] = data[letter2] ? data[letter2] : [];
                data[letter2][letter3] = data[letter2][letter3] ? data[letter2][letter3] : [];
                data[letter2][letter3][26] = data[letter2][letter3][26] ? data[letter2][letter3][26] + 1 : 1;
            }
        }
    }

    let totals = [];
    let stotals = [];
    let ftotals = [];

    for (let i = 0; i < data.length; i++) {
        totals[i] = [];
        for (let j = 0; j < 26; j++) {
            totals[i][j] = [];
            let n = 0;
            for (let k = 0; k < 27; k++) {
                n += data[i][j] ? data[i][j][k] ? data[i][j][k] : 0 : 0;
                totals[i][j][k] = n;
            }
        }
    }

    for (let i = 0; i < starts.length; i++) {
        stotals[i] = [];
        let n = 0;
        for (let j = 0; j < 26; j++) {
            n += starts[i][j] ? starts[i][j] : 0;
            stotals[i][j] = n;
        }
    }

    let n = 0;
    for (let i = 0; i < first.length; i++) {
        n += first[i];
        ftotals[i] = n;
    }
    
    return [totals, stotals, ftotals];
}

let given = getData('https://raw.githubusercontent.com/Nichodon/tech_guy/master/json/given-names.json');
let sur = getData('https://raw.githubusercontent.com/Nichodon/tech_guy/master/json/surnames.json');

let bigbrain = [];
for (let i = 0; i < 1000; i++) {
    bigbrain.push(generate(sur[0], sur[1], sur[2], 1.125) + ', ' + generate(given[0], given[1], given[2], 1.1875));
}
bigbrain.sort();
let display = document.createElement('p');
document.body.appendChild(display);
for (let i = 0; i < bigbrain.length; i++) {
    display.innerHTML += bigbrain[i] + '<br>';
}


function generate(totals, stotals, ftotals, factor) {
    let curr1 = -1;
    let rands = Math.floor(Math.random() * ftotals[25]);
    for (let i = 0; i < 26; i++) {
        if (rands < ftotals[i]) {
            curr1 = i;
            break;
        }
    }
    let curr2 = -1;
    let randc = Math.floor(Math.random() * stotals[curr1][25]);
    let debug = '';
    for (let i = 0; i < 26; i++) {
        if (randc < stotals[curr1][i]) {
            curr2 = i;
            break;
        }
    }
    debug += ('curr1: ' + curr1);
    debug += ('\ncurr2: ' + curr2);
    let out = alphabet[curr1];
    for (let i = 0; i < 100; i++) {
        let decay = (totals[curr1][curr2][26] - totals[curr1][curr2][25]) * (Math.pow(factor, (out.length) * 2) - 1);
        let random = Math.floor(Math.random() * (totals[curr1][curr2][25] + decay));
        debug += ('\ni: ' + i);
        debug += ('\n- end chance: ' + (totals[curr1][curr2][26] - totals[curr1][curr2][25]));
        debug += ('\n- decay: ' + decay);
        for (let j = 0; j < 27; j++) {
            if (j === 26) {
                return out[0].toUpperCase() + out.substr(1) + alphabet[curr2];
            }
            if (random < totals[curr1][curr2][j]) {
                out += alphabet[curr2];
                debug += ('\n- j: ' + j);
                debug += ('\n--- out: ' + out);
                curr1 = curr2;
                curr2 = j;
                break;
            }
        }
    }
    return totals[curr1][curr2].toString();
}