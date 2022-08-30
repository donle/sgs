import { CardDrawReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'hongyuan', description: 'hongyuan_description' })
export class HongYuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DrawCardStage.CardDrawing;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === event.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      event.bySpecialReason === CardDrawReason.GameStage &&
      event.drawAmount > 0
    );
  }

  public numberOfTargets(): number[] {
    return [1, 2];
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }
    (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>).drawAmount -= 1;

    for (const toId of event.toIds) {
      await room.drawCards(1, toId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
