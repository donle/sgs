import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, RulesBreakerSkill, ShadowSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'duanliang', description: 'duanliang_description' })
export class DuanLiang extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['bingliangcunduan'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.canUseCard(room, new CardMatcher({ name: ['bingliangcunduan'] }));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean {
    const card = Sanguosha.getCardById(pendingCardId);
    const isAvailable = cardMatcher
      ? cardMatcher.match(new CardMatcher({ type: [CardType.Basic] })) ||
        cardMatcher.match(new CardMatcher({ type: [CardType.Equip] }))
      : card.is(CardType.Basic) || card.is(CardType.Equip);
    return isAvailable && card.isBlack();
  }

  public viewAs(selectedCards: CardId[]): VirtualCard {
    return VirtualCard.create<Slash>(
      {
        cardName: 'bingliangcunduan',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: DuanLiang.Name, description: DuanLiang.Description })
export class DuanLiangShadow extends RulesBreakerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  breakCardUsableDistanceTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player) {
    if (owner.getCardIds(PlayerCardsArea.HandArea).length > target.getCardIds(PlayerCardsArea.HandArea).length) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ name: ['bingliangcunduan'] })) ? INFINITE_DISTANCE : 0;
    } else {
      const card = Sanguosha.getCardById(cardId);
      return card.GeneralName === 'bingliangcunduan' ? INFINITE_DISTANCE : 0;
    }
  }
}
