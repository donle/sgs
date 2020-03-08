import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
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
    this.presenter.setupClientPlayerCardActionsMatcher(() => () => false);
    this.presenter.disableActionButton('confirm');
    this.presenter.broadcastUIUpdate();
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

  private readonly playCardMatcher = (area: PlayerCardsArea) => (
    card: Card,
  ) => {
    return (
      !!this.presenter.ClientPlayer?.canUseCard(this.store.room!, card.Id) &&
      area === PlayerCardsArea.HandArea
    );
  };

  private readonly playerResponsiveCardMatcher = (
    cardMatcher: CardMatcher,
    fromArea?: PlayerCardsArea,
  ) => (area: PlayerCardsArea) => (card: Card) => {
    const isFromArea = fromArea === undefined ? true : fromArea === area;
    return (
      isFromArea &&
      cardMatcher.match(card) &&
      (this.presenter.ClientPlayer?.canUseCard(this.store.room!, card.Id) ||
        card.Skill instanceof ResponsiveSkill)
    );
  };

  private createCardOrSkillUseEvent(
    player: PlayerId,
  ): ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> {
    let useEvent:
      | ClientEventFinder<
          GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent
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
      return {
        fromId: player,
        end: false,
        eventName: this.selectedAction!,
        event: useEvent,
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
      return {
        fromId: player,
        end: false,
        eventName: this.selectedAction!,
        event: useEvent,
      };
    }
  }

  private readonly definedPlayButtonConfirmHandler = (player: PlayerId) => {
    this.presenter.defineConfirmButtonActions(() => {
      if (!this.selectedAction) {
        // tslint:disable-next-line:no-console
        console.warn('Unknown player action');
        return;
      }

      this.store.room.broadcast(
        GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
        this.createCardOrSkillUseEvent(player),
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

    this.presenter.setupClientPlayerCardActionsMatcher(
      (area: PlayerCardsArea) => (card: Card) => {
        return (
          card === this.selectedPlayCard ||
          skill.isAvailableCard(
            playerId,
            this.store.room,
            card.Id,
            this.selectedActionCards.map(c => c.Id),
          )
        );
      },
    );
  };

  enableFinishButton(who: PlayerId) {
    this.presenter.enableActionButton('finish');
    this.presenter.defineFinishButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
        fromId: who,
        end: true,
      };

      this.store.room.broadcast(
        GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
        event,
      );
      this.endAction();
    });
  }

  async onSelectCardAction(
    from: PlayerCardsArea[],
    requiredNumberOfCards: number,
  ) {
    return new Promise<CardId[]>((resolve, reject) => {
      const selectedCards: CardId[] = [];
      this.presenter.setupClientPlayerCardActionsMatcher(area => card => {
        if (!from.includes(area)) {
          return false;
        }
        return (
          selectedCards.length !== requiredNumberOfCards ||
          selectedCards.includes(card.Id)
        );
      });
      this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
        if (selected) {
          selectedCards.push(card.Id);
        } else {
          const index = selectedCards.findIndex(cardId => card.Id === cardId);
          selectedCards.splice(index, 1);
        }

        if (requiredNumberOfCards === selectedCards.length) {
          this.presenter.enableActionButton('confirm');
        } else {
          this.presenter.disableActionButton('confirm');
        }
        this.presenter.broadcastUIUpdate();
      });

      this.presenter.defineConfirmButtonActions(() => {
        resolve(selectedCards);
      });
    });
  }

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
      });
    }

    const player = this.presenter.ClientPlayer!;
    this.presenter.setupClientPlayerCardActionsMatcher(area => card => {
      return (
        (!selectedCard || card === selectedCard) &&
        player.cardFrom(card.Id) === area &&
        CardMatcher.match(content.cardMatcher, card)
      );
    });

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

      this.presenter.disableActionButton('cancel');
      this.endAction();
    });

    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      if (!selectedCard || card === selectedCard) {
        selected ? (selectedCard = card) : (selectedCard = undefined);
      }

      selectedCard
        ? this.presenter.enableActionButton('confirm')
        : this.presenter.disableActionButton('confirm');

      this.presenter.broadcastUIUpdate();
    });
  }

  onReponseToUseWuXieKeJi(who: PlayerId) {
    this.presenter.enableActionButton('cancel');

    this.onPlayAction(who, new CardMatcher({ name: ['wuxiekeji'] }));

    this.presenter.defineConfirmButtonActions(() => {
      const playEvent = this.createCardOrSkillUseEvent(who);
      const cardUseEvent = playEvent.end
        ? undefined
        : playEvent.eventName === GameEventIdentifiers.CardUseEvent
        ? playEvent.event
        : undefined;

      const event: ClientEventFinder<GameEventIdentifiers.AskForWuXieKeJiEvent> = {
        fromId: who,
        cardId: cardUseEvent && cardUseEvent.cardId,
      };

      this.store.room.broadcast(
        GameEventIdentifiers.AskForWuXieKeJiEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.AskForWuXieKeJiEvent,
          event,
        ),
      );

      this.presenter.disableActionButton('cancel');
      this.endAction();
    });

    this.presenter.defineCancelButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForWuXieKeJiEvent> = {
        fromId: who,
      };

      this.store.room.broadcast(
        GameEventIdentifiers.AskForWuXieKeJiEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.AskForWuXieKeJiEvent,
          event,
        ),
      );
      this.endAction();
    });
  }

  onResponsiveUseCard(
    content: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const who = this.presenter.ClientPlayer!.Id;
    this.onPlayAction(who, new CardMatcher(content.cardMatcher));

    this.presenter.defineConfirmButtonActions(() => {
      const playEvent = this.createCardOrSkillUseEvent(who);
      const cardUseEvent = playEvent.end
        ? undefined
        : playEvent.eventName === GameEventIdentifiers.CardUseEvent
        ? playEvent.event
        : undefined;

      const event: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: who,
        cardId: cardUseEvent && cardUseEvent.cardId,
      };

      this.store.room.broadcast(
        GameEventIdentifiers.AskForCardUseEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.AskForCardUseEvent,
          event,
        ),
      );
      this.presenter.disableActionButton('cancel');
      this.endAction();
    });

    if (EventPacker.isUncancellabelEvent(content)) {
      this.presenter.disableActionButton('cancel');
    } else {
      this.presenter.enableActionButton('cancel');

      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
          fromId: who,
        };
        this.store.room.broadcast(
          GameEventIdentifiers.AskForCardUseEvent,
          EventPacker.createIdentifierEvent(
            GameEventIdentifiers.AskForCardUseEvent,
            event,
          ),
        );

        this.endAction();
      });
    }
  }

  onPlayAction(who: PlayerId, cardMatcher?: CardMatcher) {
    const availableCardItemsSetter = cardMatcher
      ? this.playerResponsiveCardMatcher(cardMatcher)
      : this.playCardMatcher;
    !cardMatcher && this.definedPlayButtonConfirmHandler(who);

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

      this.presenter.broadcastUIUpdate();
    });

    this.presenter.onClickPlayer((player: Player, selected: boolean) => {
      if (selected) {
        this.selectedTargets.push(player);
      } else {
        this.selectedTargets = this.selectedTargets.filter(p => p !== player);
      }

      this.updateClickActionStatus();

      this.presenter.broadcastUIUpdate();
    });

    this.presenter.setupClientPlayerCardActionsMatcher(
      availableCardItemsSetter,
    );
    this.presenter.broadcastUIUpdate();
  }
}
