import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhukou', description: 'zhukou_description' })
export class ZhuKou extends TriggerSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    const records = room.Analytics.getDamageRecord(owner.Id, 'round', [PlayerPhase.PlayCardStage], 1);
    if (records.length > 0) {
      owner.setFlag<boolean>(ZhuKouDamage.Name, true);
      EventPacker.addMiddleware({ tag: this.Name, data: true }, records[0]);
    }
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      EventPacker.getMiddleware<boolean>(this.Name, content) === true &&
      room.Analytics.getCardUseRecord(owner.Id, 'round', undefined, 1).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(
      room.Analytics.getCardUseRecord(event.fromId, 'round').length,
      event.fromId,
      'top',
      event.fromId,
      this.Name,
    );

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZhuKou.Name, description: ZhuKou.Description })
export class ZhuKouDamage extends TriggerSkill {
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
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      room.getOtherPlayers(owner.Id).length > 1 &&
      room.Analytics.getDamageRecord(owner.Id, 'round', undefined, 1).length < 1
    );
  }

  public numberOfTargets(): number {
    return 2;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose two targets to deal 1 damage each?',
      this.GeneralName,
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
      await room.damage({
        fromId: event.fromId,
        toId,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhuKouDamage.Name, description: ZhuKouDamage.Description })
export class ZhuKouShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ) {
    return stage === DamageEffectStage.DamageDone || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.fromId === owner.Id &&
        !owner.getFlag<boolean>(this.Name) &&
        room.CurrentPlayerPhase === PlayerPhase.PlayCardStage
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.from === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(this.Name);
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
      EventPacker.addMiddleware({ tag: this.GeneralName, data: true }, unknownEvent);
    } else {
      room.removeFlag(event.fromId, this.Name);
    }

    return true;
  }
}
