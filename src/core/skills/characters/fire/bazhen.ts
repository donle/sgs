import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Logger } from 'core/shares/libs/logger/logger';
import { BaGuaZhenSkill } from 'core/skills/cards/standard/baguazhen';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

const log = new Logger();
@CompulsorySkill({ name: 'bazhen', description: 'bazhen_description' })
export class BaZhen extends BaGuaZhenSkill {
  get Alias() {
    return BaGuaZhenSkill.GeneralName;
  }

  async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const askForInvoke: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      toId: event.fromId,
      invokeSkillNames: [this.Name],
    };
    room.notify(GameEventIdentifiers.AskForSkillUseEvent, askForInvoke, event.fromId);
    const { invoke } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, event.fromId);
    return invoke !== undefined;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    log.info(this.Alias);
    log.info(this.SkillDependency);
    return super.canUse(room, owner, content) && owner.getEquipment(CardType.Armor) === undefined;
  }
}
