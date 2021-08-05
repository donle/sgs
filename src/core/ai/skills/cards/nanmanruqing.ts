import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { NanManRuQingSkill } from 'core/skills';

export class NanManRuQingSkillTrigger extends ActiveSkillTriggerClass<NanManRuQingSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: NanManRuQingSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e =>
        room.canUseCardTo(skillInCard!, ai, e) &&
        !e.hasSkill('juxiang') &&
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
