import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ActiveSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import {
  SelectionState,
  isCardEnabled,
  isCardInParticularArea,
  isOutsideCardVisible,
  isPlayerEnabled,
  findSingleTarget,
  processViewAsSkill,
  showViewAsDialog,
  CardFilterContext,
  TargetFilterContext,
} from './selectors';
import { canConfirmAction } from './validators';
import { RoomPresenter } from '../room.presenter';
import { RoomStore } from '../room.store';

export abstract class BaseAction {
  public static disableSkills = (skill: Skill) => {
    if (skill instanceof TriggerSkill) {
      return false;
    }

    return true;
  };

  // --- Selection state ---
  protected selectedCards: CardId[] = [];
  protected selectedCardToPlay?: CardId;
  protected selectedSkillToPlay?: Skill;
  protected selectedTargets: PlayerId[] = [];
  protected equipSkillCardId?: CardId;
  protected pendingCards: CardId[] = [];

  private inProcessDialog = false;
  protected player: Player;

  // --- Composed helpers ---
  protected get selectionState(): SelectionState {
    return {
      selectedCards: this.selectedCards,
      selectedCardToPlay: this.selectedCardToPlay,
      selectedSkillToPlay: this.selectedSkillToPlay,
      selectedTargets: this.selectedTargets,
      equipSkillCardId: this.equipSkillCardId,
      pendingCards: this.pendingCards,
    };
  }

  protected get cardFilterCtx(): CardFilterContext {
    return {
      store: this.store,
      player: this.player,
      state: this.selectionState,
    };
  }

  protected get targetFilterCtx(): TargetFilterContext {
    return {
      store: this.store,
      player: this.player,
      playerId: this.playerId,
      scopedTargets: this.scopedTargets,
    };
  }

