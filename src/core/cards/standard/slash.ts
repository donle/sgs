import { BasicCard } from 'core/cards/basic_card';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { CardId, CardSuit } from '../card';

export class Slash extends BasicCard {
  constructor(id: CardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit, 'slash', 'slash_description', [
      SkillLoader.getInstance().getSkillByName('slash'),
    ]);
  }

  public get ActualSkill() {
    return this.skills[0];
  }
}
