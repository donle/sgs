import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { ActiveSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { BaseAction } from './base_action';
import { RoomPresenter } from '../room.presenter';
import { RoomStore } from '../room.store';

export class SelectAction<T extends GameEventIdentifiers> extends BaseAction {
  constructor(
    playerId: PlayerId,
    store: RoomStore,
    presenter: RoomPresenter,
    translator: ClientTranslationModule,
    private event: ServerEventFinder<T>,
    private customSelector?: CardMatcher,
  ) {
    super(playerId, store, presenter, translator);
  }

  onSelectPlayer(requiredAmount: number | [number, number], scopedTargets: PlayerId[]) {
    return new Promise<PlayerId[] | undefined>(resolve => {
      let requiredAmounts: [number, number];
      this.delightItems();
      if (!EventPacker.isUncancellableEvent(this.event)) {
        this.presenter.enableActionButton('cancel');
        this.presenter.defineCancelButtonActions(() => {
          this.resetAction();
          resolve(undefined);
        });
      } else {
        this.presenter.disableActionButton('cancel');
      }

      if (requiredAmount instanceof Array) {
        requiredAmounts = requiredAmount.sort((a, b) => a - b);
      } else {
        requiredAmounts = [requiredAmount, requiredAmount];
      }

      const selectedPlayers: PlayerId[] = scopedTargets.length === 1 ? scopedTargets.slice() : [];
      for (const player of selectedPlayers) {
        this.presenter.selectPlayer(this.store.room.getPlayerById(player));
      }

      this.presenter.setupPlayersSelectionMatcher(
        (player: Player) =>
          (scopedTargets.includes(player.Id) && selectedPlayers.length < requiredAmounts[1]) ||
          selectedPlayers.includes(player.Id),
      );

      if (requiredAmounts[0] <= selectedPlayers.length && requiredAmounts[1] >= selectedPlayers.length) {
        this.presenter.enableActionButton('confirm');
      }

      this.presenter.onClickPlayer((player: Player, selected: boolean) => {
        if (selected) {
          this.presenter.selectPlayer(player as ClientPlayer);
        } else {
          this.presenter.unselectPlayer(player as ClientPlayer);
        }

        if (selected) {
          selectedPlayers.push(player.Id);
        } else {
          const index = selectedPlayers.findIndex(playerId => player.Id === playerId);
          if (index >= 0) {
            selectedPlayers.splice(index, 1);
          }
        }

        if (requiredAmounts[0] <= selectedPlayers.length && requiredAmounts[1] >= selectedPlayers.length) {
          this.presenter.enableActionButton('confirm');
        } else {
          this.presenter.disableActionButton('confirm');
        }
        this.presenter.broadcastUIUpdate();
      });

      this.presenter.defineConfirmButtonActions(() => {
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.isSkillDisabled(BaseAction.disableSkills);
        this.presenter.resetSelectedSkill();
        resolve(selectedPlayers);
      });
    });
  }

  onSelectCardTargets(user, cardId: CardId, exclude: PlayerId[]) {
    return new Promise<PlayerId[] | undefined>(resolve => {
      this.presenter.delightPlayers(true);

      const card = Sanguosha.getCardById(cardId);
      if (!(card.Skill instanceof ActiveSkill)) {
        resolve(undefined);
      }

      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        this.resetAction();
        resolve(undefined);
      });

      const selectedTargets: PlayerId[] = [];
      const cardSkill = card.Skill as ActiveSkill;
      const skillExtralProp = card.Skill as unknown as ExtralCardSkillProperty;
      let numberOfCardTargets = cardSkill.numberOfTargets();
      numberOfCardTargets = (numberOfCardTargets instanceof Array ? numberOfCardTargets[0] : numberOfCardTargets) || 1;

      const excludeInvalidTargets = (playerId: PlayerId) =>
        (selectedTargets.length === 0 ? !exclude.includes(playerId) : true) &&
        this.store.room.isAvailableTarget(cardId, this.store.clientPlayerId, playerId);

      const isAvailableTarget = (playerId: PlayerId) =>
        skillExtralProp.isCardAvailableTarget
          ? skillExtralProp.isCardAvailableTarget(this.playerId, this.store.room, playerId, [], selectedTargets, cardId)
          : cardSkill.isAvailableCard(this.playerId, this.store.room, playerId, [], selectedTargets, cardId);

      this.presenter.setupPlayersSelectionMatcher(
        (player: Player) =>
          (excludeInvalidTargets(player.Id) &&
            selectedTargets.length < numberOfCardTargets &&
            isAvailableTarget(player.Id)) ||
          selectedTargets.includes(player.Id),
      );

      this.presenter.onClickPlayer((player: Player, selected: boolean) => {
        if (selected) {
          this.presenter.selectPlayer(player as ClientPlayer);
        } else {
          this.presenter.unselectPlayer(player as ClientPlayer);
        }
        if (selected) {
          selectedTargets.push(player.Id);
        } else {
          const index = selectedTargets.findIndex(playerId => player.Id === playerId);
          if (index >= 0) {
            selectedTargets.splice(index, 1);
          }
        }

        if (selectedTargets.length === numberOfCardTargets) {
          this.presenter.enableActionButton('confirm');
        } else {
          this.presenter.disableActionButton('confirm');
        }

        this.presenter.broadcastUIUpdate();
      });

      this.presenter.defineConfirmButtonActions(() => {
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.isSkillDisabled(BaseAction.disableSkills);
        this.presenter.resetSelectedSkill();
        resolve(selectedTargets);
      });
    });
  }

  private match(cardAmount: number | [number, number], currentAmount: number) {
    if (cardAmount instanceof Array) {
      return currentAmount >= cardAmount[0] && currentAmount <= cardAmount[1];
    } else {
      return currentAmount === cardAmount;
    }
  }

  onSelectCard(
    fromArea: PlayerCardsArea[],
    cardAmount: number | [number, number],
    except: CardId[] = [],
    hiddenRules?: (card: CardId) => boolean,
  ) {
    return new Promise<CardId[]>(resolve => {
      this.presenter.highlightCards();
      if (!EventPacker.isUncancellableEvent(this.event)) {
        this.presenter.enableActionButton('cancel');
        this.presenter.defineCancelButtonActions(() => {
          resolve([]);
          this.resetAction();
        });
      } else {
        this.presenter.disableActionButton('cancel');
      }

      if (hiddenRules) {
        this.presenter.setupClientPlayerHandardsActionsMatcher(
          card => fromArea.includes(PlayerCardsArea.HandArea) && hiddenRules(card.Id),
        );
      }

      this.presenter.setupClientPlayerCardActionsMatcher(card => {
        if (
          !fromArea.includes(PlayerCardsArea.HandArea) ||
          (this.customSelector && !this.customSelector.match(card)) ||
          except.includes(card.Id)
        ) {
          return false;
        }
        return (
          (cardAmount instanceof Array
            ? this.store.selectedCards.length < cardAmount[1]
            : this.store.selectedCards.length !== cardAmount) || this.store.selectedCards.includes(card.Id)
        );
      });
      this.presenter.setupClientPlayerOutsideCardActionsMatcher(card => {
        // if (this.isCardFromParticularArea(card)) {
        //   return true;
        // }

        if (
          !fromArea.includes(PlayerCardsArea.OutsideArea) ||
          (this.customSelector && !this.customSelector.match(card)) ||
          except.includes(card.Id)
        ) {
          return false;
        }
        return (
          (cardAmount instanceof Array
            ? this.store.selectedCards.length < cardAmount[1]
            : this.store.selectedCards.length !== cardAmount) || this.store.selectedCards.includes(card.Id)
        );
      });

      this.presenter.setupCardSkillSelectionMatcher(card => {
        if (
          !fromArea.includes(PlayerCardsArea.EquipArea) ||
          (this.customSelector && !this.customSelector.match(card)) ||
          except.includes(card.Id)
        ) {
          return false;
        }
        return (
          (cardAmount instanceof Array
            ? this.store.selectedCards.length < cardAmount[1]
            : this.store.selectedCards.length !== cardAmount) || this.store.selectedCards.includes(card.Id)
        );
      });

      this.presenter.setValidSelectionReflectAction(() => this.availableToConfirm(cardAmount));
      const onClickCard = (card: Card, selected: boolean) => {
        if (selected) {
          this.presenter.selectCard(card);
        } else {
          this.presenter.unselectCard(card);
          const index = this.store.selectedCards.findIndex(cardId => card.Id === cardId);
          if (index >= 0) {
            this.store.selectedCards.splice(index, 1);
          }
        }

        this.availableToConfirm(cardAmount);
      };

      this.presenter.onClickPlayerCard(onClickCard);
      this.presenter.onClickEquipment(onClickCard);

      this.presenter.defineConfirmButtonActions(() => {
        const cards = this.store.selectedCards.slice();
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.isSkillDisabled(BaseAction.disableSkills);
        this.presenter.resetSelectedSkill();
        resolve(cards);
      });
    });
  }

  private readonly availableToConfirm = (cardAmount: number | [number, number]) => {
    if (this.match(cardAmount, this.store.selectedCards.length)) {
      this.presenter.enableActionButton('confirm');
    } else {
      this.presenter.disableActionButton('confirm');
    }
    this.presenter.broadcastUIUpdate();
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onPlay() {}
}
