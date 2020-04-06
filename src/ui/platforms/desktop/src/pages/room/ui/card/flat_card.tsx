import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './card.module.css';
import { CardNumberItem } from './card_number';
import { CardSuitItem } from './card_suit';

type FlatClientCardProps = {
  translator: ClientTranslationModule;
  card: Card;
  className?: string;
};

export class FlatClientCard extends React.Component<FlatClientCardProps> {
  render() {
    const { className, translator, card } = this.props;
    return (
      <div className={classNames(className, styles.flatCard)}>
        <span className={styles.equipName}>{translator.trx(card.Name)}</span>
        <CardSuitItem suit={card.Suit} />
        <CardNumberItem cardNumber={card.CardNumber} />
      </div>
    );
  }
}
