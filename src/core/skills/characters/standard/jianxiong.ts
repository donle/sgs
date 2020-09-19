import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jianxiong', description: 'jianxiong_description' })
export class JianXiong extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const damagedEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (damagedEvent.cardIds !== undefined) {
      const { cardIds, toId } = damagedEvent;
      await room.moveCards({
        movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toId,
        moveReason: CardMoveReason.ActivePrey,
        toArea: CardMoveArea.HandArea,
      });
    }
    await room.drawCards(1, damagedEvent.toId, undefined, damagedEvent.toId, this.Name);
    return true;
  }
}
