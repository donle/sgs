import { EventProcessSteps, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shichou', description: 'shichou_description' })
export class ShiChou extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    if (owner.getFlag<PlayerId[]>(this.Name)) {
      room.removeFlag(owner.Id, this.Name);
    }

    let canUse: boolean = content.fromId === owner.Id && Sanguosha.getCardById(content.cardId).GeneralName === 'slash';

    if (canUse) {
      const targets = room
        .getOtherPlayers(owner.Id)
        .filter(
          player =>
            room.canAttack(owner, player, content.cardId, undefined, true) &&
            !TargetGroupUtil.getRealTargets(content.targetGroup).includes(player.Id),
        );
      canUse = targets.length > 0;
      if (canUse) {
        room.setFlag<PlayerId[]>(
          owner.Id,
          this.Name,
          targets.map(player => player.Id),
        );
      }
    }

    return canUse;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length > 0 && targets.length <= Math.max(1, owner.LostHp);
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getFlag<PlayerId[]>(owner, this.Name)?.includes(target);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to add at least {1} targets for {2} ?',
      this.Name,
      Math.max(1, owner.LostHp),
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): EventProcessSteps {
    return event.toIds ? [{ from: event.fromId, tos: event.toIds }] : [];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    const targetGroup = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup;
    if (targetGroup) {
      for (const toId of toIds) {
        TargetGroupUtil.pushTargets(targetGroup, toId);
      }
    }

    return true;
  }
}
