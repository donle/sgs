import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { BaGuaZhenSkill } from 'core/skills/cards/standard/baguazhen';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'bazhen', description: 'bazhen_description' })
export class BaZhen extends BaGuaZhenSkill {
  async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const askForInvoke: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      toId: event.fromId,
      invokeSkillNames: [this.Name],
      translationsMessage: super.getSkillLog(room, event),
    };
    room.notify(GameEventIdentifiers.AskForSkillUseEvent, askForInvoke, event.fromId);
    const { invoke } = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForSkillUseEvent, event.fromId);
    return invoke !== undefined;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    return super.canUse(room, owner, content) && owner.getEquipment(CardType.Armor) === undefined;
  }
}
