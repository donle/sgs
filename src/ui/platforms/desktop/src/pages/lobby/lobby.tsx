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
import { Translation } from 'core/translations/translation_json_tool';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import SocketIOClient from 'socket.io-client';
import { RoomList } from 'types/lobby_types';
import { PagePropsWithHostConfig } from 'types/page_props';
import styles from './lobby.module.css';

type LobbyProps = PagePropsWithHostConfig<{
  translator: Translation;
}>;

@mobxReact.observer
export class Lobby extends React.Component<LobbyProps> {
  @mobx.observable.shallow
  private roomList: RoomList[] = [];
  @mobx.observable.ref
  private unmatchedCoreVersion = false;
  private socket = SocketIOClient(
    `${this.props.config.protocol}://${this.props.config.host}:${this.props.config.port}/lobby`,
  );

  constructor(props: LobbyProps) {
    super(props);

    this.socket
      .on(
        LobbySocketEvent.VersionMismatch.toString(),
        mobx.action(
          (
            matched: LobbySocketEventPicker<LobbySocketEvent.VersionMismatch>,
          ) => {
            this.unmatchedCoreVersion = !matched;
          },
        ),
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
        LobbySocketEvent.GameCreated.toString(),
        mobx.action(
          (event: LobbySocketEventPicker<LobbySocketEvent.GameCreated>) => {
            const { roomId } = event;
            this.props.history.push(`/room/${roomId}`);
          },
        ),
      );
  }

  @mobx.action
  UNSAFE_componentWillMount() {
    this.socket.emit(LobbySocketEvent.QueryRoomList.toString());
    this.socket.emit(LobbySocketEvent.QueryVersion.toString(), {
      version: Sanguosha.Version,
    });
  }

  private getTranslatePackName = (...packages: GameCharacterExtensions[]) => {
    return packages
      .map(pack => this.props.translator.tr(pack))
      .join(this.props.translator.tr(','));
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

        <button onClick={this.onCreateRoom}>
          {this.props.translator.tr('Create a room')}
        </button>
      </div>
    );
  }

  unmatchedView() {
    //TODO: complete unmatched view;
    return (
      <div>
        {this.props.translator.tr(
          'Unmatched core version, please update your application',
        )}
      </div>
    );
  }

  render() {
    return (
      <div className={styles.board}>
        <div className={styles.roomList}>
          {this.roomList.length === 0 && (
            <span>{this.props.translator.tr('No rooms at the moment')}</span>
          )}
          {this.unmatchedCoreVersion
            ? this.unmatchedView()
            : this.roomList.map((roomInfo, index) => (
                <li className={styles.roomInfo} key={index}>
                  <span>{roomInfo.name}</span>
                  <span>{this.getTranslatePackName(...roomInfo.packages)}</span>
                  <span>{`${roomInfo.activePlayers}/${roomInfo.totalPlayers}`}</span>
                  <span>{this.props.translator.tr(roomInfo.status)}</span>
                </li>
              ))}
        </div>
        {this.createRoomDialog()}
      </div>
    );
  }
}
