import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { BaseAction } from './base_action';

export class PlayPhaseAction extends BaseAction {
  public static isPlayPhaseSkillsDisabled = (room: Room, player: Player) => (skill: Skill) => {
    if (skill instanceof TriggerSkill) {
      return false;
    } else if (skill instanceof ActiveSkill) {
      return !skill.canUse(room, player);
    } else if (skill instanceof ViewAsSkill) {
      return !player.canUseCard(room, new CardMatcher({ name: skill.canViewAs() }));
    }

    return true;
  };

  private createCardOrSkillUseEvent(
    player: PlayerId,
  ): ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> {
    let useEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent> | undefined;
    if (this.selectedCardToPlay !== undefined) {
      useEvent = {
        fromId: player,
        cardId: this.selectedCardToPlay!,
        toIds: this.selectedTargets.length > 0 ? this.selectedTargets : undefined,
        toCardIds: this.selectedCards.length > 0 ? this.selectedCards : undefined,
      };
      return {
        fromId: player,
        end: false,
        eventName: GameEventIdentifiers.CardUseEvent,
        event: useEvent,
      };
    } else {
      useEvent = {
        fromId: player,
        skillName: this.selectedSkillToPlay!.Name,
        cardIds: this.selectedCards.length > 0 ? this.selectedCards : undefined,
        toIds: this.selectedTargets.length > 0 ? this.selectedTargets : undefined,
      };
      return {
        fromId: player,
        end: false,
        eventName: GameEventIdentifiers.SkillUseEvent,
        event: useEvent,
      };
    }
  }

  onResetAction() {
    this.presenter.disableActionButton('cancel');
  }

  onPlay() {
    this.selectedSkillToPlay || this.selectedCardToPlay
      ? this.presenter.enableActionButton('cancel')
      : this.presenter.disableActionButton('cancel');
    this.presenter.defineCancelButtonActions(() => this.resetAction());

    this.presenter.defineFinishButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
        fromId: this.playerId,
        end: true,
      };

      this.store.room.broadcast(GameEventIdentifiers.AskForPlayCardsOrSkillsEvent, event);
      this.presenter.disableActionButton('finish');
      this.resetActionHandlers();
      this.resetAction();
      this.presenter.resetSelectedSkill();
    });

    this.presenter.defineConfirmButtonActions(() => {
      this.store.room.broadcast(
        GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
        this.createCardOrSkillUseEvent(this.playerId),
      );

      this.presenter.disableActionButton('finish');
      this.resetActionHandlers();
      this.resetAction();
      this.presenter.resetSelectedSkill();
    });

    const player = this.store.room.getPlayerById(this.playerId);
    this.presenter.setupPlayersSelectionMatcher((player: Player) => this.isPlayerEnabled(player));
    this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
      this.isCardEnabled(card, player, PlayerCardsArea.HandArea),
    );
    this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
      this.isCardEnabled(card, player, PlayerCardsArea.EquipArea),
    );
  }
}
