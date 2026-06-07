import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { ResponsiveSkill, ViewAsSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter } from 'pages/room/room.presenter';
import { RoomStore } from 'pages/room/room.store';
import { SelectionState } from './selection_state';

/**
 * Result of processing a ViewAsSkill selection.
 */
export type ViewAsResult =
  | { kind: 'created'; cardId: CardId }
  | { kind: 'dialog'; canViewAs: string[]; skill: ViewAsSkill }
  | { kind: 'cancelled' }
  | { kind: 'not-applicable' };

/**
 * Handle the duplicated ViewAsSkill dialog flow that was present in
 * both onClickCard and onClickSkill in the original BaseAction.
 *
 * When a ViewAsSkill has collected enough pending cards, this determines
 * what virtual card(s) it can produce:
 * - Single option → creates the virtual card immediately
 * - Multiple options → shows a CardCategoryDialog for the user to pick
 * - No options → cancels
 */
export const processViewAsSkill = (
  state: SelectionState,
  store: RoomStore,
  player: Player,
  matcher?: CardMatcher,
): ViewAsResult => {
  if (!state.selectedSkillToPlay || !(state.selectedSkillToPlay instanceof ViewAsSkill)) {
    return { kind: 'not-applicable' };
  }

  const skill = state.selectedSkillToPlay as ViewAsSkill;

  if (!skill.cardFilter(store.room, player, state.pendingCards, state.selectedTargets, state.selectedCardToPlay)) {
    return { kind: 'cancelled' };
  }

  const canViewAs = skill.canViewAs(store.room, player, state.pendingCards).filter(cardName => {
    if (!matcher) {
      return (
        !(Sanguosha.getCardByName(cardName).Skill instanceof ResponsiveSkill) &&
        player.canUseCard(store.room, VirtualCard.create({ cardName, bySkill: skill.Name }).Id)
      );
    } else {
      return matcher.match(new CardMatcher({ name: [cardName] }));
    }
  });

  if (canViewAs.length === 0) {
    return { kind: 'cancelled' };
  }

  if (canViewAs.length === 1) {
    const cardId = skill.viewAs(state.pendingCards, player, canViewAs[0]).Id;
    return { kind: 'created', cardId };
  }

  return { kind: 'dialog', canViewAs, skill };
};

/**
 * Show the card category dialog for ViewAsSkill with multiple options.
 * Calls presenter.createCardCategoryDialog and returns nothing synchronously
 * (dialog handles the callback).
 */
export const showViewAsDialog = (
  presenter: RoomPresenter,
  translator: ClientTranslationModule,
  skill: ViewAsSkill,
  canViewAs: string[],
  onSelect: (cardName: string) => void,
): void => {
  const onClickDemoCard = (selectedCardName: string) => {
    presenter.closeDialog();
    onSelect(selectedCardName);
  };

  presenter.createCardCategoryDialog({
    translator,
    cardNames: canViewAs,
    onClick: onClickDemoCard,
  });
};
