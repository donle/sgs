import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { BaseAction } from './base_action';
import { RoomPresenter } from '../room.presenter';
import { RoomStore } from '../room.store';

export class CardResponseAction extends BaseAction {
  public static isSkillsOnCardResponseDisabled =
    (room: Room, matcher: CardMatcher, player: Player, event: ServerEventFinder<GameEventIdentifiers>) =>
    (skill: Skill) => {
      if (UniqueSkillRule.isProhibited(skill, player)) {
        return true;
      }

      if (skill instanceof TriggerSkill) {
        return true;
      } else if (skill instanceof ViewAsSkill) {
        return (
          !new CardMatcher({ name: skill.canViewAs(room, player, undefined, matcher) }).match(matcher) ||
          !skill.canUse(room, player, event)
        );
      }

      return true;
    };

  private askForEvent: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>;
  private matcher: CardMatcher;

  constructor(
    playerId: PlayerId,
    store: RoomStore,
    presenter: RoomPresenter,
    askForEvent: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>,
    translator: ClientTranslationModule,
  ) {
    super(playerId, store, presenter, translator);
    this.askForEvent = askForEvent;
    this.matcher = new CardMatcher(this.askForEvent.cardMatcher);

    if (!EventPacker.isUncancellableEvent(this.askForEvent)) {
      this.presenter.enableActionButton('cancel');
    } else {
      this.presenter.disableActionButton('cancel');
    }
  }

  isOutsideCardShowOnResponse(card: Card) {
    if (this.isCardFromParticularArea(card)) {
      return true;
    }
    return false;
  }

  isCardEnabledOnResponse(card: Card, fromArea: PlayerCardsArea, matcher: CardMatcher) {
    for (const skill of this.player.getSkills<FilterSkill>('filter')) {
      if (!skill.canUseCard(card.Id, this.store.room, this.playerId, undefined, true)) {
        return false;
      }
    }

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
        return (
          skill.isAvailableCard(
            this.store.room,
            this.player,
            card.Id,
            this.pendingCards,
            this.equipSkillCardId,
            this.matcher,
          ) &&
          skill.availableCardAreas().includes(fromArea) &&
          (!skill.cardFilter(
            this.store.room,
            this.player,
            this.pendingCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) ||
            skill.cardFilter(
              this.store.room,
              this.player,
              [...this.pendingCards, card.Id],
              this.selectedTargets,
              this.selectedCardToPlay,
            ))
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
          return new CardMatcher({
            name: card.Skill.canViewAs(this.store.room, this.player, this.pendingCards, this.matcher),
          }).match(new CardMatcher(this.askForEvent.cardMatcher));
        }
      } else if (
        fromArea === PlayerCardsArea.OutsideArea &&
        this.isCardFromParticularArea(card) &&
        this.askForEvent.fromArea.includes(PlayerCardsArea.HandArea)
      ) {
        return matcher.match(card);
      }
    }

    return false;
  }

  protected onClickCard(card: Card, selected: boolean): void {
    super.onClickCard(card, selected, this.matcher);
  }
  protected onClickSkill(skill: Skill, selected: boolean): void {
    super.onClickSkill(skill, selected, this.matcher);
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

  async onPlay(translator: ClientTranslationModule) {
    return new Promise<void>(resolve => {
      this.presenter.highlightCards();
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
        resolve();
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
        resolve();
      });

      this.presenter.setupPlayersSelectionMatcher(() => false);
      this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
        this.isCardEnabledOnResponse(card, PlayerCardsArea.HandArea, new CardMatcher(this.askForEvent.cardMatcher)),
      );
      this.presenter.setupClientPlayerOutsideCardActionsMatcher(
        (card: Card) =>
          this.isOutsideCardShowOnResponse(card) ||
          this.isCardEnabledOnResponse(
            card,
            PlayerCardsArea.OutsideArea,
            new CardMatcher(this.askForEvent.cardMatcher),
          ),
      );
      this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
        this.isCardEnabledOnResponse(card, PlayerCardsArea.EquipArea, new CardMatcher(this.askForEvent.cardMatcher)),
      );
    });
  }
}
