import classNames from 'classnames';
import { Card } from 'core/cards/card';
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

type FlatClientCardProps = {
  translator: ClientTranslationModule;
  card: Card;
  imageLoader: ImageLoader;
  className?: string;
};

@mobxReact.observer
export class FlatClientCard extends React.PureComponent<FlatClientCardProps> {
  @mobx.observable.ref
  private equipImage: string | undefined;
  @mobx.observable.ref
  private equipName: string | undefined;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  private onTooltipOpeningTimer: NodeJS.Timer;

  @mobx.action
  async componentDidUpdate() {
    const { card, imageLoader } = this.props;
    if (this.equipName !== card.Name) {
      const { src, alt } = await imageLoader.getOthersEquipCard(card.Name);
      this.equipName = alt;
      this.equipImage = src;
    }
  }

  @mobx.action
  async componentDidMount() {
    const { card, imageLoader } = this.props;
    const { src, alt } = await imageLoader.getOthersEquipCard(card.Name);
    this.equipName = alt;
    this.equipImage = src;
  }

  @mobx.action
  private readonly openTooltip = () => {
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
  };

  render() {
    const { className, translator, card } = this.props;
    return (
      <div
        className={classNames(className, styles.flatCard)}
        onMouseEnter={this.openTooltip}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.closeTooltip}
      >
        {this.equipImage ? (
          <img className={styles.equipImage} src={this.equipImage} alt={this.equipName} />
        ) : (
          <span className={styles.equipName}>{translator.trx(card.Name)}</span>
        )}
        <span className={styles.cardSpecification}>
          <CardSuitItem suit={card.Suit} />
          <CardNumberItem className={styles.flatEquipNumber} cardNumber={card.CardNumber} isRed={card.isRed()} />
        </span>
        {this.onTooltipOpened && (
          <Tooltip position={['left', 'bottom']} className={styles.cardDescription}>
            <CardDescription translator={translator} card={card} />
          </Tooltip>
        )}
      </div>
    );
  }
}
