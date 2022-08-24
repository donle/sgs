import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from '../room.presenter';
export class ResponsiveChangeCardAction {
  private inProcessDialog = false;
  protected selectedCards: CardId[] = [];

  constructor(protected playerId: PlayerId, protected store: RoomStore, protected presenter: RoomPresenter) {
    this.presenter.enableActionButton('cancel');

    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      selected ? this.selectCard(card.Id) : this.unselectCard(card.Id);
      this.onClickCard(card, selected);
    });
  }

  isCardEnabled(fromArea: PlayerCardsArea): boolean {
    if (!this.store.room.isPlaying() || this.store.room.isGameOver()) {
      return false;
    }
    if (fromArea === PlayerCardsArea.HandArea) {
      return true;
    }
    return false;
  }

  protected selectCard(cardId: CardId) {
    this.selectedCards.push(cardId);
  }

  protected unselectCard(cardId: CardId) {
    const index = this.selectedCards.findIndex(selectedCard => selectedCard === cardId);
    if (index >= 0) {
      this.selectedCards.splice(index, 1);
    }
  }

  private callToActionCheck() {
    this.enableToCallAction()
      ? this.presenter.enableActionButton('confirm')
      : this.presenter.disableActionButton('confirm');
    this.presenter.broadcastUIUpdate();
  }

  protected enableToCallAction() {
    if (this.selectedCards.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  protected onClickCard(card: Card, selected: boolean): void {
    if (selected) {
      this.presenter.selectCard(card);
    } else {
      this.presenter.unselectCard(card);
    }
    this.callToActionCheck();
  }

  public readonly resetAction = () => {
    this.store.selectedCards = [];
    this.selectedCards = [];
    this.presenter.disableActionButton('confirm');
    this.presenter.disableActionButton('cancel');
    this.presenter.closeIncomingConversation();
    this.presenter.highlightCards();
    this.presenter.broadcastUIUpdate();
  };
  public readonly resetActionHandlers = () => {
    this.presenter.setupClientPlayerCardActionsMatcher(() => false);
    this.presenter.clearSelectedCards();
  };

  public onPlay(translator: ClientTranslationModule) {
    return new Promise<void>(resolve => {
      this.presenter.highlightCards();
      this.presenter.createIncomingConversation({
        conversation: 'Please select cards which needs to be replaced',
        translator,
      });

      this.presenter.defineConfirmButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForChangeInitCardEvent> = {
          fromId: this.playerId,
          cardIds: this.selectedCards,
        };
        this.store.room.broadcast(GameEventIdentifiers.AskForChangeInitCardEvent, event);
        this.resetActionHandlers();
        this.resetAction();
        resolve();
      });

      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForChangeInitCardEvent> = {
          fromId: this.playerId,
          cardIds: [],
        };
        this.store.room.broadcast(GameEventIdentifiers.AskForChangeInitCardEvent, event);
        this.resetActionHandlers();
        this.resetAction();
        resolve();
      });

      this.presenter.setupClientPlayerCardActionsMatcher(() => this.isCardEnabled(PlayerCardsArea.HandArea));
    });
  }
}
