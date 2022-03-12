import { EventPacker, EventProcessSteps, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'dangmo', description: 'dangmo_description' })
export class DangMo extends TriggerSkill {
  private readonly DangMoTargets = 'dangmo_targets';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    if (owner.getFlag<PlayerId[]>(this.DangMoTargets)) {
      room.removeFlag(owner.Id, this.DangMoTargets);
    }

    let canUse: boolean =
      content.fromId === owner.Id &&
      owner.Hp - 1 > 0 &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'slash' &&
      EventPacker.getMiddleware<boolean>(this.Name, content) === true;

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
          this.DangMoTargets,
          targets.map(player => player.Id),
        );
      }
    }

    return canUse;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length > 0 && targets.length <= owner.Hp - 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getFlag<PlayerId[]>(owner, this.DangMoTargets)?.includes(target);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to add at least {1} targets for {2} ?',
      this.Name,
      owner.Hp - 1,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public getAnimationSteps(
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): EventProcessSteps {
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

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: DangMo.Name, description: DangMo.Description })
export class DangMoShadow extends TriggerSkill implements OnDefineReleaseTiming {
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
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash' &&
        !owner.getFlag<boolean>(this.GeneralName)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.fromPlayer === owner.Id &&
        phaseChangeEvent.from === PlayerPhase.PhaseFinish &&
        owner.getFlag<boolean>(this.GeneralName)
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      room.getPlayerById(fromId).setFlag<boolean>(this.GeneralName, true);
      EventPacker.addMiddleware(
        { tag: this.GeneralName, data: true },
        unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
      );
    } else {
      room.getPlayerById(fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}
