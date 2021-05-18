import { Room } from 'core/room/room';
import { PlayerId, PlayerCardsArea } from 'core/player/player_props';
import { Sanguosha } from 'core/game/engine';

import { CardType } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { getCardValueofCard } from './ai_standard';
// import { RealCardId, CardId, CardValue } from 'core/cards/libs/card_props';
import { ActiveSkill } from 'core/skills/skill';
import { EquipCard } from 'core/cards/equip_card';
import { CardValue, CardId } from 'core/cards/libs/card_props';

export function getCardValueofPlayer(room: Room, aiId: PlayerId, cardId: CardId): CardValue {
  let cardValue: CardValue = getCardValueofCard(cardId);
  const targetCard = Sanguosha.getCardById(cardId);
  if (targetCard.BaseType === CardType.Equip) {
    cardValue.priority =
      room.getPlayerById(aiId).getEquipment((targetCard as EquipCard).EquipType) === undefined
        ? cardValue.priority
        : Math.max(0, cardValue.priority - 60);
  }
  return cardValue;
}

export function aiUseCard(room: Room, aiId: PlayerId) {
  const handCards = room
    .getPlayerById(aiId)
    .getCardIds(PlayerCardsArea.HandArea)
    .sort((a, b) => getCardValueofPlayer(room, aiId, b).priority! - getCardValueofPlayer(room, aiId, a).priority!);

  if (handCards.length > 0) {
    // console.log('Ai handle hand cards');
    for (const cardId of handCards) {
      if (!room.getPlayerById(aiId).canUseCard(room, cardId)) {
        continue;
      }

      if (Sanguosha.getCardById(cardId).BaseType === CardType.Equip) {
        // todo: judge replace equipment
        // console.log('Ai get Equip Card');
        const equipCardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
          fromId: aiId,
          cardId,
        };
        return equipCardUseEvent;
      }

      // console.log(`Ai get Basic and Trick Card: ${Sanguosha.getCardById(cardId).GeneralName}`);
      const cardSkill = Sanguosha.getCardById(cardId).Skill;
      if (cardSkill instanceof ActiveSkill) {
        // console.log('Card is ActiveSkill Card');
        if (cardSkill.GeneralName === 'jiedaosharen') {
          // todo: handle jiedaosharen
          continue;
        }

        let targetNumber: number =
          cardSkill.numberOfTargets() instanceof Array ? cardSkill.numberOfTargets()[0] : cardSkill.numberOfTargets();
        // console.log(`Card target number is ${targetNumber}`);

        if (cardSkill.GeneralName === 'tiesuolianhuan') {
          console.log(`tiesuolianhuan target number is ${targetNumber}`);
          // todo: handle jiedaosharen
        }

        if (room.AlivePlayers.length <= targetNumber) {
          continue;
        }

        const targetPlayer =
          targetNumber === 0
            ? undefined
            : room.AlivePlayers.filter(player => player.Id !== aiId)
                .slice(0, targetNumber)
                .map(player => {
                  // console.log(`target has ${player.Id}`);
                  return player.Id;
                });

        // console.log(`Target Player is ${targetPlayer}`);

        const cardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
          fromId: aiId,
          cardId,
          toIds: targetPlayer,
        };

        return cardUseEvent;
      }
    }
  }

  return undefined;
}
