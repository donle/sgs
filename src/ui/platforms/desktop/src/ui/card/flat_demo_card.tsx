import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './card.module.css';

type FlatClientCardProps = {
  translator: ClientTranslationModule;
  cardName: string;
  imageLoader: ImageLoader;
  className?: string;
  onClick?(cardName: string): void;
};

@mobxReact.observer
export class FlatDemoCard extends React.Component<FlatClientCardProps> {
  @mobx.observable.ref
  private cardImage: string | undefined;
  private readonly onClick = () => {
    this.props.onClick && this.props.onClick(this.props.cardName);
  };

  @mobx.action
  async componentDidMount() {
    this.cardImage = (await this.props.imageLoader.getSlimCard(this.props.cardName)).src;
  }

  render() {
    const { className, translator, cardName } = this.props;
    return (
      <div className={classNames(className, styles.flatDemoCard)} onClick={this.onClick}>
        {this.cardImage ? (
          <img className={styles.flatCardImage} src={this.cardImage} alt={translator.tr(cardName)} />
        ) : (
          <span className={styles.flatCardName}>{translator.tr(cardName)}</span>
        )}
      </div>
    );
  }
}
