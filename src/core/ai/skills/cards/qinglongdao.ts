import { AiLibrary } from 'core/ai/ai_lib';
import { TriggerSkillTriggerClass } from 'core/ai/skills/base/trigger_skill_trigger';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { QingLongYanYueDaoSkill } from 'core/skills';

export class QingLongDaoSkillTrigger extends TriggerSkillTriggerClass<
  QingLongYanYueDaoSkill,
  GameEventIdentifiers.CardEffectEvent
> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: QingLongYanYueDaoSkill,
    onEvent?: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> | undefined => {
    const { toIds } = onEvent!;
    const to = room.getPlayerById(toIds![0]);

    const slashes = AiLibrary.getAttackWillEffectSlashesTo(room, ai, to);
    if (slashes.length === 0) {
      return;
    }

    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };

  onAskForCardUseEvent = (
    content: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
    room: Room,
    availableCards: CardId[],
  ): ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> | undefined => {
    const ai = room.getPlayerById(content.toId);
    const to = room.getPlayerById(content.scopedTargets![0]);
    const slashes = AiLibrary.getAttackWillEffectSlashesTo(room, ai, to, availableCards);

    if (slashes.length > 0) {
      return {
        fromId: content.toId,
        toIds: content.scopedTargets,
        cardId: slashes[0],
      };
    }
  };
}
