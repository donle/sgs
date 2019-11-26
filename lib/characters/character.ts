import { Skill } from 'skills/skill';

export abstract class Character {
  private constructor(
    protected name: string,
    protected maxHp: number,
    protected skills: Skill[]
  ) {}
}
