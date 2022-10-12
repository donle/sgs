import { CardSuit } from 'core/cards/libs/card_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { CardSuitItem } from 'ui/card/card_suit';
import styles from './emoji_loader.module.css';

export function emojiLoader(translator: ClientTranslationModule) {
  translator.addEmojiOrImageSymbolText(
    [CardSuit.Club, <CardSuitItem suit={CardSuit.Club} className={styles.cardSuit} />],
    [CardSuit.Diamond, <CardSuitItem suit={CardSuit.Diamond} className={styles.cardSuit} />],
    [CardSuit.Heart, <CardSuitItem suit={CardSuit.Heart} className={styles.cardSuit} />],
    [CardSuit.Spade, <CardSuitItem suit={CardSuit.Spade} className={styles.cardSuit} />],
    [CardSuit.NoSuit, <CardSuitItem suit={CardSuit.NoSuit} className={styles.cardSuit} />],
  );
}
