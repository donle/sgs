import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ActiveSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { BaseAction } from './base_action';

export class ResponsiveUseCardAction<
  T extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForPeachEvent = GameEventIdentifiers.AskForCardUseEvent
> extends BaseAction {
  public static isSkillsOnResponsiveCardUseDisabled = (matcher: CardMatcher, player: Player) => (skill: Skill) => {
    if (UniqueSkillRule.isProhibited(skill, player)) {
      return true;
    }

    if (skill instanceof TriggerSkill) {
      return false;
    } else if (skill instanceof ViewAsSkill) {
      return !new CardMatcher({ name: skill.canViewAs() }).match(matcher);
    }

    return true;
  };

  protected askForEvent: ServerEventFinder<T>;
  protected matcher: CardMatcher;

  private extraUse: boolean;

  constructor(
    playerId: PlayerId,
    store: RoomStore,
    presenter: RoomPresenter,
    askForEvent: ServerEventFinder<T>,
    cardMatcher?: CardMatcher,
  ) {
    const dynamicEvent = askForEvent as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
    super(playerId, store, presenter, dynamicEvent.scopedTargets);
    this.askForEvent = askForEvent;
    this.extraUse = !!dynamicEvent.extraUse;
    this.matcher = cardMatcher || new CardMatcher(dynamicEvent.cardMatcher);

    if (!EventPacker.isUncancellabelEvent(this.askForEvent)) {
      this.presenter.enableActionButton('cancel');
    }
  }

  isCardEnabledOnResponsiveUse(card: Card, fromArea: PlayerCardsArea, matcher: CardMatcher) {
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

    const player = this.store.room.getPlayerById(this.playerId);

    if (this.selectedSkillToPlay !== undefined) {
      const skill = this.selectedSkillToPlay;
      if (skill instanceof ActiveSkill) {
        return (
          skill.isAvailableCard(
            this.playerId,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            this.equipSkillCardId,
          ) &&
          (!skill.cardFilter(this.store.room, this.selectedCards) ||
            skill.cardFilter(this.store.room, [...this.selectedCards, card.Id]))
        );
      } else if (skill instanceof ViewAsSkill) {
        return (
          skill.isAvailableCard(
            this.store.room,
            player,
            card.Id,
            this.pendingCards,
            this.equipSkillCardId,
            this.matcher,
          ) &&
          (!skill.cardFilter(this.store.room, player, this.pendingCards) ||
            skill.cardFilter(this.store.room, player, [...this.pendingCards, card.Id]))
        );
      } else {
        return false;
      }
    }

    if (this.selectedCardToPlay === undefined) {
      if (
        !this.extraUse &&
        !this.store.room.getPlayerById(this.playerId).canUseCard(this.store.room, card.Id, matcher)
      ) {
        return false;
      }

      if (fromArea === PlayerCardsArea.HandArea) {
        return matcher.match(card);
      } else if (fromArea === PlayerCardsArea.EquipArea) {
        if (card.Skill instanceof ViewAsSkill) {
          return new CardMatcher({ name: card.Skill.canViewAs() }).match(this.matcher);
        }
      }
    }
    return false;
  }

  onResetAction() {
    this.presenter.disableActionButton('cancel');
    this.presenter.closeIncomingConversation();
  }

  onPlay(translator: ClientTranslationModule) {
    this.presenter.createIncomingConversation({
      conversation: this.askForEvent.conversation,
      translator,
    });

    this.presenter.defineConfirmButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        cardId: this.selectedCardToPlay,
        toIds: this.selectedTargets.length > 0 ? this.selectedTargets : undefined,
        fromId: this.playerId,
      };
      this.store.room.broadcast(GameEventIdentifiers.AskForCardUseEvent, event);
      this.resetActionHandlers();
      this.resetAction();
      this.presenter.isSkillDisabled(BaseAction.disableSkills);
      this.presenter.resetSelectedSkill();
    });
    this.presenter.defineCancelButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: this.playerId,
      };
      this.store.room.broadcast(GameEventIdentifiers.AskForCardUseEvent, event);
      this.resetActionHandlers();
      this.resetAction();
      this.presenter.isSkillDisabled(BaseAction.disableSkills);
      this.presenter.resetSelectedSkill();
    });

    if (this.scopedTargets && this.scopedTargets.length === 1) {
      this.selectedTargets = this.scopedTargets.slice();
    } else {
      this.presenter.setupPlayersSelectionMatcher((player: Player) => this.isPlayerEnabled(player));
    }
    this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
      this.isCardEnabledOnResponsiveUse(card, PlayerCardsArea.HandArea, this.matcher),
    );
    this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
      this.isCardEnabledOnResponsiveUse(card, PlayerCardsArea.EquipArea, this.matcher),
    );
  }
}
