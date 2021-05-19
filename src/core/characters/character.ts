import { GameCharacterExtensions } from 'core/game/game_props';
import { Skill } from 'core/skills/skill';

export type CharacterId = number;
export const enum CharacterGender {
  Male,
  Female,
  Neutral,
}

export const enum CharacterNationality {
  Wei,
  Shu,
  Wu,
  Qun,
  God,
}

export function getNationalityRawText(nationality: CharacterNationality) {
  const rawNationalityText = ['wei', 'shu', 'wu', 'qun', 'god'];
  return rawNationalityText[nationality];
}
export function getGenderRawText(gender: CharacterGender) {
  const rawGenderText = ['male', 'female', 'unknoun'];
  return rawGenderText[gender];
}

export function Lord(constructor: new (...args: any[]) => any): any {
  return class extends constructor {
    private lord: boolean = true;
  } as any;
}

export abstract class Character {
  private turnedOver: boolean = false;
  private linked: boolean = false;
  private lord: boolean = false;

  protected constructor(
    protected id: CharacterId,
    protected name: string,
    protected gender: CharacterGender,
    protected nationality: CharacterNationality,
    protected maxHp: number,
    protected hp: number,
    protected fromPackage: GameCharacterExtensions,
    protected skills: Skill[],
  ) {}

  protected getSkillsDescrption() {
    return this.skills.map(skill => skill.Description);
  }

  public isLord() {
    return this.lord;
  }

  public get Id(): CharacterId {
    return this.id;
  }

  public get MaxHp() {
    return this.maxHp;
  }

  public get Hp() {
    return this.hp;
  }

  public get Nationality() {
    return this.nationality;
  }

  public get Skills() {
    return this.skills;
  }

  public get Name() {
    return this.name;
  }
  public get Package() {
    return this.fromPackage;
  }

  public get Gender() {
    return this.gender;
  }

  public turnOver() {
    this.turnedOver = !this.turnedOver;
  }

  public isTurnOver() {
    return this.turnedOver;
  }

  public link() {
    this.linked = true;
  }

  public unlink() {
    this.linked = false;
  }

  public isLinked() {
    return this.linked;
  }
}
