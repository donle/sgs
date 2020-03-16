import classNames from 'classnames';
import { CardSuit } from 'core/cards/libs/card_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './card.module.css';

export const CardSuitItem = (props: { suit: CardSuit; className?: string; translator: ClientTranslationModule }) => {
  switch (props.suit) {
    case CardSuit.Club:
      return <span className={classNames(styles.cardSuit, props.className)}>&clubs;</span>;
    case CardSuit.Heart:
      return <span className={classNames(styles.cardSuit, props.className, styles.redCard)}>&hearts;</span>;
    case CardSuit.Diamond:
      return <span className={classNames(styles.cardSuit, props.className, styles.redCard)}>&diams;</span>;
    case CardSuit.Spade:
      return <span className={classNames(styles.cardSuit, props.className)}>&spades;</span>;
    case CardSuit.NoSuit:
      return (
        <span className={props.className}>
          {props.translator.tr(TranslationPack.translationJsonPatcher('[{0}]', 'nosuit').extract())}
        </span>
      );
    default:
      return <></>;
  }
};
