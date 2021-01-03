import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, CardEffectStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'paoxiao', description: 'paoxiao_description' })
export class PaoXiao extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher) {
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? INFINITE_TRIGGERING_TIMES : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? INFINITE_TRIGGERING_TIMES : 0;
    }
  }
}

@ShadowSkill
@CompulsorySkill({ name: PaoXiao.GeneralName, description: PaoXiao.Description })
export class PaoXiaoShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage: AllStage) {
    return stage === CardEffectStage.CardEffectCancelledOut;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    return content.fromId === owner.Id && Sanguosha.getCardById(content.cardId).GeneralName === 'slash';
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const baseDamage = room.getFlag<number>(event.fromId, this.GeneralName) || 0;
    room.setFlag<number>(event.fromId, this.GeneralName, baseDamage + 1, true);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PaoXiaoShadow.Name, description: PaoXiaoShadow.Description })
export class PaoXiaoRemove extends TriggerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage: AllStage,
  ): boolean {
    return stage === DamageEffectStage.DamageEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    let canTrigger = false;
    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      canTrigger =
        damageEvent.fromId !== undefined &&
        damageEvent.fromId === owner.Id &&
        damageEvent.cardIds !== undefined &&
        Sanguosha.getCardById(damageEvent.cardIds[0]).GeneralName === 'slash';
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      canTrigger = owner.Id === phaseChangeEvent.fromPlayer && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return canTrigger && room.getFlag<number>(owner.Id, this.GeneralName) > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const additionalDamage = room.getFlag<number>(damageEvent.fromId!, this.GeneralName);

      if (additionalDamage < 1) {
        return false;
      }

      damageEvent.damage += additionalDamage;
      damageEvent.messages = damageEvent.messages || [];
      damageEvent.messages.push(
        TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, damage increases to {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(damageEvent.fromId!)),
          this.GeneralName,
          damageEvent.damage,
        ).toString(),
      );

      room.removeFlag(damageEvent.fromId!, this.GeneralName);
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      const { fromPlayer } = phaseChangeEvent;
      fromPlayer && room.removeFlag(fromPlayer, this.GeneralName);
    }

    return true;
  }
}
