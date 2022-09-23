import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'boming', description: 'boming_description' })
export class BoMing extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return owner.hasUsedSkillTimes(this.Name) < 2;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(event.fromId).cardFrom(event.cardIds[0]) }],
      fromId: event.fromId,
      toId: event.toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    if (room.getFlag<boolean>(event.fromId, this.Name) === undefined) {
      room.getPlayerById(event.fromId).hasUsedSkillTimes(this.Name) === 2 &&
        room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: BoMing.Name, description: BoMing.Description })
export class BoMingShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return room.getFlag<number>(owner, this.GeneralName) === undefined;
  }

  public async whenDead(room: Room, player: Player) {
    player.removeFlag(this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    if (owner.getFlag<boolean>(this.GeneralName) === undefined) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        owner.getFlag<boolean>(this.GeneralName)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.fromPlayer === owner.Id && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.GeneralName);
    }

    room.getPlayerById(event.fromId).removeFlag(this.GeneralName);

    return true;
  }
}
