const CLASSES = [
    {
        'name': 'Advanced World History', 'short': ['history'],
        'grades': [9], 'rooms': 1.5, 'type': 'soc1', 'req': 'soc'
    },
    {
        'name': 'Advanced Government', 'short': ['gov'],
        'grades': [10], 'rooms': 1.5, 'type': 'soc1', 'req': 'soc'
    },
    {
        'name': 'Advanced US History', 'short': ['USH'],
        'grades': [11], 'rooms': 1.5, 'type': 'soc2', 'req': 'soc'
    },
    {
        'name': 'Advanced Economy', 'short': ['econ'],
        'grades': [12], 'rooms': 1.5, 'type': 'soc2', 'req': 'soc'
    },
    {
        'name': 'Honored Spanish', 'short': ['spanish'],
        'grades': [9, 10], 'rooms': 1, 'type': 'lang1', 'req': 'lang'
    },
    {
        'name': 'Advanced Spanish', 'short': ['spanish'],
        'grades': [11, 12], 'rooms': 1, 'type': 'lang1', 'req': 'lang'
    },
    {
        'name': 'Honored French', 'short': ['french'],
        'grades': [9, 10], 'rooms': 1, 'type': 'lang2', 'req': 'lang'
    },
    {
        'name': 'Advanced French', 'short': ['french'],
        'grades': [11, 12], 'rooms': 1, 'type': 'lang2', 'req': 'lang'
    },
    {
        'name': 'Advanced Art', 'short': ['art'],
        'grades': [9, 10, 11, 12], 'rooms': 2, 'type': 'lang3', 'req': 'lang'
    },
    {
        'name': 'Honored Biology', 'short': ['bio'],
        'grades': [9], 'rooms': 1.5, 'type': 'sci1', 'req': 'sci'
    },
    {
        'name': 'Honored Chemistry', 'short': ['chem'],
        'grades': [10], 'rooms': 1.5, 'type': 'sci2', 'req': 'sci'
    },
    {
        'name': 'Advanced Biology', 'short': ['bio'],
        'grades': [11, 12], 'rooms': 1, 'type': 'sci1', 'req': 'sci'
    },
    {
        'name': 'Advanced Chemistry', 'short': ['chem'],
        'grades': [11, 12], 'rooms': 1, 'type': 'sci2', 'req': 'sci'
    },
    {
        'name': 'Advanced Physics', 'short': ['physics'],
        'grades': [11, 12], 'rooms': 1, 'type': 'sci3', 'req': 'sci'
    },
    {
        'name': 'Honored English', 'short': ['english'],
        'grades': [9, 10], 'rooms': 3, 'type': 'eng1', 'req': 'eng'
    },
    {
        'name': 'Advanced English', 'short': ['english'],
        'grades': [11, 12], 'rooms': 3, 'type': 'eng1', 'req': 'eng'
    },
    {
        'name': 'Honored Geometry', 'short': ['geo'],
        'grades': [9], 'rooms': 1.5, 'type': 'math1', 'req': 'math'
    },
    {
        'name': 'Honored Trigonometry', 'short': ['trig'],
        'grades': [10], 'rooms': 1.5, 'type': 'math1', 'req': 'math'
    },
    {
        'name': 'Honored Algebra 2', 'short': ['alg 2'],
        'grades': [11], 'rooms': 1.5, 'type': 'math2', 'req': 'math'
    },
    {
        'name': 'Advanced Calculus', 'short': ['calc'],
        'grades': [12], 'rooms': 1.5, 'type': 'math2', 'req': 'math'
    }
];

let students = generateSchool();
console.log(students);

const reqs = ['soc', 'lang', 'sci', 'eng', 'math'];
const PERIODS = 6;

function getClass(grade, req) {
    return CLASSES.filter(
        x => x.req === req &&
        x.grades.filter(y => y === grade).length > 0
    );
}

// generate class table
let schedule = [];
let n = 0;
let currClass = 0;
for (let j = 0; j < 180 / PERIODS; j++) {
    if (currClass === CLASSES.length) {
        //break;
    }
    let type = CLASSES[currClass].type;
    let row = [];
    for (let i = 0; i < PERIODS; i++) {
        row.push({
            'name': CLASSES[currClass].name,
            'students': []
        });
        n++;
        if (n >= CLASSES[currClass].rooms * PERIODS) {
            n = 0;
            currClass++;
            if (currClass === CLASSES.length || CLASSES[currClass].type !== type) {
                //break;
            }
        }
    }
    row.sort(() => Math.random() - 0.5);
    schedule = schedule.concat(row);
}


for (let i = 0; i < schedule.length; i++) {
    schedule[i].period = i % PERIODS;
    schedule[i].room = Math.floor(i / PERIODS);
}
//console.log(schedule);

let studentList = students['Students'];
studentList = studentList.sort((x, y) => x.grade - y.grade);

for (let j = 0; j < studentList.length; j++) {
    
    let student = studentList[j];
    let classes = [];
    
    for (let i = 0; i < reqs.length; i++) {
        let req = reqs[i];
        let classList = getClass(student.grade, req);
        let chosen = classList[Math.floor(Math.random() * classList.length)];
        
        classes.push({'name': chosen.name, 'grades': chosen.grades, 'rooms': chosen.rooms});
    }
    
    // at this point, the classes the student "wants" to take has been generated
    // no actual classes have been generated
    
    classes.sort(() => Math.random() - 0.5); // epic randomizer
    
    let takenPeriods = [];
    
    for (let i = 0; i < classes.length; i++) {
        let _class = classes[i];
        let existing = schedule.filter(
            x => x.name === _class.name && !takenPeriods.includes(x.period)
        );
        
        if (existing.length === 0) {
            console.log('big owie');
            continue;
        }
        
        existing.sort(() => Math.random() - 0.5);
        existing.sort((x, y) => x.students.length - y.students.length);
        existing[0].students.push(student.index);
        takenPeriods.push(existing[0].period);
    }
}

console.log(schedule.sort((x, y) => x.room - y.room));

function getStudentSchedule(student) {
    console.log(schedule.filter(x => x.students.includes(student.index)).sort((x, y) => x.period - y.period));
}