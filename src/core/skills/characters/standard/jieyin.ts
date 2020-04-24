import { CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterGender } from 'core/characters/character';
import {
  CardLostReason,
  CardObtainedReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jieyin', description: 'jieyin_description' })
export class JieYin extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId, selectedCards: CardId[]): boolean {
    const targetPlayer = room.getPlayerById(target);
    if (targetPlayer.Gender !== CharacterGender.Male) {
      return false;
    }

    if (selectedCards.length === 0) {
      return false;
    }

    const card = Sanguosha.getCardById(selectedCards[0]);
    const fromArea = room.getPlayerById(owner).cardFrom(card.Id);
    if (card.is(CardType.Equip) && fromArea === PlayerCardsArea.EquipArea) {
      const sameTypeEquip =
        targetPlayer
          .getCardIds(PlayerCardsArea.EquipArea)
          .find((equip) => Sanguosha.getCardById<EquipCard>(equip).isSameType(card)) !== undefined;

      if (sameTypeEquip) {
        return false;
      }
    }

    return true;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const fromArea = room.getPlayerById(owner).cardFrom(cardId);
    return fromArea !== undefined && [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].includes(fromArea);
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, cardIds, fromId } = skillUseEvent;

    const card = Sanguosha.getCardById(cardIds![0]);
    const to = room.getPlayerById(toIds![0]);
    const from = room.getPlayerById(fromId);
    if (
      card.is(CardType.Equip) &&
      to.getCardIds(PlayerCardsArea.EquipArea).find((equip) => Sanguosha.getCardById(equip).isSameType(card)) ===
        undefined
    ) {
      const fromArea = from.cardFrom(card.Id);

      let moveCard = true;
      if (fromArea === PlayerCardsArea.HandArea) {
        const askForChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          toId: fromId,
          options: ['jieyin:drop', 'jieyin:move'],
          conversation: 'please choose',
        };

        room.notify(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoose),
          fromId,
        );
        const response = await room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          fromId,
        );
        if (response.selectedOption !== 'jieyin:move') {
          moveCard = false;
        }
      }

      if (moveCard) {
        await room.moveCards(
          cardIds!,
          fromId,
          to.Id,
          CardLostReason.ActiveMove,
          fromArea,
          PlayerCardsArea.EquipArea,
          CardObtainedReason.PassiveObtained,
          fromId,
          this.Name,
        );
      } else {
        await room.dropCards(CardLostReason.ActiveDrop, cardIds!, fromId, fromId, this.Name);
      }
    } else {
      await room.dropCards(CardLostReason.ActiveDrop, cardIds!, fromId, fromId, this.Name);
    }

    const weaker = from.Hp > to.Hp ? to : to.Hp > from.Hp ? from : undefined;
    if (weaker !== undefined) {
      await room.recover({
        recoveredHp: 1,
        toId: weaker.Id,
      });
      const stronger = from === weaker ? to : from;
      await room.drawCards(1, stronger.Id, 'top', undefined, this.Name);
    }

    return true;
  }
}
