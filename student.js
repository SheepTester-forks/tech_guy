/*
Some remarks

Times are represented in game as Unix time

*/

const Sex = {Male: 'M', Female: 'F'};
const Gender = {Man: 'M', Woman: 'W', Other: 'O'};
const SexualOrientation = {Male: 'M', Female: 'F', Other: 'O', None: 'A', All: 'P'};

const HairType = {None: 'N', Short: 'S', Medium: 'M', MediumLong: 'ML', Long: 'L', Afro: 'A', Fade: 'F'};
const Height = {Short: 'S', Medium: 'M', Tall: 'T', Extreme: 'E'};

const SkinColor = {Light: 'L', Medium: 'M', Dark: 'D'};
const Thiqness = {Small: 'S', Medium: 'M', Large: 'L'};

class Human {
  constructor(params = {}) {
    this.firstName = params.firstName || "John";
    this.lastName = params.lastName || "Smith";
    this.nickname = params.nickname || this.firstName;

    this.sex = params.sex || Sex.Female;
    this.gender = params.gender || Gender.Man;
    this.humanID = select(params.humanID,1);
  }

  parameterize() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      sex: this.sex,
      gender: this.gender,
      humanID: this.humanID,
      nickname: this.nickname
    };
  }

  formalName() {
    return this.lastName + ', ' + this.firstName;
  }

  fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

/* Class representing a student, including the following parameters:

firstName: string
lastName: string

*/
class Student extends Human {
  constructor(params = {}) {
    super(params);

    this.drugsLikelihood = select(params.drugsLikelihood,0);
    this.politicsLikelihood = select(params.politicsLikelihood,0);
    this.violenceLikelihood = select(params.violenceLikelihood,0);
    this.physical = Object.assign({
      hairColor: 0xffffff,
      hairType: HairType.None,
      height: Height.Short,
      skinType: SkinType.Medium,
      thiqness: Thiqness.Medium
    }, params.physical || {});
    this.sexualOrientation = params.sexualOrientation || SexualOrientation.All;
    this.grade = params.grade || 12;
    this.dailySleep = params.dailySleep || 2;
    this.intelligence = params.intelligence || 100;
    this.crimes = [];
    this.suspensions = [];
    this.classes = [];
    this.friends = [];
  }

  getLastDrugs() {

  }

  get isSuspended() {

  }

  suspend(time = 1, start = 0) {

  }

  parameterize() {
    return Object.assign({
      drugsLikelihood: this.drugsLikelihood,
      politicsLikelihood: this.politicsLikelihood,
      violenceLikelihood: this.violenceLikelihood,
      physical: {...this.physical},
      sexualOrientation: this.sexualOrientation,
      grade: this.grade,
      dailySleep: this.dailySleep,
      intelligence: this.intelligence,
      crimes: [],
      suspensions: [],
      classes: [],
      friends: []
    }, super.paramterize());
  }
}

class Teacher extends Human {
  constructor(params = {}) {
    this.title = params.title || "Mr";
  }

  addressedName() {
    return this.title + ". " + this.lastName;
  }

  parameterize() {
    return Object.assign({title: this.title}, super.paramterize());
  }
}
