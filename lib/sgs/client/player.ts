import { CharacterId } from 'characters/character';
import { Player, PlayerId, PlayerProps, PlayerRole } from 'core/player';

export type ClientPlayerProps = PlayerProps & {
  avatarUrl?: string;
};

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

  public get Id() {
    return this.playerId;
  }
}

export type ClientViewPlayer = {
  playerId: PlayerId;
  playerName: string;
  playerCharacterId: CharacterId;
  playerRole: PlayerRole;
};
