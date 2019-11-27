import { Card, CardProps } from 'cards/card';

type ClientCardProps = CardProps & {
  imagePath: string;
  soundTrackUrl?: string;
};

export abstract class ClientCard extends Card {
  protected imagePath: string;
  protected soundTrackUrl: string | undefined;

  constructor(props: ClientCardProps) {
    const { imagePath, soundTrackUrl, ...baseProps } = props;
    super(baseProps);

    this.imagePath = imagePath;
    this.soundTrackUrl = soundTrackUrl;
  }
}
