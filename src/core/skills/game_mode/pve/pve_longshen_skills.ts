import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {
  AllStage,
  DrawCardStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_longshen_ziyu', description: 'pve_longshen_ziyu_description' })
export class PveLongShenZiYu extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId && PlayerPhaseStages.PrepareStageStart === content.toStage && owner.isInjured()
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(content.fromId);
    await room.recover({
      recoveredHp: owner.MaxHp - owner.Hp,
      recoverBy: owner.Id,
      toId: owner.Id,
    });

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_chouxin', description: 'pve_longshen_chouxin_description' })
export class PveLongShenChouXin extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      content.fromId === room.CurrentPhasePlayer.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      content.fromId !== owner.Id
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const target = room.CurrentPhasePlayer;
    const card = target.getPlayerCards()[Math.floor(target.getPlayerCards().length * Math.random())];
    await room.moveCards({
      movingCards: [{ card }],
      fromId: target.Id,
      toId: content.fromId,
      moveReason: CardMoveReason.ActivePrey,
      toArea: CardMoveArea.HandArea,
      movedByReason: this.Name,
    });

    return true;
  }
}
