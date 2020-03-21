import { Card, CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ActiveSkill, ResponsiveSkill, Skill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from './room.presenter';

export class Action {
  private selectedTargets: Player[] = [];
  private selectedPlayCard: Card | undefined;
  private selectSkill: Skill | undefined;
  private selectedActionCards: Card[] = [];
  private selectedAction: GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent | undefined;
  constructor(private store: RoomStore, private presenter: RoomPresenter) {}

  public readonly endAction = () => {
    this.selectedAction = undefined;
    this.selectedPlayCard = undefined;
    this.selectSkill = undefined;
    this.selectedActionCards = [];
    this.selectedTargets = [];
    this.presenter.closeDialog();
    this.presenter.closeIncomingConversation();
    this.presenter.setupPlayersSelectionMatcher(() => false);
    this.presenter.setupClientPlayerCardActionsMatcher(() => () => false);
    this.presenter.disableActionButton('confirm');
    this.presenter.broadcastUIUpdate();
  };

  private readonly updateClickActionStatus = () => {
    let canActivateSkill = false;
    if (!this.selectedPlayCard) {
      return this.presenter.disableActionButton('confirm');
    } else {
      canActivateSkill =
        this.presenter.ClientPlayer!.cardFrom(this.selectedPlayCard.Id) === PlayerCardsArea.EquipArea
          ? false
          : this.selectedPlayCard.is(CardType.Equip);
    }

    const { Skill: skill } = this.selectedPlayCard;
    if (!(skill instanceof ActiveSkill)) {
      return this.presenter.enableActionButton('confirm');
    }

    const canUse =
      canActivateSkill ||
      (skill.cardFilter(
        this.store.room,
        this.selectedActionCards.map(c => c.Id),
      ) &&
        skill.targetFilter(
          this.store.room,
          this.selectedTargets.map(p => p.Id),
        ));

    canUse ? this.presenter.enableActionButton('confirm') : this.presenter.disableActionButton('confirm');
  };

  private readonly playCardMatcher = (area: PlayerCardsArea) => (card: Card) => {
    return !!this.presenter.ClientPlayer?.canUseCard(this.store.room!, card.Id) && area === PlayerCardsArea.HandArea;
  };

  private readonly playerResponsiveCardMatcher = (cardMatcher: CardMatcher, fromArea?: PlayerCardsArea) => (
    area: PlayerCardsArea,
  ) => (card: Card) => {
    const isFromArea = fromArea === undefined ? true : fromArea === area;
    return (
      isFromArea &&
      cardMatcher.match(card) &&
      (this.presenter.ClientPlayer?.canUseCard(this.store.room!, card.Id) || card.Skill instanceof ResponsiveSkill)
    );
  };

  private createCardOrSkillUseEvent(
    player: PlayerId,
  ): ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> {
    let useEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent> | undefined;
    if (this.selectedAction === GameEventIdentifiers.CardUseEvent) {
      useEvent = {
        fromId: player,
        cardId: this.selectedPlayCard!.Id,
        toIds: this.selectedTargets.length > 0 ? this.selectedTargets.map(p => p.Id) : undefined,
        toCardIds: this.selectedActionCards.length > 0 ? this.selectedActionCards.map(c => c.Id) : undefined,
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
        cardIds: this.selectedActionCards.length > 0 ? this.selectedActionCards.map(c => c.Id) : undefined,
        toIds: this.selectedTargets.length > 0 ? this.selectedTargets.map(p => p.Id) : undefined,
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
    containerCard: Card,
    skill: ActiveSkill,
    playerId: PlayerId,
    scopedTargets?: PlayerId[],
  ) => {
    this.presenter.setupPlayersSelectionMatcher((player: Player) => {
      if (scopedTargets) {
        return (
          scopedTargets.includes(player.Id) &&
          !skill.targetFilter(
            this.store.room,
            this.selectedTargets.map(p => p.Id),
          )
        );
      }

      return (
        (skill.isAvailableTarget(
          playerId,
          this.store.room,
          player.Id,
          this.selectedTargets.map(p => p.Id),
          containerCard.Id,
        ) &&
          !skill.targetFilter(
            this.store.room,
            this.selectedTargets.map(p => p.Id),
          )) ||
        this.selectedTargets.includes(player)
      );
    });

    this.presenter.setupClientPlayerCardActionsMatcher((area: PlayerCardsArea) => (card: Card) => {
      return (
        card === this.selectedPlayCard ||
        skill.isAvailableCard(
          playerId,
          this.store.room,
          card.Id,
          this.selectedActionCards.map(c => c.Id),
          containerCard.Id,
        )
      );
    });
  };

  enableFinishButton(who: PlayerId) {
    this.presenter.defineFinishButtonActions(() => {
      const event: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
        fromId: who,
        end: true,
      };

      this.store.room.broadcast(GameEventIdentifiers.AskForPlayCardsOrSkillsEvent, event);
      this.endAction();
    });
  }

  async onSelectCardAction<T extends GameEventIdentifiers>(
    from: PlayerCardsArea[],
    requiredNumberOfCards: number,
    content: ServerEventFinder<T>,
  ) {
    return new Promise<CardId[]>((resolve, reject) => {
      if (!EventPacker.isUncancellabelEvent(content)) {
        this.presenter.enableActionButton('cancel');
        this.presenter.defineCancelButtonActions(() => {
          this.presenter.setupClientPlayerCardActionsMatcher(() => () => false);
          resolve([]);
        });
      }

      const selectedCards: CardId[] = [];
      this.presenter.setupClientPlayerCardActionsMatcher(area => card => {
        if (!from.includes(area)) {
          return false;
        }
        return selectedCards.length !== requiredNumberOfCards || selectedCards.includes(card.Id);
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
    translator: ClientTranslationModule,
  ) {
    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator,
    });

    let selectedCard: Card | undefined;

    if (EventPacker.isUncancellabelEvent(content)) {
      this.presenter.disableActionButton('cancel');
    } else {
      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
          fromId: this.presenter.ClientPlayer!.Id,
        };
        this.store.room.broadcast(
          GameEventIdentifiers.AskForCardResponseEvent,
          EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardResponseEvent, event),
        );

        this.presenter.closeIncomingConversation();
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
        EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardResponseEvent, event),
      );

      this.presenter.closeIncomingConversation();
      this.presenter.disableActionButton('cancel');
      this.endAction();
    });

    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      if (!selectedCard || card === selectedCard) {
        selected ? (selectedCard = card) : (selectedCard = undefined);
      }

      selectedCard ? this.presenter.enableActionButton('confirm') : this.presenter.disableActionButton('confirm');

      this.presenter.broadcastUIUpdate();
    });
  }

  onResponsiveUseCard(
    content: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
    translator: ClientTranslationModule,
  ) {
    const who = this.presenter.ClientPlayer!.Id;
    this.onPlayAction(who, new CardMatcher(content.cardMatcher), content.scopedTargets);

    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator,
    });

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
        toIds: this.selectedTargets.map(player => player.Id),
      };

      this.store.room.broadcast(
        GameEventIdentifiers.AskForCardUseEvent,
        EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardUseEvent, event),
      );
      this.presenter.closeIncomingConversation();
      this.presenter.disableActionButton('cancel');
      this.endAction();
    });

    if (EventPacker.isUncancellabelEvent(content)) {
      this.presenter.disableActionButton('cancel');
    } else {
      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
          fromId: who,
        };
        this.store.room.broadcast(
          GameEventIdentifiers.AskForCardUseEvent,
          EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardUseEvent, event),
        );

        this.presenter.closeIncomingConversation();
        this.endAction();
      });
    }
  }

  onPlayAction(who: PlayerId, cardMatcher?: CardMatcher, scopedTargets?: PlayerId[]) {
    const availableCardItemsSetter = cardMatcher ? this.playerResponsiveCardMatcher(cardMatcher) : this.playCardMatcher;
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
          this.selectedActionCards = this.selectedActionCards.filter(actionCard => actionCard !== card);
        }
      } else if (this.selectedPlayCard) {
        if (selected) {
          this.selectedActionCards.push(card);
        } else {
          if (this.selectedPlayCard === card) {
            this.endAction();
            this.presenter.setupClientPlayerCardActionsMatcher(availableCardItemsSetter);
          } else {
            this.selectedActionCards = this.selectedActionCards.filter(actionCard => actionCard !== card);
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
          this.selectedActionCards = this.selectedActionCards.filter(actionCard => actionCard !== card);
        }
      }
      this.updateClickActionStatus();

      const skill = this.selectedPlayCard?.Skill;
      if (skill instanceof ActiveSkill) {
        this.onActionOfActiveSkill(this.selectedPlayCard!, skill, who, scopedTargets);
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

    this.presenter.setupClientPlayerCardActionsMatcher(availableCardItemsSetter);
    this.presenter.broadcastUIUpdate();
  }

  onInvokingSkills<T extends GameEventIdentifiers.AskForInvokeEvent>(
    content: ServerEventFinder<T>,
    translator: ClientTranslationModule,
  ) {
    const { invokeSkillNames, to } = content;
    if (to !== this.presenter.ClientPlayer!.Id) {
      return;
    }

    if (invokeSkillNames.length === 1) {
      const skill = invokeSkillNames[0];
      const translatedConversation = TranslationPack.translationJsonPatcher(
        'do you want to trigger skill {0} ?',
        skill,
      ).extract();

      this.presenter.createIncomingConversation({
        conversation: translatedConversation,
        translator,
      });

      const event: ClientEventFinder<T> = {
        invoke: undefined,
        fromId: to,
      };
      this.presenter.enableActionButton('confirm');
      this.presenter.defineConfirmButtonActions(() => {
        event.invoke = skill;
        this.store.room.broadcast(GameEventIdentifiers.AskForInvokeEvent, event);
        this.presenter.disableActionButton('cancel');
        this.presenter.closeIncomingConversation();
      });
      this.presenter.defineCancelButtonActions(() => {
        this.store.room.broadcast(GameEventIdentifiers.AskForInvokeEvent, event);
        this.presenter.disableActionButton('confirm');
        this.presenter.closeIncomingConversation();
      });
    } else {
      const optionHandlers: any = {};
      for (const skillName of content.invokeSkillNames) {
        const event: ClientEventFinder<T> = {
          invoke: skillName,
          fromId: to,
        };

        optionHandlers[skillName] = () => {
          this.store.room.broadcast(GameEventIdentifiers.AskForInvokeEvent, event);
        };
      }

      this.presenter.createIncomingConversation({
        conversation: 'select a skill to trigger',
        optionsActionHanlder: {},
        translator,
      });
    }
  }
}
