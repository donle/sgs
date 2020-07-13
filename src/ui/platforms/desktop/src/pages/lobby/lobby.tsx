import logoImage from 'assets/images/lobby/logo.png';
import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions, GameCharacterExtensions } from 'core/game/game_props';
import { LobbySocketEvent, LobbySocketEventPicker, RoomInfo } from 'core/shares/types/server_types';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import SocketIOClient from 'socket.io-client';
import { PagePropsWithConfig } from 'types/page_props';
import { Button } from 'ui/button/button';
import styles from './lobby.module.css';
import { CreatRoomDialog, TemporaryRoomCreationInfo } from './ui/create_room_dialog/create_room_dialog';
import { UsernameData, UsernameDialog } from './ui/username_dialog/username_dialog';

type LobbyProps = PagePropsWithConfig<{
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
  @mobx.observable.ref
  private openRoomCreationDialog = false;

  private socket = SocketIOClient(
    `${this.props.config.host.protocol}://${this.props.config.host.host}:${this.props.config.host.port}/lobby`,
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

  @mobx.action
  private readonly onCreateRoom = () => {
    this.openRoomCreationDialog = true;
  };

  private readonly onClickRefresh = () => {
    this.socket.emit(LobbySocketEvent.QueryRoomList.toString());
  };

  @mobx.action
  private readonly onChangeUsername = () => {
    this.openUsernameDialog = true;
  };

  unmatchedView() {
    //TODO: complete unmatched view;
    return <div>{this.props.translator.tr('Unmatched core version, please update your application')}</div>;
  }

  private readonly enterRoom = (roomInfo: RoomInfo) => () => {
    this.props.history.push(`/room/${roomInfo.id}`);
  };

  @mobx.action
  private readonly onUsernameDialogSubmit = (data: UsernameData) => {
    this.openUsernameDialog = false;
    window.localStorage.setItem('username', data.username);
  };

  @mobx.action
  private readonly onRoomCreated = (roomInfo: TemporaryRoomCreationInfo) => {
    this.openRoomCreationDialog = false;

    this.socket.emit(LobbySocketEvent.GameCreated.toString(), {
      characterExtensions: [
        GameCharacterExtensions.Standard,
        GameCharacterExtensions.Wind,
        GameCharacterExtensions.Fire,
        GameCharacterExtensions.Forest,
		GameCharacterExtensions.Mountain,
        GameCharacterExtensions.God,
      ],
      cardExtensions: [GameCardExtensions.Standard, GameCardExtensions.LegionFight],
      ...roomInfo,
    });
  };

  @mobx.action
  private readonly onRoomCreationCancelled = () => {
    this.openRoomCreationDialog = false;
  };

  render() {
    return (
      <div className={styles.lobby}>
        <div className={styles.board}>
          <img className={styles.logo} src={logoImage} alt={'logo'} />
          <div className={styles.functionBoard}>
            <Button
              variant="primary"
              className={styles.button}
              onClick={this.onCreateRoom}
              disabled={!window.localStorage.getItem('username')}
            >
              {this.props.translator.tr('Create a room')}
            </Button>
            <Button variant="primary" className={styles.button} onClick={this.onClickRefresh}>
              {this.props.translator.tr('Refresh room list')}
            </Button>
            <Button variant="primary" className={styles.button} onClick={this.onChangeUsername}>
              {this.props.translator.tr('Change username')}
            </Button>
          </div>
          <div className={styles.roomList}>
            {this.roomList.length === 0 && <span>{this.props.translator.tr('No rooms at the moment')}</span>}
            {this.unmatchedCoreVersion
              ? this.unmatchedView()
              : this.roomList.map((roomInfo, index) => (
                  <li className={styles.roomInfo} key={index}>
                    <span>{roomInfo.name}</span>
                    <span>{this.getTranslatePackName(...roomInfo.packages)}</span>
                    <span>{`${roomInfo.activePlayers}/${roomInfo.totalPlayers}`}</span>
                    <span>{this.props.translator.tr(roomInfo.status)}</span>
                    <span className={styles.roomActions}>
                      <button
                        onClick={this.enterRoom(roomInfo)}
                        disabled={roomInfo.activePlayers === roomInfo.totalPlayers}
                      >
                        {this.props.translator.tr('Join')}
                      </button>
                    </span>
                  </li>
                ))}
          </div>
        </div>
        <div className={styles.chatInfo}></div>
        {this.openUsernameDialog && (
          <UsernameDialog translator={this.props.translator} onSubmit={this.onUsernameDialogSubmit} />
        )}
        {this.openRoomCreationDialog && (
          <CreatRoomDialog
            translator={this.props.translator}
            onSubmit={this.onRoomCreated}
            onCancel={this.onRoomCreationCancelled}
          />
        )}
      </div>
    );
  }
}
