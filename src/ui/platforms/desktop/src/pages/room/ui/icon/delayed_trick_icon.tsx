import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './delayed_trick_icon.module.css';

export const DelayedTrickIcon = (props: { card: Card; translator: ClientTranslationModule; className?: string }) => {
  const { card, translator, className } = props;
  return <div className={classNames(styles.delayedTrickIcon, className)}>
    <span className={styles.cardInitialWord}>{translator.tr(card.Name).slice(0, 1)}</span></div>;
};
