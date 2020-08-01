import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yajiao', description: 'yajiao_description' })
export class YaJiao extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return (
      stage === CardMoveStage.AfterCardMoved &&
      event.movingCards.find(cardInfo => cardInfo.fromArea === CardMoveArea.HandArea) !== undefined &&
      [CardMoveReason.CardResponse, CardMoveReason.CardUse].includes(event.moveReason)
    );
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return owner.Id === content.fromId && room.CurrentPlayer.Id !== owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const cardUseOrResponseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const card = room.getCards(1, 'top');
    const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId,
      displayCards: card,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1} from top of draw stack',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(...card),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);

    const lostCard = Sanguosha.getCardById(cardUseOrResponseEvent.movingCards[0].card);
    const obtainedCard = Sanguosha.getCardById(card[0]);
    const sameType = lostCard.BaseType === obtainedCard.BaseType;

    const from = room.getPlayerById(fromId);
    const targets = room.AlivePlayers.filter(
      player =>
        player.getAttackDistance(room) >= room.distanceBetween(player, from) &&
        player !== from &&
        player.getCardIds().length > 0,
    ).map(p => p.Id);

    if (!sameType && targets.length < 1) {
      await room.moveCards({
        movingCards: card.map(card => ({ card })),
        moveReason: CardMoveReason.PlaceToDropStack,
        toArea: CardMoveArea.DropStack,
        hideBroadcast: true,
        movedByReason: this.Name,
      });

      return false;
    }

    const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: sameType ? room.AlivePlayers.map(p => p.Id) : targets,
      requiredAmount: 1,
      conversation: sameType
        ? TranslationPack.translationJsonPatcher(
            '{0}: please choose a player to obtain {1}',
            this.Name,
            TranslationPack.patchCardInTranslation(card[0]),
          ).extract()
        : TranslationPack.translationJsonPatcher('{0}: please choose a player to drop', this.Name).extract(),
      toId: fromId,
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent),
      fromId,
    );

    const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      fromId,
    );

    if (selectedPlayers && selectedPlayers.length === 1) {
      if (sameType) {
        await room.moveCards({
          movingCards: card.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
          proposer: fromId,
          toId: selectedPlayers[0],
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          movedByReason: this.Name,
        });
      } else {
        const to = room.getPlayerById(selectedPlayers[0]);
        if (to.getCardIds().length === 0) {
          return false;
        }

        const options: CardChoosingOptions = {
          [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
          [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
        };

        const chooseCardEvent = {
          fromId,
          toId: to.Id,
          options,
        };

        room.notify(
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
          fromId,
        );

        const response = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
          fromId,
        );

        if (response.selectedCard === undefined) {
          const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
          response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
        }

        await room.dropCards(
          CardMoveReason.PassiveDrop,
          [response.selectedCard],
          chooseCardEvent.toId,
          chooseCardEvent.fromId,
          this.Name,
        );

        await room.moveCards({
          movingCards: card.map(card => ({ card })),
          moveReason: CardMoveReason.PlaceToDropStack,
          toArea: CardMoveArea.DropStack,
          hideBroadcast: true,
          movedByReason: this.Name,
        });
      }
    } else {
      await room.moveCards({
        movingCards: card.map(card => ({ card })),
        moveReason: CardMoveReason.PlaceToDropStack,
        toArea: CardMoveArea.DropStack,
        hideBroadcast: true,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}
