import { CardType } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { FlatDemoCard } from 'ui/card/flat_demo_card';
import { BaseDialog } from '../base_dialog';
import styles from './card_category_dialog.module.css';

export type CardCategoryDialogProps = {
  translator: ClientTranslationModule;
  cardNames: string[];
  onClick(sleectedCardName: string): void;
  imageLoader: ImageLoader;
};

const DemoCardList = (props: CardCategoryDialogProps & { type: CardType }) => {
  return (
    <div className={styles.demoCardList}>
      <h3 className={styles.cardListName}>{props.translator.tr(Functional.getCardTypeRawText(props.type))}</h3>
      {props.cardNames.map((cardName, index) => (
        <FlatDemoCard
          translator={props.translator}
          cardName={cardName}
          imageLoader={props.imageLoader}
          onClick={props.onClick}
          key={index}
          className={styles.flatCard}
        />
      ))}
    </div>
  );
};

export const CardCategoryDialog = (props: CardCategoryDialogProps) => {
  const onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  const baseTypes = [CardType.Basic, CardType.Trick, CardType.Equip];
  const cardsWithTypes: [string[], string[], string[]] = [[], [], []];
  for (const cardName of props.cardNames) {
    const card = Sanguosha.getCardByName(cardName);
    for (let i = 0; i < baseTypes.length; i++) {
      if (card.is(baseTypes[i])) {
        cardsWithTypes[i].push(cardName);
      }
    }
  }

  return (
    <BaseDialog title={props.translator.tr('please choose a card')} className={styles.cardCategoryDialog}>
      <div className={styles.cardList} onMouseDown={onAction}>
        {cardsWithTypes
          .filter(cards => cards.length > 0)
          .map((cards, index) => (
            <DemoCardList {...props} cardNames={cards} type={baseTypes[index]} key={index} />
          ))}
      </div>
    </BaseDialog>
  );
};
