/**
 * Tests for action_validator.ts — canConfirmAction pure function.
 */

jest.mock('core/game/engine', () => ({
  Sanguosha: {
    getCardById: jest.fn(),
    getCardByName: jest.fn(),
  },
}));

jest.mock('core/skills/skill', () => {
  class Skill {}
  class ActiveSkill extends Skill {}
  class TriggerSkill extends Skill {}
  class ResponsiveSkill extends Skill {}
  return {
    Skill,
    ActiveSkill,
    TriggerSkill,
    ResponsiveSkill,
    ViewAsSkill: Skill,
    GlobalFilterSkill: Skill,
    FilterSkill: Skill,
  };
});

import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { SelectionState } from '../selectors/selection_state';
import { canConfirmAction, ValidationContext } from '../validators/action_validator';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { ActiveSkill, TriggerSkill, ResponsiveSkill } = require('core/skills/skill');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const mockGetCardById = require('core/game/engine').Sanguosha.getCardById as jest.Mock;

const createActiveSkill = (overrides: any = {}) => {
  const skill = Object.create(ActiveSkill.prototype);
  skill.numberOfCards = jest.fn().mockReturnValue([0]);
  skill.cardFilter = jest.fn().mockReturnValue(true);
  skill.targetFilter = jest.fn().mockReturnValue(true);
  Object.assign(skill, overrides);
  return skill;
};

const createTriggerSkill = (overrides: any = {}) => {
  const skill = Object.create(TriggerSkill.prototype);
  skill.numberOfCards = jest.fn().mockReturnValue([0]);
  skill.cardFilter = jest.fn().mockReturnValue(true);
  skill.targetFilter = jest.fn().mockReturnValue(true);
  Object.assign(skill, overrides);
  return skill;
};

const makeValidationContext = (overrides: Partial<ValidationContext> = {}): ValidationContext => ({
  player: { Id: 'player-1' as PlayerId } as unknown as Player,
  store: { room: { isPlaying: jest.fn().mockReturnValue(true), isGameOver: jest.fn().mockReturnValue(false) } },
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

describe('canConfirmAction', () => {
  beforeEach(() => {
    mockGetCardById.mockReset();
  });

  it('returns false when nothing is selected', () => {
    expect(canConfirmAction(makeEmptyState(), makeValidationContext())).toBe(false);
  });

  describe('with selectedCardToPlay', () => {
    it('returns true for equipment cards', () => {
      mockGetCardById.mockReturnValue({
        is: (type: CardType) => type === CardType.Equip,
        Skill: undefined,
      });
      const state: SelectionState = { ...makeEmptyState(), selectedCardToPlay: 100 as CardId };
      expect(canConfirmAction(state, makeValidationContext())).toBe(true);
    });

    it('returns true when ActiveSkill cardFilter and targetFilter pass', () => {
      mockGetCardById.mockReturnValue({
        is: (type: CardType) => type === CardType.Normal,
        Skill: createActiveSkill(),
      });
      const state: SelectionState = { ...makeEmptyState(), selectedCardToPlay: 100 as CardId };
      expect(canConfirmAction(state, makeValidationContext())).toBe(true);
    });

    it('returns false when ActiveSkill cardFilter fails', () => {
      mockGetCardById.mockReturnValue({
        is: (type: CardType) => type === CardType.Normal,
        Skill: createActiveSkill({ cardFilter: jest.fn().mockReturnValue(false) }),
      });
      const state: SelectionState = { ...makeEmptyState(), selectedCardToPlay: 100 as CardId };
      expect(canConfirmAction(state, makeValidationContext())).toBe(false);
    });

    it('returns true for ResponsiveSkill cards', () => {
      const respSkill = Object.create(ResponsiveSkill.prototype);
      mockGetCardById.mockReturnValue({
        is: (type: CardType) => type === CardType.Normal,
        Skill: respSkill,
      });
      const state: SelectionState = { ...makeEmptyState(), selectedCardToPlay: 100 as CardId };
      expect(canConfirmAction(state, makeValidationContext())).toBe(true);
    });

    it('validates numberOfCards when a range is specified', () => {
      mockGetCardById.mockReturnValue({
        is: (type: CardType) => type === CardType.Normal,
        Skill: createActiveSkill({ numberOfCards: jest.fn().mockReturnValue([1, 2]) }),
      });
      const state: SelectionState = {
        ...makeEmptyState(),
        selectedCardToPlay: 100 as CardId,
        selectedCards: [1 as CardId],
      };
      expect(canConfirmAction(state, makeValidationContext())).toBe(true);
    });

    it('fails numberOfCards when outside range', () => {
      mockGetCardById.mockReturnValue({
        is: (type: CardType) => type === CardType.Normal,
        Skill: createActiveSkill({ numberOfCards: jest.fn().mockReturnValue([2, 3]) }),
      });
      const state: SelectionState = {
        ...makeEmptyState(),
        selectedCardToPlay: 100 as CardId,
        selectedCards: [],
      };
      expect(canConfirmAction(state, makeValidationContext())).toBe(false);
    });
  });

  describe('with selectedSkillToPlay', () => {
    it('returns true when ActiveSkill passes filters', () => {
      const state: SelectionState = {
        ...makeEmptyState(),
        selectedSkillToPlay: createActiveSkill(),
      };
      expect(canConfirmAction(state, makeValidationContext())).toBe(true);
    });

    it('returns false when TriggerSkill targetFilter fails', () => {
      const state: SelectionState = {
        ...makeEmptyState(),
        selectedSkillToPlay: createTriggerSkill({ targetFilter: jest.fn().mockReturnValue(false) }),
      };
      expect(canConfirmAction(state, makeValidationContext())).toBe(false);
    });

    it('returns true for ResponsiveSkill', () => {
      const state: SelectionState = {
        ...makeEmptyState(),
        selectedSkillToPlay: Object.create(ResponsiveSkill.prototype),
      };
      expect(canConfirmAction(state, makeValidationContext())).toBe(true);
    });

    it('returns false for unknown skill types', () => {
      const state: SelectionState = {
        ...makeEmptyState(),
        selectedSkillToPlay: {} as any,
      };
      expect(canConfirmAction(state, makeValidationContext())).toBe(false);
    });
  });
});
