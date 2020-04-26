import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './username_dialog.module.css';

export type UsernameData = {
  username: string;
};

export const UsernameDialog = (props: { translator: ClientTranslationModule; onSubmit(data: UsernameData): void }) => {
  const [username, setUsername] = React.useState<string>(window.localStorage.getItem('username') || '');
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit({ username });
  };

  const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <div className={styles.usernameDialog}>
      <form onSubmit={onSubmit} className={styles.usernameForm}>
        <div className={styles.inputField}>
          <span className={styles.inputLabelText}>{props.translator.tr('please enter your username')}</span>
          <input className={styles.input} value={username} onChange={onUsernameChange} />
        </div>
        <div className={styles.submitSection}>
          <button type="submit" disabled={!username}>
            {props.translator.tr('confirm')}
          </button>
        </div>
      </form>
    </div>
  );
};
