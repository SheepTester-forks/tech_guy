const PARAMS = {
    factor: 1000, // a high FACTOR will mean some game minutes will be skipped
    start: {
        month: 5,
        day: 5
    },
    mlength: 31 // game takes place over one month so it's not necessary to make this smarter
};

const BELLS = [
    { time: [8, 0], type: 'c', index: 0 },
    { time: [9, 20], type: 'p' },
    { time: [9, 30], type: 'c', index: 1 },
    { time: [10, 50], type: 'p' },
    { time: [11, 0], type: 'c', index: 2 },
    { time: [12, 20], type: 'p' },
    { time: [12, 30], type: 'l' },
    { time: [12, 50], type: 'p' },
    { time: [13, 0], type: 'c', index: 3 },
    { time: [14, 20], type: 'p' },
    { time: [14, 30], type: 'c', index: 4 },
    { time: [15, 50] }
];

const SCHEDULE = [
    [0, 1, 2, 5],
    [3, 4, 1, 0, 5],
    [1, 2, 3, 4, 5],
    [4, 1, 2, 3, 0],
    [2, 3, 4, 0, 5]
];

let timeData = {
    pause: 0,
    day: 0,
    start: 0,
    min: 0,
    bell: 0,
    game: {
        month: 0,
        day: 0,
        weekday: 0,
        hour: 0,
        min: 0,
        period: 0, // -1=passing, 6=lunch
    },
    display: {
        date: '',
        weekday: '',
        time: '',
    }
};

function resetGame() {
    timeData.day = 0;
    resetDay();
}

function resetDay() {
    timeData.start = Date.now();
    timeData.bell = -1;
}

function resume() {
    timeData.start += Date.now() - timeData.pause;
}

function pause() {
    timeData.pause = Date.now();
}

function isPastTime(time) {
    return timeData.game.hour > time[0] || (timeData.game.hour === time[0] && timeData.game.min >= time[1]);
}

function loop() {
    timeData.min = Math.floor((Date.now() - timeData.start) * PARAMS.factor / 60000);

    timeData.game.month = Math.floor((timeData.day + PARAMS.start.day - 1) / PARAMS.mlength) + PARAMS.start.month;
    timeData.game.week = timeData.day % 7;
    timeData.game.day = (timeData.day + PARAMS.start.day - 1) % PARAMS.mlength + 1;
    timeData.game.hour = Math.floor((timeData.min + BELLS[0].time[1]) / 60) + BELLS[0].time[0];
    timeData.game.min = (timeData.min + BELLS[0].time[1]) % 60;
    
    if (isPastTime(BELLS[timeData.bell + 1].time)) {
        timeData.bell++;
        if (BELLS[timeData.bell].type === 'c') {
            timeData.game.period = SCHEDULE[timeData.game.week][BELLS[timeData.bell].index];
        } else if (BELLS[timeData.bell].type === 'l') {
            timeData.game.period = 6;
        } else if (BELLS[timeData.bell].type === 'p') {
            if (SCHEDULE[timeData.game.week].length === BELLS[timeData.bell - 1].index + 1) {
                timeData.day += timeData.day % 7 === 4 ? 3 : 1;
                pause();
                return false;
            }
            timeData.game.period = -1;
        } else {
            timeData.day += timeData.day % 7 === 4 ? 3 : 1;
            pause();
            return false;
        }
    }

    return true;
}

function getData() {
    return timeData;
}

export {
    getData,
    resetGame,
    resetDay,
    resume,
    pause,
    loop,
    PARAMS
};