import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { BaseAction } from './base_action';

export class CardResponseAction extends BaseAction {
  public static isSkillsOnCardResponseDisabled = (matcher: CardMatcher) => (skill: Skill) => {
    if (skill instanceof TriggerSkill) {
      return false;
    } else if (skill instanceof ViewAsSkill) {
      return !new CardMatcher({ name: skill.canViewAs() }).match(matcher);
    }

    return true;
  };

  private askForEvent: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>;

  constructor(
    playerId: PlayerId,
    store: RoomStore,
    presenter: RoomPresenter,
    askForEvent: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>,
  ) {
    super(playerId, store, presenter, undefined);
    this.askForEvent = askForEvent;

    if (!EventPacker.isUncancellabelEvent(this.askForEvent)) {
      this.presenter.enableActionButton('cancel');
    }
  }

  isCardEnabledOnResponse(card: Card, fromArea: PlayerCardsArea, matcher: CardMatcher) {
    if (EventPacker.isDisresponsiveEvent(this.askForEvent)) {
      return false;
    }

    if (
      card.Id === this.selectedCardToPlay ||
      card.Id === this.equipSkillCardId ||
      this.pendingCards.includes(card.Id) ||
      this.selectedCards.includes(card.Id)
    ) {
      return true;
    }

    if (this.selectedSkillToPlay !== undefined) {
      const skill = this.selectedSkillToPlay;
      if (skill instanceof ViewAsSkill) {
        const player = this.store.room.getPlayerById(this.playerId);
        return (
          skill.isAvailableCard(this.store.room, player, card.Id, this.pendingCards, this.equipSkillCardId) &&
          (!skill.cardFilter(this.store.room, player, this.pendingCards) ||
            skill.cardFilter(this.store.room, player, [...this.pendingCards, card.Id]))
        );
      } else {
        return false;
      }
    }
    this.askForEvent.fromArea = this.askForEvent.fromArea || [PlayerCardsArea.HandArea];
    if (this.selectedCardToPlay === undefined) {
      if (fromArea === PlayerCardsArea.HandArea && this.askForEvent.fromArea.includes(PlayerCardsArea.HandArea)) {
        return matcher.match(card);
      } else if (
        fromArea === PlayerCardsArea.EquipArea &&
        this.askForEvent.fromArea.includes(PlayerCardsArea.HandArea)
      ) {
        if (card.Skill instanceof ViewAsSkill) {
          return new CardMatcher({ name: card.Skill.canViewAs() }).match(new CardMatcher(this.askForEvent.cardMatcher));
        }
      }
    }

    return false;
  }

  enableToCallAction() {
    const card = this.selectedCardToPlay === undefined ? undefined : Sanguosha.getCardById(this.selectedCardToPlay);
    if (card && CardMatcher.match(this.askForEvent.cardMatcher, card)) {
      return true;
    }

    return false;
  }

  onResetAction() {
    this.presenter.closeIncomingConversation();
  }

  onPlay(translator: ClientTranslationModule) {
    this.presenter.createIncomingConversation({
      conversation: this.askForEvent.conversation,
      translator,
    });

    this.presenter.defineConfirmButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        fromId: this.playerId,
        cardId: this.selectedCardToPlay,
      };
      this.store.room.broadcast(GameEventIdentifiers.AskForCardResponseEvent, event);
      this.presenter.disableActionButton('confirm');
      this.resetActionHandlers();
      this.resetAction();
      this.presenter.isSkillDisabled(BaseAction.disableSkills);
      this.presenter.resetSelectedSkill();
    });
    this.presenter.defineCancelButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        fromId: this.playerId,
      };
      this.store.room.broadcast(GameEventIdentifiers.AskForCardResponseEvent, event);
      this.resetActionHandlers();
      this.resetAction();
      this.presenter.isSkillDisabled(BaseAction.disableSkills);
      this.presenter.resetSelectedSkill();
    });

    this.presenter.setupPlayersSelectionMatcher(() => false);
    this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
      this.isCardEnabledOnResponse(card, PlayerCardsArea.HandArea, new CardMatcher(this.askForEvent.cardMatcher)),
    );
    this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
      this.isCardEnabledOnResponse(card, PlayerCardsArea.EquipArea, new CardMatcher(this.askForEvent.cardMatcher)),
    );
  }
}
