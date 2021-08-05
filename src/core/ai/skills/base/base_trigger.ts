import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';

export abstract class BaseSkillTrigger {
  public readonly onAskForCardResponseEvent: <T extends GameEventIdentifiers.AskForCardResponseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForCardUseEvent: <T extends GameEventIdentifiers.AskForCardUseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForCardDropEvent: <T extends GameEventIdentifiers.AskForCardDropEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForCardDisplayEvent: <T extends GameEventIdentifiers.AskForCardDisplayEvent>(
    content: ServerEventFinder<T>,
    room: Room,
    availableCards: CardId[],
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForCardEvent: <T extends GameEventIdentifiers.AskForCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForPinDianCardEvent: <T extends GameEventIdentifiers.AskForPinDianCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForChoosingCardEvent: <T extends GameEventIdentifiers.AskForChoosingCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForChoosingPlayerEvent: <T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForChoosingOptionsEvent: <T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForChoosingCharacterEvent: <T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForChoosingCardFromPlayerEvent: <
    T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent
  >(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForPlaceCardsInDileEvent: <T extends GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;

  public readonly onAskForContinuouslyChoosingCardEvent: <
    T extends GameEventIdentifiers.AskForContinuouslyChoosingCardEvent
  >(
    content: ServerEventFinder<T>,
    room: Room,
  ) => ClientEventFinder<T> | undefined;
}
