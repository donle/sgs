import { Card, CardId, CardProps } from 'core/cards/card';

type ClientCardProps = CardProps & {
  imagePath: string;
  soundTrackUrl?: string;
};

export abstract class ClientCard extends Card {
  protected imagePath: string;
  protected soundTrackUrl: string | undefined;

  constructor(id: CardId, props: ClientCardProps) {
    const { imagePath, soundTrackUrl, ...baseProps } = props;
    super(id, baseProps);

    this.imagePath = imagePath;
    this.soundTrackUrl = soundTrackUrl;
  }
}
