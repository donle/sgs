import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter } from 'pages/room/room.presenter';
import * as React from 'react';
import { ClientCard } from 'ui/card/card';
import { CardSlot } from 'ui/card/card_slot';
import { BaseDialog } from '../base_dialog';
import styles from './guanxing_dialog.module.css';

export type GuanXingDialogProps = {
  cards: Card[];
  translator: ClientTranslationModule;
  top: number;
  topStackName: string;
  bottom: number;
  bottomStackName: string;
  presenter: RoomPresenter;
  imageLoader: ImageLoader;
  onConfirm(top: Card[], bottom: Card[]): () => void;
  title?: string;
  movable?: boolean;
  topMaxCard?: number;
  topMinCard?: number;
  bottomMaxCard?: number;
  bottomMinCard?: number;
};

const EmptyCardSlots = (props: { slotName: string; length: number; translator: ClientTranslationModule }) => {
  const slots: JSX.Element[] = [];
  for (let i = 0; i < props.length; i++) {
    slots.push(
      <CardSlot
        width={100}
        slotName={props.slotName}
        className={styles.cardSlot}
        key={i}
        translator={props.translator}
      />,
    );
  }

  return <>{slots}</>;
};

@mobxReact.observer
export class GuanXingCardSlots extends React.Component<GuanXingDialogProps> {
  private readonly cardWidth = 100;
  private readonly cardMargin = 2;
  private topCards: Card[] = [];
  private bottomCards: Card[] = [];
  private movingCardPosition:
    | {
        x: number;
        y: number;
      }
    | undefined;
  private focusedCard: Card | undefined;

  @mobx.observable.shallow
  private cardStyles: React.CSSProperties[] = new Array(this.props.cards.length);
  @mobx.observable.deep
  private cardPositions: {
    [K in CardId]: {
      top: number;
      left: number;
    };
  } = {} as any;

  @mobx.action
  UNSAFE_componentWillMount() {
    this.props.presenter.defineConfirmButtonActions(this.props.onConfirm(this.topCards, this.bottomCards));
    for (let i = 0; i < this.props.cards.length; i++) {
      const card = this.props.cards[i];
      this.topCards.push(card);
      this.cardPositions[card.Id] = {
        left: this.getCardLeftOffset(i),
        top: 0,
      };
    }
  }

  @mobx.action
  private updateCardOffset(movingCard: Card, to: 'top' | 'bottom', targetIndex: number) {
    const originalIndex = this.getCardPositionIndex(movingCard);
    const from = this.getCardStack(movingCard);
    const toCardOffset = this.getCardLeftOffset(targetIndex);
    if (from === to) {
      const minMovingRange = this.getCardLeftOffset(Math.min(originalIndex, targetIndex));
      const maxMovingRange = this.getCardLeftOffset(Math.max(originalIndex, targetIndex));
      for (const cardId of Object.keys(this.cardPositions)) {
        if (cardId === movingCard.Id.toString()) {
          continue;
        }

        if (
          this.cardPositions[cardId].top === this.cardPositions[movingCard.Id].top &&
          this.cardPositions[cardId].left >= minMovingRange &&
          this.cardPositions[cardId].left <= maxMovingRange
        ) {
          targetIndex <= originalIndex
            ? (this.cardPositions[cardId].left += this.getCardLeftOffset(1))
            : (this.cardPositions[cardId].left -= this.getCardLeftOffset(1));
        }
      }
      this.cardPositions[movingCard.Id].left = toCardOffset;
    } else {
      for (const cardId of Object.keys(this.cardPositions)) {
        if (cardId === movingCard.Id.toString()) {
          continue;
        }

        if (
          this.cardPositions[cardId].top === this.cardPositions[movingCard.Id].top &&
          this.cardPositions[cardId].left >= this.cardPositions[movingCard.Id].left
        ) {
          this.cardPositions[cardId].left -= this.getCardLeftOffset(1);
        } else if (
          this.cardPositions[cardId].top !== this.cardPositions[movingCard.Id].top &&
          this.cardPositions[cardId].left >= toCardOffset
        ) {
          this.cardPositions[cardId].left += this.getCardLeftOffset(1);
        }
      }
      this.cardPositions[movingCard.Id].left = toCardOffset;
      this.cardPositions[movingCard.Id].top = to === 'bottom' ? 158 : 0;
    }
  }

