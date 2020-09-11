import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardEffectStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'tengjia', description: 'tengjia_description' })
export class TengJiaSkill extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ) {
    return stage === CardEffectStage.PreCardEffect || stage === DamageEffectStage.DamagedEffect;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.DamageEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const effectEvent = content as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      return (
        effectEvent.toIds !== undefined &&
        effectEvent.toIds.includes(owner.Id) &&
        (Sanguosha.getCardById(effectEvent.cardId).Name === 'slash' ||
          Sanguosha.getCardById(effectEvent.cardId).GeneralName === 'nanmanruqing' ||
          Sanguosha.getCardById(effectEvent.cardId).GeneralName === 'wanjianqifa')
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.toId === owner.Id && damageEvent.damageType === DamageType.Fire;
    }
    return false;
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const unknownEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.DamageEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const effectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      effectEvent.nullifiedTargets?.push(skillUseEvent.fromId);
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
      damageEvent.messages = damageEvent.messages || [];
      damageEvent.messages.push(
        TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, damage increases to {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId!)),
          this.Name,
          damageEvent.damage,
        ).toString(),
      );
    }

    return true;
  }
}
