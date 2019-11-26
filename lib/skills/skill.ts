import { Card } from 'cards/card';
import { Character } from 'characters/character';

export abstract class Skill {
  constructor(protected name: string, protected description: string) {}

  abstract onRequiringTargets?(): Character[];
  abstract onRequiringCards?(): Card[];
  abstract onTrigger(): boolean;
}
