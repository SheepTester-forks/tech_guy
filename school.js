let PERIODS = Array.from("ABCDEFI");

//const CLASSES = [
  //{name: "AP Physics C", type: "physics", teacher: "Bolaf", }
//]

var request = new XMLHttpRequest();
request.open('GET', '/json/baby_names.json', false);  // `false` makes the request synchronous
request.send(null);

let NAMES = JSON.parse(request.responseText);

function weightedChoose(listicle, pow=2) {
  return listicle[Math.floor(Math.pow(Math.random(), 2) * listicle.length)]
}

function randomStudent() {
  let grade = Math.floor(Math.random() * 4) + 9; // 9 through 12

  if (Math.random() < 0.508) {
    // female
    return {
      first: weightedChoose(NAMES.girls),
      grade,
      gender: 'F',
      last: "Newdam",
      drug_susceptibility: Math.random(), // 0 to 1
      politiq_susceptibility: Math.random(),
      violence_susceptibility: Math.pow(Math.random(), 1.4 /* makes girls less violent; is this sexist XD */),
      personality: {
        friendliness: Math.random() * (1 + (grade - 9) / 3) /* older people friendlier */,
        interests: ["bio"]
      }, friends: []
    };
  } else {
    // male
    return {
      first: weightedChoose(NAMES.boys),
      grade,
      gender: 'M',
      last: "Newdam",
      drug_susceptibility: Math.random(), // 0 to 1
      politiq_susceptibility: Math.random(),
      violence_susceptibility: Math.random(),
      personality: {
        friendliness: Math.random() * (1 + (grade - 9) / 3) /* older people friendlier */,
        interests: ["bio"] // will be used later for assigning classes
      }, friends: []
    };
  }
}

function evaluateSimilarity(student1, student2) {
  let similarity = 0;

  similarity += 0.5 * (student1.gender === student2.gender) + 0.4; // boys are more likely to have boys as friends, etc.
  similarity += Math.hypot(student1.drug_susceptibility - student2.drug_susceptibility,
    student1.politiq_susceptibility - student2.politiq_susceptibility,
    student1.violence_susceptibility - student2.violence_susceptibility) - 1.3;

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

  let Students = [...Array(750).keys()].map(i => ({...randomStudent(), index: i}));
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
