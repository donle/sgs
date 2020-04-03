import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';

export type PlayerDialogProps = {
  store: RoomStore;
  presenter: RoomPresenter;
};

@mobxReact.observer
export class MessageDialog extends React.Component<PlayerDialogProps> {}
