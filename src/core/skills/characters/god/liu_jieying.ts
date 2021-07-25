import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, ChainLockStage, GameBeginStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, GlobalRulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'liu_jieying', description: 'liu_jieying_description' })
export class LiuJieYing extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.ChainLockedEvent
      | GameEventIdentifiers.GameBeginEvent
    >,
    stage?: AllStage,
  ) {
    return (
      stage === GameBeginStage.AfterGameBegan ||
      stage === PhaseStageChangeStage.StageChanged ||
      stage === ChainLockStage.BeforeChainingOn
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.ChainLockedEvent
      | GameEventIdentifiers.GameBeginEvent
    >,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        room.getOtherPlayers(owner.Id).find(player => !player.ChainLocked) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.ChainLockedEvent) {
      const chainLockedEvent = content as ServerEventFinder<GameEventIdentifiers.ChainLockedEvent>;
      return chainLockedEvent.toId === owner.Id && chainLockedEvent.linked === false;
    }

    return identifier === GameEventIdentifiers.GameBeginEvent && !owner.ChainLocked;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.ChainLockedEvent
      | GameEventIdentifiers.GameBeginEvent
    >;
    
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const targets = room.getOtherPlayers(fromId).filter(player => !player.ChainLocked).map(player => player.Id);
      if (targets.length === 0) {
        return false;
      }

      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        {
          players: targets,
          toId: fromId,
          requiredAmount: 1,
          conversation: 'liu_jieying: please choose a target to chain on',
          triggeredBySkills: [this.Name],
        }),
        fromId,
      );

      resp.selectedPlayers = resp.selectedPlayers || [targets[0]];

      await room.chainedOn(resp.selectedPlayers[0]);
    } else if (identifier === GameEventIdentifiers.ChainLockedEvent) {
      EventPacker.terminate(unknownEvent);
    } else {
      await room.chainedOn(fromId);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: LiuJieYing.Name, description: LiuJieYing.Description })
export class LiuJieYingBuff extends GlobalRulesBreakerSkill {
  public breakAdditionalCardHold(room: Room, owner: Player, target: Player): number {
    return target.ChainLocked ? 2 : 0;
  }
}
