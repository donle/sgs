import { AiLibrary } from 'core/ai/ai_lib';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import type { Room } from 'core/room/room';
import { BaseSkillTrigger } from '../base/base_trigger';

export class WuXieKeJiSkillTrigger extends BaseSkillTrigger {
  public onAskForCardUseEvent(
    content: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
    room: Room,
    availableCards: CardId[],
  ): ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> | undefined {
    const { scopedTargets, toId, cardUserId } = content;
    const target = scopedTargets?.[0] && room.getPlayerById(scopedTargets![0]);
    const ai = room.getPlayerById(toId);

    if (target) {
      const filteredAvailableCards = availableCards.filter(card => room.canUseCardTo(card, ai, target));

      if (filteredAvailableCards.length > 0) {
        const card = content.byCardId != null && Sanguosha.getCardById(content.byCardId);
        if (card && !AiLibrary.areTheyFriendly(ai, target, room.Info.gameMode)) {
          return {
            cardId: ['wugufengdeng', 'wuzhongshengyou', 'taoyuanjieyi'].includes(card.Name)
              ? filteredAvailableCards[0]
              : undefined,
            fromId: ai.Id,
          };
        }
      }
    } else if (cardUserId) {
      const filteredAvailableCards = availableCards.filter(card =>
        ai.canUseCard(room, card, new CardMatcher(content.cardMatcher)),
      );
      return {
        cardId: AiLibrary.areTheyFriendly(ai, room.getPlayerById(cardUserId), room.Info.gameMode)
          ? undefined
          : filteredAvailableCards.length > 0
          ? filteredAvailableCards[0]
          : undefined,
        fromId: ai.Id,
      };
    }

    return {
      fromId: ai.Id,
    };
  }
}
