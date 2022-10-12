import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardType } from 'core/cards/card';
import { PlayerCardsArea } from 'core/player/player_props';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { PlayerId } from 'core/player/player_props';
import type { Room } from 'core/room/room';
import type { TieSuoLianHuanSkill } from 'core/skills';

export class TieSuoLianHuanSkillTrigger extends ActiveSkillTriggerClass<TieSuoLianHuanSkill> {
  protected filterTargets(room: Room, ai: Player, skill: TieSuoLianHuanSkill, card: CardId, enemies: Player[]) {
    const filteredTargets: PlayerId[] = [];
    if (ai.ChainLocked) {
      const tengjiaEnemies = enemies.filter(e => e.getEquipment(CardType.Shield) && e.getShield()!.Name === 'tengjia');
      if (tengjiaEnemies.length > 0 && ai.getCardIds(PlayerCardsArea.HandArea).length >= 2) {
        for (const e of tengjiaEnemies) {
          if (skill.targetFilter(room, ai, [...filteredTargets, e.Id], [], card)) {
            filteredTargets.push(e.Id);
          }
        }

        if (filteredTargets.length > 0) {
          return filteredTargets;
        }
      } else {
        filteredTargets.push(ai.Id);
      }
    }

    for (const e of enemies) {
      if (skill.targetFilter(room, ai, [...filteredTargets, e.Id], [], card)) {
        filteredTargets.push(e.Id);
      }
    }

    return filteredTargets;
  }

  skillTrigger = (
    room: Room,
    ai: Player,
    skill: TieSuoLianHuanSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e => room.canUseCardTo(skillInCard!, ai, e) && !e.ChainLocked,
    );

    const targets = this.filterTargets(room, ai, skill, skillInCard!, enemies);
    if (targets.length <= 1) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
      toIds: targets,
    };
  };

  reforgeTrigger(room: Room, ai: Player, skill: TieSuoLianHuanSkill, card: CardId): boolean {
    if (ai.ChainLocked) {
      return false;
    }

    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(e => room.canUseCardTo(card, ai, e) && !e.ChainLocked);

    if (enemies.length < 2) {
      if (
        enemies.filter(e => e.getEquipment(CardType.Shield) && e.getShield()!.Name === 'tengjia').length > 0 &&
        ai.getCardIds(PlayerCardsArea.HandArea).length >= 2
      ) {
        return false;
      }
    } else {
      return false;
    }

    return true;
  }
}
