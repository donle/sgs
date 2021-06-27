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
import { PlayerPhaseBadge } from 'ui/badge/badge';
import { ClientCard } from 'ui/card/card';
import { CardNumberItem } from 'ui/card/card_number';
import { CardSuitItem } from 'ui/card/card_suit';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { PlayerAvatar } from '../player_avatar/player_avatar';
import { PlayingBar } from '../playing_bar/playing_bar';
import styles from './dashboard.module.css';
import { CharacterSkinInfo } from '../../../../image_loader/skins';

import { Button } from 'ui/button/button';
import { CardDescription } from 'ui/card_description/card_description';
import { Tooltip } from 'ui/tooltip/tooltip';
import armorSlot from './images/armor.png';
import defenseHorseSlot from './images/defense_horse.png';
import offenseHorseSlot from './images/offense_horse.png';
import weaponSlot from './images/weapon.png';

export type DashboardProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  updateFlag: boolean;
  imageLoader: ImageLoader;
  skinData: CharacterSkinInfo[];
  playerSelectableMatcher?(player: Player): boolean;
  onClickPlayer?(player: Player, selected: boolean): void;
  cardEnableMatcher?(card: Card): boolean;
  outsideCardEnableMatcher?(card: Card): boolean;
  cardSkillEnableMatcher?(card: Card): boolean;
  onClick?(card: Card, selected: boolean): void;
  onClickEquipment?(card: Card, selected: boolean): void;
  onClickConfirmButton?(): void;
  onClickReforgeButton?(): void;
  onClickCancelButton?(): void;
  onClickFinishButton?(): void;
  onClickSkill?(skill: Skill, selected: boolean): void;
  isSkillDisabled(skill: Skill): boolean;
};

type EquipCardItemProps = {
  disabled?: boolean;
  highlight?: boolean;
  card: Card;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  onClick?(selected: boolean): void;
};

@mobxReact.observer
export class EquipCardItem extends React.Component<EquipCardItemProps> {
  @mobx.observable.ref
  selected: boolean = false;
  @mobx.observable.ref
  equipCardImage: string | undefined;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  private onTooltipOpeningTimer: NodeJS.Timer;
  private cardName: string = this.props.card.Name;

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

  @mobx.action
  async componentDidMount() {
    this.equipCardImage = (await this.props.imageLoader.getSlimEquipCard(this.props.card.Name)).src;
  }

  @mobx.action
  async componentDidUpdate() {
    if (this.cardName !== this.props.card.Name) {
      this.cardName = this.props.card.Name;
      this.equipCardImage = (await this.props.imageLoader.getSlimEquipCard(this.props.card.Name)).src;
    }
  }

  @mobx.action
  private readonly openTooltip = () => {
    this.onTooltipOpeningTimer = setTimeout(() => {
      this.onTooltipOpened = true;
    }, 1000);
  };
  @mobx.action
  private readonly closeTooltip = () => {
    this.onTooltipOpeningTimer && clearTimeout(this.onTooltipOpeningTimer);
    this.onTooltipOpened = false;
  };

