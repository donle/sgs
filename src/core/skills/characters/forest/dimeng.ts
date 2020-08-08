import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'dimeng', description: 'dimeng_description' })
export class DiMeng extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 2;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[], selectedTargets: PlayerId[]) {
    if (selectedTargets.length !== this.numberOfTargets()) {
      return false;
    }

    const first = room.getPlayerById(selectedTargets[0]);
    const second = room.getPlayerById(selectedTargets[1]);
    const firstHandcardNum = first.getCardIds(PlayerCardsArea.HandArea).length;
    const secondHandcardNum = second.getCardIds(PlayerCardsArea.HandArea).length;

    return cards.length === Math.abs(firstHandcardNum - secondHandcardNum);
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ) {
    if (selectedTargets.length === 0) {
      return owner !== target;
    }

    const first = room.getPlayerById(selectedTargets![0]);
    const second = room.getPlayerById(target);
    const firstHandcardNum = first.getCardIds(PlayerCardsArea.HandArea).length;
    const secondHandcardNum = second.getCardIds(PlayerCardsArea.HandArea).length;

    return (
      owner !== target &&
      room.getPlayerById(owner).getPlayerCards().length >=
        Math.abs(firstHandcardNum - secondHandcardNum)
    );
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (skillUseEvent.cardIds) {
      await room.dropCards(
        CardMoveReason.SelfDrop,
        skillUseEvent.cardIds,
        skillUseEvent.fromId,
        skillUseEvent.fromId,
        this.Name,
      );
    }

    const fromId = skillUseEvent.fromId;
    const firstId = skillUseEvent.toIds![0];
    const secondId = skillUseEvent.toIds![1];
    const first = room.getPlayerById(firstId);
    const second = room.getPlayerById(secondId);

    const firstCards = first.getCardIds(PlayerCardsArea.HandArea).slice();
    const secondCards = second.getCardIds(PlayerCardsArea.HandArea).slice();
    await room.asyncMoveCards([
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: firstCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.HandArea })),
        fromId: firstId,
        toArea: CardMoveArea.ProcessingArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [firstId],
      },
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: secondCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.HandArea })),
        fromId: secondId,
        toArea: CardMoveArea.ProcessingArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [secondId],
      },
    ]);

    await room.asyncMoveCards([
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: secondCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
        toId: firstId,
        toArea: CardMoveArea.HandArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [firstId, secondId],
      },
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: firstCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
        toId: secondId,
        toArea: CardMoveArea.HandArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [firstId, secondId],
      },
    ]);

    return true;
  }
}
