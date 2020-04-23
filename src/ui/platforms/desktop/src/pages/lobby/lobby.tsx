import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions, GameCharacterExtensions, GameInfo } from 'core/game/game_props';
import { LobbySocketEvent, LobbySocketEventPicker, RoomInfo } from 'core/shares/types/server_types';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import SocketIOClient from 'socket.io-client';
import { PagePropsWithHostConfig } from 'types/page_props';
import styles from './lobby.module.css';

type LobbyProps = PagePropsWithHostConfig<{
  translator: ClientTranslationModule;
}>;

@mobxReact.observer
export class Lobby extends React.Component<LobbyProps> {
  @mobx.observable.shallow
  private roomList: RoomInfo[] = [];
  @mobx.observable.ref
  private unmatchedCoreVersion = false;
  @mobx.observable.ref
  private openUsernameDialog = false;

  private socket = SocketIOClient(
    `${this.props.config.protocol}://${this.props.config.host}:${this.props.config.port}/lobby`,
  );

  private username: string | null;

  constructor(props: LobbyProps) {
    super(props);

    this.socket
      .on(
        LobbySocketEvent.VersionMismatch.toString(),
        mobx.action((matched: LobbySocketEventPicker<LobbySocketEvent.VersionMismatch>) => {
          this.unmatchedCoreVersion = !matched;
        }),
      )
      .on(
        LobbySocketEvent.QueryRoomList.toString(),
        mobx.action((content: LobbySocketEventPicker<LobbySocketEvent.QueryRoomList>) => {
          this.roomList = content;
        }),
      )
      .on(
        LobbySocketEvent.GameCreated.toString(),
        mobx.action((event: LobbySocketEventPicker<LobbySocketEvent.GameCreated>) => {
          const { roomId } = event;
          this.props.history.push(`/room/${roomId}`);
        }),
      );
  }

  @mobx.action
  componentDidMount() {
    this.username = localStorage.getItem('username');
    if (!this.username) {
      this.openUsernameDialog = true;
    }
  }

  @mobx.action
  UNSAFE_componentWillMount() {
    this.socket.emit(LobbySocketEvent.QueryRoomList.toString());
    this.socket.emit(LobbySocketEvent.QueryVersion.toString(), {
      version: Sanguosha.Version,
    });

    if (window.innerWidth < 1200) {
      window.screen.orientation.lock('landscape');
    }
  }

  private getTranslatePackName = (...packages: GameCharacterExtensions[]) => {
    return packages.map(pack => this.props.translator.tr(pack)).join(this.props.translator.tr(','));
  };

  private readonly onCreateRoom = () => {
    const roomInfo: GameInfo = {
      characterExtensions: [GameCharacterExtensions.Standard],
      cardExtensions: [GameCardExtensions.Standard],
      numberOfPlayers: 2,
      roomName: 'test room name',
    };

    this.socket.emit(LobbySocketEvent.GameCreated.toString(), roomInfo);
  };

  createRoomDialog() {
    return (
      <div className={styles.createRoomBoard}>
        <span>
          <input type="checkbox" defaultChecked={true} />
          {this.props.translator.tr(GameCardExtensions.Standard)}
        </span>

        <button onClick={this.onCreateRoom}>{this.props.translator.tr('Create a room')}</button>
      </div>
    );
  }

  unmatchedView() {
    //TODO: complete unmatched view;
    return <div>{this.props.translator.tr('Unmatched core version, please update your application')}</div>;
  }

  private readonly enterRoom = (roomInfo: RoomInfo) => () => {
    this.props.history.push(`/room/${roomInfo.id}`);
  };

  render() {
    return (
      <>
        <div className={styles.board}>
          <div className={styles.roomList}>
            {this.roomList.length === 0 && <span>{this.props.translator.tr('No rooms at the moment')}</span>}
            {this.unmatchedCoreVersion
              ? this.unmatchedView()
              : this.roomList.map((roomInfo, index) => (
                  <li className={styles.roomInfo} key={index} onClick={this.enterRoom(roomInfo)}>
                    <span>{roomInfo.name}</span>
                    <span>{this.getTranslatePackName(...roomInfo.packages)}</span>
                    <span>{`${roomInfo.activePlayers}/${roomInfo.totalPlayers}`}</span>
                    <span>{this.props.translator.tr(roomInfo.status)}</span>
                  </li>
                ))}
          </div>
          {this.createRoomDialog()}
        </div>
        {this.openUsernameDialog && <></>}
      </>
    );
  }
}
