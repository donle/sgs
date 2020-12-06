import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'mieji', description: 'mieji_description' })
export class MieJi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.isBlack() && card.is(CardType.Trick);
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (skillUseEvent.cardIds! !== undefined) {
      await room.moveCards({
        movingCards: skillUseEvent.cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: skillUseEvent.fromId,
        moveReason: CardMoveReason.PassiveMove,
        toArea: CardMoveArea.DrawStack,
        proposer: skillUseEvent.fromId,
        movedByReason: this.Name,
      });
    }
    const { toIds } = skillUseEvent;
    const to = room.getPlayerById(toIds![0]);
    const toId = toIds![0];
    const options: string[] = [];
    if (to.getPlayerCards().filter(cardId => Sanguosha.getCardById(cardId).BaseType === CardType.Trick).length > 0) {
      options.push('mieji:trick');
    }
    if (to.getPlayerCards().filter(cardId => Sanguosha.getCardById(cardId).BaseType !== CardType.Trick).length > 0) {
      options.push('mieji:drop');
    }

    // const options = to.getPlayerCards().filter(cardId => Sanguosha.getCardById(cardId).BaseType === CardType.Trick).length>0 ? ['mieji:trick', 'mieji:drop']:['mieji:drop'];
    const askForChooseOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: toIds![0],
      conversation: 'please choose mieji options',
    };
    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseOptionsEvent, toIds![0]);
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      toIds![0],
    );
    if (selectedOption === 'mieji:trick') {
      const response1 = await room.askForCardDrop(
        toId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        to
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(cardId => Sanguosha.getCardById(cardId).BaseType !== CardType.Trick),
        this.Name,
      );
      await room.moveCards({
        movingCards: [{ card: response1.droppedCards[0], fromArea: CardMoveArea.HandArea }],
        fromId: toIds![0],
        toId: skillUseEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: skillUseEvent.fromId,
      });
    } else {
      for (let i = 1; i <= 2; i++) {
        const response = await room.askForCardDrop(
          toId,
          Math.min(
            1,
            to.getPlayerCards().filter(cardId => Sanguosha.getCardById(cardId).BaseType !== CardType.Trick).length,
          ),
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          to
            .getCardIds(PlayerCardsArea.HandArea)
            .filter(cardId => Sanguosha.getCardById(cardId).BaseType === CardType.Trick),
          this.Name,
        );
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId);
      }
    }

    return true;
  }
}
