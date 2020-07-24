import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
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

  render() {
    const { className, translator, card } = this.props;
    return (
      <div className={classNames(className, styles.flatCard)}>
        {this.equipImage ? (
          <img className={styles.equipImage} src={this.equipImage} alt={this.equipName} />
        ) : (
          <span className={styles.equipName}>{translator.trx(card.Name)}</span>
        )}
        <CardSuitItem suit={card.Suit} />
        <CardNumberItem className={styles.flatEquipNumber} cardNumber={card.CardNumber} isRed={card.isRed()} />
      </div>
    );
  }
}
