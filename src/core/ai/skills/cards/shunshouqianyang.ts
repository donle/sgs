import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import type { Room } from 'core/room/room';
import type { ShunShouQianYangSkill } from 'core/skills';

export class ShunShouQianYangSkillTrigger extends ActiveSkillTriggerClass<ShunShouQianYangSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: ShunShouQianYangSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const friends = AiLibrary.sortFriendsFromWeakToStrong(room, ai).filter(
      f => f.getCardIds(PlayerCardsArea.JudgeArea).length > 0,
    );
    const enemies = AiLibrary.sortEnemiesByRole(room, ai);

    const availableTargets = [...friends, ...enemies].filter(target =>
      target.getPlayerCards().length > 0 && skill.isAvailableTarget(ai.Id, room, target.Id, [], [], skillInCard!),
    );

    const targets = this.filterTargets(room, ai, skill, skillInCard!, availableTargets);
    if (targets.length === 0) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
      toIds: targets,
    };
  };

  onAskForChoosingCardFromPlayerEvent = (
    content: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>,
    room: Room,
  ): ClientEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> | undefined => {
    const ai = room.getPlayerById(content.fromId);
    const to = room.getPlayerById(content.toId);

    const judgeCards = content.options[PlayerCardsArea.JudgeArea] as CardId[] | undefined;
    const handCards = content.options[PlayerCardsArea.HandArea] as number | undefined;
    const equipCards = content.options[PlayerCardsArea.EquipArea] as CardId[] | undefined;

    if (AiLibrary.areTheyFriendly(ai, to, room.Info.gameMode)) {
      if (judgeCards) {
        const availablecard = AiLibrary.sortByJudgeCardsThreatenValue(judgeCards)[0];
        return {
          fromId: ai.Id,
          selectedCard: availablecard,
          fromArea: PlayerCardsArea.JudgeArea,
        };
      }

      if (handCards !== undefined) {
        const index = Math.floor(Math.random() * handCards);
        return {
          fromId: ai.Id,
          selectedCardIndex: index,
          fromArea: PlayerCardsArea.HandArea,
        };
      }

      if (equipCards && equipCards.length > 0) {
        return {
          fromId: ai.Id,
          selectedCard: equipCards[equipCards.length - 1],
          fromArea: PlayerCardsArea.EquipArea,
        };
      }
    } else {
      if (equipCards && equipCards.length > 0) {
        return {
          fromId: ai.Id,
          selectedCard: AiLibrary.sortTargetEquipsInDefense(room, ai, to)[0],
          fromArea: PlayerCardsArea.EquipArea,
        };
      }
      if (handCards !== undefined) {
        const index = Math.floor(Math.random() * handCards);
        return {
          fromId: ai.Id,
          selectedCardIndex: index,
          fromArea: PlayerCardsArea.HandArea,
        };
      }
      if (judgeCards) {
        const availablecards = AiLibrary.sortByJudgeCardsThreatenValue(judgeCards);
        return {
          fromId: ai.Id,
          selectedCard: availablecards[availablecards.length - 1],
          fromArea: PlayerCardsArea.JudgeArea,
        };
      }
    }

    return;
  };
}
