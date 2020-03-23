const alphabet = 'abcdefghijklmnopqrstuvwxyz';

function getData(link) {
    let request = new XMLHttpRequest();
    //request.open('GET', '../json/surnames.json', false);  // `false` makes the request synchronous
    request.open('GET', link, false);  // `false` makes the request synchronous
    request.send(null);

    let names = JSON.parse(request.responseText).boys || JSON.parse(request.responseText).surnames;
    
    let data = {};
    let starts = {};
    
    for (let i = 0; i < names.length; i++) {
        let curve = Math.pow(4, -i / (names.length / 2));
        
        let name = names[i];
        
        let start = name.substr(0, 3);
        starts[start] = safeAdd(starts[start], curve);
        
        for (let j = 0; j < name.length - 2; j++) {
            let sub = name.substr(j, 3);
            let next = name[j + 3] || '';
            data[sub] = safeSet(data[sub], {});
            data[sub][next] = safeAdd(data[sub][next], curve);
        }
    }
    
    return [data, starts];
}

function safeSet(obj, arg) {
    return obj ? obj : arg;
}

function safeAdd(obj, arg) {
    return obj ? obj + arg : arg;
}

function generate(args) {
    let debug = '';
    
    let data = args[0];
    let starts = args[1];
    
    let s_keys = Object.keys(starts);
    let s_vals = Object.values(starts);
    
    let s_sum = s_vals.reduce((x, y) => x + y);
    let s_rand = Math.random() * s_sum;
    let s_count = 0;
    
    let out = '';
    let curr = '';
    
    for (let i = 0; i < s_keys.length; i++) {
        let s_curr = s_keys[i];
        s_count += s_vals[i];
        if (s_rand < s_count) {
            out = s_curr;
            curr = s_curr;
            break;
        }
    }
    
    debug += out + '\n';
    
    for (let i = 0; i < 100; i++) {
        if (!data[curr]) {
            return out;
        }
        
        let d_keys = Object.keys(data[curr]);
        let d_vals = Object.values(data[curr]);
        
        let d_sum = d_vals.reduce((x, y) => x + y);
        let d_rand = Math.random() * d_sum;
        let d_count = 0;
        
        for (let j = 0; j < d_keys.length; j++) {
            let d_curr = d_keys[j];
            d_count += d_vals[j];
            if (d_rand < d_count) {
                out += d_curr;
                curr = out.substr(i + 1);
                break;
            }
        }
    }
    
    return 'oops';
}

let given = getData('https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/json/given-names.json');
let sur = getData('https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/json/surnames.json');

let gened = [];

for (let i = 0; i < 500; i++) {
    gened.push(generate(given) + ' ' + generate(sur));
}

gened.sort();
let display = '';

for (let i = 0; i < 500; i++) {
    display += gened[i] + '<br>';
}

document.body.innerHTML = display;