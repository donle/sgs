import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Button } from 'ui/button/button';
import styles from './conversation.module.css';

export type ConversationProps = {
  translator: ClientTranslationModule;
  conversation: string | PatchedTranslationObject;
  optionsActionHanlder?: {
    [option: string]: () => void;
  };
};

@mobxReact.observer
export class Conversation extends React.Component<ConversationProps> {
  private getActions = () => {
    const { optionsActionHanlder = {}, translator } = this.props;
    return Object.entries(optionsActionHanlder).map(([option, action], index) => (
      <Button variant="option" key={index} className={styles.actionButton} onClick={action}>
        {translator.trx(option)}
      </Button>
    ));
  };

  render() {
    const { translator, conversation } = this.props;
    return (
      <div className={styles.conversation}>
        <h3 className={styles.conversationText}>
          {translator.trx(
            typeof conversation === 'string' ? conversation : TranslationPack.create(conversation).toString(),
          )}
        </h3>
        <div className={styles.actions}>{this.getActions()}</div>
      </div>
    );
  }
}
