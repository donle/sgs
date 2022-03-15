import classNames from 'classnames';
import { Card } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { CharacterSkinInfo } from 'skins/skins';
import { PlayerPhaseBadge } from 'ui/badge/badge';
import { AutoButton } from 'ui/button/auto_button';
import { Button } from 'ui/button/button';
import { ClientCard } from 'ui/card/card';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { JudgeAreaDisabledIcon } from '../icon/judge_area_disabled_icon';
import { PlayerAvatar } from '../player_avatar/player_avatar';
import { PlayingBar } from '../playing_bar/playing_bar';
import { AbortedCardItem } from './aborted_card_item/aborted_card_item';
import styles from './dashboard.module.css';
import { EquipCardItem } from './equip_card_item/equip_card_item';
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
  skinData?: CharacterSkinInfo[];
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
  onTrusted?(): void;
  onClickSkill?(skill: Skill, selected: boolean): void;
  isSkillDisabled(skill: Skill): boolean;
};

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
  @mobx.observable.ref
  private onFocusCardIndex: number = -1;

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

    const abortedSections = this.props.presenter.ClientPlayer?.DisabledEquipSections;

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
        {abortedSections?.map(section => (
          <AbortedCardItem key={section} imageLoader={this.props.imageLoader} abortedSection={section} />
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

  getCardYOffset(index: number) {
    if (this.onFocusCardIndex === index) {
      return this.cardOffset < 0 ? -48 : -16;
    }
  }

  private readonly onFocusCard = (index: number) =>
    mobx.action(() => {
      this.onFocusCardIndex = index;
    });

  @mobx.computed
  get AllClientHandCards() {
    const outsideCards = this.AvailableOutsideCards.map((cardInfo, index) => {
      const isSelected = this.props.store.selectedCards.includes(cardInfo.card.Id);
      const isDisabled = !this.props.outsideCardEnableMatcher || !this.props.outsideCardEnableMatcher(cardInfo.card);
      return (
        <ClientCard
          imageLoader={this.props.imageLoader}
          key={cardInfo.card.Id}
          width={this.handCardWidth}
          offsetLeft={index * (this.handCardWidth + this.cardOffset)}
          offsetTop={this.getCardYOffset(index)}
          translator={this.props.translator}
          card={cardInfo.card}
          highlight={this.props.store.highlightedCards}
          onMouseEnter={isSelected || isDisabled ? undefined : this.onFocusCard(index)}
          onMouseLeave={this.onFocusCard(-2)}
          onSelected={this.onClick(cardInfo.card)}
          tag={this.props.translator.tr(cardInfo.areaName)}
          className={styles.handCard}
          disabled={isDisabled}
          selected={isSelected}
        />
      );
    });

    const handcards =
      this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.HandArea).map((cardId, index) => {
        const card = Sanguosha.getCardById(cardId);
        const isSelected = this.props.store.selectedCards.includes(card.Id);
        const isDisabled = !this.props.cardEnableMatcher || !this.props.cardEnableMatcher(card);
        return (
          <ClientCard
            imageLoader={this.props.imageLoader}
            key={cardId}
            width={this.handCardWidth}
            offsetLeft={(index + outsideCards.length) * (this.handCardWidth + this.cardOffset)}
            offsetTop={this.getCardYOffset(index + outsideCards.length)}
            translator={this.props.translator}
            onMouseEnter={isSelected || isDisabled ? undefined : this.onFocusCard(index + outsideCards.length)}
            onMouseLeave={this.onFocusCard(-2)}
            card={card}
            highlight={this.props.store.highlightedCards}
            onSelected={this.onClick(card)}
            className={styles.handCard}
            disabled={isDisabled}
            selected={isSelected}
          />
        );
      }) || [];

    return [...outsideCards, ...handcards];
  }

  getPlayerJudgeCards() {
    const judgeAreaDisabled = this.props.presenter.ClientPlayer?.judgeAreaDisabled();

    return (
      <div className={styles.judges}>
        {judgeAreaDisabled ? <JudgeAreaDisabledIcon /> : <></>}
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
          {(this.props.store.actionButtonStatus.finish ||
            this.props.store.actionButtonStatus.cancel ||
            this.props.store.actionButtonStatus.confirm) && (
            <AutoButton
              variant="confirm"
              disabled={!this.props.store.actionButtonStatus.confirm}
              onClick={this.props.onClickConfirmButton}
            />
          )}
          {this.props.store.actionButtonStatus.cancel && (
            <AutoButton
              variant="cancel"
              disabled={!this.props.store.actionButtonStatus.cancel}
              onClick={this.props.onClickCancelButton}
            />
          )}
          {this.props.store.actionButtonStatus.finish && (
            <AutoButton
              variant="finish"
              disabled={!this.props.store.actionButtonStatus.finish}
              onClick={this.props.onClickFinishButton}
            />
          )}
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
      this.props.onTrusted?.();
    }
  };

  private readonly onSortHandcards = () => {
    const handcards = this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.HandArea) || [];
    this.props.presenter.ClientPlayer?.setupCards(PlayerCardsArea.HandArea, Functional.sortCards(handcards));
    this.props.presenter.broadcastUIUpdate();
  };

  private readonly onReverseSelectCards = () => {
    const handcards = this.props.presenter.ClientPlayer?.getCardIds(PlayerCardsArea.HandArea) || [];
    for (const cardId of handcards) {
      const card = Sanguosha.getCardById(cardId);
      this.props.store.selectedCards.includes(cardId)
        ? this.props.presenter.unselectCard(card)
        : this.props.presenter.selectCard(card);
    }

    this.props.presenter.broadcastUIUpdate();
  };

  private readonly createShortcutButtons = (player: ClientPlayer) => {
    return (
      <div className={styles.actionButtons}>
        <Button
          variant="primary"
          className={styles.actionButton}
          onClick={this.onTrusted}
          disabled={!this.props.store.room.isPlaying() || this.props.store.room.isGameOver()}
        >
          {this.props.translator.tr(player.isTrusted() ? 'cancel trusted' : 'trusted')}
        </Button>
        <Button
          variant="primary"
          className={styles.actionButton}
          onClick={this.onSortHandcards}
          disabled={!this.props.store.room.isPlaying() || this.props.store.room.isGameOver()}
        >
          {this.props.translator.tr('adjust handcards')}
        </Button>
        <Button
          variant="primary"
          className={styles.actionButton}
          onClick={this.onReverseSelectCards}
          disabled={
            !this.props.store.room.isPlaying() ||
            this.props.store.room.isGameOver() ||
            this.props.store.room.CurrentPlayer !== player ||
            this.props.store.room.CurrentPlayerPhase !== PlayerPhase.DropCardStage
          }
        >
          {this.props.translator.tr('reverse select')}
        </Button>
      </div>
    );
  };

  render() {
    const player = this.props.presenter.ClientPlayer!;
    return (
      <div className={styles.dashboard} id={this.props.store.clientPlayerId}>
        {this.createShortcutButtons(player)}
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
