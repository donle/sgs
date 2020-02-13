import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPacker,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { PinDianResultType } from 'core/event/event.server';
import {
  CardDropStage,
  CardEffectStage,
  CardResponseStage,
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  GameEventStage,
  JudgeEffectStage,
  ObtainCardStage,
  PhaseChangeStage,
  PinDianStage,
  PlayerPhase,
  PlayerStageListEnum,
  SkillEffectStage,
  SkillUseStage,
  StageProcessor,
} from 'core/game/stage_processor';
import {
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
} from 'core/player/player_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ServerRoom } from '../room/room.server';
import { Sanguosha } from './engine';
import { GameCommonRules } from './game_rules';

export class GameProcessor {
  private playerPositionIndex = -1;
  private room: ServerRoom;
  private currentPlayerStage: PlayerStageListEnum | undefined;
  private currentPlayerPhase: PlayerPhase | undefined;

  constructor(private stageProcessor: StageProcessor) {}

  private tryToThrowNotStartedError() {
    if (!this.room || this.playerPositionIndex < 0) {
      throw new Error('Game is not started yet');
    }
  }

  private async chooseCharacters(playersInfo: PlayerInfo[]) {
    const lordInfo = playersInfo[0];
    const gameStartEvent = EventPacker.createUncancellableEvent<
      GameEventIdentifiers.AskForChooseCharacterEvent
    >({
      characterIds: Sanguosha.getLordCharacters().map(
        character => character.Id,
      ),
      role: lordInfo.Role,
      isGameStart: true,
    });
    this.room.notify(
      GameEventIdentifiers.AskForChooseCharacterEvent,
      EventPacker.createIdentifierEvent(
        GameEventIdentifiers.AskForChooseCharacterEvent,
        gameStartEvent,
      ),
      lordInfo.Id,
    );

    const lordResponse = await this.room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChooseCharacterEvent,
      lordInfo.Id,
    );
    this.room.getPlayerById(lordInfo.Id).CharacterId = lordResponse.chosenCharacter;
    lordInfo.CharacterId = lordResponse.chosenCharacter;

    const characters = Sanguosha.getRandomCharacters(
      playersInfo.length - 1,
      lordInfo.CharacterId,
    );

    const sequentialAsyncResponse: Promise<
      ClientEventFinder<GameEventIdentifiers.AskForChooseCharacterEvent>
    >[] = [];