  private getCardLeftOffset(index: number) {
    return (this.cardWidth + this.cardMargin * 2) * index;
  }

  private getCardPositionIndex(card: Card) {
    return Math.floor(this.cardPositions[card.Id].left / (this.cardWidth + this.cardMargin * 2));
  }

  private getCardStack(card: Card): 'top' | 'bottom' {
    if (this.cardPositions[card.Id].top === 0) {
      return 'top';
    }

    return 'bottom';
  }

  private calculateMovingPosition(card: Card, top: number, left: number): { index: number; to: 'top' | 'bottom' } {
    let to: 'bottom' | 'top' = 'top';
    const from = this.getCardStack(card);
    if (this.props.bottom !== 0) {
      if (from === 'top') {
        to = top >= 104 ? 'bottom' : 'top';
      } else {
        to = top <= -104 ? 'top' : 'bottom';
      }
    }

    let maxLength = to === 'top' ? this.topCards.length : this.bottomCards.length;
    if (from === to) {
      maxLength--;
    }

    const currentIndex = this.getCardPositionIndex(card);
    const index = Math.max(
      Math.min(currentIndex + Math.round(left / (this.cardMargin + this.cardWidth)), maxLength),
      0,
    );

    return { to, index };
  }

  private addToStack(card: Card, place: 'top' | 'bottom', index: number) {
    if (place === 'top') {
      if (place !== this.getCardStack(card)) {
        this.topCards.splice(index, 0, card);
        const deleteIndex = this.bottomCards.findIndex(seekingCard => seekingCard === card);
        if (deleteIndex >= 0) {
          this.bottomCards.splice(deleteIndex, 1);
        }
      } else {
        const swapIndex = this.topCards.findIndex(seekingCard => seekingCard === card);
        if (swapIndex >= 0) {
          [this.topCards[swapIndex], this.topCards[index]] = [this.topCards[index], this.topCards[swapIndex]];
        }
      }
    } else {
      if (place !== this.getCardStack(card)) {
        this.bottomCards.push(card);
        const deleteIndex = this.topCards.findIndex(seekingCard => seekingCard === card);
        if (deleteIndex >= 0) {
          this.topCards.splice(deleteIndex, 1);
        }
      } else {
        const swapIndex = this.bottomCards.findIndex(seekingCard => seekingCard === card);
        if (swapIndex >= 0) {
          [this.bottomCards[swapIndex], this.bottomCards[index]] = [
            this.bottomCards[index],
            this.bottomCards[swapIndex],
          ];
        }
      }
    }
  }

  @mobx.action
  onDrag = (card: Card, index: number) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (this.movingCardPosition === undefined || this.focusedCard !== card) {
      return;
    }

    const left = e.clientX - this.movingCardPosition.x;
    const top = e.clientY - this.movingCardPosition.y;

