import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDiedStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhuiyi', description: 'zhuiyi_description' })
export class ZhuiYi extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
  ): boolean {
    if (owner.getFlag<PlayerId>(this.Name) !== undefined) {
      room.removeFlag(owner.Id, this.Name);
    }

    const canUse = owner.Id === content.playerId;
    if (canUse && content.killedBy) {
      room.setFlag<PlayerId>(owner.Id, this.Name, content.killedBy);
    }

    return canUse;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== room.getFlag<PlayerId>(owner, this.Name);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
  ): PatchedTranslationObject {
    return (
      event.killedBy
      ? TranslationPack.translationJsonPatcher(
          '{0}: please choose a target except {1} to draw 3 cards and recover 1 hp',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.killedBy!)),
        ).extract()
      : TranslationPack.translationJsonPatcher(
          '{0}: please choose a target to draw 3 cards and recover 1 hp',
          this.Name,
        ).extract()
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = event;
    room.removeFlag(fromId, this.Name);

    await room.drawCards(3, toIds![0], 'top', fromId, this.Name);
    await room.recover({
      toId: toIds![0],
      recoveredHp: 1,
      recoverBy: fromId,
    });

    return true;
  }
}
