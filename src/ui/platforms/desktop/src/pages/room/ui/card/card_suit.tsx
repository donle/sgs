import classNames from 'classnames';
import { CardSuit } from 'core/cards/libs/card_props';
import * as React from 'react';
import styles from './card.module.css';

export const CardSuitItem = (props: { suit: CardSuit; className?: string }) => {
  switch (props.suit) {
    case CardSuit.Club:
      return <span className={classNames(styles.cardSuit, props.className, styles.blackCard)}>&clubs;</span>;
    case CardSuit.Heart:
      return <span className={classNames(styles.cardSuit, props.className, styles.redCard)}>&hearts;</span>;
    case CardSuit.Diamond:
      return <span className={classNames(styles.cardSuit, props.className, styles.redCard)}>&diams;</span>;
    case CardSuit.Spade:
      return <span className={classNames(styles.cardSuit, props.className, styles.blackCard)}>&spades;</span>;
    default:
      return <></>;
  }
};
