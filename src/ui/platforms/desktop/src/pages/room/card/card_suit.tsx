import { CardSuit } from 'core/cards/libs/card_props';
import * as React from 'react';
import clubImage from './images/club.png';
import diamondImage from './images/diamond.png';
import heartImage from './images/heart.png';
import nosuitImage from './images/no_suit.png';
import spadeImage from './images/spade.png';

export const CardSuitItem = (props: { suit: CardSuit; className?: string }) => {
  switch (props.suit) {
    case CardSuit.Club:
      return (
        <img
          src={clubImage}
          className={props.className}
          alt={props.suit.toString()}
        />
      );
    case CardSuit.Heart:
      return (
        <img
          src={heartImage}
          className={props.className}
          alt={props.suit.toString()}
        />
      );
    case CardSuit.Diamond:
      return (
        <img
          src={diamondImage}
          className={props.className}
          alt={props.suit.toString()}
        />
      );
    case CardSuit.Spade:
      return (
        <img
          src={spadeImage}
          className={props.className}
          alt={props.suit.toString()}
        />
      );
    case CardSuit.NoSuit:
      return (
        <img
          src={nosuitImage}
          className={props.className}
          alt={props.suit.toString()}
        />
      );
    default:
      return <></>;
  }
};
