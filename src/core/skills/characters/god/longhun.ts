import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, RecoverEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'longhun', description: 'longhun_description' })
export class LongHun extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[]): string[] {
    if (!selectedCards) {
      return ['jink', 'slash', 'wuxiekeji', 'peach'];
    } else {
      const cardOne = Sanguosha.getCardById(selectedCards[0]);
      const cardTwo = selectedCards.length > 1 ? Sanguosha.getCardById(selectedCards[1]) : undefined;

      if (cardTwo && cardTwo.Suit !== cardOne.Suit) {
        return [];
      }

      if (cardOne.Suit === CardSuit.Club) {
        return ['jink'];
      }
      if (cardOne.Suit === CardSuit.Diamond) {
        return ['slash'];
      }
      if (cardOne.Suit === CardSuit.Heart) {
        return ['peach'];
      }
      if (cardOne.Suit === CardSuit.Spade) {
        return ['wuxiekeji'];
      }

      return [];
    }
  }

  public canUse(room: Room, owner: Player) {
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['slash'] })) ||
      owner.canUseCard(room, new CardMatcher({ name: ['peach'] }))
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length >= 1 && cards.length <= 2;
  }

  public isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean {
    if (selectedCards.length === 0) {
      if (cardMatcher) {
        let canUse = false;
        if (cardMatcher.Matcher.name?.includes('jink')) {
          canUse = Sanguosha.getCardById(pendingCardId).Suit === CardSuit.Club;
        } else if (cardMatcher.Matcher.name?.includes('slash')) {
          canUse = Sanguosha.getCardById(pendingCardId).Suit === CardSuit.Diamond;
        } else if (cardMatcher.Matcher.name?.includes('peach')) {
          canUse = Sanguosha.getCardById(pendingCardId).Suit === CardSuit.Heart;
        } else if (cardMatcher.Matcher.name?.includes('wuxiekeji')) {
          canUse = Sanguosha.getCardById(pendingCardId).Suit === CardSuit.Spade;
        }
        return canUse;
      } else {
        const card = Sanguosha.getCardById(pendingCardId);
        if (card.Suit === CardSuit.Diamond) {
          return owner.canUseCard(room, new CardMatcher({ name: ['slash'] }));
        } else if (card.Suit === CardSuit.Heart) {
          return owner.canUseCard(room, new CardMatcher({ name: ['peach'] }));
        }

        return false;
      }
    } else {
      return (
        owner.cardFrom(pendingCardId) === PlayerCardsArea.HandArea &&
        Sanguosha.getCardById(pendingCardId).Suit === Sanguosha.getCardById(selectedCards[0]).Suit
      );
    }
  }

  public viewAs(selectedCards: CardId[]): VirtualCard {
    const suit = Sanguosha.getCardById(selectedCards[0]).Suit;
    let cardName: string | undefined;
    switch (suit) {
      case CardSuit.Spade:
        cardName = 'wuxiekeji';
        break;
      case CardSuit.Club:
        cardName = 'jink';
        break;
      case CardSuit.Heart:
        cardName = 'peach';
        break;
      case CardSuit.Diamond:
        cardName = 'fire_slash';
        break;
      default:
        throw new Error('Unknown longhun card');
    }

    return VirtualCard.create(
      {
        cardName: cardName!,
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: LongHun.Name, description: LongHun.Description })
export class LongHunEffect extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  isTriggerable(
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent>,
    stage?: AllStage,
  ) {
    return stage === DamageEffectStage.OnDamageConfirmed || stage === RecoverEffectStage.BeforeRecoverEffect;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();
    return true;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const event = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (event.fromId !== owner.Id || event.cardIds === undefined) {
        return false;
      }
      const card = Sanguosha.getCardById<VirtualCard>(event.cardIds[0]);
      return card.isVirtualCard() && card.GeneratedBySkill === LongHun.Name && card.ActualCardIds.length === 2;
    } else {
      const event = content as ServerEventFinder<GameEventIdentifiers.RecoverEvent>;
      if (event.recoverBy !== owner.Id || event.cardIds === undefined) {
        return false;
      }
      const card = Sanguosha.getCardById<VirtualCard>(event.cardIds[0]);
      return card.isVirtualCard() && card.GeneratedBySkill === LongHun.Name && card.ActualCardIds.length === 2;
    }
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const identifier = EventPacker.getIdentifier(triggeredOnEvent!);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const event = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      event.damage++;
    } else {
      const event = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>;
      event.recoveredHp++;
    }

    return true;
  }
}
