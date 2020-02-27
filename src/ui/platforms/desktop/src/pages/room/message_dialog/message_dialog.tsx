import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { RoomPresenter, RoomStore } from '../room.presenter';

export type PlayerDialogProps = {
  store: RoomStore;
  presenter: RoomPresenter;
};

@mobxReact.observer
export class MessageDialog extends React.Component<PlayerDialogProps> {}