    for (let i = 1; i < playersInfo.length; i++) {
      const playerInfo = playersInfo[i];
      this.room.notify(
        GameEventIdentifiers.AskForChooseCharacterEvent,
        {
          characterIds: [characters.pop()!.Id],
          lordInfo: {
            lordCharacter: lordInfo.CharacterId,
            lordId: lordInfo.Id,
          },
          role: playerInfo.Role,
          isGameStart: true,
        },
        playerInfo.Id,
      );

      sequentialAsyncResponse.push(
        this.room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForChooseCharacterEvent,
          playerInfo.Id,
        ),
      );
    }

    for (const response of await Promise.all(sequentialAsyncResponse)) {
      const player = playersInfo.find(info => info.Id === response.fromId);
      if (!player) {
        throw new Error('Unexpected player id received');
      }

      this.room.getPlayerById(player.Id).CharacterId = response.chosenCharacter;
      player.CharacterId = response.chosenCharacter;
    }
  }

  private drawGameBeginsCards(playersInfo: PlayerInfo[]) {
    for (const player of playersInfo) {
      const cardIds = this.room.getCards(4, 'top');
      const drawEvent: ServerEventFinder<GameEventIdentifiers.DrawCardEvent> = {
        cardIds,
        playerId: player.Id,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} drawed {1} cards',
          player.Name,
          4,
        ),
      };

      this.room.broadcast(GameEventIdentifiers.DrawCardEvent, drawEvent);
    }
  }

  public async gameStart(room: ServerRoom) {
    this.room = room;

    const playersInfo = this.room.assignRoles();
    await this.chooseCharacters(playersInfo);

    for (const player of playersInfo) {
      const gameStartEvent: ServerEventFinder<GameEventIdentifiers.GameStartEvent> = {
        currentPlayer: player,
        otherPlayers: playersInfo.filter(info => info.Id !== player.Id),
      };

      await this.onHandleIncomingEvent(
        GameEventIdentifiers.GameStartEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.GameStartEvent,
          gameStartEvent,
        ),
      );
    }
    this.drawGameBeginsCards(playersInfo);

    while (this.room.AlivePlayers.length > 1) {
      await this.play();
      this.turnToNextPlayer();
    }
  }

  private async onPhase(phase: PlayerPhase) {
    switch (phase) {
      case PlayerPhase.JudgeStage:
        const judgeCards = this.CurrentPlayer.getCardIds(
          PlayerCardsArea.JudgeArea,
        ).map(cardId => Sanguosha.getCardById(cardId));
        for (const judgeCard of judgeCards) {
          const cardEffectEvent: ServerEventFinder<GameEventIdentifiers.CardEffectEvent> = {
            cardId: judgeCard.Id,
            toIds: [this.CurrentPlayer.Id],
          };
          await judgeCard.Skill.onEffect(this.room, cardEffectEvent);
        }
        return;
      case PlayerPhase.DrawCardStage:
        await this.room.drawCards(2, this.CurrentPlayer.Id);
        return;
      case PlayerPhase.PlayCardStage:
        this.room.notify(
          GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
          EventPacker.createIdentifierEvent(
            GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
            {
              fromId: this.CurrentPlayer.Id,
            },
          ),
          this.CurrentPlayer.Id,
        );

        let response:
          | ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>
          | undefined;

        do {
          this.room.notify(
            GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
            EventPacker.createIdentifierEvent(
              GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
              {
                fromId: this.CurrentPlayer.Id,
              },
            ),
            this.CurrentPlayer.Id,
          );
          response = await this.room.onReceivingAsyncReponseFrom(
            GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
            this.CurrentPlayer.Id,
          );

          if (response.end) {
            break;
          }

          const identifier = EventPacker.getIdentifier(response);
          if (identifier === GameEventIdentifiers.CardUseEvent) {
            const event = response.event as ClientEventFinder<
              GameEventIdentifiers.CardUseEvent
            >;
            await this.room.useCard(event);
          } else {
            const event = response.event as ClientEventFinder<
              GameEventIdentifiers.SkillUseEvent
            >;
            await this.room.useSkill(event);
          }
        } while (true);
        return;
      case PlayerPhase.DropCardStage:
        const maxCardHold =
          this.CurrentPlayer.MaxHp +
          GameCommonRules.getAdditionalHoldCardNumber(this.CurrentPlayer);
        const discardAmount =
          this.CurrentPlayer.getCardIds(PlayerCardsArea.HandArea).length -
          maxCardHold;

        if (discardAmount > 0) {
          const dropCardsEvent = EventPacker.createIdentifierEvent(
            GameEventIdentifiers.AskForCardDropEvent,
            {
              cardAmount: discardAmount,
              fromArea: [PlayerCardsArea.HandArea],
              toId: this.CurrentPlayer.Id,
            },
          );
          this.room.notify(
            GameEventIdentifiers.AskForCardDropEvent,
            EventPacker.createUncancellableEvent<
              GameEventIdentifiers.AskForCardDropEvent
            >(dropCardsEvent),
            this.CurrentPlayer.Id,
          );

          const response = await this.room.onReceivingAsyncReponseFrom(
            GameEventIdentifiers.AskForCardDropEvent,
            this.CurrentPlayer.Id,
          );

          await this.room.dropCards(response.droppedCards, response.fromId);
        }

        return;
      default:
        return;
    }
  }

  private async play() {
    let lastPlayer = this.room.AlivePlayers[this.playerPositionIndex];
    this.playerPositionIndex =
      (this.playerPositionIndex + 1) % this.room.AlivePlayers.length;

    const playerStages = this.stageProcessor.createPlayerStage();

    while (playerStages.length > 0) {
      this.currentPlayerStage = playerStages.unshift();
      const nextPhase = this.stageProcessor.getInsidePlayerPhase(
        this.currentPlayerStage,
      );

      if (nextPhase !== this.currentPlayerPhase) {
        await this.onHandlePhaseChangeEvent(
          GameEventIdentifiers.PhaseChangeEvent,
          {
            from: this.currentPlayerPhase,
            to: nextPhase,
            fromPlayer: lastPlayer.Id,
            toPlayer: this.CurrentPlayer.Id,
          },
          async stage => {
            if (stage === PhaseChangeStage.PhaseChanged) {
              this.currentPlayerPhase = nextPhase;
              await this.onPhase(this.CurrentPlayerPhase);
            }

            return true;
          },
        );
      }

      lastPlayer = this.room.AlivePlayers[this.playerPositionIndex];
    }
  }

  public async onHandleIncomingEvent<
    T extends GameEventIdentifiers,
    E extends ServerEventFinder<T>
  >(
    identifier: T,
    event: E,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ): Promise<void> {
    switch (identifier) {
      case GameEventIdentifiers.PhaseChangeEvent:
        await this.onHandlePhaseChangeEvent(
          identifier as GameEventIdentifiers.PhaseChangeEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.GameStartEvent:
        await this.onHandleGameStartEvent(
          identifier as GameEventIdentifiers.GameStartEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.CardUseEvent:
        await this.onHandleCardUseEvent(
          identifier as GameEventIdentifiers.CardUseEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.AimEvent:
        await this.onHandleAimEvent(
          identifier as GameEventIdentifiers.AimEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.DamageEvent:
        this.onHandleDamgeEvent(
          identifier as GameEventIdentifiers.DamageEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.PinDianEvent:
        await this.onHandlePinDianEvent(
          identifier as GameEventIdentifiers.PinDianEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.DrawCardEvent:
        await this.onHandleDrawCardEvent(
          identifier as GameEventIdentifiers.DrawCardEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.CardDropEvent:
        await this.onHandleDropCardEvent(
          identifier as GameEventIdentifiers.CardDropEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.CardEffectEvent:
        await this.onHandleCardEffectEvent(
          identifier as GameEventIdentifiers.CardEffectEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.CardResponseEvent:
        await this.onHandleCardResponseEvent(
          identifier as GameEventIdentifiers.CardResponseEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.SkillUseEvent:
        await this.onHandleSkillUseEvent(
          identifier as GameEventIdentifiers.SkillUseEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.SkillEffectEvent:
        await this.onHandleSkillEffectEvent(
          identifier as GameEventIdentifiers.SkillEffectEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.JudgeEvent:
        await this.onHandleJudgeEvent(
          identifier as GameEventIdentifiers.JudgeEvent,
          event as any,
          onActualExecuted,
        );
      case GameEventIdentifiers.ObtainCardEvent:
        await this.onHandleObtainCardEvent(
          identifier as GameEventIdentifiers.ObtainCardEvent,
          event as any,
          onActualExecuted,
        );
      default:
        throw new Error(`Unknown incoming event: ${identifier}`);
    }

    return;
  }

  private iterateEachStage = async <T extends GameEventIdentifiers>(
    identifier: T,
    event: EventPicker<GameEventIdentifiers, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
    processor?: (stage: GameEventStage) => Promise<void>,
  ) => {
    let eventStage = this.stageProcessor.involve(identifier);
    while (this.stageProcessor.isInsideEvent(identifier, eventStage)) {
      await this.room.trigger<typeof event>(event, eventStage!);
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      if (onActualExecuted) {
        await onActualExecuted(eventStage!);
      }

      if (processor) {
        await processor(eventStage!);
      }

      eventStage = this.stageProcessor.nextInstantEvent();
    }
  };

  private async onHandleObtainCardEvent(
    identifier: GameEventIdentifiers.ObtainCardEvent,
    event: ServerEventFinder<GameEventIdentifiers.ObtainCardEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === ObtainCardStage.CardObtaining) {
        const to = this.room.getPlayerById(event.toId);
        // to.obtainCardIds(...event.cardIds);
        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} obtains {1} cards' + event.fromId ? ' from ${2}' : '',
          to.Name,
          event.cardIds.length,
          event.fromId ? this.room.getPlayerById(event.fromId).Name : '',
        );
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleDrawCardEvent(
    identifier: GameEventIdentifiers.DrawCardEvent,
    event: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} draws {1} cards',
      this.room.getPlayerById(event.playerId).Name,
      event.cardIds.length,
    );

    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === DrawCardStage.CardDrawing) {
        const { cardIds, playerId } = event;
        const to = this.room.getPlayerById(playerId);
        //Question?: How about xuyou?
        to.obtainCardIds(...cardIds);
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleDropCardEvent(
    identifier: GameEventIdentifiers.CardDropEvent,
    event: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} drops {1} cards',
      this.room.getPlayerById(event.fromId).Name,
      event.cardIds.length,
    );

    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardDropStage.CardDropping) {
        const from = this.room.getPlayerById(event.fromId);
        from.dropCards(...event.cardIds);
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleDamgeEvent(
    identifier: GameEventIdentifiers.DamageEvent,
    event: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const { toId, damage } = event;
    this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async (stage: GameEventStage) => {
        if (stage === DamageEffectStage.DamagedEffect) {
          this.room.getPlayerById(toId).onDamage(damage);
          this.room.broadcast(identifier, event);
        }
      },
    );
  }

  private async onHandleSkillUseEvent(
    identifier: GameEventIdentifiers.SkillUseEvent,
    event: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === SkillUseStage.SkillUsing) {
        this.room.broadcast(identifier, event);
      }
    });
  }
  private async onHandleSkillEffectEvent(
    identifier: GameEventIdentifiers.SkillEffectEvent,
    event: EventPicker<GameEventIdentifiers.SkillEffectEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === SkillEffectStage.SkillEffecting) {
        this.room.broadcast(identifier, event);
        const { skillName } = event;
        await Sanguosha.getSkillBySkillName(skillName).onEffect(
          this.room,
          event,
        );
      }
    });
  }

  private async onHandleAimEvent(
    identifier: GameEventIdentifiers.AimEvent,
    event: EventPicker<GameEventIdentifiers.AimEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    if (event.byCardId !== undefined) {
      const user = this.room.getPlayerById(event.fromId);
      event.toIds = event.toIds.filter(to =>
        user.canUseCardTo(this.room, event.byCardId!, to),
      );
    }

    this.iterateEachStage(identifier, event, onActualExecuted);
  }

  private async onHandleCardEffectEvent(
    identifier: GameEventIdentifiers.CardEffectEvent,
    event: EventPicker<GameEventIdentifiers.CardEffectEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage == CardEffectStage.BeforeCardEffect) {
        for (const player of this.room.getAlivePlayersFrom(
          this.CurrentPlayer.Id,
          true,
        )) {
          const wuxiekejiEvent = EventPacker.createIdentifierEvent(
            GameEventIdentifiers.AskForWuXieKeJiEvent,
            {
              fromId: event.fromId,
              cardId: event.cardId,
              cardUserId: event.fromId,
              translationsMessage: TranslationPack.translationJsonPatcher(
                'do you wanna use {0} for {1}' + event.fromId
                  ? ' from {2}'
                  : '',
                'wuxiekeji',
                TranslationPack.patchCardInTranslation(event.cardId),
                event.fromId ? this.room.getPlayerById(event.fromId).Name : '',
              ),
            },
          );
          this.room.notify(
            GameEventIdentifiers.AskForWuXieKeJiEvent,
            wuxiekejiEvent,
            player.Id,
          );

          const response = await this.room.onReceivingAsyncReponseFrom(
            GameEventIdentifiers.AskForWuXieKeJiEvent,
            player.Id,
          );

          if (response.cardId !== undefined) {
            const cardUseEvent = EventPacker.createIdentifierEvent(
              GameEventIdentifiers.CardUseEvent,
              {
                fromId: response.fromId,
                cardId: response.cardId,
                toCardIds: [event.cardId],
              },
            );
            await this.room.useCard(cardUseEvent);
            if (!EventPacker.isTerminated(cardUseEvent)) {
              EventPacker.terminate(event);
            }

            return;
          }
        }
      } else if (stage === CardEffectStage.CardEffecting) {
        const { cardId } = event;
        if (
          !(await Sanguosha.getCardById(cardId).Skill.onEffect(
            this.room,
            event,
          ))
        ) {
          this.stageProcessor.terminateEventProcess();
        }
      }
    });
  }

  private async onHandleCardUseEvent(
    identifier: GameEventIdentifiers.CardUseEvent,
    event: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Client>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardUseStage.CardUsing) {
        if (
          !(await Sanguosha.getCardById(event.cardId).Skill.onUse(
            this.room,
            event,
          ))
        ) {
          this.stageProcessor.terminateEventProcess();
        }
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleCardResponseEvent(
    identifier: GameEventIdentifiers.CardResponseEvent,
    event: EventPicker<
      GameEventIdentifiers.CardResponseEvent,
      WorkPlace.Server
    >,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardResponseStage.CardResponsing) {
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleJudgeEvent(
    identifier: GameEventIdentifiers.JudgeEvent,
    event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === JudgeEffectStage.JudgeEffect) {
        const { toId, cardId, judgeCardId } = event;
        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} got judged card {2} on card {1}',
          this.room.getPlayerById(toId).Name,
          TranslationPack.patchCardInTranslation(cardId),
          TranslationPack.patchCardInTranslation(judgeCardId),
        );
      }
    });
  }

  private async onHandlePinDianEvent(
    identifier: GameEventIdentifiers.PinDianEvent,
    event: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Client>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    let pindianResult: PinDianResultType | undefined;

    this.iterateEachStage(
      identifier,
      pindianResult || event,
      onActualExecuted,
      async stage => {
        if (stage === PinDianStage.PinDianEffect) {
          const { from, toIds } = event;
          const askForPinDianEvent: EventPicker<
            GameEventIdentifiers.AskForPinDianCardEvent,
            WorkPlace.Server
          > = {
            from,
          };

          this.room.notify(
            GameEventIdentifiers.AskForPinDianCardEvent,
            askForPinDianEvent,
            from,
          );
          toIds.forEach(to => {
            askForPinDianEvent.from = to;
            this.room.notify(
              GameEventIdentifiers.AskForPinDianCardEvent,
              askForPinDianEvent,
              to,
            );
          });

          const responses = await Promise.all([
            this.room.onReceivingAsyncReponseFrom(
              GameEventIdentifiers.AskForPinDianCardEvent,
              from,
            ),
            ...toIds.map(to =>
              this.room.onReceivingAsyncReponseFrom(
                GameEventIdentifiers.AskForPinDianCardEvent,
                to,
              ),
            ),
          ]);

          let winner: PlayerId | undefined;
          let largestCardNumber = 0;
          const pindianCards: CardId[] = [];

          for (const result of responses) {
            const pindianCard = Sanguosha.getCardById(result.pindianCard);
            if (pindianCard.CardNumber > largestCardNumber) {
              largestCardNumber = pindianCard.CardNumber;
              winner = result.from;
            } else if (pindianCard.CardNumber === largestCardNumber) {
              winner = undefined;
            }

            pindianCards.push(result.pindianCard);
          }

          pindianResult = {
            winner,
            pindianCards,
          };
        }
      },
    );
  }

  private onHandlePhaseChangeEvent(
    identifier: GameEventIdentifiers.PhaseChangeEvent,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === PhaseChangeStage.PhaseChanged) {
        this.room.broadcast(GameEventIdentifiers.PhaseChangeEvent, event);
      }
    });
  }

  private onHandleGameStartEvent(
    identifier: GameEventIdentifiers.GameStartEvent,
    event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === PhaseChangeStage.PhaseChanged) {
        this.room.broadcast(GameEventIdentifiers.GameStartEvent, event);
      }
    });
  }

  public turnToNextPlayer() {
    this.tryToThrowNotStartedError();
    this.playerPositionIndex =
      (this.playerPositionIndex + 1) % this.room.AlivePlayers.length;
  }

  public get CurrentPlayer() {
    this.tryToThrowNotStartedError();
    return this.room.AlivePlayers[this.playerPositionIndex];
  }

  public get CurrentGameStage() {
    this.tryToThrowNotStartedError();
    return this.stageProcessor.CurrentGameEventStage;
  }

  public get CurrentPlayerPhase() {
    this.tryToThrowNotStartedError();
    return this.currentPlayerPhase!;
  }
  public get CurrentPlayerStage() {
    this.tryToThrowNotStartedError();
    return this.currentPlayerStage!;
  }
}
