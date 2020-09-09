import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'shensu', description: 'shensu_description' })
export class ShenSu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return (
      stage === PhaseChangeStage.BeforePhaseChange &&
      [PlayerPhase.JudgeStage, PlayerPhase.PlayCardStage, PlayerPhase.DropCardStage].includes(event.to)
    );
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    if (content.toPlayer !== owner.Id) {
      return false;
    }
    if (content.to === PlayerPhase.PlayCardStage) {
      room.setFlag(owner.Id, this.Name, content.to);
      return owner.getPlayerCards().length > 0;
    } else if (owner.getFlag<boolean>(this.Name)) {
      room.removeFlag(owner.Id, this.Name);
    }

    return true;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    const availableNumOfTargets = 1;
    const additionalNumberOfTargets = this.additionalNumberOfTargets(
      room,
      owner,
      new CardMatcher({ generalName: ['slash'] }),
    );
    if (additionalNumberOfTargets > 0) {
      return (
        targets.length >= availableNumOfTargets && targets.length <= availableNumOfTargets + additionalNumberOfTargets
      );
    } else {
      return targets.length === availableNumOfTargets;
    }
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      owner !== target &&
      room.getPlayerById(owner).canUseCardTo(room, new CardMatcher({ generalName: ['slash'] }), target)
    );
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    if (room.getPlayerById(owner).getFlag<PlayerPhase>(this.Name) === PlayerPhase.PlayCardStage) {
      return Sanguosha.getCardById(cardId).is(CardType.Equip);
    }
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    if (owner.getFlag<PlayerPhase>(this.Name) === PlayerPhase.PlayCardStage) {
      return cards.length === 1;
    }
    return cards.length === 0;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, toIds, fromId, cardIds } = skillUseEvent;
    const phaseChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
    room.endPhase(phaseChangeEvent.to);
    if (phaseChangeEvent.to === PlayerPhase.JudgeStage) {
      await room.skip(fromId, PlayerPhase.DrawCardStage);
    }
    if (phaseChangeEvent.to === PlayerPhase.PlayCardStage && cardIds && cardIds.length > 0) {
      room.removeFlag(fromId, this.Name);
      await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    }
    if (phaseChangeEvent.to === PlayerPhase.DropCardStage) {
      await room.turnOver(fromId);
    }

    const cardUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId,
      toIds,
      cardId: VirtualCard.create({ cardName: 'slash', bySkill: this.Name }).Id,
    };
    await room.useCard(cardUseEvent);
    return true;
  }
}
