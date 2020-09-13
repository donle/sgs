import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'anjian', description: 'anjian_description' })
export class AnJian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect && event.isFromChainedDamage !== true;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    if (!event.cardIds || Sanguosha.getCardById(event.cardIds[0]).GeneralName !== 'slash') {
      return false;
    }
    const damageTo = event.toId !== undefined && room.getPlayerById(event.toId);
    return (
      damageTo && !damageTo.Dead && damageTo.getAttackDistance(room) < room.distanceBetween(damageTo, owner)
    );
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    damageEvent.damage++;
    damageEvent.messages = damageEvent.messages || [];
    damageEvent.messages.push(
      TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, damage increases to {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        this.Name,
        damageEvent.damage,
      ).toString(),
    );

    return true;
  }
}
