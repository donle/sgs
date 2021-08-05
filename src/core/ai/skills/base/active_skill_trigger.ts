import { ActiveSkillTrigger } from 'core/ai/ai_skill_trigger';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { BaseSkillTrigger } from './base_trigger';

export class ActiveSkillTriggerClass<T extends ActiveSkill = ActiveSkill> extends BaseSkillTrigger {
  protected filterTargets(room: Room, ai: Player, skill: ActiveSkill, card: CardId, targets: Player[]) {
    const pickedTargets: PlayerId[] = [];

    for (const target of targets) {
      if (skill.targetFilter(room, ai, [...pickedTargets, target.Id], [], card)) {
        pickedTargets.push(target.Id);
      }
    }

    return pickedTargets;
  }

  public readonly skillTrigger: ActiveSkillTrigger<T> = (
    room: Room,
    ai: Player,
    skill: T,
    card?: CardId,
  ): undefined => {
    return;
  };

  public reforgeTrigger(
    room: Room,
    ai: Player,
    skill: T,
    card: CardId,
  ): boolean {
    return false;
  }

  public dynamicallyAdjustSkillUsePriority(
    room: Room,
    ai: Player,
    skill: ActiveSkill,
    sortedActions: (ActiveSkill | CardId)[],
  ) {
    return sortedActions;
  }
}
