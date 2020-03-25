//let PERIODS = Array.from("ABCDEFI");

//const CLASSES = [
  //{name: "AP Physics C", type: "physics", teacher: "Bolaf", }
//]

let rg = new XMLHttpRequest();
//rg.open('GET', '../json/given-names.json', false);  // `false` makes the request synchronous
rg.open('GET', 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/names/json/given-names.json', false);  // `false` makes the request synchronous
rg.send(null);

let rs = new XMLHttpRequest();
//rs.open('GET', '../json/surnames.json', false);  // `false` makes the request synchronous
rs.open('GET', 'https://raw.githubusercontent.com/Nichodon/tech_guy/master/characters/names/json/surnames.json', false);  // `false` makes the request synchronous
rs.send(null);

let NAMES = JSON.parse(rg.responseText);
let SURNAMES = JSON.parse(rs.responseText);

function weightedChoose(list, pow=1.5) {
  return list[Math.floor(Math.pow(Math.random(), pow) * list.length)];
}

function randomStudent() {
  let grade = Math.floor(Math.random() * 4) + 9; // 9 through 12
  // Gender = pronouns and social groupings
  // Name = traditionally boy or girl names
  let name = Math.random() < 0.5 ? "F" : "M";
  let grand = Math.random();
  let gender = grand < 0.95 ? name : grand < 0.975 ? (name === "F" ? "M" : "F") : "O";
  return {
    name: {
      first: weightedChoose(name === "F" ? NAMES.girls : NAMES.boys),
      last: weightedChoose(SURNAMES.surnames)
    },
    gender: gender,
    grade: grade,
    personality: {
      friendliness: Math.random() * (0.5 + (grade - 9) / 6) /* older people friendlier */,
      interests: ["bio"]
    },
    chance: {
      drug: Math.random(),
      cut: Math.random(),
      violent: Math.random()
    },
    friends: []
  }
}

// need to add interests to this if interests is gonna be a thing
function evaluateSimilarity(student1, student2) {
  let similarity = 0;

  similarity += 0.5 * (student1.gender === student2.gender) + 0.5; // people like to segregate for some reason
  similarity += Math.hypot(student1.chance.drug - student2.chance.drug,
    student1.chance.cut - student2.chance.cut,
    student1.chance.violent - student2.chance.violent) / Math.sqrt(3);

  similarity += (student1.personality.friendliness + student2.personality.friendliness) / 2;
  similarity += 2 * (student1.grade === student2.grade); // most important factor

  return similarity / 5; // hopefully now this is 0-1
}

function friendCurve(friendliness) {
  // return how many friends a person with this friendliness should try to have
  return friendliness * 45 + 5; // bruh don't make this too big
}

function shouldBeFriends(s1, s2) {
  let sim = evaluateSimilarity(s1, s2);

  sim += (s1.friends.some(f => f.index === s2.index));
  sim += (s2.friends.some(f => f.index === s1.index));

  if (sim > 0.5 || Math.random() < 0.05) {
    return sim / 3;
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

  let Students = [...Array(1000).keys()].map(i => ({...randomStudent(), index: i}));
  let Friendships = [];

  let MAX_ITER = 2;

  for (let iterations = 0; iterations < MAX_ITER; iterations++) {
    for (let i = 0; i < Students.length; ++i) {
      let student = Students[i];

      for (let k = 0; k < randomlyRound(friendCurve(student.personality.friendliness) / MAX_ITER); ++k) {
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
