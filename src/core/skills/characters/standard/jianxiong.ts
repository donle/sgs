import { CardObtainedReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class JianXiong extends TriggerSkill {
  constructor() {
    super('jianxiong', 'jianxiong_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const damagedEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (damagedEvent.cardIds !== undefined && damagedEvent.cardIds.length > 0) {
      const { cardIds, toId } = damagedEvent;
      const translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} obtains cards {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
        TranslationPack.patchCardInTranslation(...cardIds),
      ).extract();
      await room.obtainCards({
        reason: CardObtainedReason.ActivePrey,
        cardIds,
        toId,
        translationsMessage,
      });
    }
    await room.drawCards(1, damagedEvent.toId);
    return true;
  }
}
