import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jiyuan', description: 'jiyuan_description' })
export class JiYuan extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PlayerDyingStage.PlayerDying || stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.MoveCardEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        moveEvent.toId !== undefined &&
        moveEvent.toId !== owner.Id &&
        moveEvent.proposer === owner.Id &&
        moveEvent.toArea === PlayerCardsArea.HandArea
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      return true;
    }
    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const unknownEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.MoveCardEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    let target: PlayerId;

    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      target = moveEvent.toId!;
    } else {
      const dyingEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;
      target = dyingEvent.dying;
    }

    await room.drawCards(1, target, 'top', undefined, this.Name);

    return true;
  }
}
