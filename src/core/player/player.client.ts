import { CharacterId } from 'core/characters/character';
import { Player, PlayerId, PlayerProps, PlayerRole } from 'core/player/player';

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
}

export type ClientViewPlayer = {
  playerId: PlayerId;
  playerName: string;
  playerCharacterId?: CharacterId;
  playerRole?: PlayerRole;
};
