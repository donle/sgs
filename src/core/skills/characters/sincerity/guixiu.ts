import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, TurnOverStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'guixiu', description: 'guixiu_description' })
export class GuiXiu extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PlayerTurnOverEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === TurnOverStage.TurnedOver;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PlayerTurnOverEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.toId === owner.Id && !owner.isFaceUp();
    } else if (identifier === GameEventIdentifiers.PlayerTurnOverEvent) {
      const playerTurnOverEvent = event as ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>;
      return playerTurnOverEvent.toId === owner.Id && owner.isFaceUp();
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PlayerTurnOverEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      room.getPlayerById(fromId).isFaceUp() || await room.turnOver(fromId);
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}
