import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './card.module.css';
import { CardSuitItem } from './card_suit';

export type ClientCardProps = {
  card: Card;
  soundTracks?: string[];
  image: string;
  translator: ClientTranslationModule;
  className?: string;
  disabled?: boolean;
  onSelected?(selected: boolean): void;
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

  @mobx.action
  getSelected() {
    if (!!this.props.disabled) {
      this.selected = false;
    }
    return this.selected;
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
          [styles.selected]: this.getSelected() && !this.props.disabled,
        })}
        onClick={this.onClick}
      >
        <div className={styles.cornerTag}>
          <CardSuitItem suit={card.Suit} className={styles.cardSuit} />
          <span>{ClientTranslationModule.getCardNumber(card.CardNumber)}</span>
        </div>
        <span>{translator.tr(card.Name)}</span>
      </div>
    );
  }
}
