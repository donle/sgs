import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import { QiLinGongSkill } from 'core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class QiLinGongSkillTrigger extends TriggerSkillTriggerClass<QiLinGongSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: QiLinGongSkill) => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };

  onAskForChoosingCardEvent(content: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent>, room: Room) {
    const { cardIds, toId } = content;
    const cardId =
      (cardIds as CardId[]).find(card => Sanguosha.getCardById(card).is(CardType.DefenseRide)) ||
      (cardIds as CardId[])[0];
    return {
      fromId: toId,
      selectedCards: [cardId],
    };
  }
}
