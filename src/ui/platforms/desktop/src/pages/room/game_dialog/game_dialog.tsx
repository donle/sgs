import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { PlayerInfo, RoomPresenter, RoomStore } from '../room.presenter';

export type GameDialogProps = {
  playerInfo: PlayerInfo;
  store: RoomStore;
  presenter: RoomPresenter;
};

@mobxReact.observer
export class GameDialog extends React.Component<GameDialogProps> {}
