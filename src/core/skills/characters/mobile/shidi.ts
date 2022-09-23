import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { RulesBreakerSkill, SwitchSkillState, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill, SwitchSkill } from 'core/skills/skill_wrappers';

@SwitchSkill()
@CompulsorySkill({ name: 'shidi', description: 'shidi_description' })
export class ShiDi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === CardUseStage.CardUsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        ((phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
          owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yin) ||
          (phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
            owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yang))
      );
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const card = Sanguosha.getCardById(cardUseEvent.cardId);
      if (card.GeneralName !== 'slash') {
        return false;
      }

      if (
        owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yang &&
        card.isBlack() &&
        cardUseEvent.fromId === owner.Id
      ) {
        cardUseEvent.disresponsiveList = cardUseEvent.disresponsiveList
          ? cardUseEvent.disresponsiveList.concat(...TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup))
          : TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup);
      } else if (
        owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yin &&
        card.isRed() &&
        cardUseEvent.fromId !== owner.Id &&
        TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).includes(owner.Id)
      ) {
        cardUseEvent.disresponsiveList = cardUseEvent.disresponsiveList
          ? [...cardUseEvent.disresponsiveList, owner.Id]
          : [owner.Id];
      }
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }
}

@SwitchSkill()
@ShadowSkill
@CompulsorySkill({ name: ShiDi.Name, description: ShiDi.Description })
export class ShiDiShadow extends RulesBreakerSkill {
  public breakOffenseDistance(room: Room, owner: Player): number {
    return owner.getSwitchSkillState(this.GeneralName, true) === SwitchSkillState.Yang ? 1 : 0;
  }

  public breakDefenseDistance(room: Room, owner: Player): number {
    return owner.getSwitchSkillState(this.GeneralName, true) === SwitchSkillState.Yin ? 1 : 0;
  }
}
