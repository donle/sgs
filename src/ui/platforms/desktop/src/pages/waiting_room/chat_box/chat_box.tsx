import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomStore } from '../waiting_room.store';

export type ChatBoxProps = {
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
};

export class ChatBox extends React.Component<ChatBoxProps> {}
