import { BasicCard } from 'core/cards/basic_card';
import { DamageType } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { SlashSkill } from 'core/skills/characters/standard/slash';
import { CardId, CardSuit } from '../card';

export class Slash extends BasicCard {
  protected damageType: DamageType = DamageType.Normal;

  constructor(id: CardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit, 'slash', 'slash_description', [
      SkillLoader.getInstance().getSkillByName('slash'),
    ]);
  }

  public get ActualSkill() {
    return this.skills[0] as SlashSkill;
  }

  public get DamageType() {
    return this.damageType;
  }
}

export class ThunderSlash extends Slash {
  protected damageType = DamageType.Thunder;
}
export class FireSlash extends Slash {
  protected damageType = DamageType.Fire;
}
