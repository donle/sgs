import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, GameBeginStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xunyi', description: 'xunyi_description' })
export class XunYi extends TriggerSkill implements OnDefineReleaseTiming {
  public static readonly XunYiTarget = 'xunyi_target';

  public async whenDead(room: Room, owner: Player) {
    const target = owner.getFlag<PlayerId>(XunYi.XunYiTarget);
    if (target && !room.getPlayerById(target).Dead) {
      const users = room.getFlag<PlayerId[]>(target, this.Name) || [];
      if (users.length === 1) {
        room.removeFlag(target, this.Name);
      } else if (users.length > 0) {
        const index = users.findIndex(user => user === owner.Id);
        index !== -1 && users.splice(index, 1);
        room.setFlag<PlayerId[]>(target, this.Name, users, 'xunyi:yi');
      }
    }
    owner.removeFlag(XunYi.XunYiTarget);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>, stage?: AllStage): boolean {
    return stage === GameBeginStage.AfterGameBegan;
  }

  public canUse(): boolean {
    return true;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to gain 1 ‘Yi’?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    room.getPlayerById(fromId).setFlag<PlayerId>(XunYi.XunYiTarget, toIds[0]);

    const originalUsers = room.getFlag<PlayerId[]>(toIds[0], this.Name) || [];
    originalUsers.push(fromId);
    room.setFlag<PlayerId[]>(toIds[0], this.Name, originalUsers, 'xunyi:yi');

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XunYi.Name, description: XunYi.Description })
export class XunYiEffect extends TriggerSkill {
  private readonly XunYiStage = 'xunyi_stage';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    if (!stage) {
      return false;
    }

    let canUse = false;
    const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const target = owner.getFlag<PlayerId>(XunYi.XunYiTarget);

    if (!target) {
      return false;
    }

    if (stage === DamageEffectStage.AfterDamageEffect) {
      canUse =
        (target === damageEvent.fromId && damageEvent.toId !== owner.Id) ||
        (owner.Id === damageEvent.fromId && target !== damageEvent.toId);
    } else {
      canUse =
        (target === damageEvent.toId && damageEvent.fromId !== owner.Id) ||
        (owner.Id === damageEvent.toId && target !== damageEvent.fromId);
    }

    if (canUse) {
      owner.setFlag<AllStage>(this.XunYiStage, stage);
    }

    return canUse;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const stage = from.getFlag<AllStage>(this.XunYiStage);
    from.removeFlag(this.XunYiStage);

    const target = room.getPlayerById(fromId).getFlag<PlayerId>(XunYi.XunYiTarget);
    if (stage === DamageEffectStage.AfterDamageEffect) {
      const player = target === damageEvent.fromId ? fromId : target;
      await room.drawCards(1, player, 'top', player, this.GeneralName);
    } else {
      const player = target === damageEvent.toId ? fromId : target;
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardDropEvent>(
        GameEventIdentifiers.AskForCardDropEvent,
        {
          toId: fromId,
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          cardAmount: 1,
          triggeredBySkills: [this.GeneralName],
        },
        player,
        true,
      );

      const playerCards = room.getPlayerById(player).getPlayerCards();
      response.droppedCards = response.droppedCards || playerCards[Math.floor(Math.random() * playerCards.length)];

      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, player, player, this.GeneralName);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XunYiEffect.Name, description: XunYiEffect.Description })
export class XunYiMove extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return owner.getFlag<PlayerId>(XunYi.XunYiTarget) === content.playerId;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner && !room.getFlag<PlayerId[]>(targetId, this.GeneralName)?.includes(owner);
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to gain 1 ‘Yi’?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    room.getPlayerById(fromId).setFlag<PlayerId>(XunYi.XunYiTarget, toIds[0]);

    const originalUsers = room.getFlag<PlayerId[]>(toIds[0], this.GeneralName) || [];
    originalUsers.push(fromId);
    room.setFlag<PlayerId[]>(toIds[0], this.GeneralName, originalUsers, 'xunyi:yi');

    return true;
  }
}
