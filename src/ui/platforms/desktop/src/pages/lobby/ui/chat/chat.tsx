import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { Button } from 'ui/button/button';
import styles from './chat.module.css';

export const Chat = ({
  connectionService,
  translator,
  className,
  username,
}: {
  connectionService: ConnectionService;
  translator: ClientTranslationModule;
  username: string;
  className?: string;
}) => {
  const [messages, setMessages] = React.useState([...connectionService.Chat.chatHistory()]);
  const [typing, setTypings] = React.useState<string>('');
  const [hide, hideChat] = React.useState<boolean>(false);

  React.useEffect(() => {
    connectionService.Chat.received(message => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      connectionService.Chat.disconnect();
    };
  }, [connectionService.Chat]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypings(e.currentTarget.value);
  };

  const onSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    connectionService.Chat.send(typing, username);
    setTypings('');
  };

  const onHide = () => {
    hideChat(!hide);
  };

  return (
    <div
      className={classNames(styles.chat, className, {
        [styles.hide]: hide,
      })}
    >
      <span className={styles.hideArrow} onClick={onHide}>
        {'⬅'}
      </span>
      <div className={styles.messages}>
        {messages.map((message, index) => {
          const date = new Date(message.timestamp);
          return (
            <span className={styles.message} key={index}>
              <b>{message.from}</b>
              {` [${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]: ${message.message}`}
            </span>
          );
        })}
      </div>
      <form className={styles.inputBox} onSubmit={onSend}>
        <input className={styles.input} value={typing} onChange={onInputChange} />
        <Button variant="primary" type="submit" disabled={!typing}>
          {translator.tr('send')}
        </Button>
      </form>
    </div>
  );
};
