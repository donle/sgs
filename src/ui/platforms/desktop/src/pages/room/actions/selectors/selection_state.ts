import { CardId } from 'core/cards/libs/card_props';
import { PlayerId } from 'core/player/player_props';
import { Skill } from 'core/skills/skill';

export interface SelectionState {
  selectedCards: CardId[];
  selectedCardToPlay?: CardId;
  selectedSkillToPlay?: Skill;
  selectedTargets: PlayerId[];
  equipSkillCardId?: CardId;
  pendingCards: CardId[];
}

export const createEmptySelectionState = (): SelectionState => ({
  selectedCards: [],
  selectedCardToPlay: undefined,
  selectedSkillToPlay: undefined,
  selectedTargets: [],
  equipSkillCardId: undefined,
  pendingCards: [],
});

export const selectionStateGuard = (
  cardId: CardId,
  state: SelectionState,
): 'already-selected-card-to-play' | 'already-equip-skill' | 'already-pending' | 'already-selected' | 'ok' => {
  if (cardId === state.selectedCardToPlay) {
    return 'already-selected-card-to-play';
  }
  if (cardId === state.equipSkillCardId) {
    return 'already-equip-skill';
  }
  if (state.pendingCards.includes(cardId)) {
    return 'already-pending';
  }
  if (state.selectedCards.includes(cardId)) {
    return 'already-selected';
  }
  return 'ok';
};
