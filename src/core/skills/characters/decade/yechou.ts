import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerDiedStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yechou', description: 'yechou_description' })
export class YeChou extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return (
      content.playerId === owner.Id && room.getOtherPlayers(owner.Id).find(player => player.LostHp > 1) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).LostHp > 1;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a yechou target to use this skill?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    room.getPlayerById(event.toIds[0]).hasShadowSkill(YeChouDebuff.Name) ||
      (await room.obtainSkill(event.toIds[0], YeChouDebuff.Name));
    room.getFlag<boolean>(event.toIds[0], this.Name) ||
      room.setFlag<boolean>(event.toIds[0], this.Name, true, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_yechou_debuff', description: 's_yechou_debuff_description' })
export class YeChouDebuff extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    room.removeFlag(player.Id, YeChou.Name);
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === PhaseChangeStage.PhaseChanged && event.from === PlayerPhase.PhaseFinish) ||
      (stage === PhaseChangeStage.AfterPhaseChanged &&
        event.to === PlayerPhase.PhaseBegin &&
        event.toPlayer === owner.Id)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const phaseChangeEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
    if (phaseChangeEvent.to === PlayerPhase.PhaseBegin && phaseChangeEvent.toPlayer === event.fromId) {
      room.removeFlag(event.fromId, YeChou.Name);
      await room.loseSkill(event.fromId, this.Name);
    } else {
      await room.loseHp(event.fromId, 1);
    }

    return true;
  }
}
