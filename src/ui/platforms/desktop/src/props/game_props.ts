export const enum LobbyButton {
  Record = 'record',
  Settings = 'settings',
  CharactersList = 'charactersList',
  Feedback = 'feedback',
  Acknowledgement = 'acknowledge',
}

export type GameSettings = {
  gameVolume: number;
  mainVolume: number;
  username: string;
}
