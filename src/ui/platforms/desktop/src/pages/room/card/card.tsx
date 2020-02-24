import { Card } from 'core/cards/card';
import * as React from 'react';
import styles from './card.module.css';

export type ClientCardProps = {
  card: Card;
  soundTracks: string[];
  image: string;
};

export class ClientCard extends React.Component<ClientCardProps> {
  playAudio(): string {
    const randomIndex = Math.round(
      Math.random() * this.props.soundTracks.length,
    );
    return this.props.soundTracks[randomIndex];
  }

  render() {
    return (
      <div className={styles.clientCard}>
        <span>{this.props.card.Suit + ' ' + this.props.card.CardNumber}</span>
        <span>{this.props.card.Name}</span>
      </div>
    );
  }
}
