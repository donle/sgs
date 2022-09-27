import { AiLibrary } from 'core/ai/ai_lib';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import type { Room } from 'core/room/room';
import { WuXieKeJiSkill } from 'core/skills';
import { ResponsiveSkillTriggerClass } from '../base/responsive_skill_trigger';

export class WuXieKeJiSkillTrigger extends ResponsiveSkillTriggerClass<WuXieKeJiSkill> {
  public onAskForCardUseEvent(
    content: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
    room: Room,
    availableCards: CardId[],
  ): ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> | undefined {
    const { scopedTargets, toId } = content;
    const target = room.getPlayerById(scopedTargets![0]);
    const ai = room.getPlayerById(toId);

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
  }
}
