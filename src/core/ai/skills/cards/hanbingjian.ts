import { AiLibrary } from 'core/ai/ai_lib';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { HanBingJianSkill } from 'core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class HanBingJianSkillTrigger extends TriggerSkillTriggerClass<
  HanBingJianSkill,
  GameEventIdentifiers.CardEffectEvent
> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: HanBingJianSkill,
    onEvent?: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> | undefined => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };

  onAskForChoosingCardFromPlayerEvent = (
    content: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>,
    room: Room,
  ): ClientEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> | undefined => {
    const ai = room.getPlayerById(content.fromId);
    const to = room.getPlayerById(content.toId);

    const handCards = content.options[PlayerCardsArea.HandArea] as number | undefined;
    const equipCards = content.options[PlayerCardsArea.EquipArea] as CardId[] | undefined;

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

    return;
  };
}
