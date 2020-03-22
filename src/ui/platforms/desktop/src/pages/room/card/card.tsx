import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './card.module.css';
import { CardSuitItem } from './card_suit';

export type ClientCardProps = {
  card?: Card;
  translator: ClientTranslationModule;
  className?: string;
  disabled?: boolean;
  onSelected?(selected: boolean): void;
  tag?: string;
};

@mobxReact.observer
export class ClientCard extends React.Component<ClientCardProps> {
  @mobx.observable.ref
  private selected: boolean = false;

  private soundTracks: string[] = [];

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
    const randomIndex = Math.round(Math.random() * this.soundTracks.length);
    return this.soundTracks[randomIndex];
  }

  render() {
    const { className, card, translator, tag } = this.props;
    return (
      <div
        className={classNames(styles.clientCard, className, {
          [styles.selected]: this.getSelected() && !this.props.disabled,
        })}
        onClick={this.onClick}
      >
        {card ? (
          <>
            <div className={styles.cornerTag}>
              <CardSuitItem suit={card.Suit} className={styles.cardSuit} translator={translator} />
              <span>{ClientTranslationModule.getCardNumber(card.CardNumber)}</span>
            </div>
            <span>{translator.tr(card.Name)}</span>
            {tag && <span className={styles.cardTag}>{translator.trx(tag)}</span>}
          </>
        ) : (
          <div className={styles.emptyCard}>{this.props.translator.tr('New QSanguosha')}</div>
        )}
      </div>
    );
  }
}
