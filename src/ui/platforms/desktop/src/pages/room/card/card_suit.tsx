import { CardSuit } from 'core/cards/libs/card_props';
import clubImage from 'pages/room/assets/images/suits/club.png';
import diamondImage from 'pages/room/assets/images/suits/diamond.png';
import heartImage from 'pages/room/assets/images/suits/heart.png';
import nosuitImage from 'pages/room/assets/images/suits/no_suit.png';
import spadeImage from 'pages/room/assets/images/suits/spade.png';
import * as React from 'react';

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
