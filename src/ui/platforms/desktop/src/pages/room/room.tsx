import { clientActiveListenerEvents, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { ClientSocket } from 'core/network/socket.client';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router-dom';
import { PagePropsWithHostConfig } from 'types/page_props';
import { GameClientProcessor } from './game_processor';
import styles from './room.module.css';
import { RoomPresenter, RoomStore } from './room.presenter';
import { ClientCard } from './ui/card/card';
import { Dashboard } from './ui/dashboard/dashboard';
import { GameDialog } from './ui/game_dialog/game_dialog';
import { SeatsLayout } from './ui/seats_layout/seats_layout';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithHostConfig<{
    match: match<{ slug: string }>;
    translator: ClientTranslationModule;
  }>
> {
  private presenter: RoomPresenter;
  private store: RoomStore;
  private socket: ClientSocket;
  private gameProcessor: GameClientProcessor;
  private roomId: number;

  private displayedCardsRef = React.createRef<HTMLDivElement>();
  private readonly cardWidth = 120;
  private readonly cardMargin = 2;
  @mobx.observable.ref
  private cardOffset = 0;

  constructor(props: any) {
    super(props);

    this.roomId = parseInt(this.props.match.params.slug, 10);
    this.presenter = new RoomPresenter();
    this.store = this.presenter.createStore();
    this.socket = new ClientSocket(this.props.config, this.roomId);

    this.gameProcessor = new GameClientProcessor(this.presenter, this.store, this.props.translator);
  }

  componentDidMount() {
    const playerName = 'test' + Date.now();

    this.presenter.setupRoomStatus({
      playerName,
      socket: this.socket,
      roomId: this.roomId,
      timestamp: Date.now(),
    });

    this.socket.notify(GameEventIdentifiers.PlayerEnterEvent, {
      playerName,
      timestamp: this.store.clientRoomInfo.timestamp,
    });

    this.socket.on(GameEventIdentifiers.PlayerEnterRefusedEvent, () => {
      this.props.history.push('/lobby');
    });

    clientActiveListenerEvents().forEach(identifier => {
      this.socket.on(identifier, async (content: ServerEventFinder<GameEventIdentifiers>) => {
        await this.gameProcessor.onHandleIncomingEvent(identifier, content);
        this.showMessageFromEvent(content);
      });
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  private showMessageFromEvent(event: ServerEventFinder<GameEventIdentifiers>) {
    const { messages = [], translationsMessage } = event;
    const { translator } = this.props;

    if (translationsMessage) {
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
            card={card}
            width={this.cardWidth}
            offset={this.calculateDisplayedCardOffset(this.store.displayedCards.length, index)}
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
        {this.store.selectorDialog}

        <div className={styles.incomingConversation}>{this.store.incomingConversation}</div>
        {this.store.room && (
          <div className={styles.roomBoard}>
            <div className={styles.mainBoard}>
              <SeatsLayout
                updateFlag={this.store.updateUIFlag}
                store={this.store}
                presenter={this.presenter}
                translator={this.props.translator}
                onClick={this.store.onClickPlayer}
                playerSelectableMatcher={this.store.playersSelectionMatcher}
                gamePad={this.getDisplayedCard()}
              />
              <div className={styles.sideBoard}>
                <GameDialog store={this.store} presenter={this.presenter} translator={this.props.translator} />
              </div>
            </div>
            <Dashboard
              updateFlag={this.store.updateUIFlag}
              store={this.store}
              presenter={this.presenter}
              translator={this.props.translator}
              cardEnableMatcher={this.store.clientPlayerCardActionsMatcher}
              onClickConfirmButton={this.store.confirmButtonAction}
              onClickCancelButton={this.store.cancelButtonAction}
              onClickFinishButton={this.store.finishButtonAction}
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
