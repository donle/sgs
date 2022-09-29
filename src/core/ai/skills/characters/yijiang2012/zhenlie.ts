import { AiLibrary } from 'core/ai/ai_lib';
import { TriggerSkillTriggerClass } from 'core/ai/skills/base/trigger_skill_trigger';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ZhenLie } from 'core/skills';

export class ZhenLieSkillTrigger extends TriggerSkillTriggerClass<ZhenLie, GameEventIdentifiers.AimEvent> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: ZhenLie,
    onEvent?: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ) => {
    if (onEvent !== undefined) {
      const hasPeachorAlcohol: boolean =
        ai
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(
            cardId =>
              Sanguosha.getCardById(cardId).Name === 'alcohol' || Sanguosha.getCardById(cardId).Name === 'peach',
          ).length > 0;
      const fromFriend: boolean = AiLibrary.areTheyFriendly(ai, room.getPlayerById(onEvent.fromId), room.Info.gameMode);

      if (!fromFriend && (ai.Hp > 2 || hasPeachorAlcohol)) {
        return {
          fromId: ai.Id,
          invoke: skill.Name,
        };
      }
    } else {
      return undefined;
    }
  };
}
