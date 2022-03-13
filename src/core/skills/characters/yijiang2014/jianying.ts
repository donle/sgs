import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, ShadowSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jianying', description: 'jianying_description' })
export class JianYing extends ViewAsSkill {
  public canViewAs(): string[] {
    return Sanguosha.getCardNameByType(types => types.includes(CardType.Basic));
  }

  isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PhaseBegin && room.CurrentPlayer.Id === owner.Id;
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown jianying card');
    const lastCardId = owner.getFlag<CardId | undefined>(JianYingRecord.Name);
    let card: Card | undefined;
    if (lastCardId !== undefined) {
      card = Sanguosha.getCardById(lastCardId);
    }

    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
        cardNumber: card ? card.CardNumber : 0,
        cardSuit: card ? card.Suit : CardSuit.NoSuit,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: JianYing.Name, description: JianYing.Description })
export class JianYingTrigger extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (
      event.fromId !== owner.Id ||
      room.CurrentPlayerPhase !== PlayerPhase.PlayCardStage ||
      room.CurrentPhasePlayer !== owner
    ) {
      return false;
    }

    const card = Sanguosha.getCardById(event.cardId);
    const lastCardId = room.getFlag<CardId | undefined>(owner.Id, JianYingRecord.Name);

    if (lastCardId !== undefined) {
      const lastCard = Sanguosha.getCardById(lastCardId);
      if (
        (lastCard.Suit !== CardSuit.NoSuit && lastCard.Suit === card.Suit) ||
        (lastCard.CardNumber !== 0 && lastCard.CardNumber === card.CardNumber)
      ) {
        return true;
      }
    }

    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JianYingTrigger.Name, description: JianYingTrigger.Description })
export class JianYingRecord extends TriggerSkill {
  getPriority(room: Room<WorkPlace>, owner: Player, event: ServerEventFinder<GameEventIdentifiers>): StagePriority {
    return StagePriority.Low;
  }

  isAutoTrigger(room: Room<WorkPlace>, owner: Player, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.AfterCardUseEffect;
  }

  isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return true;
  }

  public isRefreshAt(room: Room<WorkPlace>, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin && room.CurrentPlayer.Id === owner.Id;
  }

  public whenRefresh(room: Room<WorkPlace>, owner: Player): void {
    room.removeFlag(owner.Id, this.Name);
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (
      event.fromId !== owner.Id ||
      room.CurrentPlayerPhase !== PlayerPhase.PlayCardStage ||
      room.CurrentPhasePlayer !== owner
    ) {
      return false;
    }

    return true;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    room.setFlag(event.fromId, this.Name, cardEvent.cardId);
    return true;
  }
}
