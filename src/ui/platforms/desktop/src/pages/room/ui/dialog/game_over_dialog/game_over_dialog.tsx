import classNames from 'classnames';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'ui/button/button';
import { ClientCard } from 'ui/card/card';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './game_over_dialog.module.css';

const PlayerInfoTable = (props: {
  translator: ClientTranslationModule;
  players: Player[];
  imageLoader: ImageLoader;
  className?: string;
}) => {
  const [handcards, setHandcards] = React.useState<CardId[]>([]);
  const onSetHandCards = (player: Player) => () => {
    setHandcards(player.getCardIds(PlayerCardsArea.HandArea));
  };
  const onClearHandCards = () => {
    setHandcards([]);
  };
  return (
    <div className={classNames(styles.players, props.className)}>
      <div className={styles.title}>
        <span className={styles.username}>{props.translator.tr('player name')}</span>
        <span className={styles.characterName}>{props.translator.tr('character name')}</span>
        <span className={styles.role}>{props.translator.tr('role')}</span>
        <span className={styles.status}>{props.translator.tr('status')}</span>
        <span className={styles.handcards}>{props.translator.tr('handcards')}</span>
      </div>
      {props.players.map(player => (
        <div className={styles.player}>
          <span className={styles.username}>{player.Name}</span>
          <span className={styles.characterName}>{props.translator.tr(player.Character.Name)}</span>
          <span className={styles.role}>{props.translator.tr(Functional.getPlayerRoleRawText(player.Role))}</span>
          <span className={styles.status}>{props.translator.tr(player.Dead ? 'dead' : 'alive')}</span>
          <span className={styles.handcards}>
            <Button variant="primary" onMouseEnter={onSetHandCards(player)} onMouseLeave={onClearHandCards}>
              {props.translator.tr('check')}
              {handcards.length > 0 && (
                <Tooltip position={['bottom']} className={styles.tooltip}>
                  {handcards.map(cardId => (
                    <ClientCard
                      width={80}
                      card={Sanguosha.getCardById(cardId)}
                      translator={props.translator}
                      imageLoader={props.imageLoader}
                    />
                  ))}
                </Tooltip>
              )}
            </Button>
          </span>
        </div>
      ))}
    </div>
  );
};

export const GameOverDialog = (props: {
  translator: ClientTranslationModule;
  winners: Player[];
  losers: Player[];
  imageLoader: ImageLoader;
}) => {
  const { translator, winners, losers, imageLoader } = props;
  const history = useHistory();

  const backToLobby = () => history.push('/lobby');

  return (
    <div className={styles.gameOverBoard}>
      <div className={styles.winners}>
        <span className={styles.title}>{translator.tr('winners')}</span>
        <PlayerInfoTable imageLoader={imageLoader} players={winners} translator={translator} />
      </div>
      <div className={styles.losers}>
        <span className={styles.title}>{translator.tr('losers')}</span>
        <PlayerInfoTable imageLoader={imageLoader} players={losers} translator={translator} />
      </div>
      <div className={styles.actionButtons}>
        <Button variant="primary" onClick={backToLobby}>{translator.tr('back to lobby')}</Button>
      </div>
    </div>
  );
};
