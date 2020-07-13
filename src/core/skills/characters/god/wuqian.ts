import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { WuShuang } from '../standard/wushuang';
import { KuangBao } from './kuangbao';

@CommonSkill({ name: 'wuqian', description: 'wuqian_description' })
export class WuQian extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return room.getMark(owner.Id, KuangBao.Fury) >= 2;
  }

  public cardFilter(): boolean {
    return true;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return !room.getFlag<boolean>(target, this.GeneralName) && target !== owner;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.addMark(skillEffectEvent.fromId, KuangBao.Fury, -2);

    const target = skillEffectEvent.toIds![0];
    room.setFlag<boolean>(target, this.GeneralName, true);

    if (!room.getFlag<boolean>(skillEffectEvent.fromId, this.GeneralName)) {
      room.setFlag<boolean>(skillEffectEvent.fromId, this.GeneralName, true);
      room.obtainSkill(skillEffectEvent.fromId, WuShuang.GeneralName);
    }

    return true;
  }
}
@ShadowSkill
@CompulsorySkill({ name: WuQian.GeneralName, description: WuQian.Description })
export class WuQianShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public onLosingSkill(room: Room): boolean {
    return room.CurrentPlayerStage === PlayerPhaseStages.FinishStageEnd;
  }

  public onDeath(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.playerId === owner.Id &&
      event.toStage === PlayerPhaseStages.FinishStageEnd &&
      !!room.getAlivePlayersFrom().find(player => !!room.getFlag<boolean>(player.Id, this.GeneralName))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    if (!!room.getFlag<boolean>(skillEffectEvent.fromId, this.GeneralName)) {
      room.removeFlag(skillEffectEvent.fromId, this.GeneralName);
      await room.loseSkill(skillEffectEvent.fromId, WuShuang.GeneralName);
    }

    for (const player of room.getOtherPlayers(skillEffectEvent.fromId)) {
      if (!!room.getFlag<boolean>(player.Id, this.GeneralName)) {
        room.removeFlag(player.Id, this.GeneralName);
      }
    }

    return true;
  }
}
