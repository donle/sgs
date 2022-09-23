import { GameCharacterExtensions, UPPER_LIMIT_OF_ARMOR } from 'core/game/game_props';
import { Skill } from 'core/skills/skill';

export type CharacterId = number;
export const enum CharacterGender {
  Male,
  Female,
  Neutral,
}

export const enum CharacterEquipSections {
  Weapon = 'weapon section',
  Shield = 'shield section',
  DefenseRide = 'defense ride section',
  OffenseRide = 'offense ride section',
  Precious = 'precious',
}

export const enum CharacterNationality {
  Wei,
  Shu,
  Wu,
  Qun,
  God,

  Ambitioner,
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

export function Armor(amount: number) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor {
      private armor: number = Math.max(Math.min(amount, UPPER_LIMIT_OF_ARMOR), 0);
    } as any;
  };
}

export abstract class Character {
  private turnedOver: boolean = false;
  private linked: boolean = false;
  private lord: boolean = false;
  private armor: number = 0;

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

  public get Armor() {
    return this.armor;
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

export abstract class HegemonyCharacter extends Character {
  protected abstract secondaryNationality: CharacterNationality;

  public get SecondaryNationality() {
    return this.secondaryNationality;
  }

  public abstract get ClosedCharacters(): string[];
}