  private readonly onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (this.onTooltipOpened) {
      this.closeTooltip();
    }
  };

  render() {
    const { card, translator, highlight } = this.props;
    return (
      <div
        className={classNames(styles.equipCardItem, {
          [styles.weapon]: card?.is(CardType.Weapon),
          [styles.armor]: card?.is(CardType.Armor),
          [styles.defenseRide]: card?.is(CardType.DefenseRide),
          [styles.offenseRide]: card?.is(CardType.OffenseRide),
          [styles.precious]: card?.is(CardType.Precious),
          [styles.selected]: this.getSelected() && !this.props.disabled,
          [styles.disabled]: highlight === undefined ? this.props.disabled : !highlight,
        })}
        onClick={this.onCardClick}
        onMouseEnter={this.openTooltip}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.closeTooltip}
      >
        {this.equipCardImage ? (
          <img src={this.equipCardImage} className={styles.equipCardImage} alt="" />
        ) : (
          <span className={styles.equipCardName}>{card && translator.tr(card.Name)}</span>
        )}
        <>
          {card && <CardSuitItem className={styles.equipCardSuit} suit={card.Suit} />}
          <CardNumberItem className={styles.equipCardNumber} cardNumber={card.CardNumber} isRed={card.isRed()} />
        </>
        {this.onTooltipOpened && (
          <Tooltip position={['left', 'bottom']}>
            <CardDescription translator={translator} card={card} />
          </Tooltip>
        )}
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
      const numOfHandCards =
        presenter.ClientPlayer.getCardIds(PlayerCardsArea.HandArea).length + this.AvailableOutsideCards.length;
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
      <div className={styles.equipSection}>
        <div className={styles.equipSlots}>
          <img className={styles.weaponSlot} src={weaponSlot} alt="" />
          <img className={styles.armorSlot} src={armorSlot} alt="" />
          <img className={styles.defenseHorseSlot} src={defenseHorseSlot} alt="" />
          <img className={styles.offenseHorseSlot} src={offenseHorseSlot} alt="" />
        </div>
        {equipCards?.map(card => (
          <EquipCardItem
            imageLoader={this.props.imageLoader}
            translator={this.props.translator}
            card={card}
            key={card.Id}
            onClick={this.onClickEquipment(card)}
            disabled={!this.props.cardSkillEnableMatcher || !this.props.cardSkillEnableMatcher(card)}
            highlight={this.props.store.highlightedCards}
          />
        ))}
      </div>
    );
  }

  get AvailableOutsideCards() {
    if (!this.props.outsideCardEnableMatcher || !this.props.presenter.ClientPlayer) {
      return [];
    }

    const availableCards: { areaName; card: Card }[] = [];
    for (const [areaName, cards] of Object.entries(this.props.presenter.ClientPlayer.getOutsideAreaCards())) {
      if (this.props.presenter.ClientPlayer.isCharacterOutsideArea(areaName)) {
        continue;
      }

      availableCards.push(
        ...cards
          .filter(card => this.props.outsideCardEnableMatcher!(Sanguosha.getCardById(card)))
          .map(cardId => ({
            areaName,
            card: Sanguosha.getCardById(cardId),
          })),
      );
    }

    return availableCards;
  }

  get AllClientHandCards() {
    const outsideCards = this.AvailableOutsideCards.map((cardInfo, index) => {
      const leftOffset = index * (this.handCardWidth + this.cardOffset);
      return (
        <ClientCard
          imageLoader={this.props.imageLoader}
          key={cardInfo.card.Id}
          width={this.handCardWidth}
          offsetLeft={leftOffset}
          translator={this.props.translator}
          card={cardInfo.card}
          highlight={this.props.store.highlightedCards}
          onSelected={this.onClick(cardInfo.card)}
          tag={this.props.translator.tr(cardInfo.areaName)}
          className={styles.handCard}
          disabled={!this.props.outsideCardEnableMatcher || !this.props.outsideCardEnableMatcher(cardInfo.card)}
          selected={this.props.store.selectedCards.includes(cardInfo.card.Id)}
        />
      );
    });

    const handcards =
      this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.HandArea).map((cardId, index) => {
        const card = Sanguosha.getCardById(cardId);
        const leftOffset = (index + outsideCards.length) * (this.handCardWidth + this.cardOffset);
        return (
          <ClientCard
            imageLoader={this.props.imageLoader}
            key={cardId}
            width={this.handCardWidth}
            offsetLeft={leftOffset}
            translator={this.props.translator}
            card={card}
            highlight={this.props.store.highlightedCards}
            onSelected={this.onClick(card)}
            className={styles.handCard}
            disabled={!this.props.cardEnableMatcher || !this.props.cardEnableMatcher(card)}
            selected={this.props.store.selectedCards.includes(card.Id)}
          />
        );
      }) || [];

    return [...outsideCards, ...handcards];
  }

  getPlayerJudgeCards() {
    return (
      <div className={styles.judges}>
        {this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.JudgeArea).map(cardId => (
          <DelayedTrickIcon
            key={cardId}
            imageLoader={this.props.imageLoader}
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
        {this.props.store.inAction && (
          <PlayingBar className={styles.playBar} playTime={this.props.store.notificationTime} />
        )}
        {this.getPlayerJudgeCards()}
        <div className={styles.userActionsButtons}>
          {!this.props.store.canReforge && (
            <Button
              variant="primaryStatic"
              disabled={!this.props.store.actionButtonStatus.confirm}
              onClick={this.props.onClickConfirmButton}
            >
              {this.props.translator.tr('confirm')}
            </Button>
          )}
          {this.props.store.canReforge && (
            <Button
              variant="primaryStatic"
              disabled={!this.props.store.actionButtonStatus.reforge}
              onClick={this.props.onClickReforgeButton}
            >
              {this.props.translator.tr('reforge')}
            </Button>
          )}
          <Button
            variant="primaryStatic"
            disabled={!this.props.store.actionButtonStatus.cancel}
            onClick={this.props.onClickCancelButton}
          >
            {this.props.translator.tr('cancel')}
          </Button>
          <Button
            variant="secondaryStatic"
            disabled={!this.props.store.actionButtonStatus.finish}
            onClick={this.props.onClickFinishButton}
          >
            {this.props.translator.tr('finish')}
          </Button>
        </div>
        <div className={styles.handCards}>
          {this.AllClientHandCards}
          <div
            className={classNames(styles.trustedCover, {
              [styles.hide]: !this.props.presenter.ClientPlayer!.isTrusted(),
            })}
          >
            {this.props.translator.tr('in trusted')}
          </div>
        </div>
      </div>
    );
  }

  private readonly onCloseIncomingMessage = (player: Player) => () => {
    this.props.presenter.onIncomingMessage(player.Id);
    this.forceUpdate();
  };

  private readonly onTrusted = () => {
    const player = this.props.presenter.ClientPlayer!;
    if (player.isTrusted()) {
      this.props.store.room.emitStatus('player', player.Id);
    } else {
      this.props.store.room.emitStatus('trusted', player.Id);
    }
  };

  render() {
    const player = this.props.presenter.ClientPlayer!;
    return (
      <div className={styles.dashboard} id={this.props.store.clientPlayerId}>
        <Button
          variant="primary"
          className={styles.trustedButton}
          onClick={this.onTrusted}
          disabled={!this.props.store.room.isPlaying() || this.props.store.room.isGameOver()}
        >
          {this.props.translator.tr(player.isTrusted() ? 'cancel trusted' : 'trusted')}
        </Button>
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
          delight={this.props.store.delightedPlayers !== undefined ? this.props.store.delightedPlayers : undefined}
          disabled={!this.props.playerSelectableMatcher || !this.props.playerSelectableMatcher(player)}
          onClick={this.props.onClickPlayer}
          store={this.props.store}
          skinData={this.props.skinData}
          presenter={this.props.presenter}
          translator={this.props.translator}
          onClickSkill={this.props.onClickSkill}
          isSkillDisabled={this.props.isSkillDisabled}
          incomingMessage={this.props.store.incomingUserMessages[player.Id]}
          onCloseIncomingMessage={this.onCloseIncomingMessage(player)}
          selected={this.props.store.selectedPlayers.includes(player)}
        />
      </div>
    );
  }
}
