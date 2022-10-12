import { VirtualCard } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { JiBing } from './jibing';

@CompulsorySkill({ name: 'wangjing', description: 'wangjing_description' })
export class WangJing extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  private findOpponent(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): PlayerId | undefined {
    const card = Sanguosha.getCardById(content.cardId);

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      if (card.GeneralName === 'slash') {
        const targets = TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup);
        targets.filter(player => player !== owner.Id);
        if (targets.length > 0) {
          room.sortPlayersByPosition(targets);
          return targets[0];
        }
      } else {
        if (
          !cardUseEvent.responseToEvent ||
          EventPacker.getIdentifier(cardUseEvent.responseToEvent) !== GameEventIdentifiers.CardEffectEvent
        ) {
          return undefined;
        }

        const cardEffectEvent = cardUseEvent.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
        return cardEffectEvent.fromId;
      }
    } else if (identifier === GameEventIdentifiers.CardResponseEvent) {
      const cardResponseEvent = content as ServerEventFinder<GameEventIdentifiers.CardResponseEvent>;
      if (
        !cardResponseEvent.responseToEvent ||
        EventPacker.getIdentifier(cardResponseEvent.responseToEvent) !== GameEventIdentifiers.CardEffectEvent
      ) {
        return undefined;
      }

      const cardEffectEvent =
        cardResponseEvent.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      if (!cardEffectEvent.fromId) {
        return undefined;
      }
      if (Sanguosha.getCardById(cardEffectEvent.cardId).GeneralName === 'duel') {
        if (cardEffectEvent.fromId === owner.Id) {
          const opponents = cardEffectEvent.toIds;
          if (opponents && opponents.length > 0) {
            return opponents[0];
          }
        } else {
          return cardEffectEvent.fromId;
        }
      } else {
        return cardEffectEvent.fromId;
      }
    }
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    const card = Sanguosha.getCardById(content.cardId);
    if (
      content.fromId !== owner.Id ||
      !card.isVirtualCard() ||
      (card.GeneralName !== 'slash' && card.GeneralName !== 'jink')
    ) {
      return false;
    }

    const virtualCard = card as VirtualCard;
    if (!virtualCard.findByGeneratedSkill(JiBing.Name)) {
      return false;
    }

    const target = this.findOpponent(room, owner, content);
    return (
      target !== undefined && !room.getOtherPlayers(target).find(player => player.Hp > room.getPlayerById(target).Hp)
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
