import { clientActiveListenerEvents, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { ClientSocket } from 'core/network/socket.client';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { getImageLoader } from 'image_loader/image_loader_util';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router-dom';
import { PagePropsWithConfig } from 'types/page_props';
import { ClientCard } from 'ui/card/card';
import { GameClientProcessor } from './game_processor';
import { installService, RoomBaseService } from './install_service';
import styles from './room.module.css';
import { RoomPresenter, RoomStore } from './room.presenter';
import { Background } from './ui/background/background';
import { Banner } from './ui/banner/banner';
import { Dashboard } from './ui/dashboard/dashboard';
import { GameBoard } from './ui/gameboard/gameboard';
import { GameDialog } from './ui/game_dialog/game_dialog';
import { SeatsLayout } from './ui/seats_layout/seats_layout';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithConfig<{
    match: match<{ slug: string }>;
    translator: ClientTranslationModule;
  }>
> {
  private presenter: RoomPresenter;
  private store: RoomStore;
  private socket: ClientSocket;
  private gameProcessor: GameClientProcessor;
  private roomId: number;
  private playerName = window.localStorage.getItem('username') || 'unknown';
  private baseService: RoomBaseService;
  private imageLoader = getImageLoader(this.props.config.flavor);

  private displayedCardsRef = React.createRef<HTMLDivElement>();
  private readonly cardWidth = 120;
  private readonly cardMargin = 2;

  constructor(props: any) {
    super(props);
    const { config, match, translator } = this.props;

    this.roomId = parseInt(match.params.slug, 10);
    this.presenter = new RoomPresenter(this.imageLoader);
    this.store = this.presenter.createStore();

    const roomId = this.roomId.toString();
    this.socket = new ClientSocket(
      `${config.host.protocol}://${config.host.host}:${config.host.port}/room-${roomId}`,
      roomId,
    );
    this.baseService = installService(translator, this.store, this.imageLoader);

    this.gameProcessor = new GameClientProcessor(this.presenter, this.store, translator, this.imageLoader);
  }

  componentDidMount() {
    this.presenter.setupRoomStatus({
      playerName: this.playerName,
      socket: this.socket,
      roomId: this.roomId,
      timestamp: Date.now(),
    });

    this.socket.notify(GameEventIdentifiers.PlayerEnterEvent, {
      playerName: this.playerName,
      timestamp: this.store.clientRoomInfo.timestamp,
    });

    this.socket.on(GameEventIdentifiers.PlayerEnterRefusedEvent, () => {
      this.props.history.push('/lobby');
    });

    clientActiveListenerEvents().forEach(identifier => {
      this.socket.on(identifier, async (content: ServerEventFinder<GameEventIdentifiers>) => {
        await this.gameProcessor.onHandleIncomingEvent(identifier, content);
        this.showMessageFromEvent(content);
        this.animation(identifier, content);
        this.updateGameStatus(content);
      });
    });

    window.addEventListener('beforeunload', () => this.disconnect());
  }

  private readonly disconnect = () => {
    this.socket.notify(GameEventIdentifiers.PlayerLeaveEvent, {
      playerId: this.store.clientPlayerId,
    });
    this.socket.disconnect();
  };

  componentWillUnmount() {
    this.disconnect();
  }

  private updateGameStatus(event: ServerEventFinder<GameEventIdentifiers>) {
    const info = EventPacker.getGameRunningInfo(event);
    this.presenter.updateNumberOfDrawStack(info.numberOfDrawStack);
    this.presenter.updateGameRound(info.round);
  }

  private animation<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    this.baseService.Animation.GuideLineAnimation.animate(identifier, event);
    this.baseService.Animation.MoveCardAnimation.animate(identifier, event);
  }

  private showMessageFromEvent(event: ServerEventFinder<GameEventIdentifiers>) {
    const { messages = [], translationsMessage, unengagedMessage, engagedPlayerIds } = event;
    const { translator } = this.props;

    if (unengagedMessage && engagedPlayerIds && !engagedPlayerIds.includes(this.store.clientPlayerId)) {
      messages.push(TranslationPack.create(unengagedMessage).toString());
    } else if (translationsMessage) {
      messages.push(TranslationPack.create(translationsMessage).toString());
    }

    messages.forEach(message => {
      this.presenter.addGameLog(translator.trx(message));
    });
  }

  private calculateDisplayedCardOffset(totalCards: number, index: number) {
    const container = this.displayedCardsRef.current;
    if (!container) {
      return this.cardMargin;
    }

    const containerWidth = container.clientWidth;
    const innerOffset =
      Math.min(this.cardWidth * totalCards + this.cardMargin * (totalCards + 1), containerWidth) / 2 -
      this.cardWidth / 2;
    if (containerWidth < totalCards * (this.cardWidth + this.cardMargin)) {
      const offset = (totalCards * (this.cardWidth + this.cardMargin) - containerWidth) / (totalCards - 1);
      return (totalCards - index - 1) * (this.cardMargin + this.cardWidth - offset) - innerOffset;
    } else {
      return (totalCards - index - 1) * (this.cardMargin + this.cardWidth) + this.cardMargin * 2 - innerOffset;
    }
  }

  private getDisplayedCard() {
    return (
      <div className={styles.displayedCards} ref={this.displayedCardsRef}>
        {this.store.displayedCards.map((card, index) => (
          <ClientCard
            imageLoader={this.imageLoader}
            card={card}
            width={this.cardWidth}
            offsetLeft={this.calculateDisplayedCardOffset(this.store.displayedCards.length, index)}
            translator={this.props.translator}
            className={styles.displayedCard}
          />
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className={styles.room}>
        <Background imageLoader={this.imageLoader} />
        {this.store.selectorDialog}

        <div className={styles.incomingConversation}>{this.store.incomingConversation}</div>
        {this.store.room && (
          <div className={styles.roomBoard}>
            <Banner
              roomIndex={this.roomId}
              translator={this.props.translator}
              roomName={this.store.room.getRoomInfo().name}
              className={styles.roomBanner}
            />
            <div className={styles.mainBoard}>
              <SeatsLayout
                imageLoader={this.imageLoader}
                updateFlag={this.store.updateUIFlag}
                store={this.store}
                presenter={this.presenter}
                translator={this.props.translator}
                onClick={this.store.onClickPlayer}
                playerSelectableMatcher={this.store.playersSelectionMatcher}
                gamePad={this.getDisplayedCard()}
              />
              <div className={styles.sideBoard}>
                <GameBoard store={this.store} translator={this.props.translator} />
                <GameDialog store={this.store} presenter={this.presenter} translator={this.props.translator} />
              </div>
            </div>
            <Dashboard
              updateFlag={this.store.updateUIFlag}
              store={this.store}
              presenter={this.presenter}
              translator={this.props.translator}
              imageLoader={this.imageLoader}
              cardEnableMatcher={this.store.clientPlayerCardActionsMatcher}
              outsideCardEnableMatcher={this.store.clientPlayerOutsideCardActionsMatcher}
              onClickConfirmButton={this.store.confirmButtonAction}
              onClickCancelButton={this.store.cancelButtonAction}
              onClickFinishButton={this.store.finishButtonAction}
              onClickReforgeButton={this.store.reforgeButtonAction}
              onClick={this.store.onClickHandCardToPlay}
              onClickEquipment={this.store.onClickEquipmentToDoAction}
              onClickPlayer={this.store.onClickPlayer}
              cardSkillEnableMatcher={this.store.cardSkillsSelectionMatcher}
              playerSelectableMatcher={this.store.playersSelectionMatcher}
              onClickSkill={this.store.onClickSkill}
              isSkillDisabled={this.store.isSkillDisabled}
            />
          </div>
        )}
      </div>
    );
  }
}
