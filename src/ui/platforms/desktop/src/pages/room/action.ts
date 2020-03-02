import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { ActiveSkill, ResponsiveSkill, Skill } from 'core/skills/skill';
import { PlayerId, RoomPresenter, RoomStore } from './room.presenter';

export class Action {
  private selectedTargets: Player[] = [];
  private selectedPlayCard: Card | undefined;
  private selectSkill: Skill | undefined;
  private selectedActionCards: Card[] = [];
  private selectedAction:
    | GameEventIdentifiers.CardUseEvent
    | GameEventIdentifiers.SkillUseEvent
    | undefined;
  constructor(private store: RoomStore, private presenter: RoomPresenter) {}

  private readonly endAction = () => {
    this.selectedAction = undefined;
    this.selectedPlayCard = undefined;
    this.selectSkill = undefined;
    this.selectedActionCards = [];
    this.selectedTargets = [];
    this.presenter.setupPlayersSelectionMatcher(() => false);
    this.presenter.setupClientPlayerCardActionsMatcher(() => false);
    this.presenter.disableActionButton('confirm');
  };

  private readonly updateClickActionStatus = () => {
    if (!this.selectedPlayCard) {
      return this.presenter.disableActionButton('confirm');
    }

    const { Skill: skill } = this.selectedPlayCard;
    if (!(skill instanceof ActiveSkill)) {
      return this.presenter.enableActionButton('confirm');
    }

    const canUse =
      skill.cardFilter(
        this.store.room,
        this.selectedActionCards.map(c => c.Id),
      ) &&
      skill.targetFilter(
        this.store.room,
        this.selectedTargets.map(p => p.Id),
      );

    canUse
      ? this.presenter.enableActionButton('confirm')
      : this.presenter.disableActionButton('confirm');
  };

  private readonly playCardMatcher = (card: Card) => {
    return !!this.presenter.ClientPlayer?.canUseCard(this.store.room!, card.Id);
  };

  private readonly playerResponsiveCardMatcher = (cardMatcher: CardMatcher) => (
    card: Card,
  ) => {
    return (
      cardMatcher.match(card) &&
      (!!this.presenter.ClientPlayer?.canUseCard(this.store.room!, card.Id) ||
        card.Skill instanceof ResponsiveSkill)
    );
  };

