import { VirtualCard } from 'core/cards/card';
import { FireSlash } from 'core/cards/legion_fight/fire_slash';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TagEnum } from 'core/shares/types/tag_list';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'lihuo', description: 'lihuo_description' })
export class LiHuo extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.AfterCardUseDeclared;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    return Sanguosha.getCardById(event.cardId).Name === 'slash' && owner.Id === event.fromId;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to transfrom {1} into fire slash?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const { cardId } = cardUseEvent;

    const fireSlash = VirtualCard.create<FireSlash>(
      {
        cardName: 'fire_slash',
        bySkill: this.Name,
      },
      [cardId],
    );
    cardUseEvent.cardId = fireSlash.Id;
    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, transfrom {2} into {3}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(cardId),
        TranslationPack.patchCardInTranslation(fireSlash.Id),
      ).extract(),
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LiHuo.Name, description: LiHuo.Description })
export class LiHuoShadow extends TriggerSkill {
  public static readonly Targets = 'lihuo_targets';

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    if (owner.getFlag<CardId>(this.Name) !== undefined) {
      room.removeFlag(owner.Id, this.Name);
    }
    if (owner.getFlag<PlayerId[]>(LiHuoShadow.Targets) !== undefined) {
      room.removeFlag(owner.Id, LiHuoShadow.Targets);
    }

    const canUse =
      Sanguosha.getCardById(event.cardId).Name === 'fire_slash' &&
      owner.Id === event.fromId &&
      room.getOtherPlayers(owner.Id)
        .find(
          player => {
            return (
              room.canAttack(owner, player, event.cardId) &&
              !event.toIds!.includes(player.Id)
            );
          }
        ) !== undefined;
    if (canUse) {
      room.setFlag<CardId>(owner.Id, this.Name, event.cardId);
      room.setFlag<PlayerId[]>(owner.Id, LiHuoShadow.Targets, event.toIds!);
    }

    return canUse;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const slash = room.getFlag<CardId>(owner, this.Name);
    const targets = room.getFlag<PlayerId[]>(owner, LiHuoShadow.Targets);
    return room.canAttack(room.getPlayerById(owner), room.getPlayerById(target), slash) && !targets.includes(target);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: please choose a target to be the additional target of {1}',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    room.removeFlag(fromId, this.Name);
    room.removeFlag(fromId, LiHuoShadow.Targets);

    cardUseEvent.toIds?.push(toIds![0]);
    room.sortPlayersByPosition(cardUseEvent.toIds!);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LiHuoShadow.Name, description: LiHuoShadow.Description })
export class LiHuoLoseHp extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    const cardUseEventTag = EventPacker.getMiddleware<number>(TagEnum.CardUseEventTag, content);
    let isLiHuo = false;
    const card = Sanguosha.getCardById(content.cardId);
    if (card.isVirtualCard()) {
      const vCard = card as VirtualCard;
      isLiHuo = vCard.findByGeneratedSkill(this.GeneralName);
    }

    return (
      content.fromId === owner.Id &&
      isLiHuo &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
        event => {
          return (
            EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent &&
            EventPacker.getMiddleware<number>(TagEnum.CardUseEventTag, event) === cardUseEventTag
          );
        },
      ).length !== 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.loseHp(event.fromId, 1);

    return true;
  }
}
