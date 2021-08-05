import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { SlashSkill } from 'core/skills';

export class SlashSkillTrigger extends ActiveSkillTriggerClass<SlashSkill> {
  protected filterTargets(room: Room, ai: Player, skill: SlashSkill, card: CardId, enemies: Player[]) {
    const pickedEnemies: PlayerId[] = [];

    if (skill.damageType === DamageType.Fire) {
      for (const e of enemies) {
        const shield = e.getShield();
        if (shield && shield.Name === 'tengjia') {
          if (skill.targetFilter(room, ai, [...pickedEnemies, e.Id], [], card)) {
            pickedEnemies.push(e.Id);
          }
        }
      }
    }

    for (const e of enemies) {
      if (pickedEnemies.includes(e.Id)) {
        continue;
      }

      if (skill.targetFilter(room, ai, [...pickedEnemies, e.Id], [], card)) {
        pickedEnemies.push(e.Id);
      }
    }

    return pickedEnemies;
  }

  skillTrigger = (
    room: Room,
    ai: Player,
    skill: SlashSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(
      e =>
        skill.isAvailableTarget(ai.Id, room, e.Id, [], [], skillInCard!) &&
        AiLibrary.getAttackWillEffectSlashesTo(room, ai, e, [skillInCard!]).length > 0,
    );

    if (enemies.length === 0) {
      return;
    }

    const targets = this.filterTargets(room, ai, skill, skillInCard!, enemies);

    if (targets.length === 0) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
      toIds: targets,
    };
  };
}
