import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { FireSlashSkill } from 'core/skills/cards/legion_fight/fire_slash';
import { CardSuit, RealCardId } from '../libs/card_props';
import { Slash } from '../standard/slash';

export class FireSlash extends Slash {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit);

    this.name = 'fire_slash';
    this.description = 'fire_slash_description';
    this.fromPackage = GameCardExtensions.LegionFight;
    this.skill = SkillLoader.getInstance().getSkillByName('fire_slash');
  }

  public get Skill() {
    return this.skill as FireSlashSkill;
  }
}
