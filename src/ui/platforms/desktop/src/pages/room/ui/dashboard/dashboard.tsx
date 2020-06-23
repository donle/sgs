import classNames from 'classnames';
import { Card, CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { PlayerPhaseBadge } from '../badge/badge';
import { ClientCard } from '../card/card';
import { CardSuitItem } from '../card/card_suit';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { PlayerAvatar } from '../player_avatar/player_avatar';
import { PlayingBar } from '../playing_bar/playing_bar';
import styles from './dashboard.module.css';

export type DashboardProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  updateFlag: boolean;
  imageLoader: ImageLoader;
  playerSelectableMatcher?(player: Player): boolean;
  onClickPlayer?(player: Player, selected: boolean): void;
  cardEnableMatcher?(card: Card): boolean;
  cardSkillEnableMatcher?(card: Card): boolean;
  onClick?(card: Card, selected: boolean): void;
  onClickEquipment?(card: Card, selected: boolean): void;
  onClickConfirmButton?(): void;
  onClickCancelButton?(): void;
  onClickFinishButton?(): void;
  onClickSkill?(skill: Skill, selected: boolean): void;
  isSkillDisabled(skill: Skill): boolean;
};

type EquipCardItemProps = {
  disabled?: boolean;
  card?: Card;
  translator: ClientTranslationModule;
  onClick?(selected: boolean): void;
};

@mobxReact.observer
export class EquipCardItem extends React.Component<EquipCardItemProps> {
  @mobx.observable.ref
  selected: boolean = false;

  @mobx.action
  readonly onCardClick = () => {
    if (this.props.disabled === false) {
      this.selected = !this.selected;
      this.props.onClick && this.props.onClick(this.selected);
    }
  };

  @mobx.action
  getSelected() {
    if (!!this.props.disabled) {
      this.selected = false;
    }
    return this.selected;
  }

  render() {
    const { card, translator } = this.props;
    return (
      <div
        className={classNames(styles.equipCardItem, {
          [styles.weapon]: card?.is(CardType.Weapon),
          [styles.armor]: card?.is(CardType.Armor),
          [styles.defenseRide]: card?.is(CardType.DefenseRide),
          [styles.offenseRide]: card?.is(CardType.OffenseRide),
          [styles.precious]: card?.is(CardType.Precious),
          [styles.selected]: this.getSelected() && !this.props.disabled,
        })}
        onClick={this.onCardClick}
      >
        <span className={styles.equipCardName}>{card && translator.tr(card.Name)}</span>
        {card && <CardSuitItem className={styles.equipCardSuit} suit={card.Suit} />}
        <span className={styles.equipCardNumber}>{card && ClientTranslationModule.getCardNumber(card.CardNumber)}</span>
      </div>
    );
  }
}

@mobxReact.observer
export class Dashboard extends React.Component<DashboardProps> {
  private readonly onClick = (card: Card) => (selected: boolean) => {
    this.props.onClick && this.props.onClick(card, selected);
  };
  private readonly onClickEquipment = (card: Card) => (selected: boolean) => {
    this.props.onClickEquipment && this.props.onClickEquipment(card, selected);
  };

  @mobx.observable.ref
  private cardOffset: number = 0;

  private handBoardRef = React.createRef<HTMLDivElement>();
  private readonly handCardWidth = 120;
  private readonly cardMargin = 2;

  @mobx.action
  componentDidUpdate() {
    const { presenter } = this.props;
    if (this.handBoardRef.current && presenter.ClientPlayer) {
      const width = this.handBoardRef.current.clientWidth;
      const numOfHandCards = presenter.ClientPlayer.getCardIds(PlayerCardsArea.HandArea).length;
      if (width < numOfHandCards * (this.handCardWidth + this.cardMargin)) {
        this.cardOffset = -(numOfHandCards * (this.handCardWidth + this.cardMargin) - width) / (numOfHandCards - 1);
      } else {
        this.cardOffset = this.cardMargin;
      }
    }
  }

  getEquipCardsSection() {
    const equipCards = this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.EquipArea).map(cardId =>
      Sanguosha.getCardById<EquipCard>(cardId),
    );

    return (
      <>
        {equipCards && (
          <div className={styles.equipSection}>
            {equipCards.map(card => (
              <EquipCardItem
                translator={this.props.translator}
                card={card}
                onClick={this.onClickEquipment(card)}
                disabled={!this.props.cardSkillEnableMatcher || !this.props.cardSkillEnableMatcher(card)}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  getAllClientHandCards() {
    return this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.HandArea).map((cardId, index) => {
      const card = Sanguosha.getCardById(cardId);
      const leftOffset = index * (this.handCardWidth + this.cardOffset);
      return (
        <ClientCard
          imageLoader={this.props.imageLoader}
          key={cardId}
          width={this.handCardWidth}
          offsetLeft={leftOffset}
          translator={this.props.translator}
          card={card}
          onSelected={this.onClick(card)}
          className={styles.handCard}
          disabled={!this.props.cardEnableMatcher || !this.props.cardEnableMatcher(card)}
        />
      );
    });
  }

  getPlayerJudgeCards() {
    return (
      <div className={styles.judges}>
        {this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.JudgeArea).map(cardId => (
          <DelayedTrickIcon
            key={cardId}
            card={Sanguosha.getCardById(cardId)}
            translator={this.props.translator}
            className={styles.judgeNames}
          />
        ))}
      </div>
    );
  }

  getPlayerHandBoard() {
    return (
      <div className={styles.handBoard} ref={this.handBoardRef}>
        {this.props.store.inAction && <PlayingBar className={styles.playBar} />}
        {this.getPlayerJudgeCards()}
        <div className={styles.userActionsButtons}>
          <button disabled={!this.props.store.actionButtonStatus.confirm} onClick={this.props.onClickConfirmButton}>
            {this.props.translator.tr('confirm')}
          </button>
          <button disabled={!this.props.store.actionButtonStatus.cancel} onClick={this.props.onClickCancelButton}>
            {this.props.translator.tr('cancel')}
          </button>
          <button disabled={!this.props.store.actionButtonStatus.finish} onClick={this.props.onClickFinishButton}>
            {this.props.translator.tr('finish')}
          </button>
        </div>
        <div className={styles.handCards}>{this.getAllClientHandCards()}</div>
      </div>
    );
  }

  render() {
    const player = this.props.presenter.ClientPlayer!;
    return (
      <div className={styles.dashboard} id={this.props.store.clientPlayerId}>
        {this.getEquipCardsSection()}

        {this.props.store.room.CurrentPlayer === player && this.props.store.room.CurrentPlayerPhase !== undefined && (
          <PlayerPhaseBadge
            stage={this.props.store.room.CurrentPlayerPhase}
            translator={this.props.translator}
            className={styles.playerPhaseStage}
          />
        )}
        {this.getPlayerHandBoard()}
        <PlayerAvatar
          imageLoader={this.props.imageLoader}
          updateFlag={this.props.store.updateUIFlag}
          disabled={!this.props.playerSelectableMatcher || !this.props.playerSelectableMatcher(player)}
          onClick={this.props.onClickPlayer}
          store={this.props.store}
          presenter={this.props.presenter}
          translator={this.props.translator}
          onClickSkill={this.props.onClickSkill}
          isSkillDisabled={this.props.isSkillDisabled}
        />
      </div>
    );
  }
}
