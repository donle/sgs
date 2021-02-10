import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardMoveStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';

@CommonSkill({ name: 'juece', description: 'juece_description' })
export class JueCe extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
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
    return target !== owner && room.getPlayerById(target).getFlag<boolean>(this.Name);
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

    for (const player of room.getOtherPlayers(skillUseEvent.fromId)) {
      player.removeFlag(this.GeneralName);
    }
    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JueCe.Name, description: JueCe.Description })
export class JueCeShadow extends TriggerSkill implements OnDefineReleaseTiming {
  isAutoTrigger() {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return (
      stage === CardMoveStage.AfterCardMoved &&
      event.movingCards.find(
        cardInfo => cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea,
      ) !== undefined
    );
  }

  async whenObtainingSkill(room: Room, owner: Player) {
    for (const player of room.getOtherPlayers(owner.Id)) {
      if (room.Analytics.getCardLostRecord(player.Id, true).length > 0) {
        room.setFlag(player.Id, this.GeneralName, true);
      }
    }
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return owner.Id !== content.fromId && room.CurrentPhasePlayer.Id === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    if (!fromId) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    if (!from.getFlag<boolean>(this.GeneralName)) {
      room.setFlag(fromId, this.GeneralName, true);
    }

    return true;
  }
}
