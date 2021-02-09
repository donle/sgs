import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

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
    return (
      owner !== target &&
      room
        .getPlayerById(target)
        .getPlayerCards()
        .filter(cardId => Sanguosha.getCardById(cardId).isBlack() && Sanguosha.getCardById(cardId).is(CardType.Trick))
        .length > 0
    );
  }

  availableCardAreas() {
    return [PlayerCardsArea.HandArea];
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
        moveReason: CardMoveReason.PlaceToDrawStack,
        toArea: CardMoveArea.DrawStack,
        proposer: skillUseEvent.fromId,
        movedByReason: this.Name,
      });
    }
    const { toIds, fromId } = skillUseEvent;
    const toId = toIds![0];
    const to = room.getPlayerById(toId);
    const options: string[] = [];
    if (to.getPlayerCards().filter(cardId => Sanguosha.getCardById(cardId).BaseType === CardType.Trick).length > 0) {
      options.push('mieji:trick');
    }
    if (to.getPlayerCards().filter(cardId => Sanguosha.getCardById(cardId).BaseType !== CardType.Trick).length > 0) {
      options.push('mieji:drop');
    }

    const askForChooseOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId,
      conversation: 'please choose mieji options',
      triggeredBySkills: [this.Name],
    };
    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChooseOptionsEvent),
      toId,
    );
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      toId,
    );
    if (selectedOption === 'mieji:trick') {
      const response1 = await room.askForCardDrop(
        toId,
        1,
        [PlayerCardsArea.HandArea],
        true,
        to
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(cardId => Sanguosha.getCardById(cardId).BaseType !== CardType.Trick),
        this.Name,
        TranslationPack.translationJsonPatcher(
          'please choose a trick card to pass to {0}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).toString(),
      );
      await room.moveCards({
        movingCards: [{ card: response1.droppedCards[0], fromArea: CardMoveArea.HandArea }],
        fromId: toId,
        toId: skillUseEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        movedByReason: this.Name,
        proposer: skillUseEvent.fromId,
        engagedPlayerIds: [fromId, toId],
      });
    } else {
      let droppedCards = 0;
      while (
        droppedCards < 2 &&
        to.getPlayerCards().filter(cardId => !Sanguosha.getCardById(cardId).is(CardType.Trick)).length > 0
      ) {
        const response = await room.askForCardDrop(
          toId,
          1,
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          to
            .getCardIds(PlayerCardsArea.HandArea)
            .filter(cardId => Sanguosha.getCardById(cardId).BaseType === CardType.Trick),
          this.Name,
        );
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId);
        droppedCards++;
      }
    }

    return true;
  }
}
