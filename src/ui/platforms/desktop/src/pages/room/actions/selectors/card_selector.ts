import { Card, CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { ActiveSkill, ResponsiveSkill, ViewAsSkill } from 'core/skills/skill';
import { RoomStore } from 'pages/room/room.store';
import { SelectionState } from './selection_state';

export interface CardFilterContext {
  store: RoomStore;
  player: Player;
  state: SelectionState;
}

/**
 * Check if a card belongs to a particular game area (e.g. 木牛流马)
 */
export const isCardInParticularArea = (card: Card, store: RoomStore, player: Player): boolean =>
  store.room.GameParticularAreas.find(cardName =>
    player.getCardIds(PlayerCardsArea.OutsideArea, cardName).includes(card.Id),
  ) !== undefined;

/**
 * Check if a card from outside area should be shown/displayed
 */
export const isOutsideCardVisible = (card: Card, ctx: CardFilterContext): boolean => {
  if (isCardInParticularArea(card, ctx.store, ctx.player)) {
    return true;
  }

  if (ctx.state.selectedSkillToPlay) {
    const skill = ctx.state.selectedSkillToPlay;
    if (skill instanceof ActiveSkill) {
      return skill.availableCardAreas().includes(PlayerCardsArea.OutsideArea);
    }
  }
  return false;
};

/**
 * Main card enabled check — determines if a card is clickable in the current selection context.
 * Extracted from BaseAction.isCardEnabled (~200 lines).
 */
export const isCardEnabled = (
  card: Card,
  fromArea: PlayerCardsArea,
  ctx: CardFilterContext,
  ignoreCanUseCondition: boolean = false,
): boolean => {
  const { store, player, state } = ctx;

  if (!store.room.isPlaying() || store.room.isGameOver()) {
    return false;
  }

  // Already-selected cards are always clickable (toggle off)
  if (
    card.Id === state.selectedCardToPlay ||
    card.Id === state.equipSkillCardId ||
    state.pendingCards.includes(card.Id) ||
    state.selectedCards.includes(card.Id)
  ) {
    return true;
  }

  // When a skill is active, delegate to the skill's card filtering
  if (state.selectedSkillToPlay) {
    return isCardEnabledWithSkill(card, fromArea, ctx);
  }

  // No skill active — check based on card type and area
  return isCardEnabledBare(card, fromArea, ctx, ignoreCanUseCondition);
};

function isCardEnabledWithSkill(card: Card, fromArea: PlayerCardsArea, ctx: CardFilterContext): boolean {
  const { store, player, state } = ctx;
  const skill = state.selectedSkillToPlay!;

  if (skill instanceof ActiveSkill) {
    return isCardEnabledWithActiveSkill(card, fromArea, ctx, skill);
  } else if (skill instanceof ViewAsSkill) {
    return (
      skill.isAvailableCard(store.room, player, card.Id, state.pendingCards, state.equipSkillCardId) &&
      skill.availableCardAreas().includes(fromArea) &&
      (!skill.cardFilter(store.room, player, state.pendingCards, state.selectedTargets, state.selectedCardToPlay) ||
        skill.cardFilter(
          store.room,
          player,
          [...state.pendingCards, card.Id],
          state.selectedTargets,
          state.selectedCardToPlay,
        ))
    );
  } else if (skill instanceof ResponsiveSkill) {
    return state.selectedCardToPlay === undefined;
  }

  return false;
}

function isCardEnabledWithActiveSkill(
  card: Card,
  fromArea: PlayerCardsArea,
  ctx: CardFilterContext,
  skill: ActiveSkill,
): boolean {
  const { store, player, state } = ctx;

  const selectedCardsRange = skill.numberOfCards();
  const usableCardNumbers = selectedCardsRange.findIndex(cardNumbers => cardNumbers === state.selectedCards.length);

  // If the current selected count is valid but not the last option, allow more
  if (usableCardNumbers >= 0 && usableCardNumbers !== selectedCardsRange.length - 1) {
    return true;
  }

  return (
    skill.isAvailableCard(
      player.Id,
      store.room,
      card.Id,
      state.selectedCards,
      state.selectedTargets,
      state.equipSkillCardId,
    ) &&
    skill.availableCardAreas().includes(fromArea) &&
    (!skill.cardFilter(store.room, player, state.selectedCards, state.selectedTargets, state.selectedCardToPlay) ||
      skill.cardFilter(
        store.room,
        player,
        [...state.selectedCards, card.Id],
        state.selectedTargets,
        state.selectedCardToPlay,
      ))
  );
}

function isCardEnabledBare(
  card: Card,
  fromArea: PlayerCardsArea,
  ctx: CardFilterContext,
  ignoreCanUseCondition: boolean,
): boolean {
  const { store, player, state } = ctx;

  const canUseOnPlayers =
    store.room.AlivePlayers.find(target => player.canUseCardTo(store.room, card.Id, target.Id)) !== undefined;

  if (state.selectedCardToPlay === undefined) {
    return isCardEnabledBareNoPrimaryCard(card, fromArea, ctx, ignoreCanUseCondition, canUseOnPlayers);
  }

  // A primary card (selectedCardToPlay) is already selected — this is an additional card
  const playingCard = Sanguosha.getCardById(state.selectedCardToPlay);
  if (playingCard.is(CardType.Equip)) {
    return false;
  }

  const skill = playingCard.Skill;
  if (skill instanceof ActiveSkill) {
    return isAdditionalCardForActiveSkill(card, fromArea, ctx, skill);
  } else if (skill instanceof ViewAsSkill) {
    return isAdditionalCardForViewAsSkill(card, fromArea, ctx, skill);
  }

  return false;
}

function isCardEnabledBareNoPrimaryCard(
  card: Card,
  fromArea: PlayerCardsArea,
  ctx: CardFilterContext,
  ignoreCanUseCondition: boolean,
  canUseOnPlayers: boolean,
): boolean {
  const { store, player, state } = ctx;

  if (fromArea === PlayerCardsArea.HandArea) {
    return isHandCardEnabled(card, ctx, ignoreCanUseCondition, canUseOnPlayers);
  } else if (fromArea === PlayerCardsArea.EquipArea) {
    return isEquipCardEnabled(card, ctx);
  } else if (fromArea === PlayerCardsArea.OutsideArea) {
    return isOutsideCardEnabled(card, ctx, ignoreCanUseCondition, canUseOnPlayers);
  }

  return false;
}

function isHandCardEnabled(
  card: Card,
  ctx: CardFilterContext,
  ignoreCanUseCondition: boolean,
  canUseOnPlayers: boolean,
): boolean {
  const { store, player } = ctx;

  if (card.is(CardType.Equip)) {
    return player.canUseCardTo(store.room, card.Id, player.Id);
  }

  if (
    card.Skill instanceof ResponsiveSkill ||
    (!ignoreCanUseCondition && !player.canUseCard(store.room, card.Id) && !canUseOnPlayers)
  ) {
    return false;
  }

  if (ignoreCanUseCondition) {
    return true;
  }

  if (card.Skill instanceof ViewAsSkill) {
    return (
      player.canUseCard(
        store.room,
        new CardMatcher({ name: card.Skill.canViewAs(store.room, player, ctx.state.pendingCards) }),
      ) && card.Skill.canUse(store.room, player)
    );
  } else if (card.Skill instanceof ActiveSkill) {
    let canSelfUse = true;
    if (card.Skill.isSelfTargetSkill()) {
      canSelfUse = player.canUseCardTo(store.room, card.Id, player.Id);
    }
    return canSelfUse && player.canUseCard(store.room, card.Id);
  }

  return false;
}

function isEquipCardEnabled(card: Card, ctx: CardFilterContext): boolean {
  const { store, player, state } = ctx;

  if (store.room.GameParticularAreas.includes(card.Skill.Name)) {
    const hasParticularOutsideCards =
      store.room.GameParticularAreas.find(
        cardName =>
          state.selectedCards.find(cardId =>
            player.getCardIds(PlayerCardsArea.OutsideArea, cardName).includes(cardId),
          ) !== undefined,
      ) !== undefined;
    if (hasParticularOutsideCards) {
      return false;
    }
  }

  if (card.Skill instanceof ViewAsSkill) {
    return (
      player.canUseCard(
        store.room,
        new CardMatcher({ name: card.Skill.canViewAs(store.room, player, state.pendingCards) }),
      ) && card.Skill.canUse(store.room, player)
    );
  } else if (card.Skill instanceof ActiveSkill) {
    let canSelfUse = true;
    if (card.Skill.isSelfTargetSkill()) {
      canSelfUse = player.canUseCardTo(store.room, card.Id, player.Id);
    }
    return canSelfUse && card.Skill.canUse(store.room, player, card.Id);
  }

  return false;
}

function isOutsideCardEnabled(
  card: Card,
  ctx: CardFilterContext,
  ignoreCanUseCondition: boolean,
  canUseOnPlayers: boolean,
): boolean {
  const { store, player } = ctx;

  if (!isCardInParticularArea(card, store, player)) {
    return false;
  }

  const hasParticularOutsideCards = ctx.state.selectedCards.find(cardId =>
    store.room.GameParticularAreas.includes(Sanguosha.getCardById(cardId).Name),
  );
  if (hasParticularOutsideCards) {
    return false;
  }

  if (
    card.Skill instanceof ResponsiveSkill ||
    (!ignoreCanUseCondition && !player.canUseCard(store.room, card.Id) && !canUseOnPlayers)
  ) {
    return false;
  }

  return true;
}

function isAdditionalCardForActiveSkill(
  card: Card,
  fromArea: PlayerCardsArea,
  ctx: CardFilterContext,
  skill: ActiveSkill,
): boolean {
  const { store, player, state } = ctx;

  const selectedCardsRange = skill.numberOfCards();
  const usableCardNumbers = selectedCardsRange.findIndex(cardNumbers => cardNumbers === state.selectedCards.length);

  if (usableCardNumbers >= 0 && usableCardNumbers !== selectedCardsRange.length - 1) {
    return true;
  }

  return (
    skill.isAvailableCard(player.Id, store.room, card.Id, state.selectedCards, state.selectedTargets, card.Id) &&
    skill.availableCardAreas().includes(fromArea) &&
    (!skill.cardFilter(
      store.room,
      state.selectedCardToPlay !== undefined ? ctx.player : player,
      state.selectedCards,
      state.selectedTargets,
      state.selectedCardToPlay,
    ) ||
      skill.cardFilter(
        store.room,
        state.selectedCardToPlay !== undefined ? ctx.player : player,
        [...state.selectedCards, card.Id],
        state.selectedTargets,
        state.selectedCardToPlay,
      ))
  );
}

function isAdditionalCardForViewAsSkill(
  card: Card,
  fromArea: PlayerCardsArea,
  ctx: CardFilterContext,
  skill: ViewAsSkill,
): boolean {
  const { store, player, state } = ctx;

  return (
    skill.isAvailableCard(store.room, player, card.Id, state.pendingCards, state.equipSkillCardId) &&
    skill.availableCardAreas().includes(fromArea) &&
    (!skill.cardFilter(store.room, player, state.pendingCards, state.selectedTargets, state.selectedCardToPlay) ||
      skill.cardFilter(
        store.room,
        player,
        [...state.pendingCards, card.Id],
        state.selectedTargets,
        state.selectedCardToPlay,
      ))
  );
}
