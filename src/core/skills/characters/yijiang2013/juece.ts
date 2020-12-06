import { CardMoveArea, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  CardMoveStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'juece', description: 'juece_description' })
export class JueCe extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      PlayerPhaseStages.FinishStageStart === content.toStage &&
      room.getOtherPlayers(owner.Id).find(player => player.getFlag<boolean>(this.Name)) !== undefined
    );
  }
  public numberOfTargets() {
    return 1;
  }
  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return target !== owner && !!room.getPlayerById(target).getFlag<boolean>(this.Name);
  }
  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    await room.damage({
      fromId,
      toId: toIds![0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: JueCe.Name, description: JueCe.Description })
export class JueCeShadow extends TriggerSkill {
  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ) {
    const unknownEvent = EventPacker.getIdentifier(event);
    if (unknownEvent === GameEventIdentifiers.MoveCardEvent) {
      const cardEvent = event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        stage === CardMoveStage.AfterCardMoved &&
        cardEvent.movingCards.find(
          cardInfo =>
            (cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea) &&
            Sanguosha.getCardById(cardInfo.card),
        ) !== undefined
      );
    } else if (unknownEvent === GameEventIdentifiers.PhaseChangeEvent) {
      return stage === PhaseChangeStage.PhaseChanged;
    }
    return false;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return owner.Id !== content.fromId && room.CurrentPlayer.Id === owner.Id;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return owner.Id === content.fromPlayer && content.from === PlayerPhase.FinishStage;
    }
    return false;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = skillUseEvent;
    const identifier = EventPacker.getIdentifier(
      triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseChangeEvent>,
    );
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      if (!room.getPlayerById(fromId!).getFlag<boolean>(this.GeneralName)) {
        room.setFlag(fromId!, this.GeneralName, true, true);
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      for (const player of room.AlivePlayers) {
        room.removeFlag(player.Id, this.GeneralName);
      }
    }

    return true;
  }
}
