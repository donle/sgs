import { CardType, VirtualCard } from 'core/cards/card';
import { CardColor, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'miaoxian', description: 'miaoxian_description' })
export class MiaoXian extends ViewAsSkill {
  public canViewAs(): string[] {
    return Sanguosha.getCardNameByType(
      types => types.includes(CardType.Trick) && !types.includes(CardType.DelayedTrick),
    );
  }

  isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PhaseBegin;
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      owner.getCardIds(PlayerCardsArea.HandArea).filter(card => Sanguosha.getCardById(card).Color === CardColor.Black)
        .length === 1
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return (
      Sanguosha.getCardById(pendingCardId).Color === CardColor.Black &&
      owner.getCardIds(PlayerCardsArea.HandArea).includes(pendingCardId)
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown guhuo card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: MiaoXian.Name, description: MiaoXian.Description })
export class MiaoXianShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      content.moveReason === CardMoveReason.CardUse &&
      content.movingCards.filter(
        card => Sanguosha.getCardById(card.card).Color === CardColor.Red && card.fromArea === CardMoveArea.HandArea,
      ).length === 1 &&
      owner.getCardIds(PlayerCardsArea.HandArea).find(card => Sanguosha.getCardById(card).Color === CardColor.Red) ===
        undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
