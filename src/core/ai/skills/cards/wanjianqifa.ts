import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { WanJianQiFaSkill } from 'core/skills';

export class WanJianQiFaSkillTrigger extends ActiveSkillTriggerClass<WanJianQiFaSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: WanJianQiFaSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e =>
        room.canUseCardTo(skillInCard!, ai, e) &&
        !(e.getEquipment(CardType.Shield) && e.getShield()!.Name === 'tengjia'),
    );
    if (enemies.length < room.AlivePlayers.length / 2) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
    };
  };
}
