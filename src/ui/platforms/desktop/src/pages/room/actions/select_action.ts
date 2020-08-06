import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { BaseAction } from './base_action';

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

  onSelectPlayer(requiredAmount: number, scopedTargets: PlayerId[]) {
    return new Promise<PlayerId[] | undefined>(resolve => {
      this.delightItems();
      if (!EventPacker.isUncancellabelEvent(this.event)) {
        this.presenter.enableActionButton('cancel');
        this.presenter.defineCancelButtonActions(() => {
          this.resetAction();
          resolve();
        });
      } else {
        this.presenter.disableActionButton('cancel');
      }

      const selectedPlayers: PlayerId[] = scopedTargets.length === 1 ? scopedTargets.slice() : [];
      for (const player of selectedPlayers) {
        this.presenter.selectPlayer(this.store.room.getPlayerById(player));
      }

      this.presenter.setupPlayersSelectionMatcher(
        (player: Player) =>
          (scopedTargets.includes(player.Id) && selectedPlayers.length < requiredAmount) ||
          selectedPlayers.includes(player.Id),
      );
      if (selectedPlayers.length === requiredAmount) {
        this.presenter.enableActionButton('confirm');
      }

      this.presenter.onClickPlayer((player: Player, selected: boolean) => {
        selected
          ? this.presenter.selectPlayer(player as ClientPlayer)
          : this.presenter.unselectPlayer(player as ClientPlayer);
        if (selected) {
          selectedPlayers.push(player.Id);
        } else {
          const index = selectedPlayers.findIndex(playerId => player.Id === playerId);
          if (index >= 0) {
            selectedPlayers.splice(index, 1);
          }
        }

        if (selectedPlayers.length === requiredAmount) {
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

  private match(cardAmount: number | [number, number], currentAmount: number) {
    if (cardAmount instanceof Array) {
      return currentAmount >= cardAmount[0] && currentAmount <= cardAmount[1];
    } else {
      return currentAmount === cardAmount;
    }
  }

  onSelectCard(fromArea: PlayerCardsArea[], cardAmount: number | [number, number], except: CardId[] = []) {
    return new Promise<CardId[]>((resolve, reject) => {
      this.presenter.highlightCards();
      if (!EventPacker.isUncancellabelEvent(this.event)) {
        this.presenter.enableActionButton('cancel');
        this.presenter.defineCancelButtonActions(() => {
          resolve([]);
          this.resetAction();
        });
      } else {
        this.presenter.disableActionButton('cancel');
      }

      const selectedCards: CardId[] = [];
      this.presenter.setupClientPlayerCardActionsMatcher(card => {
        if (
          !fromArea.includes(PlayerCardsArea.HandArea) ||
          (this.customSelector && !this.customSelector.match(card)) ||
          except.includes(card.Id)
        ) {
          return false;
        }
        return (
          (cardAmount instanceof Array ? selectedCards.length < cardAmount[1] : selectedCards.length !== cardAmount) ||
          selectedCards.includes(card.Id)
        );
      });
      this.presenter.setupClientPlayerOutsideCardActionsMatcher(card => {
        if (
          !fromArea.includes(PlayerCardsArea.OutsideArea) ||
          (this.customSelector && !this.customSelector.match(card)) ||
          except.includes(card.Id)
        ) {
          return false;
        }
        return (
          (cardAmount instanceof Array ? selectedCards.length < cardAmount[1] : selectedCards.length !== cardAmount) ||
          selectedCards.includes(card.Id)
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
          (cardAmount instanceof Array ? selectedCards.length < cardAmount[1] : selectedCards.length !== cardAmount) ||
          selectedCards.includes(card.Id)
        );
      });

      const onClickCard = (card: Card, selected: boolean) => {
        if (selected) {
          this.presenter.selectCard(card);
          selectedCards.push(card.Id);
        } else {
          this.presenter.unselectCard(card);
          const index = selectedCards.findIndex(cardId => card.Id === cardId);
          if (index >= 0) {
            selectedCards.splice(index, 1);
          }
        }

        if (this.match(cardAmount, selectedCards.length)) {
          this.presenter.enableActionButton('confirm');
        } else {
          this.presenter.disableActionButton('confirm');
        }
        this.presenter.broadcastUIUpdate();
      };

      this.presenter.onClickPlayerCard(onClickCard);
      this.presenter.onClickEquipment(onClickCard);

      this.presenter.defineConfirmButtonActions(() => {
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.isSkillDisabled(BaseAction.disableSkills);
        this.presenter.resetSelectedSkill();
        resolve(selectedCards);
      });
    });
  }

  // tslint:disable-next-line:no-empty
  async onPlay() {}
}
