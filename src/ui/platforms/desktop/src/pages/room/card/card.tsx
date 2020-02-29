import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { Translation } from 'core/translations/translation_json_tool';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './card.module.css';
import { CardSuitItem } from './card_suit';

export type ClientCardProps = {
  card: Card;
  soundTracks?: string[];
  image: string;
  translator: Translation;
  className?: string;
  disabled?: boolean;
  onSelected?(selected: boolean): void;
};

const uniquNumberOnCard = {
  11: 'J',
  12: 'Q',
  13: 'K',
};

@mobxReact.observer
export class ClientCard extends React.Component<ClientCardProps> {
  @mobx.observable.ref
  private selected: boolean = false;

  readonly onClick = mobx.action(() => {
    if (this.props.disabled === false) {
      this.selected = !this.selected;
      this.props.onSelected && this.props.onSelected(this.selected);
    }
  });

  getCardNumber(cardNumber: number): string {
    return uniquNumberOnCard[cardNumber] || cardNumber.toString();
  }

  playAudio(): string {
    const { soundTracks = [] } = this.props;
    const randomIndex = Math.round(Math.random() * soundTracks.length);
    return soundTracks[randomIndex];
  }

  render() {
    const { className, card, translator } = this.props;
    return (
      <div
        className={classNames(styles.clientCard, className, {
          [styles.selected]: this.selected,
        })}
        onClick={this.onClick}
      >
        <div className={styles.cornerTag}>
          <CardSuitItem suit={card.Suit} className={styles.cardSuit} />
          <span>{this.getCardNumber(card.CardNumber)}</span>
        </div>
        <span>{translator.tr(card.Name)}</span>
      </div>
    );
  }
}
