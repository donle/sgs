import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { PlayerInfo } from '../room.presenter';

export type DashboardProps = {
  playerInfo: PlayerInfo;
};

@mobxReact.observer
export class Dashboard extends React.Component<DashboardProps> {}
