import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'huomo', description: 'huomo_description' })
export class HuoMo extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player): string[] {
    const usedCards = owner.getFlag<string[]>(this.Name) || [];
    return Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).filter(name => {
      return !usedCards.includes(name);
    });
  }

  isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PhaseBegin;
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return !Sanguosha.getCardById(pendingCardId).is(CardType.Basic) && Sanguosha.getCardById(pendingCardId).isBlack();
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown huomo card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
        cardNumber: 0,
        cardSuit: CardSuit.NoSuit,
        hideActualCard: true,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: HuoMo.Name, description: HuoMo.Description })
export class HuoMoShadow extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  get Muted() {
    return true;
  }

  public getPriority() {
    return StagePriority.High;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === CardUseStage.PreCardUse || stage === CardResponseStage.PreCardResponse) &&
      Card.isVirtualCardId(event.cardId)
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return (
      content.fromId === owner.Id &&
      Sanguosha.getCardById<VirtualCard>(content.cardId).findByGeneratedSkill(this.GeneralName)
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    const preuseCard = Sanguosha.getCardById<VirtualCard>(cardEvent.cardId);
    const realCard = preuseCard.ActualCardIds[0];
    const from = room.getPlayerById(cardEvent.fromId);

    await room.moveCards({
      fromId: event.fromId,
      movingCards: [
        {
          card: realCard,
          fromArea: from.cardFrom(realCard),
        },
      ],
      moveReason: CardMoveReason.ActiveMove,
      toArea: CardMoveArea.DrawStack,
      movedByReason: this.GeneralName,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} placed card {1} on the top of draw stack',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(realCard),
      ).extract(),
    });

    cardEvent.cardId = VirtualCard.create({
      bySkill: this.GeneralName,
      cardName: preuseCard.Name,
    }).Id;

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: HuoMoShadow.Name, description: HuoMoShadow.Description })
export class HuoMoRecord extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  get Muted() {
    return true;
  }

  public getPriority() {
    return StagePriority.High;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === CardUseStage.AfterCardUseDeclared || stage === CardResponseStage.AfterCardResponseEffect) &&
      Sanguosha.getCardById(event.cardId).is(CardType.Basic)
    );
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseFinish;
  }

  public whenRefresh(room: Room, owner: Player) {
    room.removeFlag(owner.Id, this.GeneralName);
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return content.fromId === owner.Id;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent, fromId } = event;
    const { cardId } = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    const usedCards = room.getFlag<string[]>(fromId, this.GeneralName) || [];
    if (!usedCards.includes(Sanguosha.getCardById(cardId).GeneralName)) {
      const slashName = Sanguosha.getCardById(cardId).GeneralName;
      if (slashName === 'slash') {
        usedCards.push('slash', 'thunder_slash', 'fire_slash');
      } else {
        usedCards.push(Sanguosha.getCardById(cardId).GeneralName);
      }
      room.setFlag(fromId, this.GeneralName, usedCards);
    }

    return true;
  }
}
