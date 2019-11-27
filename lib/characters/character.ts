import { Skill } from 'skills/skill';

export type CharacterProps = {
  id: number;
  name: string;
  maxHp: number;
  skills: Skill[];
};

export abstract class Character {
  protected constructor(props: CharacterProps) {
    for (const [key, value] of Object.entries(props)) {
      this[key] = value;
    }
  }
}