  private readonly activateConfirmButton = (player: PlayerId) => {
    this.presenter.defineConfirmButtonActions(() => {
      if (!this.selectedAction) {
        // tslint:disable-next-line:no-console
        console.warn('Unknown player action');
        return;
      }

      let useEvent:
        | ClientEventFinder<
            | GameEventIdentifiers.CardUseEvent
            | GameEventIdentifiers.SkillUseEvent
          >
        | undefined;
      if (this.selectedAction === GameEventIdentifiers.CardUseEvent) {
        useEvent = {
          fromId: player,
          cardId: this.selectedPlayCard!.Id,
          toIds:
            this.selectedTargets.length > 0
              ? this.selectedTargets.map(p => p.Id)
              : undefined,
          toCardIds:
            this.selectedActionCards.length > 0
              ? this.selectedActionCards.map(c => c.Id)
              : undefined,
        };
      } else {
        useEvent = {
          fromId: player,
          skillName: this.selectSkill!.Name,
          cardIds:
            this.selectedActionCards.length > 0
              ? this.selectedActionCards.map(c => c.Id)
              : undefined,
          toIds:
            this.selectedTargets.length > 0
              ? this.selectedTargets.map(p => p.Id)
              : undefined,
        };
      }

      const event: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
        fromId: player,
        eventName: GameEventIdentifiers.CardUseEvent,
        event: useEvent,
      };
      this.store.room.broadcast(
        GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
        event,
      );
      this.endAction();
      this.presenter.disableActionButton('finish');
      this.presenter.disableActionButton('cancel');
    });
  };

  private readonly onActionOfActiveSkill = (
    skill: ActiveSkill,
    playerId: PlayerId,
  ) => {
    this.presenter.setupPlayersSelectionMatcher((player: Player) => {
      return (
        (skill.isAvailableTarget(
          playerId,
          this.store.room,
          player.Id,
          this.selectedTargets.map(p => p.Id),
        ) &&
          !skill.targetFilter(
            this.store.room,
            this.selectedTargets.map(p => p.Id),
          )) ||
        this.selectedTargets.includes(player)
      );
    });

    this.presenter.setupClientPlayerCardActionsMatcher((card: Card) => {
      return (
        card === this.selectedPlayCard ||
        skill.isAvailableCard(
          playerId,
          this.store.room,
          card.Id,
          this.selectedActionCards.map(c => c.Id),
        )
      );
    });
  };

  onResponseCardAction(
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>,
  ) {
    let selectedCard: Card | undefined;

    if (EventPacker.isUncancellabelEvent(content)) {
      this.presenter.disableActionButton('cancel');
    } else {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
          fromId: this.presenter.ClientPlayer!.Id,
        };
        this.store.room.broadcast(
          GameEventIdentifiers.AskForCardResponseEvent,
          EventPacker.createIdentifierEvent(
            GameEventIdentifiers.AskForCardResponseEvent,
            event,
          ),
        );

        this.endAction();
        this.presenter.disableActionButton('cancel');
      });
    }

    this.presenter.defineConfirmButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        cardId: selectedCard?.Id,
        fromId: this.presenter.ClientPlayer!.Id,
      };

      this.store.room.broadcast(
        GameEventIdentifiers.AskForCardResponseEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.AskForCardResponseEvent,
          event,
        ),
      );

      this.endAction();
      this.presenter.disableActionButton('cancel');
    });

    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      if (selectedCard && card !== selectedCard) {
        return;
      }

      selected ? (selectedCard = card) : (selectedCard = undefined);
      selectedCard
        ? this.presenter.enableActionButton('confirm')
        : this.presenter.disableActionButton('confirm');
    });
  }

  onResponsiveUseCard(
    content: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    this.onPlayAction(
      this.presenter.ClientPlayer!.Id,
      new CardMatcher(content.carMatcher),
    );

    if (EventPacker.isUncancellabelEvent(content)) {
      this.presenter.disableActionButton('cancel');
    } else {
      this.presenter.enableActionButton('cancel');

      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
          fromId: this.presenter.ClientPlayer!.Id,
        };
        this.store.room.broadcast(
          GameEventIdentifiers.AskForCardUseEvent,
          EventPacker.createIdentifierEvent(
            GameEventIdentifiers.AskForCardUseEvent,
            event,
          ),
        );

        this.endAction();
        this.presenter.disableActionButton('cancel');
      });
    }
  }

  onPlayAction(who: PlayerId, cardMatcher?: CardMatcher) {
    const availableCardItemsSetter = cardMatcher
      ? this.playerResponsiveCardMatcher(cardMatcher)
      : this.playCardMatcher;
    this.activateConfirmButton(who);

    this.presenter.onClickSkill((skill: Skill, selected: boolean) => {
      if (selected && !this.selectSkill) {
        this.selectSkill = skill;
        this.selectedAction = GameEventIdentifiers.SkillUseEvent;
        this.selectedPlayCard = undefined;
      } else if (!selected && this.selectSkill === skill) {
        this.endAction();
      }
    });

    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      if (this.selectSkill) {
        if (selected) {
          this.selectedActionCards.push(card);
        } else {
          this.selectedActionCards = this.selectedActionCards.filter(
            actionCard => actionCard !== card,
          );
        }
      } else if (this.selectedPlayCard) {
        if (selected) {
          this.selectedActionCards.push(card);
        } else {
          if (this.selectedPlayCard === card) {
            this.endAction();
            this.presenter.setupClientPlayerCardActionsMatcher(
              availableCardItemsSetter,
            );
          } else {
            this.selectedActionCards = this.selectedActionCards.filter(
              actionCard => actionCard !== card,
            );
          }
        }
      } else if (this.selectedPlayCard === undefined) {
        if (selected) {
          this.selectedPlayCard = card;
          this.selectedAction = GameEventIdentifiers.CardUseEvent;
        } else {
          throw new Error('Undefined behaviour');
        }
      } else {
        if (selected) {
          this.selectedActionCards.push(card);
        } else {
          this.selectedActionCards = this.selectedActionCards.filter(
            actionCard => actionCard !== card,
          );
        }
      }
      this.updateClickActionStatus();

      const skill = this.selectedPlayCard?.Skill;
      if (skill instanceof ActiveSkill) {
        this.onActionOfActiveSkill(skill, who);
      }

      this.presenter.updateClientPlayerUI();
      this.presenter.updateDashboardUI();
    });

    this.presenter.onClickPlayer((player: Player, selected: boolean) => {
      if (selected) {
        this.selectedTargets.push(player);
      } else {
        this.selectedTargets = this.selectedTargets.filter(p => p !== player);
      }

      this.updateClickActionStatus();

      this.presenter.updateDashboardUI();
      this.presenter.updateClientPlayerUI();
    });

    this.presenter.setupClientPlayerCardActionsMatcher(
      availableCardItemsSetter,
    );
    this.presenter.updateClientPlayerUI();
  }
}
