import classNames from 'classnames';
import { Player } from 'core/player/player';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import styles from './game_over_dialog.module.css';

const PlayerInfoTable = (props: { translator: ClientTranslationModule; players: Player[]; className?: string }) => {
  return (
    <div className={classNames(styles.players, props.className)}>
      {props.players.map((player) => (
        <div className={styles.player}>
          <span>{player.Name}</span>
          <span>{props.translator.tr(player.Character.Name)}</span>
          <span>{props.translator.tr(Functional.getPlayerRoleRawText(player.Role))}</span>
          <span>{props.translator.tr(player.Dead ? 'dead' : 'alive')}</span>
        </div>
      ))}
    </div>
  );
};

export const GameOverDialog = (props: { translator: ClientTranslationModule; winners: Player[]; losers: Player[] }) => {
  const { translator, winners, losers } = props;
  const history = useHistory();

  const backToLobby = () => history.push('/lobby');

  return (
    <div className={styles.gameOverBoard}>
      <div className={styles.winners}>
        <span className={styles.title}>{translator.tr('winners')}</span>
        <PlayerInfoTable players={winners} translator={translator} />
      </div>
      <div className={styles.losers}>
        <span className={styles.title}>{translator.tr('losers')}</span>
        <PlayerInfoTable players={losers} translator={translator} />
      </div>
      <div className={styles.actionButtons}>
        <button onClick={backToLobby}>{translator.tr('back to lobby')}</button>
      </div>
    </div>
  );
};
