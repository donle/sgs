/**
 * Integration tests for BaseAction with mobx observable workflow.
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
  class ViewAsSkill extends Skill {}
  class ResponsiveSkill extends Skill {}
  class GlobalFilterSkill extends Skill {}
  return {
    Skill,
    ActiveSkill,
    TriggerSkill,
    ViewAsSkill,
    ResponsiveSkill,
    GlobalFilterSkill,
    FilterSkill: Skill,
    TransformSkill: Skill,
  };
});

jest.mock('core/cards/card', () => {
  const actual = jest.requireActual('core/cards/card');
  return {
    ...actual,
    VirtualCard: {
      create: jest.fn((props: any) => ({ Id: `virtual-${props.cardName}`, Name: props.cardName })),
      getActualCards: jest.fn((ids: any[]) => ids),
    },
    CardType: { Normal: 0, Equip: 1, Trick: 2 },
  };
});

import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter } from 'pages/room/room.presenter';
import { RoomStore } from 'pages/room/room.store';
import { BaseAction } from '../base_action';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { ActiveSkill, ViewAsSkill } = require('core/skills/skill');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const mockGetCardById = require('core/game/engine').Sanguosha.getCardById as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const mockGetCardByName = require('core/game/engine').Sanguosha.getCardByName as jest.Mock;

const createActiveSkill = (overrides: any = {}) => {
  const skill = Object.create(ActiveSkill.prototype);
  skill.numberOfCards = jest.fn().mockReturnValue([0]);
  skill.cardFilter = jest.fn().mockReturnValue(true);
  skill.targetFilter = jest.fn().mockReturnValue(true);
  skill.isAvailableTarget = jest.fn().mockReturnValue(true);
  skill.isAvailableCard = jest.fn().mockReturnValue(true);
  skill.availableCardAreas = jest.fn().mockReturnValue([PlayerCardsArea.HandArea]);
  skill.canUse = jest.fn().mockReturnValue(true);
  Object.assign(skill, overrides);
  return skill;
};

const createViewAsSkill = (overrides: any = {}) => {
  const skill = Object.create(ViewAsSkill.prototype);
  skill.cardFilter = jest.fn().mockReturnValue(true);
  skill.canViewAs = jest.fn().mockReturnValue(['slash']);
  skill.viewAs = jest.fn().mockReturnValue({ Id: 'virtual-slash', Name: 'slash' });
  skill.isAvailableCard = jest.fn().mockReturnValue(true);
  skill.availableCardAreas = jest.fn().mockReturnValue([PlayerCardsArea.HandArea]);
  skill.canUse = jest.fn().mockReturnValue(true);
  skill.Name = 'view-as-skill';
  Object.assign(skill, overrides);
  return skill;
};

class TestAction extends BaseAction {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onPlay() {}
}

const makeMockRoom = (overrides: any = {}) => ({
  isPlaying: jest.fn().mockReturnValue(true),
  isGameOver: jest.fn().mockReturnValue(false),
  AlivePlayers: [] as any[],
  getAlivePlayersFrom: jest.fn().mockReturnValue([]),
  GameParticularAreas: [] as string[],
  isAvailableTarget: jest.fn().mockReturnValue(true),
  getPlayerById: jest.fn((id: PlayerId) => makeMockPlayer(id)),
  broadcast: jest.fn(),
  ...overrides,
});

const makeMockPlayer = (id: PlayerId = 'player-1' as PlayerId): Player =>
  ({
    Id: id,
    Dead: false,
    canUseCard: jest.fn().mockReturnValue(true),
    canUseCardTo: jest.fn().mockReturnValue(true),
    getCardIds: jest.fn().mockReturnValue([]),
    getSkills: jest.fn().mockReturnValue([]),
  } as unknown as Player);

const makeMockStore = (overrides: Partial<RoomStore> = {}): RoomStore => {
  const store = {
    room: makeMockRoom(),
    clientPlayerId: 'player-1' as PlayerId,
    selectedCards: [] as CardId[],
    selectedPlayers: [] as ClientPlayer[],
    selectedSkill: undefined as Skill | undefined,
    actionButtonStatus: { confirm: false, cancel: false, finish: false },
    inAction: false,
    awaitingResponseEvent: {} as any,
    updateUIFlag: false,
    canReforge: false,
    delightedPlayers: undefined as boolean | undefined,
    highlightedCards: undefined as boolean | undefined,
    notifiedPlayers: [] as PlayerId[],
    notificationTime: 60,
    ...overrides,
  };
  return store as unknown as RoomStore;
};

const makeMockPresenter = (): RoomPresenter => {
  const presenter = {
    onClickPlayer: jest.fn(),
    onClickPlayerCard: jest.fn(),
    onClickEquipment: jest.fn(),
    onClickSkill: jest.fn(),
    enableActionButton: jest.fn(),
    disableActionButton: jest.fn(),
    enableCardReforgeStatus: jest.fn(),
    disableCardReforgeStatus: jest.fn(),
    broadcastUIUpdate: jest.fn(),
    selectCard: jest.fn(),
    unselectCard: jest.fn(),
    clearSelectedCards: jest.fn(),
    selectPlayer: jest.fn(),
    unselectPlayer: jest.fn(),
    clearSelectedPlayers: jest.fn(),
    resetSelectedSkill: jest.fn(),
    isSkillDisabled: jest.fn(),
    delightPlayers: jest.fn(),
    highlightCards: jest.fn(),
    setupPlayersSelectionMatcher: jest.fn(),
    setupClientPlayerCardActionsMatcher: jest.fn(),
    setupClientPlayerOutsideCardActionsMatcher: jest.fn(),
    setupCardSkillSelectionMatcher: jest.fn(),
    setupClientPlayerHandardsActionsMatcher: jest.fn(),
    clearSelectionReflectAction: jest.fn(),
    closeDialog: jest.fn(),
    createCardCategoryDialog: jest.fn(),
    createIncomingConversation: jest.fn(),
    closeIncomingConversation: jest.fn(),
    defineConfirmButtonActions: jest.fn(),
    defineCancelButtonActions: jest.fn(),
    defineFinishButtonActions: jest.fn(),
    startAction: jest.fn(),
    endAction: jest.fn(),
    ClientPlayer: undefined as ClientPlayer | undefined,
  } as unknown as RoomPresenter;
  return presenter;
};

const makeMockTranslator = (): ClientTranslationModule => ({ setup: jest.fn() } as unknown as ClientTranslationModule);

let store: RoomStore;
let presenter: RoomPresenter;
let translator: ClientTranslationModule;
let action: TestAction;

beforeEach(() => {
  jest.clearAllMocks();

  store = makeMockStore();
  presenter = makeMockPresenter();
  translator = makeMockTranslator();

  mockGetCardById.mockReturnValue({
    Id: 100 as CardId,
    Name: 'slash',
    is: jest.fn().mockImplementation((type: number) => type === 0),
    Skill: createActiveSkill(),
    Reforgeable: false,
  });
  mockGetCardByName.mockReturnValue({ Skill: {} });

  action = new TestAction('player-1' as PlayerId, store, presenter, translator);
});

describe('constructor event wiring', () => {
  it('registers onClickPlayer handler', () => {
    expect(presenter.onClickPlayer).toHaveBeenCalledWith(expect.any(Function));
  });

  it('registers onClickPlayerCard handler', () => {
    expect(presenter.onClickPlayerCard).toHaveBeenCalledWith(expect.any(Function));
  });

  it('registers onClickEquipment handler', () => {
    expect(presenter.onClickEquipment).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe('onClickPlayerCard handler', () => {
  it('calls selectCard on selected=true', () => {
    const handler = (presenter.onClickPlayerCard as jest.Mock).mock.calls[0][0];
    const card = { Id: 42 as CardId, Name: 'slash' } as Card;
    const spy = jest.spyOn(action as any, 'selectCard');
    handler(card, true);
    expect(spy).toHaveBeenCalledWith(42);
  });

  it('calls unselectCard on selected=false', () => {
    const handler = (presenter.onClickPlayerCard as jest.Mock).mock.calls[0][0];
    const card = { Id: 42 as CardId } as Card;
    const spy = jest.spyOn(action as any, 'unselectCard');
    handler(card, false);
    expect(spy).toHaveBeenCalledWith(42);
  });
});

describe('selectCard', () => {
  it('sets selectedCardToPlay when nothing is selected yet', () => {
    (action as any).selectCard(42 as CardId);
    expect((action as any).selectedCardToPlay).toBe(42);
  });

  it('pushes to pendingCards when selectedSkillToPlay is ViewAsSkill', () => {
    const skill = createViewAsSkill();
    (action as any).selectedSkillToPlay = skill;
    (action as any).selectCard(42 as CardId);
    expect((action as any).pendingCards).toEqual([42]);
    expect((action as any).selectedCardToPlay).toBeUndefined();
  });

  it('pushes to selectedCards when selectedSkillToPlay is ActiveSkill', () => {
    (action as any).selectedSkillToPlay = createActiveSkill();
    (action as any).selectCard(42 as CardId);
    expect((action as any).selectedCards).toEqual([42]);
  });

  it('does nothing when the card is the equipSkillCardId', () => {
    (action as any).equipSkillCardId = 42 as CardId;
    (action as any).selectCard(42 as CardId);
    expect((action as any).selectedCardToPlay).toBeUndefined();
    expect((action as any).selectedCards).toEqual([]);
  });
});

describe('unselectCard', () => {
  it('resets action when card is equipSkillCardId', () => {
    const spy = jest.spyOn(action, 'resetAction');
    (action as any).equipSkillCardId = 42 as CardId;
    (action as any).unselectCard(42 as CardId);
    expect(spy).toHaveBeenCalled();
  });

  it('clears selectedCardToPlay when unselecting primary card', () => {
    (action as any).selectedCardToPlay = 100 as CardId;
    (action as any).unselectCard(100 as CardId);
    expect((action as any).selectedCardToPlay).toBeUndefined();
  });

  it('removes card from selectedCards', () => {
    (action as any).selectedCards = [1 as CardId, 2 as CardId, 3 as CardId];
    (action as any).unselectCard(2 as CardId);
    expect((action as any).selectedCards).toEqual([1 as CardId, 3 as CardId]);
  });

  it('removes card from pendingCards', () => {
    (action as any).pendingCards = [10 as CardId, 20 as CardId];
    (action as any).unselectCard(10 as CardId);
    expect((action as any).pendingCards).toEqual([20 as CardId]);
  });
});

describe('selectPlayer / unselectePlayer', () => {
  it('adds player to selectedTargets', () => {
    (action as any).selectPlayer(makeMockPlayer('t1' as PlayerId));
    expect((action as any).selectedTargets).toEqual(['t1']);
  });

  it('does not duplicate targets', () => {
    const p = makeMockPlayer('t1' as PlayerId);
    (action as any).selectPlayer(p);
    (action as any).selectPlayer(p);
    expect((action as any).selectedTargets).toEqual(['t1']);
  });

  it('removes player from selectedTargets', () => {
    (action as any).selectedTargets = ['t1' as PlayerId, 't2' as PlayerId];
    (action as any).unselectePlayer(makeMockPlayer('t1' as PlayerId));
    expect((action as any).selectedTargets).toEqual(['t2' as PlayerId]);
  });
});

describe('resetAction', () => {
  it('clears all internal selection state', () => {
    (action as any).selectedCardToPlay = 100 as CardId;
    (action as any).selectedCards = [1 as CardId];
    (action as any).selectedTargets = ['t1' as PlayerId];
    (action as any).pendingCards = [5 as CardId];
    (action as any).equipSkillCardId = 200 as CardId;

    action.resetAction();

    expect((action as any).selectedCardToPlay).toBeUndefined();
    expect((action as any).selectedCards).toEqual([]);
    expect((action as any).selectedTargets).toEqual([]);
    expect((action as any).pendingCards).toEqual([]);
    expect((action as any).equipSkillCardId).toBeUndefined();
  });

  it('disables confirm and cancel buttons', () => {
    action.resetAction();
    expect(presenter.disableActionButton).toHaveBeenCalledWith('confirm');
    expect(presenter.disableActionButton).toHaveBeenCalledWith('cancel');
  });

  it('clears store.selectedCards mobx observable', () => {
    store.selectedCards = [1 as CardId, 2 as CardId];
    action.resetAction();
    expect(store.selectedCards).toEqual([]);
  });

  it('highlights cards and broadcasts UI update', () => {
    action.resetAction();
    expect(presenter.highlightCards).toHaveBeenCalled();
    expect(presenter.broadcastUIUpdate).toHaveBeenCalled();
  });
});

describe('enableToCallAction', () => {
  it('returns false when nothing is selected', () => {
    expect((action as any).enableToCallAction()).toBe(false);
  });

  it('returns true when selectedCardToPlay is equip card', () => {
    mockGetCardById.mockReturnValue({
      is: jest.fn().mockImplementation((type: number) => type === 1),
      Skill: undefined,
    });
    (action as any).selectedCardToPlay = 100 as CardId;
    expect((action as any).enableToCallAction()).toBe(true);
  });

  it('returns true with valid cardFilter/targetFilter', () => {
    mockGetCardById.mockReturnValue({
      is: jest.fn().mockImplementation((type: number) => type === 0),
      Skill: createActiveSkill(),
    });
    (action as any).selectedCardToPlay = 100 as CardId;
    expect((action as any).enableToCallAction()).toBe(true);
  });
});

describe('delightItems', () => {
  it('delights players when a card is selected', () => {
    (action as any).selectedCardToPlay = 100 as CardId;
    (action as any).delightItems();
    expect(presenter.delightPlayers).toHaveBeenCalledWith(true);
  });

  it('removes delight when nothing selected', () => {
    (action as any).delightItems();
    expect(presenter.delightPlayers).toHaveBeenCalledWith(false);
  });
});

describe('onClickCard', () => {
  it('highlights card on select', () => {
    const card = { Id: 42 as CardId } as Card;
    (action as any).onClickCard(card, true);
    expect(presenter.selectCard).toHaveBeenCalledWith(card);
  });

  it('unhighlights card on deselect', () => {
    const card = { Id: 42 as CardId } as Card;
    (action as any).selectedCards = [42 as CardId];
    (action as any).onClickCard(card, false);
    expect(presenter.unselectCard).toHaveBeenCalledWith(card);
  });
});

describe('onClickPlayer', () => {
  it('selects player on click', () => {
    const p = makeMockPlayer('t1' as PlayerId);
    (action as any).onClickPlayer(p, true);
    expect(presenter.selectPlayer).toHaveBeenCalledWith(p);
  });

  it('unselects player on deselect', () => {
    const p = makeMockPlayer('t1' as PlayerId);
    (action as any).onClickPlayer(p, false);
    expect(presenter.unselectPlayer).toHaveBeenCalledWith(p);
  });
});

describe('resetActionHandlers', () => {
  it('resets matchers to noop', () => {
    action.resetActionHandlers();
    expect(presenter.setupPlayersSelectionMatcher).toHaveBeenCalledWith(expect.any(Function));
    const matcher = (presenter.setupPlayersSelectionMatcher as jest.Mock).mock.calls[0][0];
    expect(matcher({} as Player)).toBe(false);
  });
});

describe('selectSkill', () => {
  it('sets selectedSkillToPlay and stores in mobx', () => {
    const mp = store.room.getPlayerById('player-1' as PlayerId);
    jest.spyOn(mp, 'getCardIds').mockReturnValue([200 as CardId]);

    const skill = createActiveSkill();
    skill.Name = 'test-skill';
    (action as any).selectSkill(skill);

    expect((action as any).selectedSkillToPlay).toBe(skill);
    expect(store.selectedSkill).toBe(skill);
  });

  it('blocks skill selection when card is already selected', () => {
    (action as any).selectedCardToPlay = 100 as CardId;
    const skill = createActiveSkill();
    (action as any).selectSkill(skill);
    expect((action as any).selectedSkillToPlay).toBeUndefined();
  });
});
