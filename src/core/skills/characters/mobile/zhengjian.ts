import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {
  AllStage,
  CardResponseStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'zhengjian', description: 'zhengjian_description' })
export class ZhengJian extends TriggerSkill {
  public static readonly Targets = 'zhengjian_targets';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const players = room.getOtherPlayers(event.fromId).map(player => player.Id);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players,
        toId: event.fromId,
        requiredAmount: 1,
        conversation: 'zhengjian: please choose a target to gain ‘Jian’',
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    const toId = (response.selectedPlayers || [players[Math.floor(Math.random() * players.length)]])[0];

    const originalTargets = room.getFlag<PlayerId[]>(event.fromId, ZhengJian.Targets) || [];
    originalTargets.includes(toId) || originalTargets.push(toId);
    room.getPlayerById(event.fromId).setFlag<PlayerId[]>(ZhengJian.Targets, originalTargets);

    room.getFlag<number>(toId, this.Name) === undefined &&
      room.setFlag<number>(
        toId,
        this.Name,
        0,
        TranslationPack.translationJsonPatcher('zhengjian count: {0}', 0).toString(),
      );

    room.getPlayerById(toId).hasShadowSkill(ZhengJianRecorder.Name) ||
      (await room.obtainSkill(toId, ZhengJianRecorder.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhengJian.Name, description: ZhengJian.Description })
export class ZhengJianShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayer === room.getPlayerById(owner) &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  public async whenDead(room: Room, player: Player) {
    const toIds = player.getFlag<PlayerId[]>(this.GeneralName);
    if (toIds) {
      for (const toId of toIds) {
        room.removeFlag(toId, this.GeneralName);
        await room.loseSkill(toId, ZhengJianRecorder.Name);
      }
    }
    player.removeFlag(ZhengJian.Targets);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.toPlayer &&
      event.to === PlayerPhase.PhaseBegin &&
      owner.getFlag<PlayerId[]>(ZhengJian.Targets) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const toIds = room.getFlag<PlayerId[]>(event.fromId, ZhengJian.Targets);
    if (!toIds) {
      return false;
    }

    for (const toId of toIds) {
      if (!room.getPlayerById(toId).Dead) {
        const count = room.getFlag<number>(toId, this.GeneralName);
        if (count !== undefined) {
          await room.drawCards(
            Math.min(count, Math.min(room.getPlayerById(toId).MaxHp, 5)),
            event.fromId,
            'top',
            event.fromId,
            this.Name,
          );

          room.removeFlag(toId, this.GeneralName);
          await room.loseSkill(toId, ZhengJianRecorder.Name);
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_zhengjian_recorder', description: 's_zhengjian_recorder_description' })
export class ZhengJianRecorder extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, player: Player) {
    room.removeFlag(player.Id, ZhengJian.Name);
  }

  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === CardResponseStage.BeforeCardResponseEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return owner.getFlag<number>(ZhengJian.Name) !== undefined && event.fromId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const originalCount = room.getFlag<number>(event.fromId, ZhengJian.Name) || 0;
    room.setFlag<number>(
      event.fromId,
      ZhengJian.Name,
      originalCount + 1,
      TranslationPack.translationJsonPatcher('zhengjian count: {0}', originalCount + 1).toString(),
    );

    return true;
  }
}
