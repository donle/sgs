import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import type { Card } from 'core/cards/card';
import type { CardId } from 'core/cards/libs/card_props';
import { CardSuit } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import type { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import type { PlayerId } from 'core/player/player_props';
import type { Room } from 'core/room/room';
import type { FireAttackSkill } from 'core/skills';

export class FireAttackSkillTrigger extends ActiveSkillTriggerClass<FireAttackSkill> {
  protected filterTargets(room: Room, ai: Player, skill: FireAttackSkill, card: CardId, enemies: Player[]) {
    const pickedEnemies: PlayerId[] = [];
    const restEnemies: Player[] = enemies.filter(e => {
      const shield = e.getShield();
      if (shield && shield.Name === 'tengjia') {
        if (skill.targetFilter(room, ai, [...pickedEnemies, e.Id], [], card)) {
          pickedEnemies.push(e.Id);
          return false;
        }
      }

      return true;
    });

    for (const e of restEnemies) {
      if (skill.targetFilter(room, ai, [...pickedEnemies, e.Id], [], card)) {
        pickedEnemies.push(e.Id);
      }
    }

    return pickedEnemies;
  }

  skillTrigger = (
    room: Room,
    ai: Player,
    skill: FireAttackSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const otherHandCards = ai.getCardIds(PlayerCardsArea.HandArea).filter(card => card !== skillInCard);
    const suits: CardSuit[] = [];
    for (const card of otherHandCards) {
      if (!suits.includes(Sanguosha.getCardById(card).Suit)) {
        suits.push(Sanguosha.getCardById(card).Suit);
      }
      if (suits.length >= 4) {
        break;
      }
    }

    if (suits.length < 3) {
      return;
    }

    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(e =>
      skill.isAvailableTarget(ai.Id, room, e.Id, [], [], skillInCard!),
    );
    if (enemies.length <= 0) {
      return;
    }

    const enemy = enemies.find(e => {
      const shield = e.getShield();
      return shield && shield.Name === 'tengjia';
    });

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
      toIds: enemy ? [enemy.Id] : [enemies[0].Id],
    };
  };

  onAskForCardDisplayEvent = (
    content: ServerEventFinder<GameEventIdentifiers.AskForCardDisplayEvent>,
    room: Room,
  ): ClientEventFinder<GameEventIdentifiers.AskForCardDisplayEvent> | undefined => {
    const ai = room.getPlayerById(content.toId);

    const handCards = ai.getCardIds(PlayerCardsArea.HandArea).map(cardId => Sanguosha.getCardById(cardId));
    let heartCard: Card | undefined;
    let spadeCard: Card | undefined;
    let clubCard: Card | undefined;
    let diamondCard: Card | undefined;
    for (const card of handCards) {
      if (card.Suit === CardSuit.Heart) {
        heartCard = card;
      } else if (card.Suit === CardSuit.Spade) {
        spadeCard = card;
      } else if (card.Suit === CardSuit.Club) {
        clubCard = card;
      } else if (card.Suit === CardSuit.Diamond) {
        diamondCard = card;
      }
    }

    const displayCard = heartCard || spadeCard || clubCard || diamondCard;
    if (!displayCard) {
      return;
    }

    return {
      fromId: ai.Id,
      selectedCards: [displayCard.Id],
    };
  };
}
