import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './card.module.css';
import { CardNumberItem } from './card_number';
import { CardSuitItem } from './card_suit';

export type ClientCardProps = {
  card?: Card;
  translator: ClientTranslationModule;
  className?: string;
  disabled?: boolean;
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
};

@mobxReact.observer
export class ClientCard extends React.Component<ClientCardProps> {
  @mobx.observable.ref
  private selected: boolean = false;

  private soundTracks: string[] = [];

  readonly onClick = mobx.action(() => {
    if (this.props.disabled === false) {
      this.selected = !this.selected;
      this.props.onSelected && this.props.onSelected(this.selected);
    }
  });

  @mobx.action
  getSelected() {
    if (!!this.props.disabled) {
      this.selected = false;
    }
    return this.selected;
  }

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

  render() {
    const { className, card, translator, tag, style = {} } = this.props;

    return (
      <div
        className={classNames(styles.clientCard, className, {
          [styles.selected]: this.getSelected() && !this.props.disabled,
        })}
        style={{
          ...this.getCardRatioSize(),
          ...style,
        }}
        onClick={this.onClick}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        onMouseMove={this.props.onMouseMove}
        onMouseLeave={this.props.onMouseLeave}
      >
        {card ? (
          <div className={styles.innerCard}>
            <div className={styles.cornerTag}>
              <CardSuitItem suit={card.Suit} />
              <CardNumberItem cardNumber={card.CardNumber} />
            </div>
            <span>{translator.tr(card.Name)}</span>
            {tag && <span className={styles.cardTag}>{translator.trx(tag)}</span>}
          </div>
        ) : (
          <div className={styles.emptyCard}>{translator.tr('New QSanguosha')}</div>
        )}
      </div>
    );
  }
}
