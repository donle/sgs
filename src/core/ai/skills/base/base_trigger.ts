import { CardId } from 'core/cards/libs/card_props';
import { Room } from 'core/room/room';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';

export class BaseSkillTrigger {
  onAskForCardResponseEvent?<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ): ClientEventFinder<T> | undefined;

  onAskForCardUseEvent?<T extends GameEventIdentifiers.AskForCardUseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ): ClientEventFinder<T> | undefined;

  onAskForCardDropEvent?<T extends GameEventIdentifiers.AskForCardDropEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ): ClientEventFinder<T> | undefined;

  onAskForCardDisplayEvent?<T extends GameEventIdentifiers.AskForCardDisplayEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ): ClientEventFinder<T> | undefined;

  onAskForCardEvent?<T extends GameEventIdentifiers.AskForCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForPinDianCardEvent?<T extends GameEventIdentifiers.AskForPinDianCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForChoosingCardEvent?<T extends GameEventIdentifiers.AskForChoosingCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForChoosingPlayerEvent?<T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForChoosingOptionsEvent?<T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForChoosingCharacterEvent?<T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForChoosingCardFromPlayerEvent?<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForPlaceCardsInDileEvent?<T extends GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForContinuouslyChoosingCardEvent?<T extends GameEventIdentifiers.AskForContinuouslyChoosingCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;

  onAskForChoosingCardWithConditionsEvent?<T extends GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T> | undefined;
}
