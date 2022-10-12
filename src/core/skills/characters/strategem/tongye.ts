import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'tongye', description: 'tongye_description' })
export class TongYe extends TriggerSkill {
  public static readonly Options = ['tongye:change', 'tongye:unchange'];

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options: TongYe.Options,
        conversation: TranslationPack.translationJsonPatcher('{0}: please choose tongye options', this.Name).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || TongYe.Options[0];

    const currentEquipsNum = room.AlivePlayers.reduce<number>(
      (sum, player) => sum + player.getCardIds(PlayerCardsArea.EquipArea).length,
      0,
    );
    room.setFlag<string>(
      event.fromId,
      this.Name,
      response.selectedOption + '+' + currentEquipsNum,
      TranslationPack.translationJsonPatcher('tongye: {0} {1}', response.selectedOption, currentEquipsNum).toString(),
    );
    room.getPlayerById(event.fromId).setFlag<boolean>(TongYeShadow.Name, true);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TongYe.Name, description: TongYe.Description })
export class TongYeShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return !!room.getPlayerById(owner).getFlag<string>(this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
        !!owner.getFlag<string>(this.GeneralName) &&
        !owner.getFlag<boolean>(this.Name)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.from === PlayerPhase.PhaseFinish &&
        phaseChangeEvent.fromPlayer === owner.Id &&
        (!!owner.getFlag<string>(this.GeneralName) || owner.getFlag<boolean>(this.Name))
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.PhaseStageChangeEvent) {
      const tongyeRecord = room.getFlag<string>(event.fromId, this.GeneralName).split('+');
      room.removeFlag(event.fromId, this.GeneralName);
      room.getPlayerById(event.fromId).removeFlag(this.Name);

      const currentEquipsNum = room.AlivePlayers.reduce<number>(
        (sum, player) => sum + player.getCardIds(PlayerCardsArea.EquipArea).length,
        0,
      );

      if (
        (tongyeRecord[0] === TongYe.Options[0] && parseInt(tongyeRecord[1], 10) !== currentEquipsNum) ||
        (tongyeRecord[0] === TongYe.Options[1] && parseInt(tongyeRecord[1], 10) === currentEquipsNum)
      ) {
        room.getMark(event.fromId, MarkEnum.Ye) < 2 && room.addMark(event.fromId, MarkEnum.Ye, 1);
      } else {
        room.getMark(event.fromId, MarkEnum.Ye) > 0 && room.addMark(event.fromId, MarkEnum.Ye, -1);
      }
    } else {
      if (room.getFlag<boolean>(event.fromId, this.Name)) {
        room.getPlayerById(event.fromId).removeFlag(this.Name);
      } else {
        room.removeFlag(event.fromId, this.GeneralName);
      }
    }

    return true;
  }
}