  constructor(
    protected playerId: PlayerId,
    protected store: RoomStore,
    protected presenter: RoomPresenter,
    protected translator: ClientTranslationModule,
    protected scopedTargets?: PlayerId[],
  ) {
    this.player = this.store.room.getPlayerById(this.playerId);

    this.presenter.onClickPlayer((player: Player, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      if (selected) {
        this.selectPlayer(player);
      } else {
        this.unselectePlayer(player);
      }
      this.onClickPlayer(player, selected);
    });

    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      if (selected) {
        this.selectCard(card.Id);
      } else {
        this.unselectCard(card.Id);
      }
      this.onClickCard(card, selected);
    });

    this.presenter.onClickEquipment((card: Card, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      if (this.selectedCardToPlay === undefined && this.selectedSkillToPlay === undefined) {
        if (card.Skill instanceof ActiveSkill || card.Skill instanceof ViewAsSkill) {
          if (selected) {
            this.selectSkill(card.Skill);
          } else {
            this.unselectSkill(card.Skill);
          }
          this.onClickSkill(card.Skill, selected);
        }
      }

      if (selected) {
        this.selectCard(card.Id);
      } else {
        this.unselectCard(card.Id);
      }
      this.onClickCard(card, selected);
    });

    this.presenter.onClickSkill((skill: Skill, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      if (selected) {
        this.selectSkill(skill);
      } else {
        this.unselectSkill(skill);
      }
      this.onClickSkill(skill, selected);
    });
  }

  // ================================================================
  //  RESET
  // ================================================================

  public readonly resetAction = () => {
    this.store.selectedCards = [];
    this.selectedCardToPlay = undefined;
    this.selectedSkillToPlay = undefined;
    this.equipSkillCardId = undefined;
    this.selectedCards = [];
    this.selectedTargets = [];
    this.pendingCards = [];

    this.presenter.disableActionButton('confirm');
    this.presenter.disableActionButton('cancel');
    this.presenter.disableCardReforgeStatus();
    this.delightItems();
    this.presenter.highlightCards();
    this.onResetAction();
    this.presenter.broadcastUIUpdate();
  };

  public readonly resetActionHandlers = () => {
    this.presenter.setupPlayersSelectionMatcher(() => false);
    this.presenter.setupClientPlayerCardActionsMatcher(() => false);
    this.presenter.setupClientPlayerOutsideCardActionsMatcher((card: Card) => this.isOutsideCardShow(card));
    this.presenter.setupCardSkillSelectionMatcher(() => false);
    this.presenter.setupClientPlayerHandardsActionsMatcher(() => false);
    this.presenter.clearSelectedCards();
    this.presenter.clearSelectedPlayers();
    this.presenter.clearSelectionReflectAction();
  };

  // ================================================================
  //  CARD FILTERING (delegates to card_selector.ts)
  // ================================================================

  protected isCardFromParticularArea(card: Card): boolean {
    return isCardInParticularArea(card, this.store, this.player);
  }

  isOutsideCardShow(card: Card): boolean {
    return isOutsideCardVisible(card, this.cardFilterCtx);
  }

  isCardEnabled(
    card: Card,
    player: Player,
    fromArea: PlayerCardsArea = PlayerCardsArea.HandArea,
    ignoreCanUseCondition: boolean = false,
  ): boolean {
    // Override the player in the context with the passed-in player
    const ctx: CardFilterContext = {
      ...this.cardFilterCtx,
      player,
    };
    return isCardEnabled(card, fromArea, ctx, ignoreCanUseCondition);
  }

  // ================================================================
  //  PLAYER FILTERING (delegates to target_selector.ts)
  // ================================================================

  isPlayerEnabled(player: Player): boolean {
    return isPlayerEnabled(player, this.targetFilterCtx, this.selectionState);
  }

  // ================================================================
  //  SELECTION MUTATIONS
  // ================================================================

  protected unselectePlayer(player: Player) {
    if (this.selectedTargets.includes(player.Id)) {
      const index = this.selectedTargets.findIndex(target => target === player.Id);
      if (index >= 0) {
        this.selectedTargets.splice(index, 1);
      }
    }
  }

  protected selectPlayer(player: Player) {
    if (!this.selectedTargets.includes(player.Id)) {
      this.selectedTargets.push(player.Id);
    }
  }

  protected selectCard(cardId: CardId) {
    if (this.equipSkillCardId === cardId) {
      return;
    }

    if (this.selectedSkillToPlay !== undefined) {
      if (this.selectedSkillToPlay instanceof ViewAsSkill) {
        this.pendingCards.push(cardId);
      } else {
        this.selectedCards.push(cardId);
      }
    } else if (this.selectedCardToPlay === undefined) {
      this.selectedCardToPlay = cardId;
    } else {
      this.selectedCards.push(cardId);
    }
  }

  protected unselectCard(cardId: CardId) {
    if (this.equipSkillCardId === cardId) {
      this.store.selectedSkill = undefined;
      this.resetAction();
      return;
    }

    if (this.selectedSkillToPlay?.Name === Sanguosha.getCardById(cardId).Name) {
      this.selectedSkillToPlay = undefined;
    }
    if (this.selectedCardToPlay === cardId) {
      this.selectedCardToPlay = undefined;
    } else {
      let index = this.selectedCards.findIndex(selectedCard => selectedCard === cardId);
      if (index >= 0) {
        this.selectedCards.splice(index, 1);
      }
      index = this.pendingCards.findIndex(pendingCard => pendingCard === cardId);
      if (index >= 0) {
        this.pendingCards.splice(index, 1);
      }
    }
  }

  protected selectSkill(skill: Skill) {
    if (this.selectedCardToPlay !== undefined) {
      return;
    }

    this.selectedSkillToPlay = skill;
    this.store.selectedSkill = skill;
    this.equipSkillCardId = this.player
      .getCardIds(PlayerCardsArea.EquipArea)
      .find(cardId => Sanguosha.getCardById(cardId).Skill === skill);

    this.autoSelectSingleTarget();
  }

  protected unselectSkill(skill: Skill) {
    if (this.selectedSkillToPlay === skill) {
      this.selectedSkillToPlay = undefined;
      this.store.selectedSkill = undefined;
    }
  }

  // ================================================================
  //  UI HELPERS
  // ================================================================

  protected delightItems() {
    if (this.selectedCardToPlay || this.selectedSkillToPlay) {
      this.presenter.delightPlayers(true);
    } else {
      this.presenter.delightPlayers(false);
    }
  }

  private callToActionCheck() {
    if (this.enableToCallAction()) {
      this.presenter.enableActionButton('confirm');
    } else {
      this.presenter.disableActionButton('confirm');
    }
    this.presenter.broadcastUIUpdate();
  }

  /**
   * Determine if the confirm button should be enabled.
   * Delegates to action_validator.ts.
   */
  protected enableToCallAction(): boolean {
    return canConfirmAction(this.selectionState, {
      player: this.player,
      store: this.store,
    });
  }

  public abstract onPlay(...args: any): Promise<void>;

  // ================================================================
  //  AUTO-TARGET
  // ================================================================

  private autoSelectSingleTarget() {
    const targetId = findSingleTarget(this.targetFilterCtx, this.selectionState);
    if (targetId !== undefined && !this.selectedTargets.includes(targetId)) {
      this.selectedTargets.push(targetId);
      this.presenter.selectPlayer(this.store.room.getPlayerById(targetId));
    }
  }

  // ================================================================
  //  CLICK HANDLERS (overridable by subclasses)
  // ================================================================

  /**
   * Process the ViewAsSkill flow after card selection changes.
   * This centralizes the duplicated logic previously spread across
   * onClickCard and onClickSkill.
   */
  private processViewAs(matcher?: CardMatcher): void {
    const result = processViewAsSkill(this.selectionState, this.store, this.player, matcher);

    switch (result.kind) {
      case 'not-applicable':
      case 'cancelled':
        if (result.kind === 'cancelled') {
          this.selectedCardToPlay = undefined;
        }
        break;
      case 'created':
      case 'dialog':
        break;
      default:
        break;
        break;

      case 'created':
        this.selectedCardToPlay = result.cardId;
        this.autoSelectSingleTarget();
        break;

      case 'dialog': {
        this.inProcessDialog = true;
        showViewAsDialog(this.presenter, this.translator, result.skill, result.canViewAs, (cardName: string) => {
          this.inProcessDialog = false;
          this.selectedCardToPlay = result.skill.viewAs(this.pendingCards, this.player, cardName).Id;
          this.callToActionCheck();
        });
        break;
      }
    }
  }

  protected onClickCard(card: Card, selected: boolean, matcher?: CardMatcher): void {
    const target = this.store.room.getAlivePlayersFrom().filter(p => this.isPlayerEnabled(p));

    if (selected) {
      this.presenter.selectCard(card);
      this.autoSelectSingleTarget();
      this.callToActionCheck();
    } else {
      this.presenter.unselectCard(card);
      if (this.selectedCards.length > 0 && target.length === 1) {
        if (!this.selectedTargets.includes(target[0].Id)) {
          this.selectedTargets.push(target[0].Id);
          this.presenter.selectPlayer(this.store.room.getPlayerById(target[0].Id));
        }
        this.callToActionCheck();
      } else {
        for (const player of target) {
          this.presenter.unselectPlayer(this.store.room.getPlayerById(player.Id));
        }
        this.scopedTargets?.length !== 1 && (this.selectedTargets = []);
      }
    }

    this.processViewAs(matcher);
    this.delightItems();
    this.callToActionCheck();
  }

  protected onClickSkill(skill: Skill, selected: boolean, matcher?: CardMatcher): void {
    this.processViewAs(matcher);

    if (!selected) {
      this.resetAction();
      if (this.selectedSkillToPlay || this.selectedCardToPlay) {
        this.presenter.enableActionButton('cancel');
      } else {
        this.presenter.disableActionButton('cancel');
      }
    }
    this.delightItems();
    this.callToActionCheck();
  }

  protected onClickPlayer(player: Player, selected: boolean): void {
    if (selected) {
      this.presenter.selectPlayer(player as ClientPlayer);
    } else {
      this.presenter.unselectPlayer(player as ClientPlayer);
    }
    this.callToActionCheck();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onResetAction() {}
}
