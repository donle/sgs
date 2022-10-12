import { ChaoFeng } from './chaofeng';
import { ChuanYun } from './chuanyun';
import { StdLongDan } from '../sp/std_longdan';
import { CongJian } from '../thunder/congjian';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerDiedStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'chuanshu', description: 'chuanshu_description' })
export class ChuanShu extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['std_longdan', 'congjian', 'chuanyun'];
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PlayerDiedEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PlayerDiedEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
        owner.LostHp > 0
      );
    } else if (identifier === GameEventIdentifiers.PlayerDiedEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>).playerId === owner.Id;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: room.getOtherPlayers(fromId).map(player => player.Id),
        toId: fromId,
        requiredAmount: 1,
        conversation: 'chuanshu: do you want to let another player gain skill ChaoFeng?',
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    if (response.selectedPlayers && response.selectedPlayers.length > 0) {
      await room.obtainSkill(response.selectedPlayers[0], ChaoFeng.Name, true);
    }

    if (
      EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>) ===
      GameEventIdentifiers.PhaseStageChangeEvent
    ) {
      await room.obtainSkill(fromId, StdLongDan.Name, true);
      await room.obtainSkill(fromId, CongJian.Name, true);
      await room.obtainSkill(fromId, ChuanYun.Name, true);
    }

    return true;
  }
}
