import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import { RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ClientCard } from 'ui/card/card';
import { Point } from '../position';
import { UiAnimation } from '../ui_animation';
import styles from './move_card.module.css';

export class MoveCard extends UiAnimation {
  private cards: { cardId: CardId; public: boolean }[] = [];

  private readonly cardWidth = 88;
  private readonly cardHeight = 120;

  constructor(private store: RoomStore, private translator: ClientTranslationModule, private imageLoader: ImageLoader) {
    super();
  }

  private get CentralPosition(): Point {
    const body = document.getElementsByTagName('body')[0];
    return {
      x: body.clientWidth / 2,
      y: body.clientHeight / 2,
    };
  }

  private createCard(card?: Card, offset: number = 0) {
    const style: React.CSSProperties = {
      transform: `translate(${-offset * 24}px, 0)`,
      height: 136,
      width: 104,
    };
    return (
      <ClientCard
        key={card?.Id}
        imageLoader={this.imageLoader}
        card={card}
        translator={this.translator}
        style={style}
      />
    );
  }

  private createCards() {
    const cardsElement: JSX.Element[] = [];
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];

      cardsElement.push(
        <span key={card.cardId}>
          {this.createCard(card.public ? Sanguosha.getCardById(card.cardId) : undefined, i - this.cards.length / 2)}
        </span>,
      );
    }
    return cardsElement;
  }

  async animate<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    if (identifier !== GameEventIdentifiers.MoveCardEvent) {
      return;
    }
    const content = (event as unknown) as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const { fromId, toId } = content;
    this.cards = content.movingCards
      .filter(cardInfo => {
        if (
          (fromId === undefined && toId === undefined) ||
          fromId === toId ||
          content.toArea === CardMoveArea.ProcessingArea ||
          (cardInfo.fromArea === CardMoveArea.ProcessingArea && content.toArea === CardMoveArea.EquipArea)
        ) {
          return false;
        }

        return true;
      })
      .map(cardInfo => {
        const isPublic = content.engagedPlayerIds
          ? false
          : !(cardInfo.fromArea === CardMoveArea.HandArea && content.toArea === CardMoveArea.HandArea) &&
            content.moveReason !== CardMoveReason.CardDraw;
        return {
          cardId: cardInfo.card,
          public: isPublic,
        };
      });

    if (
      (fromId === undefined && toId === undefined) ||
      fromId === toId ||
      content.toArea === CardMoveArea.ProcessingArea ||
      content.toArea === CardMoveArea.EquipArea
    ) {
      return;
    }

    const elements = this.createCards();

    const animationStyles: React.CSSProperties = {};

    if (fromId) {
      const position = this.store.animationPosition.getPosition(fromId, fromId === this.store.clientPlayerId);
      animationStyles.transform = `translate(${position.x - this.cardWidth / 2}px, ${
        position.y - this.cardHeight / 2
      }px)`;
    } else {
      animationStyles.transform = `translate(${this.CentralPosition.x - this.cardWidth / 2}px, ${
        this.CentralPosition.y - this.cardHeight / 2
      }px)`;
    }

    const container = document.createElement('div');
    document.getElementById('root')?.append(container);
    ReactDOM.render(
      <div className={styles.movingCards} style={animationStyles}>
        {elements}
      </div>,
      container,
    );

    await this.play(100, () => {
      const toPosition = toId
        ? this.store.animationPosition.getPosition(toId, toId === this.store.clientPlayerId)
        : this.CentralPosition;

      ReactDOM.render(
        <div
          className={styles.movingCards}
          style={{ opacity: 1, transform: `translate(${toPosition.x}px, ${toPosition.y}px)` }}
        >
          {elements}
        </div>,
        container,
      );
    });
    await this.play(1000, () => {
      ReactDOM.render(
        <div className={styles.movingCards} style={{ opacity: 0 }}>
          {elements}
        </div>,
        container,
      );
    });

    await this.play(150, () => {
      container.remove();
    });
  }
}
