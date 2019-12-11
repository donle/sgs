import { CharacterNationality } from 'core/characters/character';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { RecoverEffectStage } from 'core/game/stage';
import { Room } from 'core/room/room';
import { CompulsorySkill } from 'core/skills/skill';

export class JiuYuan extends CompulsorySkill {
  public isLordSkill = true;

  constructor() {
    super('jiuyuan', 'jiuyuan_description', false, true);
  }

  public get TriggerStage() {
    return RecoverEffectStage.BeforeRecoverEffect;
  }

  onEffect(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.RecoverEvent>,
  ) {
    if (
      event.toId == room.CurrentPlayer.Id &&
      room.getPlayerById(event.fromId).Nationality === CharacterNationality.Wu
    ) {
      event.recover++;
    }
  }
}
