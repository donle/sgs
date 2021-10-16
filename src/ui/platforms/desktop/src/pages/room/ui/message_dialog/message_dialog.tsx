import classNames from 'classnames';
import { GameEventIdentifiers } from 'core/event/event';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { Button } from 'ui/button/button';
import { Input } from 'ui/input/input';
import styles from './message_dialog.module.css';

export type MessageDialogProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  connectionService: ConnectionService;
  replayMode?: boolean;
  className?: string;
  fixedHeight: number;
};

const tabOptions: ['room', 'lobby'] = ['room', 'lobby'];
const Tab = ({
  onClickTab,
  translator,
  defaultTab,
  hasIncomingMessage,
}: {
  onClickTab(tab: 'room' | 'lobby'): void;
  translator: ClientTranslationModule;
  defaultTab: 'room' | 'lobby';
  hasIncomingMessage: boolean;
}) => {
  const onTab = (tab: 'room' | 'lobby') => () => {
    setTab(tab);
    onClickTab(tab);
  };

  const [selectedTab, setTab] = React.useState<'room' | 'lobby'>(defaultTab);
  return (
    <div className={styles.tabs}>
      {tabOptions.map(tab => (
        <span
          key={tab}
          className={classNames(styles.tab, {
            [styles.selected]: tab === selectedTab,
            [styles.new]: hasIncomingMessage && tab === 'lobby',
          })}
          onClick={onTab(tab)}
        >
          {translator.tr(tab)}
        </span>
      ))}
      <span className={styles.spacer} />
    </div>
  );
};

@mobxReact.observer
export class MessageDialog extends React.Component<MessageDialogProps> {
  private userMessageDialogElementRef = React.createRef<HTMLDivElement>();
  private readonly textMessageMinHeight = 160;

  @mobx.observable.ref
  private currentTab: 'room' | 'lobby' = 'room';
  @mobx.observable.ref
  private incomingMessage: boolean = false;
  @mobx.observable.ref
  private textMessage: string | undefined;
  @mobx.observable.ref
  private hideQuickChatItems: boolean = true;
  @mobx.action
  private readonly onMessageChange = (value?: string) => {
    this.textMessage = value;
  };
  @mobx.observable.shallow
  private chatMessages: JSX.Element[] = [];

  private readonly onClickSendButton = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (this.currentTab === 'room') {
      !this.props.replayMode &&
        this.props.store.room.broadcast(GameEventIdentifiers.UserMessageEvent, {
          message: this.textMessage!,
          playerId: this.props.presenter.ClientPlayer!.Id,
        });
    } else {
      this.props.connectionService.Chat.send(this.textMessage!, this.props.presenter.ClientPlayer!.Name);
    }
    this.onMessageChange('');
  };

  componentDidMount() {
    this.chatMessages = this.props.connectionService.Chat.chatHistory().map((message, index) => {
      const date = new Date(message.timestamp);
      return (
        <span className={styles.message} key={index}>
          <b>{message.from}</b>
          {` [${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${message.message}`}
        </span>
      );
    });

    this.props.connectionService.Chat.received(
      mobx.action(chatObject => {
        this.incomingMessage = this.currentTab !== 'lobby';
        const date = new Date(chatObject.timestamp);
        this.chatMessages.push(
          <span className={styles.message}>
            <b>{chatObject.from}</b>
            {` [${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${chatObject.message}`}
          </span>,
        );
      }),
    );
  }

  private getQuickChatContents() {
    const contents:string[] = [];
    for (let i = 0; i < 23; i++) {
      contents.push('quickChat:' + i);
    }

    return contents;
  }

  componentWillUnmount() {
    this.props.connectionService.Chat.disconnect();
  }

  componentDidUpdate() {
    if (this.userMessageDialogElementRef.current) {
      this.userMessageDialogElementRef.current.scrollTop = this.userMessageDialogElementRef.current.scrollHeight;
    }
  }

  @mobx.action
  private readonly onClickTab = (tab: 'room' | 'lobby') => {
    this.incomingMessage = false;
    this.currentTab = tab;
  };

  @mobx.action
  private readonly onClickQuickChatButton = () => {
    this.hideQuickChatItems = !this.hideQuickChatItems;
  };

  @mobx.action
  private onClickQuickChatItem = (content: string) => () => {
    !this.props.replayMode &&
      this.props.store.room.broadcast(GameEventIdentifiers.UserMessageEvent, {
        message: content,
        playerId: this.props.presenter.ClientPlayer!.Id,
      });

    this.hideQuickChatItems = !this.hideQuickChatItems;
  };

  private getSkillAudios() {
    return this.props.presenter.ClientPlayer !== undefined && this.props.presenter.ClientPlayer.Character
      ? this.props.presenter
          .ClientPlayer!.Character.Skills.filter(skill => !skill.isShadowSkill())
          .reduce<string[]>((audioNames, skill) => {
            const characterName = this.props.presenter.ClientPlayer!.Character.Name;
            for (let i = 1; i <= skill.audioIndex(); i++) {
              audioNames.push(
                skill.RelatedCharacters.includes(characterName)
                  ? '$' + skill.Name + '.' + characterName + ':' + i
                  : '$' + skill.Name + ':' + i,
              );
            }

            return audioNames;
          }, [])
      : [];
  }

  render() {
    return (
      <div className={styles.chat}>
        <Tab
          onClickTab={this.onClickTab}
          translator={this.props.translator}
          hasIncomingMessage={this.incomingMessage}
          defaultTab={this.currentTab}
        />
        <div
          className={styles.messageDialog}
          ref={this.userMessageDialogElementRef}
          style={{
            minHeight: this.textMessageMinHeight,
            height: this.userMessageDialogElementRef.current
              ? `${this.userMessageDialogElementRef.current.clientHeight + this.props.fixedHeight}px`
              : undefined,
          }}
        >
          {(this.currentTab === 'room' ? this.props.store.messageLog : this.chatMessages).map((log, index) => (
            <p className={styles.messageLine} key={index}>
              {log}
            </p>
          ))}
        </div>

        <form className={classNames(styles.inputLabel, this.props.className)} onSubmit={this.onClickSendButton}>
          {!this.hideQuickChatItems ? (
            <div className={styles.quickChat}>
              {[...this.getSkillAudios(), ...(this.getQuickChatContents())].map((content, index) => (
                <div>
                  <span key={index} className={styles.quickChatItems} onClick={this.onClickQuickChatItem(content)}>
                    {this.props.translator.tr(content)}
                  </span>
                  <br />
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
          <Input
            className={styles.chatInput}
            onChange={this.onMessageChange}
            placeholder={this.props.translator.tr('please enter your text here')}
            value={this.textMessage}
          />
          <Button className={styles.sendButton} variant="primary" type="button" onClick={this.onClickQuickChatButton}>
            {this.props.translator.tr('e')}
          </Button>
          <Button className={styles.sendButton} variant="primary" disabled={!this.textMessage}>
            {this.props.translator.tr('send')}
          </Button>
        </form>
      </div>
    );
  }
}
