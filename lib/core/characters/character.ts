import { Skill } from 'core/skills/skill';

export type CharacterId = number;
export const enum CharacterGender {
  Male,
  Female,
}

export type CharacterProps = {
  name: string;
  gender: CharacterGender;
  maxHp: number;
  skills: Skill[];
};

export abstract class Character {
  protected id: number;
  protected name: string;
  protected gender: CharacterGender;
  protected maxHp: number;
  protected skills: Skill[];
  private turnedOver: boolean = false;
  private linked: boolean = false;

  protected constructor(id: CharacterId, props: CharacterProps) {
    for (const [key, value]  of Object.entries(props)) {
      this[key] = value;
    }
  }

  protected getSkillsDescrption() {
    return this.skills.map(skill => skill.Description);
  }

  public get Id() {
    return this.id;
  }

  public get MaxHp() {
    return this.maxHp;
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
