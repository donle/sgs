import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './card.module.css';

type FlatClientCardProps = {
  translator: ClientTranslationModule;
  cardName: string;
  className?: string;
  onClick?(cardName: string): void;
};

export class FlatDemoCard extends React.Component<FlatClientCardProps> {
  private readonly onClick = () => {
    this.props.onClick && this.props.onClick(this.props.cardName);
  };
  render() {
    const { className, translator, cardName } = this.props;
    return (
      <div className={classNames(className, styles.flatDemoCard)} onClick={this.onClick}>
        <span className={styles.flatCardName}>{translator.trx(cardName)}</span>
      </div>
    );
  }
}
