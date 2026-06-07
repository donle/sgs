/**
 * Tests for target_selector.ts — pure target filtering functions.
 */

// Mock core modules BEFORE any imports — put class definitions in the factory
jest.mock('core/game/engine', () => ({
  Sanguosha: {
    getCardById: jest.fn(),
    getCardByName: jest.fn(),
  },
}));

jest.mock('core/skills/skill', () => {
  // Classes defined inside the factory to avoid hoist issue
  class Skill {}
  class ActiveSkill extends Skill {}
  class TriggerSkill extends Skill {}
  class ViewAsSkill extends Skill {}
  class GlobalFilterSkill extends Skill {}
  return {
    Skill,
    ActiveSkill,
    TriggerSkill,
    ViewAsSkill,
    GlobalFilterSkill,
    FilterSkill: Skill,
    ResponsiveSkill: Skill,
  };
});

import { CardId } from 'core/cards/libs/card_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { RoomStore } from 'pages/room/room.store';
import { SelectionState } from '../selectors/selection_state';
import { isPlayerEnabled, findSingleTarget, TargetFilterContext } from '../selectors/target_selector';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { ActiveSkill } = require('core/skills/skill');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const mockGetCardById = require('core/game/engine').Sanguosha.getCardById as jest.Mock;

const createActiveSkill = (overrides: any = {}) => {
  const skill = Object.create(ActiveSkill.prototype);
  skill.isAvailableTarget = jest.fn().mockReturnValue(true);
  skill.targetFilter = jest.fn().mockReturnValue(true);
  skill.numberOfCards = jest.fn().mockReturnValue([0]);
  Object.assign(skill, overrides);
  return skill;
};

const makeMockPlayer = (id: string, overrides: Partial<Player> = {}): Player =>
  ({
    Id: id as PlayerId,
    Dead: false,
    canUseCard: jest.fn().mockReturnValue(true),
    canUseCardTo: jest.fn().mockReturnValue(true),
    getSkills: jest.fn().mockReturnValue([]),
    ...overrides,
  } as unknown as Player);

const makeMockRoom = (overrides: any = {}) => ({
  isPlaying: jest.fn().mockReturnValue(true),
  isGameOver: jest.fn().mockReturnValue(false),
  AlivePlayers: [],
  getAlivePlayersFrom: jest.fn().mockReturnValue([]),
  isAvailableTarget: jest.fn().mockReturnValue(true),
  ...overrides,
});

const makeMockStore = (roomOverrides: any = {}): RoomStore =>
  ({ room: makeMockRoom(roomOverrides) } as unknown as RoomStore);

const makeTargetContext = (overrides: Partial<TargetFilterContext> = {}): TargetFilterContext => ({
  store: makeMockStore(),
  player: makeMockPlayer('self'),
  playerId: 'self' as PlayerId,
  scopedTargets: undefined,
  ...overrides,
});

const makeEmptyState = (): SelectionState => ({
  selectedCards: [],
  selectedCardToPlay: undefined,
  selectedSkillToPlay: undefined,
  selectedTargets: [],
  equipSkillCardId: undefined,
  pendingCards: [],
});

describe('isPlayerEnabled', () => {
  beforeEach(() => {
    mockGetCardById.mockReset();
    mockGetCardById.mockReturnValue({
      Skill: createActiveSkill(),
      is: jest.fn().mockReturnValue(false),
    });
  });

  it('returns false when player is dead', () => {
    const target = makeMockPlayer('dead-guy', { Dead: true });
    expect(isPlayerEnabled(target, makeTargetContext(), makeEmptyState())).toBe(false);
  });

  it('returns false when game is over', () => {
    const target = makeMockPlayer('someone');
    const ctx = makeTargetContext({
      store: makeMockStore({ isGameOver: jest.fn().mockReturnValue(true) }),
    });
    expect(isPlayerEnabled(target, ctx, makeEmptyState())).toBe(false);
  });

  it('returns true for an already-selected target', () => {
    const target = makeMockPlayer('selected-guy');
    const state: SelectionState = {
      ...makeEmptyState(),
      selectedTargets: ['selected-guy' as PlayerId],
    };
    expect(isPlayerEnabled(target, makeTargetContext(), state)).toBe(true);
  });

  it('returns false when target is outside scopedTargets', () => {
    const target = makeMockPlayer('outside');
    const ctx = makeTargetContext({
      scopedTargets: ['inside-1' as PlayerId, 'inside-2' as PlayerId],
    });
    expect(isPlayerEnabled(target, ctx, makeEmptyState())).toBe(false);
  });

  it('returns true for a player within scopedTargets when skill allows', () => {
    const target = makeMockPlayer('inside-1');
    const ctx = makeTargetContext({
      scopedTargets: ['inside-1' as PlayerId, 'inside-2' as PlayerId],
    });
    const state: SelectionState = {
      ...makeEmptyState(),
      selectedCardToPlay: 100 as CardId,
    };
    expect(isPlayerEnabled(target, ctx, state)).toBe(true);
  });

  it('returns false when no card or skill is selected', () => {
    const target = makeMockPlayer('someone');
    expect(isPlayerEnabled(target, makeTargetContext(), makeEmptyState())).toBe(false);
  });
});

describe('findSingleTarget', () => {
  beforeEach(() => {
    mockGetCardById.mockReset();
    mockGetCardById.mockReturnValue({
      Skill: createActiveSkill(),
      is: jest.fn().mockReturnValue(false),
    });
  });

  it('returns the single valid target id', () => {
    const ctx = makeTargetContext({
      store: makeMockStore({
        getAlivePlayersFrom: jest
          .fn()
          .mockReturnValue([makeMockPlayer('only-target'), makeMockPlayer('dead-guy', { Dead: true })]),
      }),
    });
    const state: SelectionState = {
      ...makeEmptyState(),
      selectedCardToPlay: 100 as CardId,
    };
    expect(findSingleTarget(ctx, state)).toBe('only-target' as PlayerId);
  });

  it('returns undefined when there are 0 valid targets', () => {
    const ctx = makeTargetContext({
      store: makeMockStore({
        getAlivePlayersFrom: jest.fn().mockReturnValue([makeMockPlayer('dead-guy', { Dead: true })]),
      }),
    });
    expect(findSingleTarget(ctx, makeEmptyState())).toBeUndefined();
  });

  it('returns undefined when there are 2+ valid targets', () => {
    const ctx = makeTargetContext({
      store: makeMockStore({
        getAlivePlayersFrom: jest.fn().mockReturnValue([makeMockPlayer('target-1'), makeMockPlayer('target-2')]),
      }),
    });
    expect(findSingleTarget(ctx, makeEmptyState())).toBeUndefined();
  });
});
