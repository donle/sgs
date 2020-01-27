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

export abstract class Character {
  private turnedOver: boolean = false;
  private linked: boolean = false;

  protected constructor(
    protected id: CharacterId,
    protected name: string,
    protected gender: CharacterGender,
    protected nationality: CharacterNationality,
    protected maxHp: number,
    protected fromPackage: GameCharacterExtensions,
    protected skills: Skill[],
  ) {}

  protected getSkillsDescrption() {
    return this.skills.map(skill => skill.Description);
  }

  public get Id() {
    return this.id;
  }

  public get MaxHp() {
    return this.maxHp;
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
