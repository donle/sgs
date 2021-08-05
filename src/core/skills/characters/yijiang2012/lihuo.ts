import { VirtualCard } from 'core/cards/card';
import { FireSlash } from 'core/cards/legion_fight/fire_slash';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ChunLao } from './chunlao';

@CommonSkill({ name: 'lihuo', description: 'lihuo_description' })
export class LiHuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardUseDeclared;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
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

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
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
  public isAutoTrigger(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      Sanguosha.getCardById(event.cardId).Name === 'fire_slash' &&
      owner.Id === event.fromId &&
      room.getOtherPlayers(owner.Id).find(player => {
        return (
          room.canAttack(owner, player, event.cardId) &&
          !TargetGroupUtil.includeRealTarget(event.targetGroup, player.Id)
        );
      }) !== undefined
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    const players = room
      .getAlivePlayersFrom()
      .filter(
        player =>
          room.canAttack(from, player, cardUseEvent.cardId) &&
          !TargetGroupUtil.includeRealTarget(cardUseEvent.targetGroup, player.Id),
      )
      .map(player => player.Id);

    if (players.length < 1) {
      return false;
    }

    const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: fromId,
      players,
      requiredAmount: 1,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose a target to be the additional target of {1}',
        this.GeneralName,
        TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
      ).extract(),
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForPlayerChoose, fromId);

    const resp = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingPlayerEvent, fromId);
    if (!resp.selectedPlayers) {
      return false;
    }

    event.toIds = resp.selectedPlayers;

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    TargetGroupUtil.pushTargets(cardUseEvent.targetGroup!, toIds![0]);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LiHuoShadow.Name, description: LiHuoShadow.Description })
export class LiHuoPut extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    if (
      event.fromId === owner.Id &&
      EventPacker.getMiddleware<boolean>(this.GeneralName, event) &&
      room.isCardOnProcessing(event.cardId)
    ) {
      const card = Sanguosha.getCardById(event.cardId);
      if (card.isVirtualCard()) {
        const cardIds = (card as VirtualCard).getRealActualCards();
        return cardIds.length === 1 && Sanguosha.getCardById(cardIds[0]).GeneralName === 'slash';
      } else {
        return card.GeneralName === 'slash';
      }
    }

    return false;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put {1} on your general card as Chun?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    const card = Sanguosha.getCardById(cardUseEvent.cardId);
    const realCardId = card.isVirtualCard() ? (card as VirtualCard).getRealActualCards()[0] : cardUseEvent.cardId;
    await room.moveCards({
      movingCards: [{ card: realCardId, fromArea: CardMoveArea.ProcessingArea }],
      toId: fromId,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: ChunLao.Name,
      isOutsideAreaInPublic: true,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: LiHuoPut.Name, description: LiHuoPut.Description })
export class LiHuoLoseHp extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.BeforePhaseChange;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    let isLiHuo = false;
    const card = Sanguosha.getCardById(content.cardId);
    if (card.isVirtualCard()) {
      const vCard = card as VirtualCard;
      isLiHuo = vCard.findByGeneratedSkill(this.GeneralName);
    }

    return content.fromId === owner.Id && isLiHuo && EventPacker.getDamageSignatureInCardUse(content);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.loseHp(event.fromId, 1);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: LiHuoLoseHp.Name, description: LiHuoLoseHp.Description })
export class LiHuoRecord extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public getPriority() {
    return StagePriority.High;
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
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    const flag = owner.getFlag<boolean>(this.GeneralName);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return cardUseEvent.fromId === owner.Id && !flag;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return flag && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const from = room.getPlayerById(fromId);
      from.setFlag<boolean>(this.GeneralName, true);
      EventPacker.addMiddleware({ tag: this.GeneralName, data: true }, unknownEvent);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}
