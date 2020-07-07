import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './card.module.css';

export const CardNumberItem = (props: { cardNumber: number; isRed?: boolean; className?: string }) => (
  <span className={classNames(styles.cardNumber, props.className, { [styles.redCardNumber]: props.isRed })}>
    {ClientTranslationModule.getCardNumber(props.cardNumber)}
  </span>
);
