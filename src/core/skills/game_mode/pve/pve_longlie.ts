import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TriggerSkill } from 'core/skills/skill';
import { ServerEventFinder, GameEventIdentifiers, EventPacker } from 'core/event/event';
import { AllStage, AimStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { VirtualCard } from 'core/cards/card';

@CompulsorySkill({ name: 'pve_longlie', description: 'pve_longlie_description' })
export class PveLongLie extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAim &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return owner.Id === event.fromId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    EventPacker.setDisresponsiveEvent(aimEvent);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveLongLie.Name, description: PveLongLie.Description })
export class PveLongLieShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id !== event.playerId && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const fireSlashUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId: event.fromId,
      cardId: VirtualCard.create({
        cardName: 'fire_slash',
        bySkill: this.GeneralName,
      }).Id,
      targetGroup: [[room.CurrentPhasePlayer.Id]],
    };

    await room.useCard(fireSlashUseEvent);

    return true;
  }
}
