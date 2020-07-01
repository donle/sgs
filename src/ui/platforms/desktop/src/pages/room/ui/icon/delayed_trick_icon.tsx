import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import styles from './delayed_trick_icon.module.css';

export const DelayedTrickIcon = (props: {
  card: Card;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  className?: string;
}) => {
  const { card, imageLoader, translator, className } = props;
  const imageInfo = imageLoader.getDelayedTricksImage(card.Name);
  return (
    <div className={classNames(styles.delayedTrickIcon, className)}>
      {imageInfo ? (
        <img src={imageInfo.src} alt={imageInfo.alt} />
      ) : (
        <span className={styles.cardInitialWord}>{translator.tr(card.Name).slice(0, 1)}</span>
      )}
    </div>
  );
};