    this.cardStyles[index] = {
      ...this.cardStyles[index],
      top,
      left,
    };
  };

  onMouseDown = (card: Card, index: number) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { topMaxCard, bottomMaxCard } = this.props;

    let canMove = true;
    if (this.bottomCards.includes(card)) {
      if (topMaxCard !== undefined && this.topCards.length === topMaxCard) {
        canMove = false;
      }
    } else {
      if (bottomMaxCard !== undefined && this.bottomCards.length === bottomMaxCard) {
        canMove = false;
      }
    }
    if (!canMove) {
      return false;
    }

    this.movingCardPosition = {
      x: e.clientX,
      y: e.clientY,
    };
    this.focusedCard = card;
    this.cardStyles[index] = { ...this.cardStyles[index], zIndex: 10, transition: 'none' };
  };

  onMouseUp = (card: Card, index: number) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (this.movingCardPosition === undefined || this.focusedCard !== card) {
      return;
    }

    const left = e.clientX - this.movingCardPosition.x;
    const top = e.clientY - this.movingCardPosition.y;
    const { to: place, index: targetIndex } = this.calculateMovingPosition(card, top, left);
    this.addToStack(card, place, targetIndex);
    this.updateCardOffset(card, place, targetIndex);

    this.movingCardPosition = undefined;
    this.focusedCard = undefined;
    this.cardStyles[index] = {
      top: 0,
      left: 0,
    };
  };
  onMouseLeave = (card: Card, index: number) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.movingCardPosition = undefined;
    this.focusedCard = undefined;
    this.cardStyles[index] = {
      top: 0,
      left: 0,
    };
  };

  getInsertIndex = (card: Card, from: 'top' | 'bottom') => {
    const { cards } = this.props;
    const currentCards = from === 'top' ? this.topCards : this.bottomCards;
    const originalIndex = cards.findIndex(originalCard => originalCard === card);
    for (let i = 0; i < currentCards.length; i++) {
      const cardIndex = cards.findIndex(originalCard => originalCard === currentCards[i]);
      if (cardIndex > originalIndex) {
        return i;
      }
    }

    return currentCards.length;
  };

  onClick = (card: Card, index: number) => () => {
    const cardIndex = this.topCards.findIndex(topCard => card === topCard);
    if (cardIndex >= 0 && this.bottomCards.length < 2) {
      const targetIndex = this.getInsertIndex(card, 'bottom');
      this.addToStack(card, 'bottom', index);
      this.updateCardOffset(card, 'bottom', targetIndex);
    } else if (cardIndex < 0) {
      const targetIndex = this.getInsertIndex(card, 'top');
      this.addToStack(card, 'top', index);
      this.updateCardOffset(card, 'top', targetIndex);
    }
  };

  private canConfirm() {
    const { presenter, topMaxCard, topMinCard, bottomMaxCard, bottomMinCard } = this.props;
    let canConfirm = true;
    if (topMaxCard !== undefined && this.topCards.length > topMaxCard) {
      canConfirm = false;
    }
    if (topMinCard !== undefined && this.topCards.length < topMinCard) {
      canConfirm = false;
    }
    if (bottomMaxCard !== undefined && this.bottomCards.length > bottomMaxCard) {
      canConfirm = false;
    }
    if (bottomMinCard !== undefined && this.bottomCards.length < bottomMinCard) {
      canConfirm = false;
    }

    canConfirm ? presenter.enableActionButton('confirm') : presenter.disableActionButton('confirm');
    presenter.broadcastUIUpdate();
  }

  private readonly onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  render() {
    const { top, bottom, cards, translator, topStackName, bottomStackName, movable, imageLoader } = this.props;
    this.canConfirm();

    return (
      <div className={styles.cardSlots} onMouseDown={this.onAction}>
        <div className={styles.topCards}>
          {cards.map((card, index) => (
            <ClientCard
              key={index}
              card={card}
              imageLoader={imageLoader}
              translator={translator}
              disabled={movable}
              highlight={!!movable}
              unselectable={true}
              onSelected={!movable ? this.onClick(card, index) : undefined}
              onMouseUp={movable ? this.onMouseUp(card, index) : undefined}
              onMouseDown={movable ? this.onMouseDown(card, index) : undefined}
              onMouseMove={movable ? this.onDrag(card, index) : undefined}
              onMouseLeave={movable ? this.onMouseLeave(card, index) : undefined}
              offsetLeft={this.cardPositions[card.Id] && this.cardPositions[card.Id].left}
              offsetTop={this.cardPositions[card.Id] && this.cardPositions[card.Id].top}
              className={styles.guanxingCard}
              style={this.cardStyles[index]}
              width={100}
            />
          ))}
        </div>

        <div className={styles.topSlots}>
          <EmptyCardSlots length={top} slotName={topStackName} translator={translator} />
        </div>
        {bottom && (
          <div className={styles.bottomSlots}>
            <EmptyCardSlots length={bottom} slotName={bottomStackName} translator={translator} />
          </div>
        )}
      </div>
    );
  }
}

export const GuanXingDialog = (props: GuanXingDialogProps) => {
  const { translator, title } = props;

  return (
    <BaseDialog title={title && translator.trx(title)}>
      <GuanXingCardSlots {...props} />
    </BaseDialog>
  );
};
