import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomStore } from '../waiting_room.store';
import styles from './chat_box.module.css';

export type ChatBoxProps = {
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;

};

@mobxReact.observer
export class ChatBox extends React.Component<ChatBoxProps> {
  @mobx.observable.ref
  private messages: string[] = [];

  @mobx.action
  private renderMessages() {
    return <span dangerouslySetInnerHTML={{ __html:  }} />
  }

  render () {
    return <div className={styles.container}>
      <div className={styles.messageBox}>
        {this.renderMessages()}
      </div>
    </div>
  }
}
