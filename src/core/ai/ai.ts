import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';

export class PlayerAI {
  private static instance: PlayerAI;
  private constructor() {}

  public static get Instance() {
    if (!PlayerAI.instance) {
      PlayerAI.instance = new PlayerAI();
    }

    return PlayerAI.instance;
  }

  onAction<T extends GameEventIdentifiers>(room: Room, e: T, content: ServerEventFinder<T>): ClientEventFinder<T> {
    switch (e) {
      case GameEventIdentifiers.AskForPlayCardsOrSkillsEvent:
        const { toId: fromId } = content as ServerEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>;
        const endEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
          fromId,
          end: true,
        };
        return endEvent as ClientEventFinder<T>;
      case GameEventIdentifiers.AskForCardResponseEvent: {
        const { toId, cardMatcher } = content as ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>;
        if (EventPacker.isUncancellabelEvent(content)) {
          const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
            fromId: toId,
            cardId: room
              .getPlayerById(toId)
              .getCardIds(PlayerCardsArea.HandArea)
              .find(cardId => CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId))),
          };
          return cardResponse as ClientEventFinder<T>;
        } else {
          const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
            fromId: toId,
          };
          return cardResponse as ClientEventFinder<T>;
        }
      }
      // tslint:disable-next-line:no-empty
      case GameEventIdentifiers.AskForCardDropEvent: {
        break;
      }
      default:
        
    }
    return {} as any;
  }
}
