import { Card } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, ResponsiveSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { BaseAction } from './base_action';

export class PlayPhaseAction extends BaseAction {
  public static isPlayPhaseSkillsDisabled = (
    room: Room,
    player: Player,
    event: ServerEventFinder<GameEventIdentifiers>,
  ) => (skill: Skill) => {
    if (!room.isPlaying() || room.isGameOver() || UniqueSkillRule.isProhibited(skill, player)) {
      return true;
    }

    if (skill instanceof TriggerSkill) {
      return true;
    } else if (skill instanceof ActiveSkill) {
      return !skill.canUse(room, player);
    } else if (skill instanceof ViewAsSkill) {
      if (!skill.canUse(room, player, event)) {
        return true;
      }

      const canViewAs = skill.canViewAs(room, player).filter(cardName => {
        return !(Sanguosha.getCardByName(cardName).Skill instanceof ResponsiveSkill);
      });

      return canViewAs.length <= 0;
    }

    return true;
  };

  private createPlayOrSkillUseEvent(
    player: PlayerId,
  ): ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> {
    let useEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent> | undefined;
    if (this.selectedCardToPlay !== undefined) {
      const card = Sanguosha.getCardById(this.selectedCardToPlay);
      if (card.Reforgeable && this.selectedTargets.length === 0) {
        return {
          fromId: player,
          end: false,
          eventName: GameEventIdentifiers.ReforgeEvent,
          event: {
            fromId: player,
            cardId: this.selectedCardToPlay,
          },
        };
      }
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

  private reforgeableCheck() {
    const card = this.selectedCardToPlay && Sanguosha.getCardById(this.selectedCardToPlay);
    if (card && card.Reforgeable && this.selectedTargets.length === 0) {
      this.presenter.enableCardReforgeStatus();
      this.presenter.enableActionButton('reforge');
    } else {
      this.presenter.disableCardReforgeStatus();
      this.presenter.disableActionButton('reforge');
    }
  }

  protected onClickCard(card: Card, selected: boolean): void {
    super.onClickCard(card, selected);
    this.reforgeableCheck();
  }

  protected onClickPlayer(player: Player, selected: boolean) {
    super.onClickPlayer(player, selected);
    this.reforgeableCheck();
  }

  protected onClickSkill(skill: Skill, selected: boolean) {
    super.onClickSkill(skill, selected);
    this.reforgeableCheck();
  }

  async onPlay() {
    return new Promise<void>(resolve => {
      this.delightItems();
      this.presenter.highlightCards();
      this.selectedSkillToPlay || this.selectedCardToPlay
        ? this.presenter.enableActionButton('cancel')
        : this.presenter.disableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => this.resetAction());

      this.presenter.defineFinishButtonActions(() => {
        this.presenter.closeDialog();
        const event: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
          fromId: this.playerId,
          end: true,
        };

        this.store.room.broadcast(GameEventIdentifiers.AskForPlayCardsOrSkillsEvent, event);
        this.presenter.disableActionButton('finish');
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.resetSelectedSkill();
        resolve();
      });

      this.presenter.defineReforgeButtonActions(() => {
        this.presenter.closeDialog();
        this.store.room.broadcast(
          GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
          this.createPlayOrSkillUseEvent(this.playerId),
        );

        this.presenter.disableActionButton('finish');
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.resetSelectedSkill();
        resolve();
      });

      this.presenter.defineConfirmButtonActions(() => {
        this.store.room.broadcast(
          GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
          this.createPlayOrSkillUseEvent(this.playerId),
        );

        this.presenter.disableActionButton('finish');
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.resetSelectedSkill();
        resolve();
      });

      this.presenter.setupPlayersSelectionMatcher((player: Player) => this.isPlayerEnabled(player));
      this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
        this.isCardEnabled(card, this.player, PlayerCardsArea.HandArea),
      );
      this.presenter.setupClientPlayerOutsideCardActionsMatcher((card: Card) =>
        this.isCardEnabled(card, this.player, PlayerCardsArea.OutsideArea),
      );
      this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
        this.isCardEnabled(card, this.player, PlayerCardsArea.EquipArea),
      );
    });
  }
}
