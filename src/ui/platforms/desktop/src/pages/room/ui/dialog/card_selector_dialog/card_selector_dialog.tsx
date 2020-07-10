import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { ClientCard } from 'ui/card/card';
import { BaseDialog } from '../base_dialog';
import styles from './card_selector_dialog.module.css';

type CardSelectorProps = {
  translator: ClientTranslationModule;
  options: CardChoosingOptions | CardId[] | number;
  imageLoader: ImageLoader;
  onClick?(card: Card | number, fromArea: PlayerCardsArea): void;
  isCardDisabled?(card: Card): boolean;
};

const CardSlot = (props: {
  from?: PlayerCardsArea;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  card?: Card;
  index?: number;
  onClick?(card: Card | number, fromArea?: PlayerCardsArea): void;
  isCardDisabled?(card: Card): boolean;
}) => {
  const onSelected = (selected: boolean) => {
    props.onClick && props.onClick(props.card || props.index!, props.from);
    setSelected(selected);
  };
  const [selected, setSelected] = React.useState(false);

  return (
    <ClientCard
      imageLoader={props.imageLoader}
      className={classNames(styles.selectorCard, { [styles.selected]: selected })}
      card={props.card}
      translator={props.translator}
      disabled={props.card && props.isCardDisabled ? props.isCardDisabled(props.card) : false}
      onSelected={onSelected}
      width={100}
    />
  );
};

const CardSelector = (props: CardSelectorProps) => {
  const { options, onClick, translator, isCardDisabled, imageLoader } = props;

  const optionCardsLine: JSX.Element[] = [];
  if (options instanceof Array || typeof options === 'number') {
    const cardLine: JSX.Element[] = [];
    if (typeof options === 'number') {
      for (let i = 0; i < options; i++) {
        cardLine.push(
          <CardSlot
            imageLoader={imageLoader}
            translator={translator}
            index={i}
            key={i}
            onClick={onClick}
            isCardDisabled={isCardDisabled}
          />,
        );
      }
    } else {
      for (const cardId of options) {
        cardLine.push(
          <CardSlot
            key={cardId}
            translator={translator}
            imageLoader={imageLoader}
            card={Sanguosha.getCardById(cardId)}
            onClick={onClick}
            isCardDisabled={isCardDisabled}
          />,
        );
      }
    }

    optionCardsLine.push(
      <div className={styles.cardLine} key={optionCardsLine.length}>
        {cardLine}
      </div>,
    );
  } else {
    for (const [area, cardIds] of Object.entries(options)) {
      if (cardIds === undefined || (cardIds instanceof Array && cardIds.length === 0)) {
        continue;
      }

      const fromArea = parseInt(area, 10);
      const cardLine: JSX.Element[] = [];
      if (typeof cardIds === 'number') {
        for (let i = 0; i < cardIds; i++) {
          cardLine.push(
            <CardSlot
              from={Number.isNaN(fromArea) ? undefined : fromArea}
              translator={translator}
              imageLoader={imageLoader}
              index={i}
              key={i}
              onClick={onClick}
              isCardDisabled={isCardDisabled}
            />,
          );
        }
      } else {
        for (const cardId of cardIds) {
          cardLine.push(
            <CardSlot
              from={Number.isNaN(fromArea) ? undefined : fromArea}
              key={cardId}
              translator={translator}
              imageLoader={imageLoader}
              card={Sanguosha.getCardById(cardId)}
              onClick={onClick}
              isCardDisabled={isCardDisabled}
            />,
          );
        }
      }

      optionCardsLine.push(
        <div className={styles.cardLine} key={optionCardsLine.length}>
          {cardLine}
        </div>,
      );
    }
  }
  return <div className={styles.selecterCardsItem}>{optionCardsLine}</div>;
};

export const CardSelectorDialog = (props: {
  translator: ClientTranslationModule;
  options: CardChoosingOptions | CardId[] | number;
  imageLoader: ImageLoader;
  onClick?(card: Card | number, fromArea?: PlayerCardsArea): void;
  isCardDisabled?(card: Card): boolean;
}) => (
  <BaseDialog title={props.translator.tr('please choose a card')}>
    <CardSelector {...props} />
  </BaseDialog>
);
