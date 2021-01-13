import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { BaseAction } from './base_action';

export class ResponsiveUseCardAction<
  T extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForPeachEvent = GameEventIdentifiers.AskForCardUseEvent
> extends BaseAction {
  public static isSkillsOnResponsiveCardUseDisabled = (room: Room, matcher: CardMatcher, player: Player) => (
    skill: Skill,
  ) => {
    if (UniqueSkillRule.isProhibited(skill, player)) {
      return true;
    }

    if (skill instanceof TriggerSkill) {
      return true;
    } else if (skill instanceof ViewAsSkill) {
      return (
        !new CardMatcher({ name: skill.canViewAs(room, player, undefined, matcher) }).match(matcher) ||
        !skill.canUse(room, player)
      );
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
    translator: ClientTranslationModule,
    cardMatcher?: CardMatcher,
  ) {
    const dynamicEvent = (askForEvent as unknown) as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
    super(playerId, store, presenter, translator, dynamicEvent.scopedTargets);
    this.askForEvent = askForEvent;
    this.extraUse = !!dynamicEvent.extraUse;
    this.matcher = cardMatcher || new CardMatcher(dynamicEvent.cardMatcher);

    if (!EventPacker.isUncancellabelEvent(this.askForEvent)) {
      this.presenter.enableActionButton('cancel');
    } else {
      this.presenter.disableActionButton('cancel');
    }
  }

  isCardEnabledOnResponsiveUse(card: Card, fromArea: PlayerCardsArea, matcher: CardMatcher) {
    for (const skill of this.player.getSkills<FilterSkill>('filter')) {
      if (!skill.canUseCard(card.Id, this.store.room, this.playerId)) {
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
      if (skill instanceof ActiveSkill) {
        const selectedCardsRange = skill.numberOfCards();
        if (
          selectedCardsRange !== undefined &&
          this.selectedCards.length < selectedCardsRange[selectedCardsRange.length - 1]
        ) {
          return true;
        }

        return (
          skill.isAvailableCard(
            this.playerId,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            this.equipSkillCardId,
          ) &&
          skill.availableCardAreas().includes(fromArea) &&
          (!skill.cardFilter(
            this.store.room,
            this.player,
            this.selectedCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) ||
            skill.cardFilter(
              this.store.room,
              this.player,
              [...this.selectedCards, card.Id],
              this.selectedTargets,
              this.selectedCardToPlay,
            ))
        );
      } else if (skill instanceof ViewAsSkill) {
        return (
          skill.isAvailableCard(
            this.store.room,
            this.player,
            card.Id,
            this.pendingCards,
            this.equipSkillCardId,
            this.matcher,
          ) &&
          this.isCardEnabledInArea(skill, card, fromArea) &&
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

    if (this.selectedCardToPlay === undefined) {
      if (!this.extraUse && !this.player.canUseCard(this.store.room, card.Id, matcher)) {
        return false;
      }

      if (fromArea === PlayerCardsArea.HandArea) {
        return matcher.match(card);
      } else if (fromArea === PlayerCardsArea.EquipArea) {
        if (card.Skill instanceof ViewAsSkill) {
          return new CardMatcher({
            name: card.Skill.canViewAs(this.store.room, this.player, this.pendingCards, this.matcher),
          }).match(this.matcher);
        }
      } else if (fromArea === PlayerCardsArea.OutsideArea && this.isCardFromParticularArea(card)) {
        return matcher.match(card);
      }
    }
    return false;
  }

  isPlayerEnabled(player: Player): boolean {
    const event = (this.askForEvent as unknown) as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
    if (!event.commonUse && this.scopedTargets && this.scopedTargets.includes(player.Id)) {
      return true;
    }

    return super.isPlayerEnabled(player);
  }

  protected onClickCard(card: Card, selected: boolean): void {
    super.onClickCard(card, selected, this.matcher);
  }
  protected onClickSkill(skill: Skill, selected: boolean): void {
    super.onClickSkill(skill, selected, this.matcher);
  }

  onResetAction() {
    this.presenter.disableActionButton('cancel');
    this.presenter.closeIncomingConversation();
  }

  onPlay(translator: ClientTranslationModule) {
    return new Promise<void>(resolve => {
      this.delightItems();
      this.presenter.highlightCards();
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
        resolve();
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
        resolve();
      });

      //TODO: optimize auto selection
      const event = (this.askForEvent as unknown) as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      if (this.scopedTargets && this.scopedTargets.length === 1 && !event.commonUse) {
        this.selectedTargets = this.scopedTargets.slice();
        this.onClickPlayer(this.store.room.getPlayerById(this.selectedTargets[0]), true);
      } else {
        this.presenter.setupPlayersSelectionMatcher((player: Player) => this.isPlayerEnabled(player));
      }
      this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
        this.isCardEnabledOnResponsiveUse(card, PlayerCardsArea.HandArea, this.matcher),
      );
      this.presenter.setupClientPlayerOutsideCardActionsMatcher((card: Card) =>
        this.isCardEnabledOnResponsiveUse(card, PlayerCardsArea.OutsideArea, this.matcher),
      );
      this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
        this.isCardEnabledOnResponsiveUse(card, PlayerCardsArea.EquipArea, this.matcher),
      );
    });
  }
}
