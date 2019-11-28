import { ServerCard } from 'core/cards/card.server';
import { PlayerCardsArea } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import { ActiveSkill, SkillFilterResponse } from 'core/skills/skill';

export class ZhiHeng extends ActiveSkill {
  isAvailable() {
    return true;
  }

  onEffect(currentPlayer: ServerPlayer, otherPlayers: ServerPlayer[], cards: ServerCard[]): void {
    currentPlayer.dropCards(...cards);
  }

  onUseFilter(currentPlayer: ServerPlayer, otherPlayers: ServerPlayer[], cards: ServerCard[]): SkillFilterResponse {
    return {
      availableCards: cards.filter(card =>
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].includes(
          currentPlayer.cardFrom(card.Id),
        ),
      ),
    };
  }

  isAutoActivate() {
    return false;
  }
}
