import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class JianXiongSkill extends TriggerSkill {
  constructor() {
    super('jianxiong', 'jianxiong_description');
  }

  isAutoTrigger() {
    return false;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ) {
    return (
      stage === DamageEffectStage.AfterDamagedEffect &&
      event.cardIds !== undefined &&
      event.cardIds.length > 0
    );
  }

  canUse() {
    return true;
  }

  async onTrigger(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates skill {1}',
      room.getPlayerById(event.fromId).Name,
      this.name,
    );

    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    const { triggeredOnEvent } = skillUseEvent;
    const damagedEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent
    >;
    await room.obtainCards(damagedEvent.cardIds || [], damagedEvent.toId);
    await room.drawCards(1, damagedEvent.toId);
    return true;
  }
}
