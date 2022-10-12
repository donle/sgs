import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import type { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import type { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import type { Room } from 'core/room/room';
import type { TiaoXin } from 'core/skills';
import { ActiveSkill } from 'core/skills/skill';

export class TiaoXinSkillTrigger extends ActiveSkillTriggerClass<TiaoXin> {
  skillTrigger = (room: Room, ai: Player, skill: TiaoXin) => {
    if (!skill.canUse(room, ai)) {
      return;
    }
    const enemies = AiLibrary.sortEnemiesByRole(room, ai);
    const outOfRange = enemies.filter(enemy => !room.canAttack(enemy, ai));

    if (outOfRange.length > 0) {
      return {
        fromId: ai.Id,
        skillName: skill.Name,
        toIds: [outOfRange[0].Id],
      };
    }

    if (ai.getCardIds(PlayerCardsArea.HandArea).find(cardId => Sanguosha.getCardById(cardId).Name === 'jink')) {
      enemies.sort(
        (a, b) => a.getCardIds(PlayerCardsArea.HandArea).length - b.getCardIds(PlayerCardsArea.HandArea).length,
      );
      return {
        fromId: ai.Id,
        skillName: skill.Name,
        toIds: [enemies[0].Id],
      };
    }
  };

  public dynamicallyAdjustSkillUsePriority(
    room: Room,
    ai: Player,
    skill: TiaoXin,
    sortedActions: (ActiveSkill | CardId)[],
  ) {
    const highPriorityCards = ['wuzhongshengyou', 'shunshouqianyang', 'guohechaiqiao', 'zhiheng'];

    const index = sortedActions.findIndex(item => item === skill);
    let lasthighPriorityCardIndex = -1;

    for (let i = 0; i < sortedActions.length; i++) {
      const item = sortedActions[i];
      if (!(item instanceof ActiveSkill)) {
        const card = Sanguosha.getCardById(item);
        if (highPriorityCards.includes(card.Name)) {
          lasthighPriorityCardIndex = i;
        }
      }
    }

    if (lasthighPriorityCardIndex >= 0) {
      const swap = skill;
      sortedActions[index] = sortedActions[lasthighPriorityCardIndex];
      sortedActions[lasthighPriorityCardIndex] = swap;
    }

    return sortedActions;
  }

  public onAskForCardUseEvent(
    content: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
    room: Room,
    availableCards: CardId[],
  ) {
    const { scopedTargets, toId } = content;
    const jiangwei = room.getPlayerById(scopedTargets![0]);
    const ai = room.getPlayerById(toId);

    const filteredAvailableCards = availableCards.filter(card => room.canUseCardTo(card, ai, jiangwei));

    if (filteredAvailableCards.length > 0) {
      return {
        cardId: filteredAvailableCards[0],
        toIds: scopedTargets,
        fromId: ai.Id,
      };
    }
  }
}
