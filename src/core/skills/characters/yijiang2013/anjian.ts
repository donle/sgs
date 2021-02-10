import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardUseStage, DamageEffectStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { QingGangSkill } from 'core/skills/cards/standard/qinggang';
import { CompulsorySkill, FilterSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'anjian', description: 'anjian_description' })
export class AnJian extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.AimEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >,
    stage?: AllStage,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(event);
    if (unknownEvent === GameEventIdentifiers.AimEvent) {
      return stage === AimStage.AfterAim;
    } else if (unknownEvent === GameEventIdentifiers.DamageEvent) {
      return stage === DamageEffectStage.DamageEffect;
    } else if (unknownEvent === GameEventIdentifiers.CardUseEvent) {
      return stage === CardUseStage.CardUseFinishedEffect;
    } else if (unknownEvent === GameEventIdentifiers.PlayerDyingEvent) {
      return stage === PlayerDyingStage.PlayerDying || stage === PlayerDyingStage.AfterPlayerDying;
    }
    return false;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      | GameEventIdentifiers.AimEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        owner.Id === content.fromId &&
        content.byCardId !== undefined &&
        Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' &&
        room.getPlayerById(content.toId).getAttackDistance(room) <
          room.distanceBetween(room.getPlayerById(content.toId), owner)
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        owner.Id === content.fromId &&
        room.getPlayerById(content.toId).getFlag<boolean>(this.GeneralName) &&
        content.cardIds !== undefined &&
        Sanguosha.getCardById(content.cardIds[0]).GeneralName === 'slash'
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;
      if (room.getPlayerById(content.dying).hasSkill(this.GeneralName)) {
        return true;
      }
      if (
        room.getPlayerById(content.dying).getFlag<boolean>(this.GeneralName) &&
        content.killedByCards &&
        Sanguosha.getCardById(content.killedByCards[0]).GeneralName === 'slash'
      ) {
        return true;
      }
    }
    return false;
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const identifier = EventPacker.getIdentifier(
      triggeredOnEvent as ServerEventFinder<
        | GameEventIdentifiers.AimEvent
        | GameEventIdentifiers.DamageEvent
        | GameEventIdentifiers.CardUseEvent
        | GameEventIdentifiers.PlayerDyingEvent
      >,
    );
    if (identifier === GameEventIdentifiers.AimEvent) {
      const { toId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      aimEvent.triggeredBySkills = aimEvent.triggeredBySkills
        ? [...aimEvent.triggeredBySkills, QingGangSkill.GeneralName]
        : [QingGangSkill.GeneralName];
      room.setFlag(toId, this.GeneralName, true, true);
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

      damageEvent.damage++;
      damageEvent.messages = damageEvent.messages || [];
      damageEvent.messages.push(
        TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, damage increases to {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId!)),
          this.Name,
          damageEvent.damage,
        ).toString(),
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      const dyingEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;
      if (room.CurrentProcessingStage === PlayerDyingStage.PlayerDying) {
        await room.obtainSkill(dyingEvent.dying, AnJianPeach.Name);
      } else if (room.CurrentProcessingStage === PlayerDyingStage.AfterPlayerDying) {
        await room.loseSkill(dyingEvent.dying, AnJianPeach.Name);
      }
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const toIds = TargetGroupUtil.getRealTargets(cardEvent.targetGroup);
      room.removeFlag(toIds[0], this.GeneralName);
    }
    return true;
  }
}
@ShadowSkill
@CompulsorySkill({ name: 'anjianPeach', description: 'anjianPeach_description' })
export class AnJianPeach extends FilterSkill {
  canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId) {
    return cardId instanceof CardMatcher ? false : Sanguosha.getCardById(cardId).GeneralName !== 'peach';
  }
}
