import { CardId } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { ActiveSkill, SkillFilterResponse } from 'core/skills/skill';

export class ZhiHeng extends ActiveSkill {
  isAvailable() {
    return this.triggeredTimes < 1;
  }

  onEffect(engine: Sanguosha, cardIds: CardId[]): void {
    engine.CurrentPlayer.dropCards(...cardIds);
  }

  onUseFilter(engine: Sanguosha, cardIds: CardId[]): SkillFilterResponse {
    return {
      availableCards: cardIds.filter(card =>
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].includes(
          engine.CurrentPlayer.cardFrom(card),
        ),
      ),
    };
  }

  isAutoActivate() {
    return false;
  }
}
