import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { ActiveSkill, GlobalFilterSkill, Skill, TriggerSkill } from 'core/skills/skill';
import { RoomStore } from 'pages/room/room.store';
import { SelectionState } from './selection_state';

export interface TargetFilterContext {
  store: RoomStore;
  player: Player;
  playerId: PlayerId;
  scopedTargets?: PlayerId[];
}

/**
 * Check whether a player is a valid target for the current action.
 * Extracted from BaseAction.isPlayerEnabled (~70 lines).
 */
export const isPlayerEnabled = (target: Player, ctx: TargetFilterContext, state: SelectionState): boolean => {
  const { store, player, playerId, scopedTargets } = ctx;

  // Fast-fail conditions
  if (
    (scopedTargets && !scopedTargets.includes(target.Id)) ||
    target.Dead ||
    !store.room.isPlaying() ||
    store.room.isGameOver()
  ) {
    return false;
  }

  // Already-selected targets are always valid (for toggling)
  if (state.selectedTargets.includes(target.Id)) {
    return true;
  }

  // Global filter check — affects card-to-target
  if (state.selectedCardToPlay !== undefined) {
    for (const skillOwner of store.room.getAlivePlayersFrom()) {
      for (const skill of skillOwner.getSkills<GlobalFilterSkill>('globalFilter')) {
        if (!skill.canUseCardTo(state.selectedCardToPlay, store.room, skillOwner, player, target)) {
          return false;
        }
      }
    }
  }

  const skill = resolveSkill(state);
  if (skill === undefined) {
    return false;
  }

  if (skill instanceof ActiveSkill || skill instanceof TriggerSkill) {
    return isTargetEnabledForSkill(target, ctx, state, skill);
  }

  return false;
};

function resolveSkill(state: SelectionState): Skill | undefined {
  if (state.selectedCardToPlay !== undefined) {
    return Sanguosha.getCardById(state.selectedCardToPlay).Skill;
  } else if (state.selectedSkillToPlay !== undefined) {
    return state.selectedSkillToPlay;
  }
  return undefined;
}

function isTargetEnabledForSkill(
  target: Player,
  ctx: TargetFilterContext,
  state: SelectionState,
  skill: ActiveSkill | TriggerSkill,
): boolean {
  const { store, player, playerId } = ctx;

  let isAvailableInRoom =
    state.selectedCardToPlay === undefined
      ? true
      : store.room.isAvailableTarget(state.selectedCardToPlay, playerId, target.Id);
  if (state.selectedCardToPlay !== undefined) {
    isAvailableInRoom = isAvailableInRoom && player.canUseCardTo(store.room, state.selectedCardToPlay, target.Id);
  }

  return (
    skill.isAvailableTarget(
      playerId,
      store.room,
      target.Id,
      state.selectedCards,
      state.selectedTargets,
      state.selectedCardToPlay,
    ) &&
    isAvailableInRoom &&
    (!skill.targetFilter(store.room, player, state.selectedTargets, state.selectedCards, state.selectedCardToPlay) ||
      skill.targetFilter(
        store.room,
        player,
        [...state.selectedTargets, target.Id],
        state.selectedCards,
        state.selectedCardToPlay,
      ))
  );
}

/**
 * Auto-select the single valid target if there's exactly one.
 * Returns the target id to select, or undefined if there are 0 or 2+.
 */
export const findSingleTarget = (ctx: TargetFilterContext, state: SelectionState): PlayerId | undefined => {
  const targets = ctx.store.room.getAlivePlayersFrom().filter(player => isPlayerEnabled(player, ctx, state));

  if (targets.length === 1) {
    return targets[0].Id;
  }
  return undefined;
};
