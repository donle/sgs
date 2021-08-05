import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AlcoholSkill } from 'core/skills';

export class AlcoholSkillTrigger extends ActiveSkillTriggerClass<AlcoholSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: AlcoholSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const slashMatcher = new CardMatcher({ generalName: ['slash'] });
    if (!ai.canUseCard(room, slashMatcher)) {
      return;
    }

    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e => AiLibrary.getAttackWillEffectSlashesTo(room, ai, e).length > 0,
    );

    if (enemies.length === 0) {
      return;
    }

    const slashes = AiLibrary.findAvailableCardsToUse(room, ai, slashMatcher);
    if (slashes.length === 0) {
      return;
    }
    return {
      fromId: ai.Id,
      cardId: skillInCard!,
    };
  };
}
