import { BasicCard } from 'core/cards/basic_card';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { SlashSkill } from 'core/skills/cards/standard/slash';
import { CardSuit, RealCardId } from '../libs/card_props';

export class Slash extends BasicCard {
  private playerDrunkLevel: number;

  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      1,
      'slash',
      'slash_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('slash'),
    );
  }

  public get Skill() {
    return this.skill as SlashSkill;
  }

  public getDrunkLevel() {
    return this.playerDrunkLevel;
  }

  public setDrunkLevel(playerDrunkLevel: number) {
    this.playerDrunkLevel = playerDrunkLevel;
  }

  public clearDrunkLevel() {
    this.playerDrunkLevel = 0;
  }
}

export class ThunderSlash extends Slash {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit);

    this.skill = SkillLoader.getInstance().getSkillByName('thunder_slash');
  }
}
export class FireSlash extends Slash {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit);

    this.skill = SkillLoader.getInstance().getSkillByName('fire_slash');
  }
}
