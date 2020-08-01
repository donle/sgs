import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

type SelectedCard = {
  card: CardId;
  player?: PlayerId;
};

@CommonSkill({ name: 'wugufengdeng', description: 'wugufengdeng_description' })
export class WuGuFengDengSkill extends ActiveSkill {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    if (containerCard) {
      for (const target of room.getAlivePlayersFrom()) {
        if (owner.canUseCardTo(room, containerCard, target.Id)) {
          return true;
        }
      }
    }

    return false;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const all = room.getAlivePlayersFrom();
    const from = room.getPlayerById(event.fromId);
    event.toIds = all.filter(player => from.canUseCardTo(room, event.cardId, player.Id)).map(player => player.Id);

    return true;
  }

  public async beforeEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    event.toCardIds = room.getCards(room.AlivePlayers.length, 'top');
    room.addProcessingCards(event.cardId.toString(), ...event.toCardIds);
    EventPacker.addMiddleware(
      {
        tag: event.cardId.toString(),
        data: [],
      },
      event,
    );

    const wugufengdengEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: event.toCardIds!,
      selected: [],
    };

    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, wugufengdengEvent);

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const toId = Precondition.exists(event.toIds, 'Unknown targets of wugufengdeng')[0];
    const selectedCards = Precondition.exists(
      EventPacker.getMiddleware<SelectedCard[]>(event.cardId.toString(), event),
      'Unable to get wugufengdeng cards',
    );

    const wugufengdengEvent: ServerEventFinder<GameEventIdentifiers.AskForContinuouslyChoosingCardEvent> = {
      cardIds: event.toCardIds!,
      selected: selectedCards,
      toId,
      userId: event.fromId,
    };

    room.notify(GameEventIdentifiers.AskForContinuouslyChoosingCardEvent, wugufengdengEvent, toId);
    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
      toId,
    );
    selectedCards.push({
      card: response.selectedCard,
      player: toId,
    });
    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, wugufengdengEvent);
    room.endProcessOnCard(response.selectedCard);

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.ProcessingArea }],
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
    });

    return true;
  }

  public async afterEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const wugufengdengCards = room.getProcessingCards(event.cardId.toString());
    room.endProcessOnTag(event.cardId.toString());

    const droppedCards: CardId[] = [];
    for (const cardId of event.toCardIds!) {
      if (wugufengdengCards.includes(cardId)) {
        droppedCards.push(cardId);
        room.bury(cardId);
      }
    }

    room.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {
      translationsMessage:
        droppedCards.length > 0
          ? TranslationPack.translationJsonPatcher(
              '{0} has been placed into drop stack',
              TranslationPack.patchCardInTranslation(...droppedCards),
            ).extract()
          : undefined,
    });

    return true;
  }
}
