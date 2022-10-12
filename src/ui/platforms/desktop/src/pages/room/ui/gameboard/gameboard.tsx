import styles from './gameboard.module.css';
import classNames from 'classnames';
import { PlayerRole } from 'core/player/player_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobxReact from 'mobx-react';
import { RoomStore } from 'pages/room/room.store';
import * as React from 'react';

export type GameBoardProps = {
  store: RoomStore;
  translator: ClientTranslationModule;
  className?: number;
};

export const GameBoard = mobxReact.observer((props: GameBoardProps) => {
  const { store, translator, className } = props;
  return (
    <div className={classNames(styles.gameboard, className)}>
      <div className={styles.gameStatus}>
        <span className={styles.currentCircle}>
          {translator.trx(TranslationPack.translationJsonPatcher('circle {0}', store.currentCircle).toString())}
        </span>
        <span className={styles.numberOfDrawStack}>
          {translator.trx(
            TranslationPack.translationJsonPatcher('{0} draw cards left', store.numberOfDrawStack).toString(),
          )}
        </span>
      </div>
      <div className={styles.players}>
        <span className={classNames(styles.alivePlayer, styles.lord)}>
          {store.room.AlivePlayers.filter(player => player.Role === PlayerRole.Lord).length +
            ' ' +
            translator.tr('lord')}
        </span>
        <span className={classNames(styles.alivePlayer, styles.loyalist)}>
          {store.room.AlivePlayers.filter(player => player.Role === PlayerRole.Loyalist).length +
            ' ' +
            translator.tr('loyalist')}
        </span>
        <span className={classNames(styles.alivePlayer, styles.rebel)}>
          {store.room.AlivePlayers.filter(player => player.Role === PlayerRole.Rebel).length +
            ' ' +
            translator.tr('rebel')}
        </span>
        <span className={classNames(styles.alivePlayer, styles.renegade)}>
          {store.room.AlivePlayers.filter(player => player.Role === PlayerRole.Renegade).length +
            ' ' +
            translator.tr('renegade')}
        </span>
      </div>
    </div>
  );
});
