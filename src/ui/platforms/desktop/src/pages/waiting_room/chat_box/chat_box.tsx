import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { WaitingRoomSender } from '../services/sender_service';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomStore } from '../waiting_room.store';
import styles from './chat_box.module.css';
import { Messages } from './messages';

export type ChatBoxProps = {
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
  senderService: WaitingRoomSender;
  playerName: string;
};

@mobxReact.observer
export class ChatBox extends React.Component<ChatBoxProps> {
  @mobx.observable.ref
  private typing: string;

  @mobx.action
  private readonly onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.typing = e.currentTarget.value;
  };

  @mobx.action
  private readonly onSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.props.senderService.sendChat(this.props.playerName, this.typing);
    this.typing = '';
  };

  @mobx.computed
  private get Messages() {
    return this.props.store.chatMessages.map((message, index) => {
      const date = new Date(message.timestamp);
      return (
        <span className={styles.message} key={index}>
          <b>{message.from}</b>
          {`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${message.message}`}
        </span>
      );
    });
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.messageBox}>{this.Messages}</div>
        <form className={styles.userInput} onSubmit={this.onSend}>
          <input className={styles.input} value={this.typing} onChange={this.onInputChange} />
          <Button className={styles.sendButton} variant="primary" type="submit">
            {this.props.translator.tr(Messages.send())}
          </Button>
        </form>
      </div>
    );
  }
}
