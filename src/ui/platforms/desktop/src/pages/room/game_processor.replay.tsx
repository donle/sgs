import { Card, CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder, serverResponsiveListenerEvents } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { TranslationPack } from 'core/translations/translation_json_tool';
import React from 'react';
import { GameClientProcessor } from './game_processor';
import { CardSelectorDialog } from './ui/dialog/card_selector_dialog/card_selector_dialog';
import { GameOverDialog } from './ui/dialog/game_over_dialog/game_over_dialog';

export class ReplayClientProcessor extends GameClientProcessor {
  protected eventFilter<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    if (!this.store.room.isGameOver()) {
      this.presenter.closeDialog();
      this.presenter.closeIncomingConversation();
    }
    if (!this.excludedResponsiveEvents.includes(identifier)) {
      this.presenter.clearNotifiers();
    }
  }

  protected record<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    if (this.store.inAction && !event.ignoreNotifiedStatus) {
      this.endAction();
    }
    if (serverResponsiveListenerEvents.includes(identifier)) {
      this.presenter.startAction(identifier, event);
    }
  }

  protected onHandlePhaseChangeEvent<T extends GameEventIdentifiers.PhaseChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.onPhaseTo(content.toPlayer, content.to);
    if (content.to === PlayerPhase.PrepareStage) {
      this.store.room.turnTo(content.toPlayer);
    }

    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleGameOverEvent<T extends GameEventIdentifiers.GameOverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { winnerIds, loserIds } = content;
    const winners = winnerIds.map(id => this.store.room.getPlayerById(id));
    const losers = loserIds.map(id => this.store.room.getPlayerById(id));
    this.presenter.createDialog(
      <GameOverDialog
        imageLoader={this.imageLoader}
        translator={this.translator}
        electron={this.electron}
        gameMode={this.store.room.Info.gameMode}
        winners={winners}
        losers={losers}
        disableSaveReplayButton={true}
      />,
    );
    this.presenter.broadcastUIUpdate();
    this.store.room.gameOver();
  }

  protected async onHandleAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator: this.translator,
    });
  }

  protected async onHandleAskForPinDianCardEvent<T extends GameEventIdentifiers.AskForPinDianCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator: this.translator,
    });
  }

  protected async onHandleAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.cardAmount <= 0) {
      return;
    }

    this.presenter.createIncomingConversation({
      conversation: content.conversation
        ? content.conversation
        : TranslationPack.translationJsonPatcher('please drop {0} cards', content.cardAmount).extract(),
      translator: this.translator,
    });
  }

  protected async onHandleCardUseEvent<T extends GameEventIdentifiers.CardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const from = this.store.room.getPlayerById(content.fromId);
    const card = Sanguosha.getCardById(content.cardId);
    if (!card.is(CardType.Equip)) {
      this.audioService.playCardAudio(card.Name, from.Gender, from.Character.Name);
    } else {
      this.audioService.playEquipAudio();
    }

    const tos = content.toIds?.map(toId => this.store.room.getPlayerById(toId)) as Player[];

    this.presenter.showCards(
      ...Card.getActualCards([content.cardId]).map(cardId => ({
        card: Sanguosha.getCardById(cardId),
        tag: TranslationPack.translationJsonPatcher(
          tos ? '{0} used card to {1}' : '{0} used card',
          TranslationPack.patchPlayerInTranslation(from),
          tos && TranslationPack.patchPlayerInTranslation(...tos),
        ).toString(),
      })),
    );
    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleAskForCardDisplayEvent<T extends GameEventIdentifiers.AskForCardDisplayEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { conversation } = content;

    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });
  }

  protected async onHandleAskForCardEvent<T extends GameEventIdentifiers.AskForCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { conversation } = content;
    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });
  }

  protected async onHandlePlayCardStage<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {}

  protected async onHandleAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator: this.translator,
    });
  }

  protected async onHandleAskForSkillUseEvent<T extends GameEventIdentifiers.AskForSkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.invokeSkillNames.length === 1) {
      this.presenter.createIncomingConversation({
        conversation:
          content.conversation ||
          TranslationPack.translationJsonPatcher(
            'do you want to trigger skill {0} ?',
            content.invokeSkillNames[0],
          ).extract(),
        translator: this.translator,
      });
    } else {
      const dummyHandlers: any = {};
      for (const skill of content.invokeSkillNames) {
        // tslint:disable-next-line:no-empty
        dummyHandlers[skill] = () => {};
      }

      this.presenter.createIncomingConversation({
        optionsActionHanlder: dummyHandlers,
        translator: this.translator,
        conversation: 'please choose a skill',
      });
    }
  }
  protected async onHandleAskForPeachEvent<T extends GameEventIdentifiers.AskForPeachEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator: this.translator,
    });
  }

  protected onHandleAskForChoosingCardFromPlayerEvent<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createDialog(
      <CardSelectorDialog
        imageLoader={this.imageLoader}
        options={content.options}
        translator={this.translator}
        title={content.customTitle}
      />,
    );
  }

  protected onHandleAskForChoosingCardWithConditionsEvent<
    T extends GameEventIdentifiers.AskForChoosingCardWithConditionsEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.presenter.createDialog(
      <CardSelectorDialog
        options={content.cardIds || content.customCardFields!}
        translator={this.translator}
        isCardDisabled={() => true}
        imageLoader={this.imageLoader}
        title={content.customTitle && this.translator.tr(content.customTitle)}
      />,
    );
  }

  protected onHandleAskForChoosingCardEvent<T extends GameEventIdentifiers.AskForChoosingCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const matcher = content.cardMatcher && new CardMatcher(content.cardMatcher);

    const isCardDisabled = matcher ? (card: Card) => !matcher.match(card) : undefined;
    this.presenter.createDialog(
      <CardSelectorDialog
        options={content.cardIds || content.customCardFields!}
        translator={this.translator}
        isCardDisabled={isCardDisabled}
        imageLoader={this.imageLoader}
        title={content.customTitle}
      />,
    );
  }

  protected onHandleAskForChoosingOptionsEvent<T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { options, conversation } = content;
    const actionHandlers = {};
    options.forEach(option => {
      // tslint:disable-next-line:no-empty
      actionHandlers[option] = () => {};
    });

    this.presenter.highlightCards();
    this.presenter.createIncomingConversation({
      optionsActionHanlder: actionHandlers,
      translator: this.translator,
      conversation,
    });
  }
  protected async onHandleAskForChoosingPlayerEvent<T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { conversation } = content;
    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });
  }
}
