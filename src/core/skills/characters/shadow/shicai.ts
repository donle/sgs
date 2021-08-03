import { CardType, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AimStage,
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PlayerPhase,
  StagePriority,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shicai', description: 'shicai_description' })
export class ShiCai extends TriggerSkill implements OnDefineReleaseTiming {
  public static readonly ShiCaiTypeUsed = 'shicai_type_used';

  public async whenObtainingSkill(room: Room, owner: Player) {
    const shicaiUsed = owner.getFlag<CardType[]>(this.Name) || [];
    const cardUseEvents = room.Analytics.getCardUseRecord(owner.Id, true);
    if (cardUseEvents.length > 0) {
      for (const event of cardUseEvents) {
        if (shicaiUsed.length === 3) {
          break;
        }
        const type = Sanguosha.getCardById(event.cardId).BaseType;
        if (!shicaiUsed.includes(type)) {
          shicaiUsed.push(type);
        }
      }
    }
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUseFinishedEffect || stage === AimStage.AfterAimmed;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

      const card = Sanguosha.getCardById(cardUseEvent.cardId);
      const cardIds = card.isVirtualCard() ? (card as VirtualCard).getRealActualCards() : [cardUseEvent.cardId];
      return (
        cardUseEvent.fromId === owner.Id &&
        cardIds.length > 0 &&
        !(card.is(CardType.Equip) || card.is(CardType.DelayedTrick)) &&
        room.isCardOnProcessing(cardUseEvent.cardId) &&
        EventPacker.getMiddleware<boolean>(ShiCai.ShiCaiTypeUsed, cardUseEvent) === true
      );
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;

      if (!aimEvent.byCardId) {
        return false;
      }
      const card = Sanguosha.getCardById(aimEvent.byCardId);
      const cardIds = card.isVirtualCard() ? (card as VirtualCard).getRealActualCards() : [aimEvent.byCardId];
      return (
        aimEvent.fromId === owner.Id &&
        cardIds.length > 0 &&
        card.is(CardType.Equip) &&
        room.isCardOnProcessing(aimEvent.byCardId) &&
        EventPacker.getMiddleware<boolean>(ShiCai.ShiCaiTypeUsed, aimEvent) === true
      );
    }

    return false;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    const judge = EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent;
    const card = judge
      ? (event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId
      : (event as ServerEventFinder<GameEventIdentifiers.AimEvent>).byCardId;
    return card
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to put {1} on the top of draw stack, then draw a card?',
          this.Name,
          TranslationPack.patchCardInTranslation(card),
        ).extract()
      : TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', this.Name).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    let cardIds: CardId[] = [];
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const card = Sanguosha.getCardById(cardUseEvent.cardId);
      cardIds = card.isVirtualCard() ? (card as VirtualCard).getRealActualCards() : [cardUseEvent.cardId];
    } else {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      if (!aimEvent.byCardId) {
        return false;
      }
      const card = Sanguosha.getCardById(aimEvent.byCardId);
      cardIds = card.isVirtualCard() ? (card as VirtualCard).getRealActualCards() : [aimEvent.byCardId];
    }

    let toMove: CardId[] = cardIds;
    if (cardIds.length > 1) {
      const { top } = await room.doAskForCommonly<GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
        GameEventIdentifiers.AskForPlaceCardsInDileEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForPlaceCardsInDileEvent>({
          cardIds,
          top: cardIds.length,
          topStackName: 'draw stack top',
          bottom: 0,
          bottomStackName: 'draw stack bottom',
          toId: fromId,
          movable: true,
          triggeredBySkills: [this.Name],
        }),
        fromId,
      );

      toMove = top;
    }

    await room.moveCards({
      movingCards: toMove.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
      toArea: CardMoveArea.DrawStack,
      moveReason: CardMoveReason.PlaceToDrawStack,
    });

    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ShiCai.Name, description: ShiCai.Description })
export class ShiCaiShadow extends TriggerSkill implements OnDefineReleaseTiming {
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
    const flag = owner.getFlag<CardType[]>(this.GeneralName);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const shicaiUsed = flag || [];
      return (
        cardUseEvent.fromId === owner.Id && !shicaiUsed.includes(Sanguosha.getCardById(cardUseEvent.cardId).BaseType)
      );
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
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const from = room.getPlayerById(fromId);
      const shicaiUsed = from.getFlag<CardType[]>(this.GeneralName) || [];
      from.setFlag<CardType[]>(this.GeneralName, [...shicaiUsed, Sanguosha.getCardById(cardUseEvent.cardId).BaseType]);
      EventPacker.addMiddleware({ tag: ShiCai.ShiCaiTypeUsed, data: true }, cardUseEvent);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}
