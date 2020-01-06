import { Card } from 'core/cards/card';
import { TrickCard } from 'core/cards/trick_card';
import { CardTransformSkill } from 'core/skills/skill';
import { SlashSkill } from './slash';

export class ZhuGeLianNuSlashSkill extends CardTransformSkill<
  TrickCard,
  SlashSkill
> {
  public canTransform(card: Card) {
    return card.Name === 'slash';
  }
  public override(cloneSkill: SlashSkill) {
    cloneSkill.canUse = () => {
      return true;
    };
  }
}
