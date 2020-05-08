import * as NAMES from '../characters/names/ntv2.js';

const NAME_DATA = {};

function getNames() {
    let given_d = NAMES.getData('https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/names/json/given-names.json');
    let sur_d = NAMES.getData('https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/names/json/surnames.json');

    NAME_DATA.boys = NAMES.parseData(given_d, 'boys');
    NAME_DATA.girls = NAMES.parseData(given_d, 'girls');
    NAME_DATA.surnames = NAMES.parseData(sur_d, 'surnames');
}


function weightedChoose(list, pow=2) {
    return list[Math.floor(Math.pow(Math.random(), pow) * list.length)];
}

function randomStudent() {
    let grade = Math.floor(Math.random() * 4) + 9; // 9 through 12
    // Gender = social / pronouns
    // Name = traditionally boy or girl names
    let name = Math.random() < 0.5 ? "F" : "M";

    let rand = Math.random();
    let gender = rand < 0.95 ? name : rand < 0.975 ? (name === "F" ? "M" : "F") : "O";

    let skinColor = Math.random();
    let hairType = Math.random();
    let hairColor = Math.random();

    return {
        name: {
            first: NAMES.generate(name === "F" ? NAME_DATA.girls : NAME_DATA.boys, 8, 5),
            last: NAMES.generate(NAME_DATA.surnames, 8, 7)
        },
        gender: gender,
        grade: grade,
        friendliness: Math.random() * (0.5 + (grade - 9) / 6), // seniors have more connections
        chance: {
            drug: Math.random(),
            disobey: Math.random(),
            violent: Math.random()
        },
        friends: [],
        appearance: {
            skinColor: skinColor,
            hairType: hairType,
            hairColor: hairColor
        },
        picture: {
            hairType: Math.random() < 0.9 ? hairType : Math.random(),
            hairColor: Math.random() < 0.9 ? hairColor : Math.random(),
            shirtType: Math.random(),
            shirtColor: Math.random()
        }
    }
}

function getSimilarity(student1, student2) {
    let similarity = 0;

    similarity += student1.gender === student2.gender; // segregation rules the nation \("/)/

    similarity += 1 - Math.abs(student1.chance.drug - student2.chance.drug);
    similarity += 1 - Math.abs(student1.chance.disobey - student2.chance.disobey);
    similarity += 1 - Math.abs(student1.chance.violent - student2.chance.violent);

    similarity += (student1.friendliness + student2.friendliness) / 2;
    similarity += 2 * (student1.grade === student2.grade); // most important factor

    return similarity / 7; // hopefully now this is 0-1
}

function friendCurve(friendliness) {
    // return how many friends a person with this friendliness should try to have
    return friendliness * 40 + 10;
}

function shouldBeFriends(s1, s2) {
    let similarity = getSimilarity(s1, s2);

    similarity += (s1.friends.some(f => f.index === s2.index));
    similarity += (s2.friends.some(f => f.index === s1.index));

    if (similarity > 0.5 || Math.random() < 0.05) {
        return similarity / 3;
    } else {
        return 0;
    }
}

function randomlyRound(r) {
    if (Math.random() < Math.trunc(r)) {
        return Math.ceil(r);
    } else {
        return Math.floor(r);
    }
}

function generateSchool() {
    // School contains classes, teachers, students
    getNames();

    let Students = [...Array(1000).keys()].map(i => ({...randomStudent(), index: i}));
    let MAX_ITER = 20;

    for (let iterations = 0; iterations < MAX_ITER; iterations++) {
        for (let i = 0; i < Students.length; i++) {
            let student = Students[i];

            for (let k = 0; k < randomlyRound(friendCurve(student.friendliness) / MAX_ITER); k++) {
                let random_student = weightedChoose(Students, 1);

                if (student.friends.some(s => s.index === i)) { continue; }

                let degree = shouldBeFriends(student, random_student);

                if (degree > 0) {
                    student.friends.push({degree, index: random_student.index});
                    random_student.friends.push({degree, index: student.index});
                }
            }
        }
    }

    return {Students};
}

export {
    generateSchool
};
