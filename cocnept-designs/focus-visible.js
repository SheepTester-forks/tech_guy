// Using invisible by default makes the focus ring visible if JS doesn't load
// Obscure case but whatever

// Based on https://github.com/Orbiit/elimination/blob/master/js/tab-key-focus.js

let focusInvisible = true;
document.body.classList.add('focus-invisible');

document.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
        focusInvisible = false;
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.add('focus-invisible');
    focusInvisible = true;
});

document.addEventListener('focusin', () => {
    if (!focusInvisible) {
        document.body.classList.remove('focus-invisible');
    }
});
