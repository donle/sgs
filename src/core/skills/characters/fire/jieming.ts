import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jieming', description: 'jieming_description' })
export class JieMing extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === event.toId;
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  isAvailableTarget() {
    return true;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = skillUseEvent;
    await room.drawCards(2, toIds![0], 'top', fromId, this.Name);
    const target = room.getPlayerById(toIds![0]);
    if (target.getCardIds(PlayerCardsArea.HandArea).length <= target.MaxHp) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}
