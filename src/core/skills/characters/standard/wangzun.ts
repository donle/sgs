import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { GameCommonRules } from 'core/game/game_rules';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';

@CompulsorySkill({ name: 'wangzun', description: 'wangzun_description' })
export class WangZun extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      PlayerPhaseStages.PrepareStageStart === content.toStage &&
      room.getPlayerById(content.playerId).Hp > owner.Hp
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const phaseStageChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;

    if (room.getPlayerById(phaseStageChangeEvent.playerId).Role === PlayerRole.Lord) {
      await room.drawCards(2, skillUseEvent.fromId, undefined, skillUseEvent.fromId, this.Name);
      room.syncGameCommonRules(phaseStageChangeEvent.playerId, user => {
        user.addInvisibleMark(this.Name, 1);
        GameCommonRules.addAdditionalHoldCardNumber(user, -1);
      });
    } else {
      await room.drawCards(1, skillUseEvent.fromId, undefined, skillUseEvent.fromId, this.Name);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: WangZun.Name, description: WangZun.Description })
export class WangZunShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  public isFlaggedSkill() {
    return true;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (PlayerPhaseStages.PhaseFinishEnd !== content.toStage) {
      return false;
    }
    const lord = room.getPlayerById(content.playerId);
    return lord.Role === PlayerRole.Lord && lord.getInvisibleMark(this.GeneralName) > 0;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const phaseChangeEvent = Precondition.exists(
      triggeredOnEvent,
      'Unknown phase change event in wangzun',
    ) as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;

    room.syncGameCommonRules(phaseChangeEvent.playerId, user => {
      const extraHold = user.getInvisibleMark(this.GeneralName);
      user.removeInvisibleMark(this.GeneralName);
      GameCommonRules.addAdditionalHoldCardNumber(user, extraHold);
    });
    return true;
  }
}
