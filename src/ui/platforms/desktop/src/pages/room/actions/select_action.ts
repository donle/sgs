import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
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
      if (!EventPacker.isUncancellabelEvent(this.event)) {
        this.presenter.enableActionButton('cancel');
        this.presenter.defineCancelButtonActions(() => {
          this.resetAction();
          resolve();
        });
      }

      const selectedPlayers: PlayerId[] = scopedTargets.length === 1 ? scopedTargets.slice() : [];
      this.presenter.setupPlayersSelectionMatcher(
        (player: Player) =>
          (scopedTargets.includes(player.Id) && selectedPlayers.length < requiredAmount) ||
          selectedPlayers.includes(player.Id),
      );
      if (selectedPlayers.length === requiredAmount) {
        this.presenter.enableActionButton('confirm');
      }

      this.presenter.onClickPlayer((player: Player, selected: boolean) => {
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

  onSelectCard(fromArea: PlayerCardsArea[], cardAmount: number, except: CardId[] = []) {
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
        if (
          !fromArea.includes(PlayerCardsArea.HandArea) ||
          (this.customSelector && !this.customSelector.match(card)) ||
          except.includes(card.Id)
        ) {
          return false;
        }
        return selectedCards.length !== cardAmount || selectedCards.includes(card.Id);
      });
      this.presenter.setupCardSkillSelectionMatcher(card => {
        if (
          !fromArea.includes(PlayerCardsArea.EquipArea) ||
          (this.customSelector && !this.customSelector.match(card)) ||
          except.includes(card.Id)
        ) {
          return false;
        }
        return selectedCards.length !== cardAmount || selectedCards.includes(card.Id);
      });

      const onClickCard = (card: Card, selected: boolean) => {
        if (selected) {
          selectedCards.push(card.Id);
        } else {
          const index = selectedCards.findIndex(cardId => card.Id === cardId);
          if (index >= 0) {
            selectedCards.splice(index, 1);
          }
        }

        if (cardAmount === selectedCards.length) {
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
