import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { ClientCard } from 'ui/card/card';
import { BaseDialog } from '../base_dialog';
import wuguStyles from '../wugufengdeng_dialog/wugufengdeng_dialog.module.css';
import styles from './card_display_dialog.module.css';

type CardDisplayDialogProps = {
  translator: ClientTranslationModule;
  cards: CardId[];
  imageLoader: ImageLoader;
  onConfirm(): void;
  from?: Player;
};

const getCardDisplayContainer = ({ cards, imageLoader, translator }: CardDisplayDialogProps) => {
  const maxCardsPerLine = Math.max(Math.round(cards.length / 2 + 0.5), 4);
  let index = 0;
  const cardsLine: JSX.Element[][] = [];
  while (index < cards.length) {
    const cardLine: JSX.Element[] = [];
    for (let i = index; i < Math.min(cards.length, maxCardsPerLine + index); i++) {
      const card = Sanguosha.getCardById(cards[i]);

      cardLine.push(<ClientCard card={card} key={i} imageLoader={imageLoader} translator={translator} width={100} />);
    }

    index += maxCardsPerLine;
    cardsLine.push(cardLine);
  }

  return cardsLine;
};

const onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
  e.stopPropagation();
};

export const CardDisplayDialog = (props: CardDisplayDialogProps) => {
  return (
    <BaseDialog
      title={props.translator.trx(
        props.from
          ? TranslationPack.translationJsonPatcher(
              '{0} display handcards to you',
              TranslationPack.patchPlayerInTranslation(props.from),
            ).toString()
          : 'cards displayed to you',
      )}
    >
      <div className={wuguStyles.cardContainer} onMouseDown={onAction}>
        {getCardDisplayContainer(props).map((cardsLine, index) => {
          return (
            <div className={wuguStyles.cardLine} key={index}>
              {cardsLine}
            </div>
          );
        })}
        <div className={styles.confirmButton}>
          <Button variant="primary" onClick={props.onConfirm}>
            {props.translator.tr('confirm')}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
};
