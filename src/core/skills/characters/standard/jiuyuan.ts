import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { RecoverEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, LordSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'jiuyuan', description: 'jiuyuan_description' })
@LordSkill
export class JiuYuan extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.RecoverEvent>) {
    return (
      content.recoverBy !== undefined &&
      content.toId === owner.Id &&
      owner.Id !== content.recoverBy &&
      room.getPlayerById(content.recoverBy).Nationality === CharacterNationality.Wu
    );
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>, stage: RecoverEffectStage) {
    return (
      // EventPacker.getIdentifier(event) === GameEventIdentifiers.RecoverEvent &&
      stage === RecoverEffectStage.BeforeRecoverEffect
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated skill {1}',
      room.getPlayerById(event.fromId).Name,
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const recoverEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>;
    if (
      recoverEvent.recoverBy &&
      recoverEvent.toId !== recoverEvent.recoverBy &&
      room.getPlayerById(recoverEvent.recoverBy).Nationality === CharacterNationality.Wu
    ) {
      recoverEvent.recoveredHp++;
    }

    return true;
  }
}
