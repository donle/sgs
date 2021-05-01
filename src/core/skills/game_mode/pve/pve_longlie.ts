import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TriggerSkill } from 'core/skills/skill';
import { ServerEventFinder, GameEventIdentifiers, EventPacker } from 'core/event/event';
import { AllStage, AimStage, DamageEffectStage } from 'core/game/stage_processor';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TranslationPack } from 'core/translations/translation_json_tool';

// 【龙烈】锁定技，你使用的【杀】指定目标后，你令此【杀】不能被【闪】响应，且此【杀】伤害加一。
@CompulsorySkill({ name: 'pve_longlie', description: 'pve_longlie_description' })
export class PveLongLie extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAim &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return owner.Id === event.fromId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    EventPacker.setDisresponsiveEvent(aimEvent);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveLongLie.Name, description: PveLongLie.Description })
export class PveLongLieShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage: AllStage) {
    return (
      stage === DamageEffectStage.DamageEffect &&
      !event.isFromChainedDamage &&
      !!event.cardIds &&
      event.cardIds.length === 1 &&
      Sanguosha.getCardById(event.cardIds[0]).GeneralName === 'slash'
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.hasSkill(this.GeneralName) && event.fromId === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    damageEvent.damage++;
    damageEvent.messages = damageEvent.messages || [];
    damageEvent.messages.push(
      TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, damage increases to {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(damageEvent.fromId!)),
        this.Name,
        damageEvent.damage,
      ).toString(),
    );

    return true;
  }
}
