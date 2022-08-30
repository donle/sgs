import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CircleStartStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, LimitSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'bihuo', description: 'bihuo_description' })
export class BiHuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.AfterPlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return !room.getPlayerById(content.dying).Dead;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use {0} to {1}?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.dying)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const dying = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying;
    await room.drawCards(3, dying, 'top', event.fromId, this.Name);

    room.setFlag<number>(
      dying,
      this.Name,
      room.AlivePlayers.length,
      TranslationPack.translationJsonPatcher('bihuo distance: {0}', room.AlivePlayers.length).toString(),
    );

    const dyingPlayer = room.getPlayerById(dying);
    dyingPlayer.hasShadowSkill(BiHuoBuff.Name) || (await room.obtainSkill(dying, BiHuoBuff.Name));
    dyingPlayer.hasShadowSkill(BiHuoRemove.Name) || (await room.obtainSkill(dying, BiHuoRemove.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_bihuo_buff', description: 's_bihuo_buff_description' })
export class BiHuoBuff extends RulesBreakerSkill {
  public breakDefenseDistance(room: Room, owner: Player): number {
    return owner.getFlag<number>(BiHuo.Name) || 0;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_bihuo_remove', description: 's_bihuo_remove_description' })
export class BiHuoRemove extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CircleStartEvent>, stage?: AllStage): boolean {
    return stage === CircleStartStage.AfterCircleStarted;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return owner.getFlag<number>(BiHuo.Name) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, BiHuo.Name);
    const from = room.getPlayerById(event.fromId);

    from.hasShadowSkill(BiHuoBuff.Name) && (await room.loseSkill(event.fromId, BiHuoBuff.Name));
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}
