import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { BasicCard } from '../basic_card';
import { CardId, CardSuit } from '../card';

export class Peach extends BasicCard {
  constructor(id: CardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit, 'peach', 'peach_description', [
      SkillLoader.getInstance().getSkillByName('peach'),
    ]);
  }

  public get ActualSkill() {
      return this.skills[0];
  }
}
