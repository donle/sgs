import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter } from 'pages/room/room.presenter';
import { RoomStore } from 'pages/room/room.store';
import * as React from 'react';
import { ClientCard } from 'ui/card/card';
import styles from './move_card.module.css';

type MoveCardProps = {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  presenter: RoomPresenter;
  store: RoomStore;
  updateFlag: boolean;
};

@mobxReact.observer
export class MoveCard extends React.Component<MoveCardProps> {
  private displayedCardsRef = React.createRef<HTMLDivElement>();
  private readonly cardWidth = 120;
  private readonly cardMargin = 2;

  @mobx.observable.ref
  private focusedCardIndex: number | undefined;

  private calculateDisplayedCardOffset(totalCards: number, index: number) {
    const container = this.displayedCardsRef.current;
    if (!container) {
      return this.cardMargin;
    }

    const containerWidth = container.clientWidth;
    const innerOffset =
      Math.min(this.cardWidth * totalCards + this.cardMargin * (totalCards + 1), containerWidth) / 2 -
      this.cardWidth / 2;
    if (containerWidth < totalCards * (this.cardWidth + this.cardMargin)) {
      const offset = (totalCards * (this.cardWidth + this.cardMargin) - containerWidth) / (totalCards - 1);
      return (totalCards - index - 1) * (this.cardMargin + this.cardWidth - offset) - innerOffset;
    } else {
      return (totalCards - index - 1) * (this.cardMargin + this.cardWidth) + this.cardMargin * 2 - innerOffset;
    }
  }

  private readonly onDisplayCardFocused = (index: number) =>
    mobx.action(() => {
      this.focusedCardIndex = index;
    });

  @mobx.action
  private readonly onDisplayCardLeft = () => {
    this.focusedCardIndex = undefined;
  };

  render() {
    return (
      <div className={styles.displayedCards} ref={this.displayedCardsRef}>
        {this.props.store.displayedCards.map((displayCard, index) => (
          <ClientCard
            id={displayCard.animationPlayed ? undefined : displayCard.card.Id.toString()}
            imageLoader={this.props.imageLoader}
            key={index}
            card={displayCard.card}
            tags={displayCard.tag}
            width={this.cardWidth}
            offsetLeft={this.calculateDisplayedCardOffset(this.props.store.displayedCards.length, index)}
            translator={this.props.translator}
            className={classNames(styles.displayedCard, {
              [styles.darken]: displayCard.buried,
              [styles.focused]: this.focusedCardIndex === index,
            })}
            onMouseEnter={this.onDisplayCardFocused(index)}
            onMouseLeave={this.onDisplayCardLeft}
            style={this.props.store.displayedCardsAnimationStyles[displayCard.card.Id]}
          />
        ))}
      </div>
    );
  }
}
