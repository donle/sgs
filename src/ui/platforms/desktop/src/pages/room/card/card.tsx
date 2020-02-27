import { Card } from 'core/cards/card';
import { Translation } from 'core/translations/translation_json_tool';
import * as React from 'react';
import styles from './card.module.css';

export type ClientCardProps = {
  card: Card;
  soundTracks?: string[];
  image: string;
  translator: Translation;
};

export class ClientCard extends React.Component<ClientCardProps> {
  playAudio(): string {
    const { soundTracks = [] } = this.props;
    const randomIndex = Math.round(Math.random() * soundTracks.length);
    return soundTracks[randomIndex];
  }

  render() {
    return (
      <div className={styles.clientCard}>
        <span>{this.props.card.Suit + ' ' + this.props.card.CardNumber}</span>
        <span>{this.props.translator.tr(this.props.card.Name)}</span>
      </div>
    );
  }
}
