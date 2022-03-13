import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { CircleSkill, CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CircleSkill
@CommonSkill({ name: 'jinzhi', description: 'jinzhi_description' })
export class JinZhi extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player): string[] {
    return Sanguosha.getCardNameByType(types => types.includes(CardType.Basic));
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).find(name => {
        return owner.canUseCard(room, new CardMatcher({ name: [name] }));
      }) !== undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === owner.hasUsedSkillTimes(this.Name) + 1;
  }

  public isAvailableCard(room: Room, owner: Player, cardId: CardId, selectedCards: CardId[]): boolean {
    if (!room.canDropCard(owner.Id, cardId)) {
      return false;
    }

    return selectedCards.length > 0
      ? Sanguosha.getCardById(cardId).Color === Sanguosha.getCardById(selectedCards[0]).Color
      : true;
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown jinzhi card');
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
@PersistentSkill()
@CommonSkill({ name: JinZhi.Name, description: JinZhi.Description })
export class JinZhiShadow extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  get Muted() {
    return true;
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

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
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
    const multiEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    const realCards = VirtualCard.getActualCards([multiEvent.cardId]);

    await room.dropCards(CardMoveReason.SelfDrop, realCards, event.fromId, event.fromId, this.Name);
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    multiEvent.cardId = VirtualCard.create({
      cardName: Sanguosha.getCardById(multiEvent.cardId).Name,
      bySkill: this.Name,
    }).Id;

    return true;
  }
}
