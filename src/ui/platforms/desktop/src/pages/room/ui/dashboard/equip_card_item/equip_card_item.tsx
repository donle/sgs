import styles from './equip_card_item.module.css';
import classNames from 'classnames';
import { Card, CardType } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CardNumberItem } from 'ui/card/card_number';
import { CardSuitItem } from 'ui/card/card_suit';

import { CardDescription } from 'ui/card_description/card_description';
import { Tooltip } from 'ui/tooltip/tooltip';

type EquipCardItemProps = {
  disabled?: boolean;
  highlight?: boolean;
  card: Card;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  onClick?(selected: boolean): void;
};

@mobxReact.observer
export class EquipCardItem extends React.Component<EquipCardItemProps> {
  @mobx.observable.ref
  selected: boolean = false;
  @mobx.observable.ref
  equipCardImage: string | undefined;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  private onTooltipOpeningTimer: NodeJS.Timer;
  private cardName: string = this.props.card.Name;

  @mobx.action
  readonly onCardClick = () => {
    if (this.props.disabled === false) {
      this.selected = !this.selected;
      this.props.onClick && this.props.onClick(this.selected);
    }
  };

  @mobx.action
  getSelected() {
    if (!!this.props.disabled) {
      this.selected = false;
    }
    return this.selected;
  }

  @mobx.action
  async componentDidMount() {
    this.equipCardImage = (await this.props.imageLoader.getSlimEquipCard(this.props.card.Name)).src;
  }

  @mobx.action
  async componentDidUpdate() {
    if (this.cardName !== this.props.card.Name) {
      this.cardName = this.props.card.Name;
      this.equipCardImage = (await this.props.imageLoader.getSlimEquipCard(this.props.card.Name)).src;
    }
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
    const { card, translator, highlight } = this.props;
    return (
      <div
        className={classNames(styles.equipCardItem, {
          [styles.weapon]: card?.is(CardType.Weapon),
          [styles.armor]: card?.is(CardType.Shield),
          [styles.defenseRide]: card?.is(CardType.DefenseRide),
          [styles.offenseRide]: card?.is(CardType.OffenseRide),
          [styles.precious]: card?.is(CardType.Precious),
          [styles.selected]: this.getSelected() && !this.props.disabled,
          [styles.disabled]: highlight === undefined ? this.props.disabled : !highlight,
        })}
        onClick={this.onCardClick}
        onMouseEnter={this.openTooltip}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.closeTooltip}
      >
        {this.equipCardImage ? (
          <img src={this.equipCardImage} className={styles.equipCardImage} alt="" />
        ) : (
          <span className={styles.equipCardName}>{card && translator.tr(card.Name)}</span>
        )}
        <>
          {card && <CardSuitItem className={styles.equipCardSuit} suit={card.Suit} />}
          <CardNumberItem className={styles.equipCardNumber} cardNumber={card.CardNumber} isRed={card.isRed()} />
        </>
        {this.onTooltipOpened && (
          <Tooltip position={['left', 'bottom']}>
            <CardDescription translator={translator} card={card} />
          </Tooltip>
        )}
      </div>
    );
  }
}
