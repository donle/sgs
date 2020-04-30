import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';

export abstract class PlayerAI {
  protected static instance: PlayerAI;

  protected abstract onAskForPlayCardsOrSkillsEvent<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForSkillUseEvent<T extends GameEventIdentifiers.AskForSkillUseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;

  protected abstract onAskForPeachEvent<T extends GameEventIdentifiers.AskForPeachEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForCardDisplayEvent<T extends GameEventIdentifiers.AskForCardDisplayEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForCardEvent<T extends GameEventIdentifiers.AskForCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForPinDianCardEvent<T extends GameEventIdentifiers.AskForPinDianCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForChoosingCardEvent<T extends GameEventIdentifiers.AskForChoosingCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForChoosingPlayerEvent<T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForChoosingOptionsEvent<T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForChoosingCharacterEvent<T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForChoosingCardFromPlayerEvent<
    T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent
  >(content: ServerEventFinder<T>, room: Room): ClientEventFinder<T>;
  protected abstract onAskForPlaceCardsInDileEvent<T extends GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ): ClientEventFinder<T>;
  protected abstract onAskForContinuouslyChoosingCardEvent<
    T extends GameEventIdentifiers.AskForContinuouslyChoosingCardEvent
  >(content: ServerEventFinder<T>, room: Room): ClientEventFinder<T>;

  onAction(room: Room, e: GameEventIdentifiers, content: ServerEventFinder<typeof e>): ClientEventFinder<typeof e> {
    switch (e) {
      case GameEventIdentifiers.AskForPlayCardsOrSkillsEvent: {
        return this.onAskForPlayCardsOrSkillsEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForSkillUseEvent: {
        return this.onAskForSkillUseEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForCardResponseEvent: {
        return this.onAskForCardResponseEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForCardUseEvent: {
        return this.onAskForCardUseEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForCardDropEvent: {
        return this.onAskForCardDropEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForPeachEvent: {
        return this.onAskForPeachEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForCardDisplayEvent: {
        return this.onAskForCardDisplayEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForCardEvent: {
        return this.onAskForCardEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForPinDianCardEvent: {
        return this.onAskForPinDianCardEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForChoosingCardEvent: {
        return this.onAskForChoosingCardEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForChoosingPlayerEvent: {
        return this.onAskForChoosingPlayerEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForChoosingOptionsEvent: {
        return this.onAskForChoosingOptionsEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForChoosingCharacterEvent: {
        return this.onAskForChoosingCharacterEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForChoosingCardFromPlayerEvent: {
        return this.onAskForChoosingCardFromPlayerEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForPlaceCardsInDileEvent: {
        return this.onAskForPlaceCardsInDileEvent(content as any, room);
      }
      case GameEventIdentifiers.AskForContinuouslyChoosingCardEvent: {
        return this.onAskForContinuouslyChoosingCardEvent(content as any, room);
      }
      default:
    }
    return {} as any;
  }
}
