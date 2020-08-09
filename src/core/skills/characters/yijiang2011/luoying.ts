import { CardSuit } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMovedBySpecialReason,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'luoying', description: 'luoying_description' })
export class LuoYing extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    if (
      (event.fromId &&
        event.fromId !== owner.Id &&
        (event.moveReason === CardMoveReason.PassiveDrop || event.moveReason === CardMoveReason.SelfDrop)) ||
      (event.proposer && event.proposer !== owner.Id && event.movedByReason === CardMovedBySpecialReason.JudgeProcess)
    ) {
      return !!event.movingCards.find(node => Sanguosha.getCardById(node.card).Suit === CardSuit.Club);
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const moveCardEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    await room.moveCards({
      movingCards: moveCardEvent.movingCards
        .filter(node => Sanguosha.getCardById(node.card).Suit === CardSuit.Club)
        .map(node => {
          node.fromArea = CardMoveArea.DropStack;
          return node;
        }),
      moveReason: CardMoveReason.ActivePrey,
      toId: skillEffectEvent.fromId,
      toArea: PlayerCardsArea.HandArea,
      proposer: skillEffectEvent.fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}
