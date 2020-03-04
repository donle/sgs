import { CardSuit } from 'core/cards/libs/card_props';
import { TranslationPack } from 'core/translations/translation_json_tool';

import clubImage from 'pages/room/assets/images/suits/club.png';
import diamondImage from 'pages/room/assets/images/suits/diamond.png';
import heartImage from 'pages/room/assets/images/suits/heart.png';
import nosuitImage from 'pages/room/assets/images/suits/no_suit.png';
import spadeImage from 'pages/room/assets/images/suits/spade.png';

TranslationPack.addEmojiOrImageSymbolText(
  [CardSuit.Club, clubImage],
  [CardSuit.Diamond, diamondImage],
  [CardSuit.Heart, heartImage],
  [CardSuit.NoSuit, nosuitImage],
  [CardSuit.Spade, spadeImage],
);
