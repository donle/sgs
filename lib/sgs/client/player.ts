import { Player, PlayerProps } from 'core/player';

export type ClientPlayerProps = PlayerProps & {
  avatarUrl?: string;
}

export class ClientPlayer extends Player {
  private avatarUrl: string | undefined;
  constructor(props: ClientPlayerProps) {
    const { avatarUrl, ...baseProps } = props;
    super(baseProps);

    this.avatarUrl = avatarUrl;
  }

  public get Avatar() {
    return this.avatarUrl;
  }
}
