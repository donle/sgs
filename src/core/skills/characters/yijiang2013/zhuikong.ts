import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { GlobalFilterSkill, GlobalRulesBreakerSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zhuikong', description: 'zhuikong_description' })
export class ZhuiKong extends TriggerSkill implements OnDefineReleaseTiming {
  public static Filter: string = 'qiuyuan_filter';
  public static DistanceBreak: string = 'distance_break';

  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase): boolean {
    return room.CurrentPhasePlayer === owner && phase === PlayerPhase.FinishStage;
  }

  public whenRefresh(room: Room, owner: Player): void {
    for (const player of room.getOtherPlayers(owner.Id)) {
      player.getFlag<boolean>(ZhuiKong.Filter) && room.removeFlag(player.Id, ZhuiKong.Filter);
      player.getFlag<boolean>(ZhuiKong.DistanceBreak) && room.removeFlag(player.Id, ZhuiKong.DistanceBreak);
    }
  }

  public isTriggerable(_: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>): boolean {
    return event.toStage === PlayerPhaseStages.PrepareStageStart && event.playerId !== owner.Id && owner.isInjured();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = skillEffectEvent;
    const { playerId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    const to = room.getPlayerById(playerId);

    const pindianResult = await room.pindian(fromId, [playerId]);
    if (!pindianResult) {
      return false;
    }

    if (pindianResult.winners.includes(fromId)) {
      room.setFlag<boolean>(to.Id, ZhuiKong.Filter, true);
    } else {
      room.setFlag<boolean>(to.Id, ZhuiKong.DistanceBreak, true);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhuiKong.Name, description: ZhuiKong.Description })
export class ZhuiKongFilter extends GlobalFilterSkill {
  public canUseCardTo(_: CardId | CardMatcher, __: Room, ___: Player, from: Player, to: Player): boolean {
    return !from.getFlag<boolean>(ZhuiKong.Filter) || to.Id === from.Id;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhuiKongFilter.Name, description: ZhuiKongFilter.Description })
export class ZhuiKongDistance extends GlobalRulesBreakerSkill {
  public breakDistance(_: Room, owner: Player, from: Player, to: Player): number {
    return from.getFlag<boolean>(ZhuiKong.DistanceBreak) && to.Id === owner.Id ? 1 : 0;
  }
}
