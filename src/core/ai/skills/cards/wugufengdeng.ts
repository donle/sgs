import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { WuGuFengDengSkill } from 'core/skills';

export class WuGuFengDengSkillTrigger extends ActiveSkillTriggerClass<WuGuFengDengSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: WuGuFengDengSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const friends = AiLibrary.sortFriendsFromWeakToStrong(room, ai).filter(f => room.canUseCardTo(skillInCard!, ai, f));
    if (friends.length + 1 < room.AlivePlayers.length / 2) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
    };
  };

  onAskForContinuouslyChoosingCardEvent = (
    content: ServerEventFinder<GameEventIdentifiers.AskForContinuouslyChoosingCardEvent>,
    room: Room,
  ): ClientEventFinder<GameEventIdentifiers.AskForContinuouslyChoosingCardEvent> | undefined => {
    const selectedCards = content.selected.map(selected => selected.card);

    const availableCards = content.cardIds.filter(cardId => !selectedCards.includes(cardId));
    return {
      fromId: content.toId,
      selectedCard: AiLibrary.sortCardbyValue(availableCards)[0],
    };
  };
}
