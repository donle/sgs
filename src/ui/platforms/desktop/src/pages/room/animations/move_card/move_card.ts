import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerId } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import { RoomStore } from 'pages/room/room.presenter';
import { UiAnimation } from '../animation';
import { Point } from '../position';

export class MoveCard extends UiAnimation {
  private cards: { cardId: CardId; public: boolean }[] = [];
  private from: PlayerId | undefined;
  private to: PlayerId | undefined;

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
    const cardElement = document.createElement('div');
    const cardImageProps = card && this.imageLoader.getCardImage(card.Name);
    if (cardImageProps) {
      const imageElement = document.createElement('img');
      imageElement.setAttribute('src', cardImageProps.src!);
      imageElement.setAttribute('alt', this.translator.tr(cardImageProps.alt));
      cardElement.append(imageElement);
    } else {
      const cardBackElement = document.createElement('span');
      cardBackElement.innerText = this.translator.tr('New QSanguosha');
      cardElement.append(cardBackElement);
    }

    cardElement.style.transform = `translate(${-offset * 24}px, 0)`;
    cardElement.style.width = `${this.cardWidth}px`;
    cardElement.style.height = `${this.cardHeight}px`;
    cardElement.style.border = '1px solid grey';
    cardElement.style.display = 'flex';
    cardElement.style.background = 'white';
    cardElement.style.justifyContent = 'center';
    cardElement.style.alignItems = 'center';
    cardElement.style.position = 'absolute';

    return cardElement;
  }

  private createCards() {
    const cardsElement = document.createElement('div');
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];

      cardsElement.append(
        this.createCard(card.public ? Sanguosha.getCardById(card.cardId) : undefined, i - this.cards.length / 2),
      );
    }

    cardsElement.style.position = 'fixed';
    cardsElement.style.transition = 'transform 0.5s ease-in-out, opacity 0.15s ease';
    cardsElement.style.transform = 'translate(0, 0)';
    cardsElement.style.display = 'flex';
    cardsElement.style.left = '0';
    cardsElement.style.top = '0';
    cardsElement.style.opacity = '0';

    if (this.from) {
      const position = this.store.animationPosition.getPosition(this.from, this.from === this.store.clientPlayerId);
      cardsElement.style.transform = `translate(${position.x - this.cardWidth / 2}px, ${position.y -
        this.cardHeight / 2}px)`;
    } else {
      cardsElement.style.transform = `translate(${this.CentralPosition.x - this.cardWidth / 2}px, ${this.CentralPosition
        .y -
        this.cardHeight / 2}px)`;
    }

    return cardsElement;
  }

  async animate(content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    this.from = content.fromId;
    this.to = content.toId;
    this.cards = content.movingCards.map(cardInfo => ({
      cardId: cardInfo.card,
      public: cardInfo.fromArea !== CardMoveArea.HandArea,
    }));

    if ((this.from === undefined && this.to === undefined) || this.from === this.to) {
      return;
    }

    const elements = this.createCards();

    const toPosition = this.to
      ? this.store.animationPosition.getPosition(this.to, this.to === this.store.clientPlayerId)
      : this.CentralPosition;
    document.getElementById('root')?.append(elements);
    await this.play(100, () => {
      elements.style.opacity = '1';
      elements.style.transform = `translate(${toPosition.x}px, ${toPosition.y}px)`;
    });
    await this.play(1000, () => {
      elements.style.opacity = '0';
    });
    await this.play(100, () => {
      elements.remove();
    });
  }
}
