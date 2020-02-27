import { getNationalityRawText } from 'core/characters/character';
import { Translation } from 'core/translations/translation_json_tool';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { RoomPresenter, RoomStore } from '../room.presenter';
import styles from './player_avatar.module.css';

type PlayerAvatarProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: Translation;
};

@mobxReact.observer
export class PlayerAvatar extends React.Component<PlayerAvatarProps> {
  @mobx.computed
  get ClientPlayer() {
    return this.props.store.room.Players.find(
      player => player.Id === this.props.store.clientPlayerId,
    );
  }

  render() {
    const character = this.ClientPlayer?.CharacterId
      ? this.ClientPlayer?.Character
      : undefined;

    return (
      <div className={styles.playerCard}>
        <p>{this.ClientPlayer?.Name}</p>
        {character && (
          <div className={styles.playerCardInside}>
            <span className={styles.nationality}>
              {this.props.translator.tr(
                getNationalityRawText(character.Nationality),
              )}
            </span>
            <span>{character.Name}</span>
            <span>
              {this.ClientPlayer?.Hp}/{this.ClientPlayer?.MaxHp}
            </span>
          </div>
        )}
      </div>
    );
  }
}
