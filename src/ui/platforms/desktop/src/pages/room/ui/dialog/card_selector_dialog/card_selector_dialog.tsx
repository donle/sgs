import { Card } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ClientCard } from 'pages/room/ui/card/card';
import * as React from 'react';
import { BaseDialog } from '../base_dialog';
import styles from './card_selector_dialog.module.css';

type CardSelectorProps = {
  translator: ClientTranslationModule;
  options: CardChoosingOptions | CardId[] | number;
  onClick(card: Card | number, fromArea: PlayerCardsArea): void;
};

const CardSlot = (props: {
  from?: PlayerCardsArea;
  translator: ClientTranslationModule;
  card?: Card;
  index?: number;
  onClick?(card: Card | number, fromArea?: PlayerCardsArea): void;
}) => {
  const onSelected = (selected: boolean) => {
    selected && props.onClick && props.onClick(props.card || props.index!, props.from);
  };

  return (
    <ClientCard
      className={styles.selectorCard}
      card={props.card}
      translator={props.translator}
      disabled={false}
      onSelected={onSelected}
    />
  );
};

const CardSelector = (props: CardSelectorProps) => {
  const { options, onClick, translator } = props;

  const optionCardsLine: JSX.Element[] = [];
  if (options instanceof Array || typeof options === 'number') {
    const cardLine: JSX.Element[] = [];
    if (typeof options === 'number') {
      for (let i = 0; i < options; i++) {
        cardLine.push(<CardSlot translator={translator} index={i} key={i} onClick={onClick} />);
      }
    } else {
      for (const cardId of options) {
        cardLine.push(
          <CardSlot key={cardId} translator={translator} card={Sanguosha.getCardById(cardId)} onClick={onClick} />,
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

      const cardLine: JSX.Element[] = [];
      if (typeof cardIds === 'number') {
        for (let i = 0; i < cardIds; i++) {
          cardLine.push(
            <CardSlot from={parseInt(area, 10)} translator={translator} index={i} key={i} onClick={onClick} />,
          );
        }
      } else {
        for (const cardId of cardIds) {
          cardLine.push(
            <CardSlot
              from={parseInt(area, 10)}
              key={cardId}
              translator={translator}
              card={Sanguosha.getCardById(cardId)}
              onClick={onClick}
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
  onClick(card: Card | number, fromArea?: PlayerCardsArea): void;
}) => <BaseDialog title={props.translator.tr('please choose a card')}>{<CardSelector {...props} />}</BaseDialog>;
