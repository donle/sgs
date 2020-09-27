import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'junxing', description: 'junxing_description' })
export class JunXing extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length > 0;
  }

  public isAvailableCard() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds, toIds } = skillEffectEvent;
    const toId = toIds![0];

    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);

    const allTypes = [CardType.Basic, CardType.Trick, CardType.Equip];
    const junxingTypes: CardType[] = cardIds!.reduce<CardType[]>((types, card) => {
      const type = Sanguosha.getCardById(card).BaseType;
      if (!types.includes(type)) {
        types.push(type);
      }
      return types;
    }, []);

    const handCards = room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea);
    if (junxingTypes.length >= 3 || handCards.length <= 0) {
      await room.turnOver(toId);
      await room.drawCards(cardIds!.length, toId, undefined, fromId, this.Name);
    } else {
      const availableTypes = allTypes.filter(type => !junxingTypes.includes(type));
      if (availableTypes.length <= 0) {
        return false;
      }

      const askForDiscard: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
        toId,
        amount: 1,
        cardMatcher: new CardMatcher({ type: availableTypes }).toSocketPassenger(),
        customCardFields: {
          [PlayerCardsArea.HandArea]: handCards,
        },
      };

      room.notify(GameEventIdentifiers.AskForChoosingCardEvent, askForDiscard, toId);

      const { selectedCards } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardEvent,
        toId,
      );
      if (selectedCards !== undefined) {
        await room.dropCards(CardMoveReason.SelfDrop, selectedCards, toId, toId, this.Name);
      } else {
        await room.turnOver(toId);
        await room.drawCards(cardIds!.length, toId, undefined, fromId, this.Name);
      }
    }

    return true;
  }
}
