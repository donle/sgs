import { OptionPromptProps } from 'core/event/event.server';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './conversation.module.css';

export type ConversationProps = {
  translator: ClientTranslationModule;
  conversation: string | PatchedTranslationObject;
  optionsActionHanlder?: {
    [option: string]: () => void;
  };
  optionPrompt?: OptionPromptProps[];
};

@mobxReact.observer
export class Conversation extends React.Component<ConversationProps> {
  @mobx.observable.ref
  onTooltipOpened: string | undefined;

  private readonly onOpenTooltip = (option: string) =>
    mobx.action(() => {
      this.onTooltipOpened = option;
    });

  private readonly onCloseTooltip = () =>
    mobx.action(() => {
      this.onTooltipOpened = undefined;
    });

  private getActions = () => {
    const { optionsActionHanlder = {}, translator, optionPrompt } = this.props;

    return Object.entries(optionsActionHanlder).map(([option, action], index) => {
      const prompt = optionPrompt && optionPrompt.find(pro => pro.option === option);
      const optionText = prompt && prompt.optionDetail ? prompt.optionDetail : option;

      return prompt && prompt.sideTip ? (
        <>
          <Button
            variant="option"
            key={index}
            className={styles.actionButton}
            onClick={action}
            onMouseEnter={this.onOpenTooltip(option)}
            onMouseLeave={this.onCloseTooltip()}
          >
            {this.onTooltipOpened === option && (
              <Tooltip position={['top']} className={styles.tooltip}>
                <span dangerouslySetInnerHTML={{ __html: translator.tr(prompt.sideTip) }} />
              </Tooltip>
            )}
            {translator.trx(optionText)}
          </Button>
        </>
      ) : (
        <Button variant="option" key={index} className={styles.actionButton} onClick={action}>
          {translator.trx(optionText)}
        </Button>
      );
    });
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
