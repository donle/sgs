import { GameCharacterExtensions } from 'core/game/game_props';
import {
  LobbySocketEvent,
  LobbySocketEventPicker,
} from 'core/shares/types/server_types';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { RoomList } from 'types/lobby_types';
import { PagePropsWithHostConfig } from 'types/page_props';
import styles from './lobby.module.css';

type LobbyProps = PagePropsWithHostConfig<{
  socket: SocketIOClient.Socket;
}>;

@mobxReact.observer
export class Lobby extends React.Component<LobbyProps> {
  @mobx.observable.shallow
  private roomList: RoomList[] = [];

  constructor(props: LobbyProps) {
    super(props);

    this.props.socket.on(
      LobbySocketEvent.QueryRoomList,
      mobx.action(
        (content: LobbySocketEventPicker<LobbySocketEvent.QueryRoomList>) => {
          this.roomList = content;
        },
      ),
    );
  }

  @mobx.action
  componentWillMount() {
    this.props.socket.emit(LobbySocketEvent.QueryRoomList);
  }

  private getTranslatePackName = (...packages: GameCharacterExtensions[]) => {
    //TODO: TBC
    return packages.join(',');
  };

  render() {
    return (
      <div className={styles.board}>
        <span>Lobby</span>
        <div className={styles.roomList}>
          {this.roomList.map((roomInfo, index) => (<li className={styles.roomInfo} key={index}>
          <span>{roomInfo.name}</span>
          <span>{this.getTranslatePackName(...roomInfo.packages)}</span>
          <span>{`${roomInfo.activePlayers}/${roomInfo.totalPlayers}`}</span>
          {/* TODO: statuc needs to be translated */}
          <span>{roomInfo.status}</span>
          </li>))}
        </div>
      </div>
    );
  }
}
