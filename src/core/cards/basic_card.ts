import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Skill } from 'core/skills/skill';
import { Card, CardId, CardSuit, CardType } from './card';

export abstract class BasicCard extends Card {
  protected cardType = CardType.Basic;
  protected generalName: string;

  constructor(
    protected id,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected skill: Skill,
    generalName?: string,
  ) {
    super();
    this.generalName = generalName || this.name;
  }
}
