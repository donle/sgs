import { Card, CardProps } from 'core/cards/card';

export abstract class ClientCard extends Card {
  constructor(protected imagePath: string, protected soundTrackUrl?: string) {
    super();
  }
}
