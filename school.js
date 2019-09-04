let PERIODS = Array.from("ABCDEFI");

//const CLASSES = [
  //{name: "AP Physics C", type: "physics", teacher: "Bolaf", }
//]

let rg = new XMLHttpRequest();
//rg.open('GET', '../json/given-names.json', false);  // `false` makes the request synchronous
rg.open('GET', 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/json/given-names.json', false);  // `false` makes the request synchronous
rg.send(null);

let rs = new XMLHttpRequest();
//rs.open('GET', '../json/surnames.json', false);  // `false` makes the request synchronous
rs.open('GET', 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/json/surnames.json', false);  // `false` makes the request synchronous
rs.send(null);

let NAMES = JSON.parse(rg.responseText);
let SURNAMES = JSON.parse(rs.responseText);

function weightedChoose(list, pow=1.1) {
  return list[Math.floor(Math.pow(Math.random(), pow) * list.length)];
}

function randomStudent() {
  let grade = Math.floor(Math.random() * 4) + 9; // 9 through 12

  if (Math.random() < 0.5) {
    return {
      first: Math.random() > 0.95 ? weightedChoose(NAMES.girls) : weightedChoose(NAMES.boys),
      grade,
      sex: "F",
      last: weightedChoose(SURNAMES.surnames),
      drug_chance: Math.random(), // 0 to 1
      cut_chance: Math.random(),
      violent_chance: Math.random(),
      personality: {
        friendliness: Math.random() * (1 + (grade - 9) / 3) /* older people friendlier */,
        interests: ["bio"]
      }, friends: []
    };
  } else {
    return {
      first: Math.random() > 0.95 ? weightedChoose(NAMES.boys) : weightedChoose(NAMES.girls),
      grade,
      sex: 'M',
      last: weightedChoose(SURNAMES.surnames),
      drug_chance: Math.random(), // 0 to 1
      cut_chance: Math.random(),
      violent_chance: Math.random(),
      personality: {
        friendliness: Math.random() * (1 + (grade - 9) / 3) /* older people friendlier */,
        interests: ["bio"] // will be used later for assigning classes
      }, friends: []
    };
  }
}

function evaluateSimilarity(student1, student2) {
  let similarity = 0;

  similarity += 0.5 * (student1.sex === student2.sex) + 0.4; // boys are more likely to have boys as friends, etc.
  similarity += Math.hypot(student1.drug_chance - student2.drug_chance,
    student1.cut_chance - student2.cut_chance,
    student1.violent_chance - student2.violent_chance) - 1.3;

  similarity += (student1.personality.friendliness + student2.personality.friendliness) / 2;
  similarity += 4 * (student1.grade === student2.grade) - 2; // most important factor

  return similarity;
}

function friendCurve(friendliness) {
  // return how many friends a person with this friendliness should try to have
  return friendliness * 105 + 15;
}

function shouldBeFriends(s1, s2) {
  let sim = evaluateSimilarity(s1, s2);

  sim += (s1.friends.some(f => f.index === s2.index));
  sim += (s2.friends.some(f => f.index === s1.index));

  if (sim > 2) {
    return Math.max(sim * (Math.random() - 0.5), 0);
  } else {
    return Math.abs(sim) * (Math.random() < 0.015); // random friends who are really different lol
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

  let Students = [...Array(768).keys()].map(i => ({...randomStudent(), index: i}));
  let Friendships = [];

  let MAX_ITER = 25;

  for (let iterations = 0; iterations < MAX_ITER; iterations++) {
    for (let i = 0; i < Students.length; ++i) {
      let student = Students[i];

      for (let k = 0; k < randomlyRound(friendCurve(student.personality.friendliness) / MAX_ITER); ++k) {
        let random_student = weightedChoose(Students, 1);
        if (student.friends.some(s => s.index === i)) continue;

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
