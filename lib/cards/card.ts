import { Skill } from 'skills/skill';

export abstract class Card {
  private constructor(
    private name: string,
    private description: string,
    private skills: Skill[]
  ) {}
}
