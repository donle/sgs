import { CardDrawReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DrawCardStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'baoshu', description: 'baoshu_description' })
export class BaoShu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= owner.MaxHp;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose at most {1} target(s) to gain 1 mark ‘Shu’ each?',
      this.Name,
      owner.MaxHp,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    for (const toId of event.toIds) {
      room.addMark(toId, MarkEnum.Shu, room.getPlayerById(event.fromId).MaxHp + 1 - event.toIds.length);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_baoshu_buff', description: 's_baoshu_buff_description' })
export class BaoShuBuff extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DrawCardStage.CardDrawing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return content.fromId === owner.Id && content.bySpecialReason === CardDrawReason.GameStage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (room.getMark(event.fromId, MarkEnum.Shu) > 0) {
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>).drawAmount += room.getMark(
        event.fromId,
        MarkEnum.Shu,
      );
      room.removeMark(event.fromId, MarkEnum.Shu);
    }

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}
