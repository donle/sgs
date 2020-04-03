import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { BaseAction } from './base_action';

export class SelectCardAction<T extends GameEventIdentifiers> extends BaseAction {
  private askForEvent: ServerEventFinder<T>;

  constructor(
    playerId: PlayerId,
    store: RoomStore,
    presenter: RoomPresenter,
    private event: ServerEventFinder<T>,
    private customSelector?: CardMatcher,
  ) {
    super(playerId, store, presenter, undefined);
  }

  onSelect(fromArea: PlayerCardsArea[], cardAmount: number) {
    return new Promise<CardId[]>((resolve, reject) => {
      if (!EventPacker.isUncancellabelEvent(this.event)) {
        this.presenter.enableActionButton('cancel');
        this.presenter.defineCancelButtonActions(() => {
          resolve([]);
          this.resetAction();
        });
      }

      const selectedCards: CardId[] = [];
      this.presenter.setupClientPlayerCardActionsMatcher(card => {
        if (!fromArea.includes(PlayerCardsArea.HandArea) || (this.customSelector && !this.customSelector.match(card))) {
          return false;
        }
        return selectedCards.length !== cardAmount || selectedCards.includes(card.Id);
      });
      this.presenter.setupCardSkillSelectionMatcher(card => {
        if (
          !fromArea.includes(PlayerCardsArea.EquipArea) ||
          (this.customSelector && !this.customSelector.match(card))
        ) {
          return false;
        }
        return selectedCards.length !== cardAmount || selectedCards.includes(card.Id);
      });

      this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
        if (selected) {
          selectedCards.push(card.Id);
        } else {
          const index = selectedCards.findIndex(cardId => card.Id === cardId);
          selectedCards.splice(index, 1);
        }

        if (cardAmount === selectedCards.length) {
          this.presenter.enableActionButton('confirm');
        } else {
          this.presenter.disableActionButton('confirm');
        }
        this.presenter.broadcastUIUpdate();
      });

      this.presenter.defineConfirmButtonActions(() => {
        resolve(selectedCards);
      });
    });
  }

  // tslint:disable-next-line:no-empty
  onPlay() {}
}
