/**
 * Tests for card_selector.ts — pure card filtering functions.
 */

// Mocks MUST come before any imports that transitively load core/game/engine
jest.mock('core/game/engine', () => ({
  Sanguosha: {
    getCardById: jest.fn(),
    getCardByName: jest.fn(),
  },
}));
jest.mock('core/cards/card', () => {
  const actual = jest.requireActual('core/cards/card');
  return {
    ...actual,
    VirtualCard: {
      create: jest.fn(() => ({ Id: 'virtual-card', Name: 'slash' })),
      getActualCards: jest.fn((ids: any[]) => ids),
    },
  };
});

import { CardType } from 'core/cards/card';
import { CardSuit, CardId } from 'core/cards/libs/card_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { RoomStore } from 'pages/room/room.store';
import {
  isCardInParticularArea,
  isOutsideCardVisible,
  isCardEnabled,
  CardFilterContext,
} from '../selectors/card_selector';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const Sanguosha = require('core/game/engine').Sanguosha;
const mockGetCardById = Sanguosha.getCardById as jest.Mock;

// Re-create mock helpers that use actual module exports
const makeMockCard = (overrides: any = {}) =>
  ({
    Id: 1001 as CardId,
    Name: 'slash',
    is: (type: CardType) => type === CardType.Normal,
    Skill: undefined,
    Suit: CardSuit.Spade,
    CardNumber: 1,
    ...overrides,
  } as any);

const makeMockPlayer = (overrides: any = {}): Player =>
  ({
    Id: 'player-1' as PlayerId,
    Dead: false,
    canUseCard: jest.fn().mockReturnValue(true),
    canUseCardTo: jest.fn().mockReturnValue(true),
    getCardIds: jest.fn().mockReturnValue([]),
    getSkills: jest.fn().mockReturnValue([]),
    ...overrides,
  } as unknown as Player);

const makeMockRoom = (overrides: any = {}) => ({
  isPlaying: jest.fn().mockReturnValue(true),
  isGameOver: jest.fn().mockReturnValue(false),
  AlivePlayers: [],
  getAlivePlayersFrom: jest.fn().mockReturnValue([]),
  GameParticularAreas: [] as string[],
  isAvailableTarget: jest.fn().mockReturnValue(true),
  ...overrides,
});

const makeMockStore = (roomOverrides: any = {}): RoomStore =>
  ({
    room: makeMockRoom(roomOverrides),
  } as unknown as RoomStore);

const makeFilterContext = (overrides: Partial<CardFilterContext> = {}): CardFilterContext => ({
  store: makeMockStore(),
  player: makeMockPlayer(),
  state: {
    selectedCards: [],
    selectedCardToPlay: undefined,
    selectedSkillToPlay: undefined,
    selectedTargets: [],
    equipSkillCardId: undefined,
    pendingCards: [],
  },
  ...overrides,
});

describe('isCardInParticularArea', () => {
  it('returns false when card is not in a particular area', () => {
    const card = makeMockCard();
    const store = makeMockStore({ GameParticularAreas: ['some_area'] });
    const player = makeMockPlayer({
      getCardIds: jest.fn().mockReturnValue([]),
    });

    expect(isCardInParticularArea(card, store, player)).toBe(false);
  });

  it('returns true when card is in a particular area', () => {
    const card = makeMockCard({ Id: 42 as CardId });
    const store = makeMockStore({ GameParticularAreas: ['wooden_ox'] });
    const player = makeMockPlayer({
      getCardIds: jest
        .fn()
        .mockImplementation((_area: any, cardName: string) => (cardName === 'wooden_ox' ? [42 as CardId] : [])),
    });

    expect(isCardInParticularArea(card, store, player)).toBe(true);
  });
});

describe('isCardEnabled', () => {
  it('returns false when game is not playing', () => {
    const ctx = makeFilterContext({
      store: makeMockStore({ isPlaying: jest.fn().mockReturnValue(false) }),
    });
    expect(isCardEnabled(makeMockCard(), PlayerCardsArea.HandArea, ctx)).toBe(false);
  });

  it('returns false when game is over', () => {
    const ctx = makeFilterContext({
      store: makeMockStore({ isGameOver: jest.fn().mockReturnValue(true) }),
    });
    expect(isCardEnabled(makeMockCard(), PlayerCardsArea.HandArea, ctx)).toBe(false);
  });

  it('returns true for an already-selected card', () => {
    const card = makeMockCard({ Id: 5 as CardId });
    const ctx = makeFilterContext({
      state: {
        ...makeFilterContext().state,
        selectedCards: [5 as CardId],
      },
    });
    expect(isCardEnabled(card, PlayerCardsArea.HandArea, ctx)).toBe(true);
  });

  it('returns true for the current cardToPlay', () => {
    const card = makeMockCard({ Id: 10 as CardId });
    const ctx = makeFilterContext({
      state: {
        ...makeFilterContext().state,
        selectedCardToPlay: 10 as CardId,
      },
    });
    expect(isCardEnabled(card, PlayerCardsArea.HandArea, ctx)).toBe(true);
  });

  it('returns false when hand card fails canUseCard', () => {
    const ctx = makeFilterContext({
      player: makeMockPlayer({
        canUseCard: jest.fn().mockReturnValue(false),
        canUseCardTo: jest.fn().mockReturnValue(false),
      }),
    });
    const card = makeMockCard();

    expect(isCardEnabled(card, PlayerCardsArea.HandArea, ctx)).toBe(false);
  });

  it('returns true when ignoreCanUseCondition is set', () => {
    const ctx = makeFilterContext({
      player: makeMockPlayer({
        canUseCard: jest.fn().mockReturnValue(false),
      }),
    });
    const card = makeMockCard();

    expect(isCardEnabled(card, PlayerCardsArea.HandArea, ctx, true)).toBe(true);
  });
});

describe('isOutsideCardVisible', () => {
  it('returns true for cards in particular areas', () => {
    const card = makeMockCard({ Id: 77 as CardId });
    const ctx = makeFilterContext({
      store: makeMockStore({ GameParticularAreas: ['wooden_ox'] }),
      player: makeMockPlayer({
        getCardIds: jest
          .fn()
          .mockImplementation((_area: any, cardName: string) => (cardName === 'wooden_ox' ? [77 as CardId] : [])),
      }),
    });

    expect(isOutsideCardVisible(card, ctx)).toBe(true);
  });

  it('returns false when no skill is selected and card not in particular area', () => {
    const ctx = makeFilterContext();
    expect(isOutsideCardVisible(makeMockCard(), ctx)).toBe(false);
  });
});
