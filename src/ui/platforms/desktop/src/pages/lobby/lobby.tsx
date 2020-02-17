import { Sanguosha } from 'core/game/engine';
import {
  GameCardExtensions,
  GameCharacterExtensions,
  GameInfo,
} from 'core/game/game_props';
import {
  LobbySocketEvent,
  LobbySocketEventPicker,
} from 'core/shares/types/server_types';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
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

    this.props.socket
      .on(
        LobbySocketEvent.VersionMismatch.toString(),
        (matched: LobbySocketEventPicker<LobbySocketEvent.VersionMismatch>) => {
          // tslint:disable-next-line:no-console
          console.log(matched);
          //TODO: stop loading room list if returns false.
        },
      )
      .on(
        LobbySocketEvent.QueryRoomList.toString(),
        mobx.action(
          (content: LobbySocketEventPicker<LobbySocketEvent.QueryRoomList>) => {
            this.roomList = content;
          },
        ),
      )
      .on(
        LobbySocketEvent.QueryRoomList.toString(),
        (event: LobbySocketEventPicker<LobbySocketEvent.GameCreated>) => {
          const history = useHistory();
          const { roomInfo, roomId } = event;
          // tslint:disable-next-line: no-console
          console.log(roomInfo);
          history.push(roomId.toString());
        },
      );
  }

  @mobx.action
  componentWillMount() {
    this.props.socket.emit(LobbySocketEvent.QueryRoomList.toString());
    this.props.socket.emit(LobbySocketEvent.QueryVersion.toString(), {
      version: Sanguosha.Version,
    });
  }

  private getTranslatePackName = (...packages: GameCharacterExtensions[]) => {
    //TODO: TBC
    return packages.join(',');
  };

  private readonly onCreateRoom = () => {
    const roomInfo: GameInfo = {
      characterExtensions: [GameCharacterExtensions.Standard],
      cardExtensions: [GameCardExtensions.Standard],
      numberOfPlayers: 2,
      roomName: 'test room name',
    };

    this.props.socket.emit(LobbySocketEvent.GameCreated.toString(), roomInfo);
  };

  createRoomDialog() {
    return (
      <div className={styles.createRoomBoard}>
        <span>
          <input type="checkbox" defaultChecked={true} />
          Standard
        </span>

        <button onClick={this.onCreateRoom}>Create a room</button>
      </div>
    );
  }

  render() {
    return (
      <div className={styles.board}>
        <div className={styles.roomList}>
          {this.roomList.length === 0 && <span>No rooms at the moment</span>}
          {this.roomList.map((roomInfo, index) => (
            <li className={styles.roomInfo} key={index}>
              <span>{roomInfo.name}</span>
              <span>{this.getTranslatePackName(...roomInfo.packages)}</span>
              <span>{`${roomInfo.activePlayers}/${roomInfo.totalPlayers}`}</span>
              {/* TODO: statuc needs to be translated */}
              <span>{roomInfo.status}</span>
            </li>
          ))}
        </div>
        {this.createRoomDialog()}
      </div>
    );
  }
}
