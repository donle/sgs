import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { BaseAction } from './base_action';
import { ResponsiveUseCardAction } from './responsive_card_use_action';

export class AskForPeachAction extends ResponsiveUseCardAction<GameEventIdentifiers.AskForPeachEvent> {
  public static readonly isSkillDisabled = (room: Room, useByMyself: boolean, player: Player) => (skill: Skill) => {
    if (UniqueSkillRule.isProhibited(skill, player)) {
      return true;
    }

    if (skill instanceof TriggerSkill) {
      return true;
    } else if (skill instanceof ViewAsSkill) {
      const matcher = new CardMatcher({ name: useByMyself ? ['alcohol', 'peach'] : ['peach'] });
      return (
        !CardMatcher.match({ name: skill.canViewAs(room, player, undefined, matcher), tag: 'card-matcher' }, matcher) ||
        !skill.canUse(room, player)
      );
    }

    return true;
  };

  isCardEnabledOnAskingForPeach(card: Card, fromArea: PlayerCardsArea) {
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
        return (
          skill.isAvailableCard(
            this.playerId,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            this.equipSkillCardId,
          ) &&
          this.isCardEnabledInArea(skill, card, fromArea) &&
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
      if (fromArea === PlayerCardsArea.HandArea) {
        return this.matcher.match(card);
      } else if (fromArea === PlayerCardsArea.EquipArea) {
        if (card.Skill instanceof ViewAsSkill) {
          return new CardMatcher({
            name: card.Skill.canViewAs(this.store.room, this.player, this.selectedCards, this.matcher),
          }).match(this.matcher);
        }
      } else if (fromArea === PlayerCardsArea.OutsideArea && this.isCardFromParticularArea(card)) {
        return this.matcher.match(card);
      }
    }
    return false;
  }

  async onPlay(translator: ClientTranslationModule) {
    await new Promise<void>(resolve => {
      this.delightItems();
      this.presenter.highlightCards();
      this.presenter.createIncomingConversation({
        conversation: this.askForEvent.conversation,
        translator,
      });

      this.presenter.defineConfirmButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForPeachEvent> = {
          cardId: this.selectedCardToPlay,
          fromId: this.playerId,
        };
        this.store.room.broadcast(GameEventIdentifiers.AskForPeachEvent, event);
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.isSkillDisabled(BaseAction.disableSkills);
        this.presenter.resetSelectedSkill();
        resolve();
      });
      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForPeachEvent> = {
          fromId: this.playerId,
        };
        this.store.room.broadcast(GameEventIdentifiers.AskForPeachEvent, event);
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.isSkillDisabled(BaseAction.disableSkills);
        this.presenter.resetSelectedSkill();
        resolve();
      });

      this.presenter.setupPlayersSelectionMatcher((player: Player) => false);
      this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
        this.isCardEnabledOnAskingForPeach(card, PlayerCardsArea.HandArea),
      );
      this.presenter.setupClientPlayerOutsideCardActionsMatcher((card: Card) =>
        this.isCardEnabledOnAskingForPeach(card, PlayerCardsArea.OutsideArea),
      );
      this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
        this.isCardEnabledOnAskingForPeach(card, PlayerCardsArea.EquipArea),
      );
    });
  }
}
