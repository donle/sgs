import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { CardDescription } from 'ui/card_description/card_description';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './delayed_trick_icon.module.css';

export const DelayedTrickIcon = (props: {
  card: Card;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  className?: string;
}) => {
  const [onTooltipOpeningTimer, setTooltipOpeningTimer] = React.useState<NodeJS.Timer>();
  const [onTooltipOpened, setTooltipOpened] = React.useState<boolean>(false);
  const openTooltip = () => {
    setTooltipOpeningTimer(
      setTimeout(() => {
        setTooltipOpened(true);
      }, 1000),
    );
  };

  const closeTooltip = () => {
    onTooltipOpeningTimer && clearTimeout(onTooltipOpeningTimer);
    setTooltipOpeningTimer(undefined);
    setTooltipOpened(false);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (onTooltipOpened) {
      closeTooltip();
    }
  };

  const { card, imageLoader, translator, className } = props;
  const imageInfo = imageLoader.getDelayedTricksImage(card.Name);
  return (
    <div
      className={classNames(styles.delayedTrickIcon, className)}
      onMouseEnter={openTooltip}
      onMouseMove={onMouseMove}
      onMouseLeave={closeTooltip}
    >
      {imageInfo ? (
        <img src={imageInfo.src} alt={imageInfo.alt} />
      ) : (
        <span className={styles.cardInitialWord}>{translator.tr(card.Name).slice(0, 1)}</span>
      )}
      {onTooltipOpened && (
        <Tooltip position={['left', 'bottom']}>
          <CardDescription translator={translator} card={card} />
        </Tooltip>
      )}
    </div>
  );
};
