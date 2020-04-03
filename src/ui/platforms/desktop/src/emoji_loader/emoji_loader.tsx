import { CardSuit } from 'core/cards/libs/card_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { CardSuitItem } from 'pages/room/ui/card/card_suit';
import * as React from 'react';
import styles from './emoji_loader.module.css';

export function emojiLoader(translator: ClientTranslationModule) {
  translator.addEmojiOrImageSymbolText(
    [CardSuit.Club, <CardSuitItem translator={translator} suit={CardSuit.Club} className={styles.cardSuit} />],
    [CardSuit.Diamond, <CardSuitItem translator={translator} suit={CardSuit.Diamond} className={styles.cardSuit} />],
    [CardSuit.Heart, <CardSuitItem translator={translator} suit={CardSuit.Heart} className={styles.cardSuit} />],
    [CardSuit.Spade, <CardSuitItem translator={translator} suit={CardSuit.Spade} className={styles.cardSuit} />],
    [CardSuit.NoSuit, <CardSuitItem translator={translator} suit={CardSuit.NoSuit} className={styles.cardSuit} />],
  );
}
