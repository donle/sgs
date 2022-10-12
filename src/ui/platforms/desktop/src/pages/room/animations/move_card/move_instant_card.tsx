import { Card, CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import { RoomStore } from 'pages/room/room.store';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ClientCard } from 'ui/card/card';
import styles from './move_instant_card.module.css';
import { Point } from '../position';
import { UiAnimation } from '../ui_animation';

type MoveCardProps = { cardId: CardId; public: boolean };

export class MoveInstantCardAnimation extends UiAnimation {
  private readonly cardWidth = 120;
  private readonly cardHeight = 160;

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
      transform: `translate(${-offset * (this.cardWidth - 16)}px, 0)`,
    };
    return (
      <ClientCard
        key={card?.Id}
        imageLoader={this.imageLoader}
        card={card}
        width={this.cardWidth}
        translator={this.translator}
        style={style}
      />
    );
  }

  private createCards(cards: MoveCardProps[]) {
    const cardsElement: JSX.Element[] = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      cardsElement.push(this.createCard(card.public ? Sanguosha.getCardById(card.cardId) : undefined, i));
    }
    return cardsElement;
  }

  private async animateCardMove(content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    for (const info of content.infos) {
      const { fromId, toId, toArea, movingCards } = info;
      if (
        toId === undefined ||
        toArea === CardMoveArea.ProcessingArea ||
        movingCards.find(card => card.fromArea === CardMoveArea.ProcessingArea)
      ) {
        return;
      }

      const cards = info.movingCards.map(cardInfo => {
        const isPublic = info.engagedPlayerIds
          ? info.engagedPlayerIds.includes(this.store.clientPlayerId)
          : !(cardInfo.fromArea === CardMoveArea.HandArea && info.toArea === CardMoveArea.HandArea) &&
            info.moveReason !== CardMoveReason.CardDraw;
        return {
          cardId: cardInfo.card,
          public: isPublic || toId === this.store.clientPlayerId,
        };
      });

      const elements = this.createCards(cards);
      const animationStyles: React.CSSProperties = {};
      const leftOffset = (this.cardWidth + (elements.length - 1) * 16) / 2;

      if (fromId) {
        const position = this.store.animationPosition.getPosition(fromId, fromId === this.store.clientPlayerId);
        animationStyles.transform = `translate(${position.x - leftOffset}px, ${position.y - this.cardHeight / 2}px)`;
      } else {
        animationStyles.transform = `translate(${this.CentralPosition.x - leftOffset}px, ${
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

      await UiAnimation.play(100, () => {
        const toPosition = this.store.animationPosition.getPosition(toId, toId === this.store.clientPlayerId);
        const leftOffset = (this.cardWidth + (elements.length - 1) * 16) / 2;

        ReactDOM.render(
          <div
            className={styles.movingCards}
            style={{ opacity: 1, transform: `translate(${toPosition.x - leftOffset}px, ${toPosition.y}px)` }}
          >
            {elements}
          </div>,
          container,
        );
      });

      await UiAnimation.play(1000, () => {
        ReactDOM.render(
          <div className={styles.movingCards} style={{ opacity: 0 }}>
            {elements}
          </div>,
          container,
        );
      });

      await UiAnimation.play(150, () => {
        ReactDOM.unmountComponentAtNode(container);
        container.remove();
      });
    }
  }

  async animateCardUse(content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const { fromId, targetGroup, cardId } = content;
    if (
      fromId === this.store.clientPlayerId ||
      !targetGroup ||
      !TargetGroupUtil.getRealTargets(targetGroup).includes(fromId) ||
      !Sanguosha.getCardById(cardId).is(CardType.Equip)
    ) {
      return;
    }

    const elements = this.createCards([
      {
        cardId,
        public: true,
      },
    ]);
    const animationStyles: React.CSSProperties = {};
    const position = this.store.animationPosition.getPosition(fromId, fromId === this.store.clientPlayerId);
    animationStyles.transform = `translate(${position.x - this.cardWidth / 2}px, ${
      position.y - this.cardHeight / 2
    }px)`;

    const container = document.createElement('div');
    document.getElementById('root')?.append(container);
    ReactDOM.render(
      <div className={styles.movingCards} style={animationStyles}>
        {elements}
      </div>,
      container,
    );

    await UiAnimation.play(100, () => {
      ReactDOM.render(
        <div className={styles.movingCards} style={{ ...animationStyles, opacity: 1 }}>
          {elements}
        </div>,
        container,
      );
    });

    await UiAnimation.play(1000, () => {
      ReactDOM.render(
        <div className={styles.movingCards} style={{ opacity: 0 }}>
          {elements}
        </div>,
        container,
      );
    });

    await UiAnimation.play(150, () => {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
    });
  }

  async animate(identifier: GameEventIdentifiers, event: ServerEventFinder<GameEventIdentifiers>) {
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      await this.animateCardMove(event as unknown as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>);
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      await this.animateCardUse(event as unknown as ServerEventFinder<GameEventIdentifiers.CardUseEvent>);
    }
  }
}
