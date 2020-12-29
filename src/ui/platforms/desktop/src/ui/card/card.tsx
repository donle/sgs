import classNames from 'classnames';
import { Card, VirtualCard } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CardDescription } from 'ui/card_description/card_description';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './card.module.css';
import { CardNumberItem } from './card_number';
import { CardSuitItem } from './card_suit';

export type ClientCardProps = {
  card?: Card;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  className?: string;
  disabled?: boolean;
  highlight?: boolean;
  unselectable?: boolean;
  onSelected?(selected: boolean): void;
  tag?: string;
  width?: number;
  offsetLeft?: number;
  offsetTop?: number;
  style?: React.CSSProperties;
  onMouseUp?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseDown?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseMove?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseLeave?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onMouseEnter?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  ref?: string | ((instance: HTMLDivElement | null) => void) | React.RefObject<HTMLDivElement>;
  selected?: boolean;
};

@mobxReact.observer
export class ClientCard extends React.Component<ClientCardProps> {
  @mobx.observable.ref
  private cardImage: string | undefined;
  @mobx.observable.ref
  private realFlatCardImage: string | undefined;
  @mobx.observable.ref
  private originalCard: Card | undefined;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  private onTooltipOpeningTimer: NodeJS.Timer;

  private soundTracks: string[] = [];

  readonly onClick = mobx.action(() => {
    if (this.props.disabled === false) {
      this.props.onSelected && this.props.onSelected(!this.props.selected);
      this.forceUpdate();
    }
  });

  playAudio(): string {
    const randomIndex = Math.round(Math.random() * this.soundTracks.length);
    return this.soundTracks[randomIndex];
  }

  getCardRatioSize(): React.CSSProperties {
    const { width = 120, offsetLeft = 0, offsetTop = 0 } = this.props;
    const height = (width * 4) / 3;
    return {
      width,
      height,
      transform: `translate(${offsetLeft}px, ${offsetTop}px)`,
    };
  }

  @mobx.action
  private async initComponent() {
    const { card, imageLoader } = this.props;
    if (!card) {
      return;
    }

    if (card.isVirtualCard() && (card as VirtualCard).ActualCardIds.length === 1) {
      this.originalCard = Sanguosha.getCardById((card as VirtualCard).ActualCardIds[0]);
      this.realFlatCardImage = (await imageLoader.getSlimCard(card.Name)).src;
      this.cardImage = (await imageLoader.getCardImage(this.originalCard.Name)).src;
    } else {
      this.originalCard = this.props.card;
      this.cardImage = (await imageLoader.getCardImage(card.Name)).src;
    }
  }

  async componentDidMount() {
    await this.initComponent();
  }

  async componentDidUpdate() {
    await this.initComponent();
  }

  get CardComponent() {
    const { card, translator, imageLoader, tag, highlight } = this.props;
    if (!card) {
      const cardBack = imageLoader.getCardBack();
      return (
        <div className={styles.emptyCard}>
          <img src={cardBack.src} className={styles.cardImage} alt={translator.tr(cardBack.alt)} />
        </div>
      );
    }

    return (
      <div
        className={classNames(styles.innerCard, {
          [styles.disabled]: highlight === undefined ? this.props.disabled : !highlight,
        })}
      >
        {this.originalCard && (
          <div className={styles.cornerTag}>
            <CardNumberItem cardNumber={this.originalCard.CardNumber} isRed={this.originalCard.isRed()} />
            <CardSuitItem suit={this.originalCard.Suit} />
          </div>
        )}
        {this.cardImage ? (
          <img className={styles.cardImage} src={this.cardImage} alt={card.Name} />
        ) : (
          <span>{translator.tr(card.Name)}</span>
        )}
        {this.realFlatCardImage && (
          <>
            <div className={styles.flatCardNumber}>
              <CardSuitItem suit={card.Suit} />
              <CardNumberItem cardNumber={card.CardNumber} isRed={card.isRed()} />
            </div>
            <img className={styles.innterFlatCardImage} src={this.realFlatCardImage} alt={card.Name} />
          </>
        )}
        {tag && <span className={styles.cardTag}>{translator.trx(tag)}</span>}
      </div>
    );
  }

  @mobx.action
  private readonly openTooltip = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.props.onMouseEnter?.(e);
    this.onTooltipOpeningTimer = setTimeout(() => {
      this.onTooltipOpened = true;
    }, 1000);
  };
  @mobx.action
  private readonly closeTooltip = () => {
    this.onTooltipOpeningTimer && clearTimeout(this.onTooltipOpeningTimer);
    this.onTooltipOpened = false;
  };

  private readonly onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (this.onTooltipOpened) {
      this.closeTooltip();
    }

    this.props.onMouseMove && this.props.onMouseMove(e);
  };

  private readonly onMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.closeTooltip();
    this.props.onMouseLeave && this.props.onMouseLeave(e);
  };

  render() {
    const { className, style = {}, card, translator } = this.props;

    return (
      <div
        ref={this.props.ref}
        className={classNames(styles.clientCard, className, {
          [styles.selected]: this.props.selected,
        })}
        style={{
          ...this.getCardRatioSize(),
          ...style,
        }}
        onClick={this.onClick}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
        onMouseEnter={this.openTooltip}
      >
        {this.CardComponent}
        {this.onTooltipOpened && card && (
          <Tooltip position={[]} className={styles.cardDescription}>
            <CardDescription translator={translator} card={card} />
          </Tooltip>
        )}
      </div>
    );
  }
}
