import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { PanShi } from './panshi';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'cixiao', description: 'cixiao_description' })
export class CiXiao extends TriggerSkill implements OnDefineReleaseTiming {
  private async handleCiXiaoFlag(room: Room, player: PlayerId, lose?: boolean) {
    if (lose) {
      room.removeFlag(player, this.Name);
      await room.loseSkill(player, PanShi.Name, true);
    } else {
      room.setFlag<boolean>(player, this.Name, true, 'cixiao:yizi');
      await room.obtainSkill(player, PanShi.Name, true);
    }
  }

  public async whenDead(room: Room, owner: Player) {
    for (const player of room.getOtherPlayers(owner.Id)) {
      if (player.getFlag<boolean>(this.Name)) {
        this.handleCiXiaoFlag(room, player.Id, true);
      }
    }
  }

  public async whenLosingSkill(room: Room, owner: Player) {
    for (const player of room.getOtherPlayers(owner.Id)) {
      if (player.getFlag<boolean>(this.Name)) {
        this.handleCiXiaoFlag(room, player.Id, true);
      }
    }
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      room.getOtherPlayers(owner.Id).find(player => !player.getFlag<boolean>(this.Name)) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && !room.getFlag<boolean>(target, this.Name);
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose another player to be your son?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const toId = Precondition.exists(event.toIds, 'Unable to get zhi_shanxi target')[0];
    for (const player of room.getOtherPlayers(event.fromId)) {
      if (player.getFlag<boolean>(this.Name)) {
        this.handleCiXiaoFlag(room, player.Id, true);
      }
    }

    this.handleCiXiaoFlag(room, toId);

    return true;
  }
}
