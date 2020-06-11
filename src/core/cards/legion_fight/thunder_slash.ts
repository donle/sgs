import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { CardSuit, RealCardId } from '../libs/card_props';
import { Slash } from '../standard/slash';

export class ThunderSlash extends Slash {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit);

    this.skill = SkillLoader.getInstance().getSkillByName('thunder_slash');
  }
}
