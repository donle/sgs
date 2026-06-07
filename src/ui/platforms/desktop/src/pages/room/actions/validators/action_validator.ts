import { CardType } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { ActiveSkill, ResponsiveSkill, TriggerSkill } from 'core/skills/skill';
import { RoomStore } from 'pages/room/room.store';
import { SelectionState } from '../selectors/selection_state';

export interface ValidationContext {
  player: Player;
  store: RoomStore;
}

/**
 * Determine whether the "confirm" button should be enabled.
 * Extracted from BaseAction.enableToCallAction (~50 lines).
 */
export const canConfirmAction = (state: SelectionState, ctx: ValidationContext): boolean => {
  if (state.selectedCardToPlay !== undefined) {
    return canConfirmWithCard(state, ctx);
  } else if (state.selectedSkillToPlay !== undefined) {
    return canConfirmWithSkill(state, ctx);
  }

  return false;
};

function canConfirmWithCard(state: SelectionState, ctx: ValidationContext): boolean {
  const card = Sanguosha.getCardById(state.selectedCardToPlay!);
  if (card.is(CardType.Equip)) {
    return true;
  }

  const skill = card.Skill;
  if (skill instanceof ActiveSkill || skill instanceof TriggerSkill) {
    const canUse = skill.numberOfCards().length === 0 || skill.numberOfCards().includes(state.selectedCards.length);

    return (
      canUse &&
      skill.cardFilter(
        ctx.store.room,
        ctx.player,
        state.selectedCards,
        state.selectedTargets,
        state.selectedCardToPlay,
      ) &&
      skill.targetFilter(
        ctx.store.room,
        ctx.player,
        state.selectedTargets,
        state.selectedCards,
        state.selectedCardToPlay,
      )
    );
  } else if (skill instanceof ResponsiveSkill) {
    return true;
  }

  return false;
}

function canConfirmWithSkill(state: SelectionState, ctx: ValidationContext): boolean {
  const skill = state.selectedSkillToPlay!;

  if (skill instanceof ActiveSkill || skill instanceof TriggerSkill) {
    const canUse = skill.numberOfCards().length === 0 || skill.numberOfCards().includes(state.selectedCards.length);
    return (
      canUse &&
      skill.cardFilter(
        ctx.store.room,
        ctx.player,
        state.selectedCards,
        state.selectedTargets,
        state.selectedCardToPlay,
      ) &&
      skill.targetFilter(
        ctx.store.room,
        ctx.player,
        state.selectedTargets,
        state.selectedCards,
        state.selectedCardToPlay,
      )
    );
  } else if (skill instanceof ResponsiveSkill) {
    return true;
  }

  return false;
}
