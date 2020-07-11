import { VirtualCard } from 'core/cards/card';
import { CardMatcher, CardMatcherProps } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'guose', description: 'guose_description' })
export class GuoSe extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    const guoseCard = selectedCards.length > 0 ? Sanguosha.getCardById(selectedCards[0]) : undefined;
    const matcherProps: CardMatcherProps = { name: ['lebusishu'] };
    if (guoseCard) {
      matcherProps.suit = [guoseCard.Suit];
    }
    return target !== owner && room.getPlayerById(owner).canUseCardTo(room, new CardMatcher(matcherProps), target);
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.Suit === CardSuit.Diamond;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, cardIds, fromId } = event;
    const hasLeBuSiShu = room
      .getPlayerById(toIds![0])
      .getCardIds(PlayerCardsArea.JudgeArea)
      .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'lebusishu');

    if (hasLeBuSiShu) {
      await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);
      await room.dropCards(CardMoveReason.PassiveDrop, [hasLeBuSiShu], toIds![0], fromId, this.Name);
    } else {
      const realCard = Sanguosha.getCardById(cardIds![0]);
      const lebusishuCard = VirtualCard.create(
        {
          cardName: 'lebusishu',
          cardNumber: realCard.CardNumber,
          cardSuit: realCard.Suit,
          bySkill: this.Name,
        },
        cardIds!,
      );
      await room.useCard({
        fromId,
        toIds,
        cardId: lebusishuCard.Id,
        triggeredBySkills: [this.Name],
      });
    }

    await room.drawCards(1, fromId, 'top', undefined, this.Name);
    return true;
  }
}
