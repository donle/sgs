import { Card, CardType } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { Translation } from 'core/translations/translation_json_tool';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { ClientCard } from '../card/card';
import { RoomPresenter, RoomStore } from '../room.presenter';
import styles from './dashboard.module.css';

export type DashboardProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: Translation;
};

export const EquipCardItem = (props: {
  disabled?: boolean;
  card?: Card;
  translator: Translation;
  onClick?(card: Card): void;
}) => {
  const { disabled = true, card, onClick, translator } = props;

  const onCardClick = () => {
    !disabled && onClick && card && onClick(card);
  };

  return (
    <div className={styles.equipCardItem} onClick={onCardClick}>
      {card && translator.tr(card.Name)}
    </div>
  );
};

@mobxReact.observer
export class Dashboard extends React.Component<DashboardProps> {
  @mobx.computed
  get ClientPlayer() {
    return this.props.store.room.Players.find(
      player => player.Id === this.props.store.clientPlayerId,
    );
  }

  getEquipCardsSection() {
    const equipCards: Card[] = new Array(4);
    this.ClientPlayer &&
      this.ClientPlayer.getCardIds(PlayerCardsArea.EquipArea).forEach(
        cardId => {
          const card = Sanguosha.getCardById(cardId);
          if (card.is(CardType.Weapon)) {
            equipCards[0] = card;
          } else if (card.is(CardType.Armor)) {
            equipCards[1] = card;
          } else if (card.is(CardType.DefenseRide)) {
            equipCards[2] = card;
          } else if (card.is(CardType.OffenseRide)) {
            equipCards[3] = card;
          }
        },
      );

    return (
      <div className={styles.equipSection}>
        {equipCards.map(card => (
          <EquipCardItem translator={this.props.translator} card={card} />
        ))}
      </div>
    );
  }

  getPlayerHandBoard() {
    return (
      <div className={styles.handBoard}>
        <div className={styles.userActionsButtons}>
          <button>{this.props.translator.tr('confirm')}</button>
          <button>{this.props.translator.tr('cancel')}</button>
          <button>{this.props.translator.tr('finish')}</button>
        </div>
        <div className={styles.handCards}>
          {this.ClientPlayer?.getCardIds(PlayerCardsArea.HandArea).map(
            cardId => (
              <ClientCard
                translator={this.props.translator}
                card={Sanguosha.getCardById(cardId)}
                image={''}
              />
            ),
          )}
        </div>
      </div>
    );
  }

  render() {
    return <div className={styles.dashboard}>
      {this.getEquipCardsSection()}
      {this.getPlayerHandBoard()}
    </div>
  }
}
