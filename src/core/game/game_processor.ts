import { Card, CardType, VirtualCard } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterId } from 'core/characters/character';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import {
  CardEffectStage,
  CardMoveStage,
  CardResponseStage,
  CardUseStage,
  ChainLockStage,
  DamageEffectStage,
  DrawCardStage,
  GameEventStage,
  HpChangeStage,
  JudgeEffectStage,
  LoseHpStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PinDianStage,
  PlayerDiedStage,
  PlayerDyingStage,
  PlayerPhase,
  PlayerPhaseStages,
  RecoverEffectStage,
  SkillEffectStage,
  SkillUseStage,
  StageProcessor,
  TurnOverStage,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { Logger } from 'core/shares/libs/logger/logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ServerRoom } from '../room/room.server';
import { Sanguosha } from './engine';
import { DamageType } from './game_props';
import { GameCommonRules } from './game_rules';

export class GameProcessor {
  private playerPositionIndex = 0;
  private room: ServerRoom;
  private currentPlayerStage: PlayerPhaseStages | undefined;
  private currentPlayerPhase: PlayerPhase | undefined;
  private currentPhasePlayer: Player;
  private currentProcessingStage: GameEventStage | undefined;
  private playerStages: PlayerPhaseStages[] = [];

  private toEndPhase: boolean = false;
  private playRoundInsertions: PlayerId[] = [];
  private dumpedLastPlayerPositionIndex: number = -1;

  constructor(private stageProcessor: StageProcessor, private logger: Logger) {}

  private tryToThrowNotStartedError() {
    Precondition.assert(this.room !== undefined, 'Game is not started yet');
  }

  private async chooseCharacters(playersInfo: PlayerInfo[], selectableCharacters: Character[]) {
    const lordInfo = playersInfo[0];
    const lordCharacters = Sanguosha.getLordCharacters(this.room.Info.characterExtensions).map(
      character => character.Id,
    );
    this.room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} is {1}, waiting for selecting a character',
        lordInfo.Name,
        Functional.getPlayerRoleRawText(PlayerRole.Lord),
      ).extract(),
    });
    const gameStartEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCharacterEvent>({
      characterIds: [
        ...lordCharacters,
        ...Sanguosha.getRandomCharacters(2, selectableCharacters, lordCharacters).map(character => character.Id),
      ],
      toId: lordInfo.Id,
      role: lordInfo.Role,
      isGameStart: true,
      translationsMessage: TranslationPack.translationJsonPatcher(
        'your role is {0}, please choose a lord',
        Functional.getPlayerRoleRawText(lordInfo.Role!),
      ).extract(),
    });
    this.room.notify(GameEventIdentifiers.AskForChoosingCharacterEvent, gameStartEvent, lordInfo.Id);

    const lordResponse = await this.room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      lordInfo.Id,
    );
    const lord = this.room.getPlayerById(lordInfo.Id);
    lord.CharacterId = lordResponse.chosenCharacter;
    lordInfo.MaxHp = lord.MaxHp;
    lordInfo.Hp = lord.Hp;

    if (playersInfo.length >= 5) {
      lordInfo.MaxHp++;
      lord.MaxHp++;
      lordInfo.Hp++;
      lord.Hp++;
    }

    lordInfo.CharacterId = lordResponse.chosenCharacter;

    const sequentialAsyncResponse: Promise<ClientEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent>>[] = [];

    const selectedCharacters: CharacterId[] = [lordInfo.CharacterId];
    for (let i = 1; i < playersInfo.length; i++) {
      const characters = Sanguosha.getRandomCharacters(3, selectableCharacters, selectedCharacters);
      characters.forEach(character => selectedCharacters.push(character.Id));

      const playerInfo = playersInfo[i];
      this.room.notify(
        GameEventIdentifiers.AskForChoosingCharacterEvent,
        {
          characterIds: characters.map(character => character.Id),
          lordInfo: {
            lordCharacter: lordInfo.CharacterId,
            lordId: lordInfo.Id,
          },
          toId: playerInfo.Id,
          role: playerInfo.Role,
          isGameStart: true,
          translationsMessage: TranslationPack.translationJsonPatcher(
            'lord is {0}, your role is {1}, please choose a character',
            Sanguosha.getCharacterById(lordInfo.CharacterId).Name,
            Functional.getPlayerRoleRawText(playerInfo.Role!),
          ).extract(),
        },
        playerInfo.Id,
      );

      sequentialAsyncResponse.push(
        this.room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForChoosingCharacterEvent, playerInfo.Id),
      );
    }

    for (const response of await Promise.all(sequentialAsyncResponse)) {
      const playerInfo = Precondition.exists(
        playersInfo.find(info => info.Id === response.fromId),
        'Unexpected player id received',
      );

      const player = this.room.getPlayerById(playerInfo.Id);
      player.CharacterId = response.chosenCharacter;
      playerInfo.CharacterId = response.chosenCharacter;
      playerInfo.MaxHp = player.MaxHp;
      playerInfo.Hp = player.Hp;
    }
  }

  private async drawGameBeginsCards(playerId: PlayerId) {
    const cardIds = this.room.getCards(4, 'top');
    this.room.transformCard(this.room.getPlayerById(playerId), cardIds, PlayerCardsArea.HandArea);

    const drawEvent: ServerEventFinder<GameEventIdentifiers.DrawCardEvent> = {
      drawAmount: cardIds.length,
      fromId: playerId,
      askedBy: playerId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} draws {1} cards',
        TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(playerId)),
        4,
      ).extract(),
    };

    this.room.broadcast(GameEventIdentifiers.DrawCardEvent, drawEvent);
    this.room.broadcast(GameEventIdentifiers.MoveCardEvent, {
      moveReason: CardMoveReason.CardDraw,
      movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
      toArea: CardMoveArea.HandArea,
      toId: playerId,
    });
    this.room
      .getPlayerById(playerId)
      .getCardIds(PlayerCardsArea.HandArea)
      .push(...cardIds);
  }

  public async gameStart(room: ServerRoom, selectableCharacters: Character[]) {
    this.room = room;

    const playersInfo = this.room.Players.map(player => player.getPlayerInfo());
    await this.chooseCharacters(playersInfo, selectableCharacters);

    const gameStartEvent: ServerEventFinder<GameEventIdentifiers.GameStartEvent> = {
      players: playersInfo,
    };

    await this.onHandleIncomingEvent(GameEventIdentifiers.GameStartEvent, gameStartEvent);
    for (const player of playersInfo) {
      await this.drawGameBeginsCards(player.Id);
    }

    let lastPlayerPosition = this.playerPositionIndex;
    while (this.room.isPlaying() && !this.room.isGameOver() && !this.room.isClosed()) {
      if (this.playerPositionIndex < lastPlayerPosition) {
        this.room.nextRound();
      }
      lastPlayerPosition = this.playerPositionIndex;

      await this.play(this.CurrentPlayer);
      await this.turnToNextPlayer();
    }
  }

  private async onPhase(phase: PlayerPhase) {
    Precondition.assert(phase !== undefined, 'Undefined phase');
    if (this.room.isClosed() || !this.room.isPlaying() || this.room.isGameOver()) {
      return;
    }

    switch (phase) {
      case PlayerPhase.JudgeStage:
        this.logger.debug('enter judge cards phase');
        const judgeCardIds = this.CurrentPlayer.getCardIds(PlayerCardsArea.JudgeArea);
        for (let i = judgeCardIds.length - 1; i >= 0; i--) {
          const judgeCardId = judgeCardIds[i];
          const cardEffectEvent: ServerEventFinder<GameEventIdentifiers.CardEffectEvent> = {
            cardId: judgeCardId,
            toIds: [this.CurrentPlayer.Id],
            nullifiedTargets: [],
            allTargets: Sanguosha.getCardById(judgeCardId).Skill.nominateForwardTarget([this.CurrentPlayer.Id]),
          };

          this.room.broadcast(GameEventIdentifiers.MoveCardEvent, {
            fromId: this.CurrentPlayer.Id,
            movingCards: [
              {
                fromArea: CardMoveArea.JudgeArea,
                card: judgeCardId,
              },
            ],
            toArea: CardMoveArea.DropStack,
            moveReason: CardMoveReason.PlaceToDropStack,
          });
          this.CurrentPlayer.dropCards(judgeCardId);

          await this.onHandleIncomingEvent(GameEventIdentifiers.CardEffectEvent, cardEffectEvent);

          if (this.toEndPhase === true) {
            this.toEndPhase = false;
            break;
          }
        }
        return;
      case PlayerPhase.DrawCardStage:
        this.logger.debug('enter draw cards phase');
        await this.room.drawCards(2, this.CurrentPlayer.Id);
        return;
      case PlayerPhase.PlayCardStage:
        this.logger.debug('enter play cards phase');
        do {
          this.room.notify(
            GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
            {
              toId: this.CurrentPlayer.Id,
            },
            this.CurrentPlayer.Id,
          );
          const response = await this.room.onReceivingAsyncReponseFrom(
            GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
            this.CurrentPlayer.Id,
          );

          if (response.end) {
            break;
          }

          if (response.eventName === GameEventIdentifiers.CardUseEvent) {
            const event = response.event as ClientEventFinder<GameEventIdentifiers.CardUseEvent>;

            if (await this.room.preUseCard(event)) {
              await this.room.useCard(event);
            }
          } else if (response.eventName === GameEventIdentifiers.SkillUseEvent) {
            await this.room.useSkill(response.event as ClientEventFinder<GameEventIdentifiers.SkillUseEvent>);
          } else {
            const reforgeEvent = response.event as ClientEventFinder<GameEventIdentifiers.ReforgeEvent>;
            await this.room.reforge(reforgeEvent.cardId, this.room.getPlayerById(reforgeEvent.fromId));
          }

          if (this.CurrentPlayer.Dead) {
            break;
          }
          if (this.toEndPhase === true) {
            this.toEndPhase = false;
            break;
          }
        } while (true);
        return;
      case PlayerPhase.DropCardStage:
        this.logger.debug('enter drop cards phase');
        const maxCardHold =
          GameCommonRules.getBaseHoldCardNumber(this.room, this.CurrentPlayer) +
          GameCommonRules.getAdditionalHoldCardNumber(this.room, this.CurrentPlayer);
        const discardAmount = this.CurrentPlayer.getCardIds(PlayerCardsArea.HandArea).length - maxCardHold;
        if (discardAmount > 0) {
          const response = await this.room.askForCardDrop(
            this.CurrentPlayer.Id,
            discardAmount,
            [PlayerCardsArea.HandArea],
            true,
          );

          await this.room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, response.fromId);
        }

        return;
      default:
        break;
    }
  }

  public skip(phase?: PlayerPhase) {
    if (phase === undefined) {
      this.playerStages = [];
    } else {
      this.playerStages = this.playerStages.filter(stage => !this.stageProcessor.isInsidePlayerPhase(phase, stage));
    }
  }

  public endPhase(phase: PlayerPhase) {
    this.toEndPhase = true;
    this.playerStages = this.playerStages.filter(stage => !this.stageProcessor.isInsidePlayerPhase(phase, stage));
  }

  private readonly processingPhaseStages = [
    PlayerPhaseStages.PrepareStage,
    PlayerPhaseStages.JudgeStage,
    PlayerPhaseStages.DrawCardStage,
    PlayerPhaseStages.PlayCardStage,
    PlayerPhaseStages.DropCardStage,
    PlayerPhaseStages.FinishStage,
  ];

  private async play(player: Player, specifiedStages?: PlayerPhaseStages[]) {
    if (!player.isFaceUp()) {
      await this.room.turnOver(player.Id);
      return;
    }

    let lastPlayer = this.currentPhasePlayer;
    this.currentPhasePlayer = player;

    this.playerStages = specifiedStages ? specifiedStages : this.stageProcessor.createPlayerStage();

    while (this.playerStages.length > 0) {
      const nextPhase = this.stageProcessor.getInsidePlayerPhase(this.playerStages[0]);

      const phaseChangeEvent = EventPacker.createIdentifierEvent(GameEventIdentifiers.PhaseChangeEvent, {
        from: this.currentPlayerPhase,
        to: nextPhase,
        fromPlayer: lastPlayer?.Id,
        toPlayer: player.Id,
      });
      if (nextPhase !== this.currentPlayerPhase) {
        await this.onHandleIncomingEvent(GameEventIdentifiers.PhaseChangeEvent, phaseChangeEvent, async stage => {
          if (this.toEndPhase) {
            EventPacker.terminate(phaseChangeEvent);
            this.toEndPhase = false;
            return false;
          }

          if (stage === PhaseChangeStage.BeforePhaseChange) {
            for (const player of this.room.AlivePlayers) {
              for (const skill of player.getSkills()) {
                if (this.currentPlayerPhase === PlayerPhase.PrepareStage) {
                  player.resetCardUseHistory();
                  player.hasDrunk() && this.room.clearHeaded(player.Id);
                } else {
                  player.resetCardUseHistory('slash');
                }

                if (skill.isRefreshAt(nextPhase)) {
                  player.resetSkillUseHistory(skill.Name);
                }
              }
            }
          } else if (stage === PhaseChangeStage.PhaseChanged) {
            this.currentPlayerPhase = nextPhase;
            if (this.currentPlayerPhase === PlayerPhase.PrepareStage) {
              this.room.Analytics.turnTo(this.CurrentPlayer.Id);
            }
          }

          return true;
        });
        if (EventPacker.isTerminated(phaseChangeEvent)) {
          continue;
        }

        do {
          if (this.playerStages.length === 0) {
            break;
          }

          await this.onHandleIncomingEvent(
            GameEventIdentifiers.PhaseStageChangeEvent,
            EventPacker.createIdentifierEvent(GameEventIdentifiers.PhaseStageChangeEvent, {
              toStage: this.currentPlayerStage!,
              playerId: this.CurrentPlayer.Id,
            }),
            async stage => {
              if (
                stage === PhaseStageChangeStage.StageChanged &&
                this.processingPhaseStages.includes(this.currentPlayerStage!)
              ) {
                await this.onPhase(this.currentPlayerPhase!);
              }
              return true;
            },
          );

          this.currentPlayerStage = this.playerStages.shift();
        } while (
          this.currentPlayerStage !== undefined &&
          this.stageProcessor.isInsidePlayerPhase(this.currentPlayerPhase!, this.currentPlayerStage)
        );
      }

      lastPlayer = this.currentPhasePlayer;
    }
  }

  private async doCardEffect(
    identifier: GameEventIdentifiers.CardEffectEvent,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const card = Sanguosha.getCardById(event.cardId);
    if (card.is(CardType.Trick)) {
      const pendingResponses: {
        [k in PlayerId]: Promise<ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent>>;
      } = {};
      for (const player of this.room.getAlivePlayersFrom(this.CurrentPlayer.Id)) {
        if (!player.hasCard(this.room, new CardMatcher({ name: ['wuxiekeji'] }))) {
          continue;
        }

        const wuxiekejiEvent = {
          toId: player.Id,
          conversation:
            event.fromId !== undefined
              ? TranslationPack.translationJsonPatcher(
                  'do you wanna use {0} for {1} from {2}' + (event.toIds ? ' to {3}' : ''),
                  'wuxiekeji',
                  TranslationPack.patchCardInTranslation(event.cardId),
                  TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(event.fromId)),
                  event.toIds
                    ? TranslationPack.patchPlayerInTranslation(
                        ...event.toIds.map(toId => this.room.getPlayerById(toId)),
                      )
                    : '',
                ).extract()
              : TranslationPack.translationJsonPatcher(
                  'do you wanna use {0} for {1}' + (event.toIds ? ' to {2}' : ''),
                  'wuxiekeji',
                  TranslationPack.patchCardInTranslation(event.cardId),
                  event.toIds
                    ? TranslationPack.patchPlayerInTranslation(
                        ...event.toIds.map(toId => this.room.getPlayerById(toId)),
                      )
                    : '',
                ).extract(),
          cardMatcher: new CardMatcher({
            name: ['wuxiekeji'],
          }).toSocketPassenger(),
          byCardId: event.cardId,
          cardUserId: event.fromId,
        };
        pendingResponses[player.Id] = this.room.askForCardUse(wuxiekejiEvent, player.Id);
      }

      let cardUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> | undefined;
      while (Object.keys(pendingResponses).length > 0) {
        const response = await Promise.race(Object.values(pendingResponses));
        if (response.cardId !== undefined) {
          cardUseEvent = {
            fromId: response.fromId,
            cardId: response.cardId,
            toCardIds: [event.cardId],
            responseToEvent: event,
          };
          break;
        } else {
          delete pendingResponses[response.fromId];
        }
      }

      for (const player of this.room.getAlivePlayersFrom(this.CurrentPlayer.Id)) {
        this.room.clearSocketSubscriber(identifier, player.Id);
      }

      if (cardUseEvent) {
        await this.room.useCard(cardUseEvent);
        if (!EventPacker.isTerminated(cardUseEvent)) {
          event.isCancelledOut = true;
          await this.room.trigger(event, CardEffectStage.CardEffectCancelledOut);

          event.isCancelledOut ? EventPacker.terminate(event) : EventPacker.recall(event);
        }
      }
      EventPacker.isTerminated(event) && card.Skill.onEffectRejected(this.room, event);
    } else if (card.GeneralName === 'slash') {
      const { toIds, fromId, cardId } = event;
      const targets = Precondition.exists(toIds, 'Unable to get slash target');
      Precondition.assert(targets.length === 1, 'slash effect target should be only one target');
      const toId = targets[0];

      if (!EventPacker.isDisresponsiveEvent(event)) {
        const askForUseCardEvent = {
          toId,
          cardMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
          byCardId: cardId,
          cardUserId: fromId,
          triggeredBySkills: event.triggeredBySkills
            ? [...event.triggeredBySkills, card.GeneralName]
            : [card.GeneralName],
          conversation:
            fromId !== undefined
              ? TranslationPack.translationJsonPatcher(
                  '{0} used {1} to you, please use a {2} card',
                  TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(fromId)),
                  TranslationPack.patchCardInTranslation(cardId),
                  'jink',
                ).extract()
              : TranslationPack.translationJsonPatcher(
                  'please use a {0} card to response {1}',
                  'jink',
                  TranslationPack.patchCardInTranslation(cardId),
                ).extract(),
          triggeredOnEvent: event,
        };

        const response = await this.room.askForCardUse(askForUseCardEvent, toId);
        if (response.cardId !== undefined) {
          const jinkUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
            fromId: toId,
            cardId: response.cardId,
            toCardIds: [cardId],
            responseToEvent: event,
          };
          await this.room.useCard(jinkUseEvent);

          if (!EventPacker.isTerminated(jinkUseEvent)) {
            event.isCancelledOut = true;
            await this.room.trigger(event, CardEffectStage.CardEffectCancelledOut);
            event.isCancelledOut ? EventPacker.terminate(event) : EventPacker.recall(event);
          }
        }
      }
    }
  }

  public async onHandleIncomingEvent<T extends GameEventIdentifiers, E extends ServerEventFinder<T>>(
    identifier: T,
    event: E,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ): Promise<void> {
    if (this.room.isClosed() || !this.room.isPlaying() || this.room.isGameOver()) {
      return;
    }

    switch (identifier) {
      case GameEventIdentifiers.PhaseChangeEvent:
        await this.onHandlePhaseChangeEvent(
          identifier as GameEventIdentifiers.PhaseChangeEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.PhaseStageChangeEvent:
        await this.onHandlePhaseStageChangeEvent(
          identifier as GameEventIdentifiers.PhaseStageChangeEvent,
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
        await this.onHandleAimEvent(identifier as GameEventIdentifiers.AimEvent, event as any, onActualExecuted);
        break;
      case GameEventIdentifiers.DamageEvent:
        await this.onHandleDamgeEvent(identifier as GameEventIdentifiers.DamageEvent, event as any, onActualExecuted);
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
      case GameEventIdentifiers.MoveCardEvent:
        await this.onHandleMoveCardEvent(
          identifier as GameEventIdentifiers.MoveCardEvent,
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
        await this.onHandleJudgeEvent(identifier as GameEventIdentifiers.JudgeEvent, event as any, onActualExecuted);
        break;
      case GameEventIdentifiers.LoseHpEvent:
        await this.onHandleLoseHpEvent(identifier as GameEventIdentifiers.LoseHpEvent, event as any, onActualExecuted);
        break;
      case GameEventIdentifiers.RecoverEvent:
        await this.onHandleRecoverEvent(
          identifier as GameEventIdentifiers.RecoverEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.PlayerTurnOverEvent:
        await this.onHandlePlayerTurnOverEvent(
          identifier as GameEventIdentifiers.PlayerTurnOverEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        await this.onHandlePlayerDiedEvent(
          identifier as GameEventIdentifiers.PlayerDiedEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.PlayerDyingEvent:
        await this.onHandleDyingEvent(
          identifier as GameEventIdentifiers.PlayerDyingEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.HpChangeEvent:
        await this.onHandleHpChangeEvent(
          identifier as GameEventIdentifiers.HpChangeEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.ChainLockedEvent:
        await this.onHandleChainLockedEvent(
          identifier as GameEventIdentifiers.ChainLockedEvent,
          event as any,
          onActualExecuted,
        );
        break;
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
    let processingStage: GameEventStage | undefined = this.stageProcessor.involve(identifier);
    while (true) {
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      this.currentProcessingStage = processingStage;
      await this.room.trigger<typeof event>(event, this.currentProcessingStage);
      this.currentProcessingStage = processingStage;
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      if (onActualExecuted) {
        this.currentProcessingStage = processingStage;
        await onActualExecuted(processingStage!);
        this.currentProcessingStage = processingStage;
      }
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      if (processor) {
        this.currentProcessingStage = processingStage;
        await processor(processingStage!);
        this.currentProcessingStage = processingStage;
      }
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      const nextStage = this.stageProcessor.getNextStage();
      if (this.stageProcessor.isInsideEvent(identifier, nextStage)) {
        processingStage = this.stageProcessor.next();
      } else {
        break;
      }
    }
  };

  private async onHandleDrawCardEvent(
    identifier: GameEventIdentifiers.DrawCardEvent,
    event: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const from = this.room.getPlayerById(event.fromId);
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (from.Dead) {
        EventPacker.terminate(event);
        return;
      }

      if (stage === DrawCardStage.CardDrawing && event.drawAmount > 0) {
        if (!event.translationsMessage) {
          event.translationsMessage = TranslationPack.translationJsonPatcher(
            '{0} draws {1} cards',
            TranslationPack.patchPlayerInTranslation(from),
            event.drawAmount,
          ).extract();
        }
        this.room.broadcast(identifier, event);

        const drawedCards = this.room.getCards(event.drawAmount, event.from || 'top');
        await this.room.moveCards({
          movingCards: drawedCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.DrawStack })),
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.CardDraw,
          hideBroadcast: true,
          movedByReason: event.triggeredBySkills ? event.triggeredBySkills[0] : undefined,
        });
      }
    });
  }

  private async onHandleDamgeEvent(
    identifier: GameEventIdentifiers.DamageEvent,
    event: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const to = this.room.getPlayerById(event.toId);
    const from = event.fromId ? this.room.getPlayerById(event.fromId) : undefined;
    return await this.iterateEachStage(identifier, event, onActualExecuted, async (stage: GameEventStage) => {
      if (to.Dead) {
        EventPacker.terminate(event);
        return;
      }

      if (stage === DamageEffectStage.DamagedEffect) {
        const { toId, damage, damageType, fromId } = event;
        event.fromId = from?.Dead ? undefined : from?.Id;

        event.translationsMessage = !from
          ? TranslationPack.translationJsonPatcher(
              '{0} got hurt for {1} hp with {2} property',
              TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(toId)),
              damage,
              damageType,
            ).extract()
          : TranslationPack.translationJsonPatcher(
              '{0} hits {1} {2} hp of damage type {3}',
              TranslationPack.patchPlayerInTranslation(from),
              TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(toId)),
              damage,
              damageType,
            ).extract();

        const hpChangeEvent: ServerEventFinder<GameEventIdentifiers.HpChangeEvent> = {
          fromId,
          toId,
          amount: damage,
          byReaon: 'damage',
          byCardIds: event.cardIds,
        };
        await this.onHandleIncomingEvent(GameEventIdentifiers.HpChangeEvent, hpChangeEvent, async hpChangeStage => {
          if (hpChangeStage === HpChangeStage.HpChanging) {
            this.room.broadcast(identifier, event);
          }
          return true;
        });
        EventPacker.copyPropertiesTo(hpChangeEvent, event);
        if (EventPacker.isTerminated(event)) {
          return;
        }

        const dyingEvent: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent> = {
          dying: to.Id,
          killedBy: event.fromId,
        };

        if (to.Hp <= 0) {
          await this.onHandleIncomingEvent(
            GameEventIdentifiers.PlayerDyingEvent,
            EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerDyingEvent, dyingEvent),
          );
        }

        if (to.ChainLocked && event.damageType !== DamageType.Normal) {
          await this.room.chainedOn(to.Id);
          await this.onChainedDamage(event);
        }
      }
    });
  }

  private async onChainedDamage(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    if (event.isFromChainedDamage) {
      return;
    }

    for (const player of this.room.getAlivePlayersFrom()) {
      if (player.ChainLocked) {
        await this.room.damage({
          ...event,
          toId: player.Id,
          isFromChainedDamage: true,
          beginnerOfTheDamage: event.fromId,
        });
      }
    }
  }

  private async onHandleDyingEvent(
    identifier: GameEventIdentifiers.PlayerDyingEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === PlayerDyingStage.PlayerDying) {
        const { dying } = event;
        const to = this.room.getPlayerById(dying);
        this.room.broadcast(GameEventIdentifiers.PlayerDyingEvent, {
          dying: to.Id,
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} is dying',
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
        });

        for (const player of this.room.getAlivePlayersFrom()) {
          let hasResponse = false;
          do {
            hasResponse = false;
            const response = await this.room.askForPeach({
              fromId: player.Id,
              toId: to.Id,
              conversation: TranslationPack.translationJsonPatcher(
                '{0} asks for a peach',
                TranslationPack.patchPlayerInTranslation(to),
              ).extract(),
            });

            if (response && response.cardId !== undefined) {
              hasResponse = true;
              const cardUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
                fromId: response.fromId,
                cardId: response.cardId,
                toIds: [to.Id],
              };

              await this.room.useCard(cardUseEvent);
            }
          } while (hasResponse && to.Hp <= 0);

          if (to.Hp > 0) {
            break;
          }
        }
      }
    });

    const { dying, killedBy } = event;
    const to = this.room.getPlayerById(dying);
    if (to.Hp <= 0) {
      await this.room.kill(to, killedBy);
      EventPacker.terminate(event);
    }
  }

  private async onHandlePlayerDiedEvent(
    identifier: GameEventIdentifiers.PlayerDiedEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    let isGameOver = false;
    const deadPlayer = this.room.getPlayerById(event.playerId);
    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === PlayerDiedStage.PlayerDied) {
        this.room.broadcast(identifier, event);
        deadPlayer.bury();

        const winners = this.room.getGameWinners();
        if (winners) {
          let winner = winners.find(player => player.Role === PlayerRole.Lord);
          if (winner === undefined) {
            winner = winners.find(player => player.Role === PlayerRole.Rebel);
          }
          if (winner === undefined) {
            winner = winners.find(player => player.Role === PlayerRole.Renegade);
          }

          this.stageProcessor.clearProcess();
          this.playerStages = [];
          this.room.gameOver();
          this.room.broadcast(GameEventIdentifiers.GameOverEvent, {
            translationsMessage: TranslationPack.translationJsonPatcher(
              'game over, winner is {0}',
              Functional.getPlayerRoleRawText(winner!.Role),
            ).extract(),
            winnerIds: winners.map(winner => winner.Id),
            loserIds: this.room.Players.filter(player => !winners.includes(player)).map(player => player.Id),
          });
          isGameOver = true;
        }
      }
    });

    if (!isGameOver) {
      const { killedBy, playerId } = event;
      const allCards = [
        ...deadPlayer.getCardIds(),
        ...Object.values(deadPlayer.getOutsideAreaCards).reduce<CardId[]>((allCards, cards) => {
          return [...allCards, ...cards];
        }, []),
      ];
      await this.room.moveCards({
        moveReason: CardMoveReason.PlaceToDropStack,
        fromId: playerId,
        movingCards: allCards.map(cardId => ({ card: cardId, fromArea: deadPlayer.cardFrom(cardId) })),
        toArea: CardMoveArea.DropStack,
      });
      if (this.room.CurrentPlayer.Id === playerId) {
        this.room.skip(playerId);
      }

      if (killedBy) {
        const killer = this.room.getPlayerById(killedBy);

        if (deadPlayer.Role === PlayerRole.Rebel) {
          await this.room.drawCards(3, killedBy);
        } else if (deadPlayer.Role === PlayerRole.Loyalist && killer.Role === PlayerRole.Lord) {
          const lordCards = Card.getActualCards(killer.getPlayerCards());
          await this.room.moveCards({
            moveReason: CardMoveReason.SelfDrop,
            fromId: killer.Id,
            movingCards: lordCards.map(cardId => ({ card: cardId, fromArea: killer.cardFrom(cardId) })),
            toArea: CardMoveArea.DropStack,
          });
        }
      }
    }
  }

  private async onHandleSkillUseEvent(
    identifier: GameEventIdentifiers.SkillUseEvent,
    event: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      event.toIds = event.toIds && this.room.deadPlayerFilters(event.toIds);
      if (stage === SkillUseStage.SkillUsing) {
        if (!event.translationsMessage && !Sanguosha.isShadowSkillName(event.skillName)) {
          event.translationsMessage = TranslationPack.translationJsonPatcher(
            '{0} used skill {1}' + (event.toIds && event.toIds.length > 0 ? ' to {2}' : ''),
            TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(event.fromId)),
            event.skillName,
            event.toIds
              ? TranslationPack.patchPlayerInTranslation(...event.toIds!.map(to => this.room.getPlayerById(to)))
              : '',
          ).extract();
        }
        const skill = Sanguosha.getSkillBySkillName(event.skillName);
        await skill.onUse(this.room, event);
        event.animation = event.animation || skill.getAnimationSteps(event);
      } else if (stage === SkillUseStage.AfterSkillUsed) {
        this.room.broadcast(identifier, event);
      }
    });
  }
  private async onHandleSkillEffectEvent(
    identifier: GameEventIdentifiers.SkillEffectEvent,
    event: EventPicker<GameEventIdentifiers.SkillEffectEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      event.toIds = event.toIds && this.room.deadPlayerFilters(event.toIds);
      if (stage === SkillEffectStage.SkillEffecting) {
        const { skillName } = event;
        await Sanguosha.getSkillBySkillName(skillName).onEffect(this.room, event);
      }
    });
  }

  private async onHandleAimEvent(
    identifier: GameEventIdentifiers.AimEvent,
    event: EventPicker<GameEventIdentifiers.AimEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      event.allTargets = this.room.deadPlayerFilters(event.allTargets);
      if (this.room.getPlayerById(event.toId).Dead) {
        EventPacker.terminate(event);
      }
      return;
    });
  }

  private async onHandleCardEffectEvent(
    identifier: GameEventIdentifiers.CardEffectEvent,
    event: EventPicker<GameEventIdentifiers.CardEffectEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const card = Sanguosha.getCardById(event.cardId);
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      event.toIds = event.toIds && this.room.deadPlayerFilters(event.toIds);
      event.allTargets = event.allTargets && this.room.deadPlayerFilters(event.allTargets);

      if (event.toIds && (event.toIds.length === 0 || event.nullifiedTargets!.includes(event.toIds[0]))) {
        EventPacker.terminate(event);
        return;
      }

      if (stage == CardEffectStage.PreCardEffect) {
        await this.doCardEffect(identifier, event);
      }

      if (event.toIds && (event.toIds.length === 0 || event.nullifiedTargets!.includes(event.toIds[0]))) {
        EventPacker.terminate(event);
        return;
      }

      if (stage === CardEffectStage.CardEffecting) {
        await card.Skill.onEffect(this.room, event);
      }
    });
  }

  private async onHandleCardUseEvent(
    identifier: GameEventIdentifiers.CardUseEvent,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const from = this.room.getPlayerById(event.fromId);
    const card = Sanguosha.getCardById(event.cardId);

    if (!event.translationsMessage) {
      if (card.is(CardType.Equip)) {
        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} equipped {1}',
          TranslationPack.patchPlayerInTranslation(from),
          TranslationPack.patchCardInTranslation(event.cardId),
        ).extract();
      } else {
        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} used card {1}' + (event.toIds || event.toCardIds ? ' to {2}' : ''),
          TranslationPack.patchPlayerInTranslation(from),
          TranslationPack.patchCardInTranslation(event.cardId),
          event.toIds
            ? TranslationPack.patchPlayerInTranslation(...event.toIds.map(id => this.room.getPlayerById(id)))
            : event.toCardIds
            ? TranslationPack.patchCardInTranslation(...event.toCardIds)
            : '',
        ).extract();
      }
    }

    this.room.broadcast(GameEventIdentifiers.CardUseEvent, event);
    event.translationsMessage = undefined;

    if (!this.room.isCardOnProcessing(event.cardId) && !card.is(CardType.DelayedTrick)) {
      this.room.addProcessingCards(event.cardId.toString(), event.cardId);
      await this.room.moveCards({
        movingCards: [{ card: event.cardId, fromArea: from.cardFrom(event.cardId) }],
        toArea: CardMoveArea.ProcessingArea,
        fromId: from.Id,
        moveReason: CardMoveReason.CardUse,
      });
    }

    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      event.toIds = event.toIds && this.room.deadPlayerFilters(event.toIds);
      if (stage === CardUseStage.CardUsing) {
        if (!card.is(CardType.Equip)) {
          event.animation = event.animation || card.Skill.getAnimationSteps(event);

          if (card.is(CardType.DelayedTrick)) {
            EventPacker.terminate(event);
          }
        } else {
          let existingEquipId = from.getEquipment((card as EquipCard).EquipType);
          if (card.isVirtualCard()) {
            const actualEquip = Sanguosha.getCardById<EquipCard>((card as VirtualCard).ActualCardIds[0]);
            existingEquipId = from.getEquipment(actualEquip.EquipType);
          }

          if (existingEquipId !== undefined) {
            await this.room.moveCards({
              fromId: from.Id,
              moveReason: CardMoveReason.PlaceToDropStack,
              toArea: CardMoveArea.DropStack,
              movingCards: [{ card: existingEquipId, fromArea: CardMoveArea.EquipArea }],
            });
          }
          await this.room.moveCards({
            movingCards: [{ card: card.Id, fromArea: CardMoveArea.ProcessingArea }],
            moveReason: CardMoveReason.CardUse,
            toId: from.Id,
            toArea: CardMoveArea.EquipArea,
          });
        }

        this.room.broadcast(identifier, event);
      }
    });

    if (!event.skipDrop) {
      if (this.room.isCardOnProcessing(card.Id)) {
        this.room.endProcessOnTag(card.Id.toString());
      }
      if (!card.is(CardType.Equip) && !card.is(CardType.DelayedTrick)) {
        this.room.bury(event.cardId);
      }
    }
  }

  private async onHandleCardResponseEvent(
    identifier: GameEventIdentifiers.CardResponseEvent,
    event: EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const from = this.room.getPlayerById(event.fromId);

    if (!event.translationsMessage) {
      event.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} responses card {1}',
        TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(event.fromId)),
        TranslationPack.patchCardInTranslation(event.cardId),
      ).extract();
    }
    this.room.broadcast(GameEventIdentifiers.CustomGameDialog, { translationsMessage: event.translationsMessage });
    event.translationsMessage = undefined;

    if (!this.room.isCardOnProcessing(event.cardId)) {
      this.room.addProcessingCards(event.cardId.toString(), event.cardId);
      await this.room.moveCards({
        movingCards: [{ card: event.cardId, fromArea: from.cardFrom(event.cardId) }],
        toArea: CardMoveArea.ProcessingArea,
        fromId: event.fromId,
        moveReason: CardMoveReason.CardResponse,
        hideBroadcast: true,
      });
    }

    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardResponseStage.CardResponsing) {
        this.room.broadcast(identifier, event);
      }
    });

    if (!event.skipDrop) {
      if (this.room.isCardOnProcessing(event.cardId)) {
        this.room.endProcessOnTag(event.cardId.toString());
      }
      this.room.bury(event.cardId);
    }
  }

  private async onHandleMoveCardEvent(
    identifier: GameEventIdentifiers.MoveCardEvent,
    event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const {
      fromId,
      toArea,
      toId,
      movingCards,
      moveReason,
      toOutsideArea,
      hideBroadcast,
      placeAtTheBottomOfDrawStack,
      isOutsideAreaInPublic,
      proposer,
    } = event;
    let to = toId && this.room.getPlayerById(toId);
    if (to && to.Dead) {
      event.toId = undefined;
      event.toArea = CardMoveArea.DropStack;
      event.moveReason = CardMoveReason.PlaceToDropStack;
      to = undefined;
    }

    const from = fromId && this.room.getPlayerById(fromId);
    const cardIds = movingCards.map(cardInfo => cardInfo.card);
    const actualCardIds = Card.getActualCards(cardIds);

    if (!hideBroadcast) {
      if (from) {
        event.messages = event.messages || [];
        const lostCards = movingCards
          .filter(cardInfo => cardInfo.fromArea === CardMoveArea.EquipArea)
          .map(cardInfo => cardInfo.card);
        if (lostCards.length > 0 && fromId !== toId) {
          if (moveReason === CardMoveReason.PlaceToDropStack) {
            event.messages.push(
              TranslationPack.translationJsonPatcher(
                '{0} has been placed into drop stack from {1}',
                TranslationPack.patchCardInTranslation(...Card.getActualCards(lostCards)),
                TranslationPack.patchPlayerInTranslation(from),
              ).toString(),
            );
          } else if (moveReason === CardMoveReason.PlaceToDrawStack) {
            event.messages.push(
              TranslationPack.translationJsonPatcher(
                `{0} has been placed on the ${placeAtTheBottomOfDrawStack ? 'bottom' : 'top'} of draw stack from {1}`,
                TranslationPack.patchCardInTranslation(...Card.getActualCards(lostCards)),
                TranslationPack.patchPlayerInTranslation(from),
              ).toString(),
            );
          } else {
            event.messages.push(
              TranslationPack.translationJsonPatcher(
                '{0} lost card {1}',
                TranslationPack.patchPlayerInTranslation(from),
                TranslationPack.patchCardInTranslation(...Card.getActualCards(lostCards)),
              ).toString(),
            );
          }
        }

        const moveOwnedCards = movingCards
          .filter(cardInfo => cardInfo.fromArea === CardMoveArea.HandArea)
          .map(cardInfo => cardInfo.card);
        if ([CardMoveReason.SelfDrop, CardMoveReason.PassiveDrop].includes(moveReason)) {
          event.messages.push(
            TranslationPack.translationJsonPatcher(
              '{0} drops cards {1}' + (proposer !== undefined && proposer !== fromId ? ' by {2}' : ''),
              TranslationPack.patchPlayerInTranslation(from),
              TranslationPack.patchCardInTranslation(...moveOwnedCards),
              proposer !== undefined ? TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(proposer)) : '',
            ).toString(),
          );
        } else if (
          ![CardMoveReason.CardUse, CardMoveReason.CardResponse].includes(moveReason) &&
          moveOwnedCards.length > 0 &&
          fromId !== toId
        ) {
          event.messages.push(
            TranslationPack.translationJsonPatcher(
              '{0} lost {1} cards',
              TranslationPack.patchPlayerInTranslation(from),
              moveOwnedCards.length,
            ).toString(),
          );
        }
      }
      if (!event.translationsMessage && to) {
        if (toArea === PlayerCardsArea.HandArea) {
          const isPrivateCardMoving = !!movingCards.find(({ fromArea }) => fromArea === CardMoveArea.HandArea);
          if (isPrivateCardMoving) {
            event.engagedPlayerIds = [];
            fromId && event.engagedPlayerIds.push(fromId);
            toId && event.engagedPlayerIds.push(toId);
          }

          event.translationsMessage = TranslationPack.translationJsonPatcher(
            '{0} obtains cards {1}' + (fromId ? ' from {2}' : ''),
            TranslationPack.patchPlayerInTranslation(to),
            TranslationPack.patchCardInTranslation(...actualCardIds),
            fromId ? TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(fromId)) : '',
          ).extract();

          event.unengagedMessage = TranslationPack.translationJsonPatcher(
            '{0} obtains {1} cards' + (fromId ? ' from {2}' : ''),
            TranslationPack.patchPlayerInTranslation(to),
            cardIds.length,
            fromId ? TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(fromId)) : '',
          ).extract();
        } else if (toArea === PlayerCardsArea.OutsideArea) {
          if (isOutsideAreaInPublic) {
            event.translationsMessage = TranslationPack.translationJsonPatcher(
              '{0} move cards {1} onto the top of character card',
              TranslationPack.patchPlayerInTranslation(to),
              TranslationPack.patchCardInTranslation(...actualCardIds),
            ).extract();
          } else {
            event.engagedPlayerIds = [to.Id];
            event.unengagedMessage = TranslationPack.translationJsonPatcher(
              '{0} move {1} cards onto the top of character card',
              TranslationPack.patchPlayerInTranslation(to),
              actualCardIds.length,
            ).extract();
          }
        }
      }
    }

    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardMoveStage.CardMoving) {
        for (const { card, fromArea } of movingCards) {
          if (fromArea === CardMoveArea.DrawStack) {
            this.room.getCardFromDrawStack(card);
          } else if (fromArea === CardMoveArea.DropStack) {
            this.room.getCardFromDropStack(card);
          } else if (fromArea === CardMoveArea.ProcessingArea) {
            this.room.endProcessOnCard(card);
          } else if (from) {
            from.dropCards(card);
          }
        }

        if (toArea === CardMoveArea.DrawStack) {
          this.room.putCards(placeAtTheBottomOfDrawStack ? 'bottom' : 'top', ...actualCardIds);
        } else if (toArea === CardMoveArea.DropStack) {
          this.room.bury(...cardIds);
        } else if (toArea === CardMoveArea.ProcessingArea) {
          const processingCards = cardIds.filter(cardId => !this.room.isCardOnProcessing(cardId));
          this.room.addProcessingCards(processingCards.join('+'), ...processingCards);
        } else {
          if (to) {
            if (toArea === CardMoveArea.EquipArea) {
              this.room.transformCard(to, actualCardIds, PlayerCardsArea.EquipArea);
              for (const cardId of actualCardIds) {
                const card = Sanguosha.getCardById<EquipCard>(cardId);
                const existingEquip = to.getEquipment(card.EquipType);
                Precondition.assert(
                  existingEquip === undefined,
                  `Cannot move card ${cardId} to equip area since there is an existing same type of equip`,
                );
                to.equip(card);
              }
            } else if (toArea === CardMoveArea.OutsideArea) {
              to.getCardIds((toArea as unknown) as PlayerCardsArea, toOutsideArea).push(...actualCardIds);
            } else if (toArea === CardMoveArea.HandArea) {
              this.room.transformCard(to, actualCardIds, PlayerCardsArea.HandArea);
              to.getCardIds((toArea as unknown) as PlayerCardsArea).push(...actualCardIds);
            } else {
              const transformedDelayedTricks = cardIds.map(cardId => {
                if (!Card.isVirtualCardId(cardId)) {
                  return cardId;
                }

                const card = Sanguosha.getCardById<VirtualCard>(cardId);
                if (card.ActualCardIds.length === 1) {
                  const originalCard = Sanguosha.getCardById(card.ActualCardIds[0]);
                  if (card.Suit !== originalCard.Suit) {
                    card.Suit = originalCard.Suit;
                  }
                  if (card.CardNumber !== originalCard.CardNumber) {
                    card.CardNumber = originalCard.CardNumber;
                  }
                  return card.Id;
                }

                return cardId;
              });
              to.getCardIds((toArea as unknown) as PlayerCardsArea).push(...transformedDelayedTricks);
            }
          }
        }

        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleJudgeEvent(
    identifier: GameEventIdentifiers.JudgeEvent,
    event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.room.addProcessingCards(event.judgeCardId.toString(), event.judgeCardId);

    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      const { toId, bySkill, byCard, judgeCardId } = event;

      if (stage === JudgeEffectStage.OnJudge) {
        this.room.broadcast(GameEventIdentifiers.CustomGameDialog, {
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} starts a judge of {1}, judge card is {2}',
            TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(event.toId)),
            byCard ? TranslationPack.patchCardInTranslation(byCard) : bySkill!,
            TranslationPack.patchCardInTranslation(event.judgeCardId),
          ).extract(),
        });
      } else if (stage === JudgeEffectStage.JudgeEffect) {
        const to = this.room.getPlayerById(toId);
        this.room.transformCard(to, event);

        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} got judged card {2} on {1}',
          TranslationPack.patchPlayerInTranslation(to),
          byCard ? TranslationPack.patchCardInTranslation(byCard) : bySkill!,
          TranslationPack.patchCardInTranslation(judgeCardId),
        ).extract();

        this.room.broadcast(identifier, event);
      }
    });

    this.room.endProcessOnTag(event.judgeCardId.toString());
    this.room.bury(event.judgeCardId);
  }

  private async onHandlePinDianEvent(
    identifier: GameEventIdentifiers.PinDianEvent,
    event: ServerEventFinder<GameEventIdentifiers.PinDianEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(GameEventIdentifiers.PinDianEvent, event, onActualExecuted);
  }

  private async onHandlePhaseChangeEvent(
    identifier: GameEventIdentifiers.PhaseChangeEvent,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (this.room.getPlayerById(event.toPlayer).Dead) {
        this.skip();
        EventPacker.terminate(event);
      } else if (stage === PhaseChangeStage.PhaseChanged) {
        this.room.broadcast(GameEventIdentifiers.PhaseChangeEvent, event);
      }
    });
  }

  private async onHandlePhaseStageChangeEvent(
    identifier: GameEventIdentifiers.PhaseStageChangeEvent,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (this.room.getPlayerById(event.playerId).Dead) {
        this.skip();
        EventPacker.terminate(event);
      } else if (stage === PhaseStageChangeStage.StageChanged) {
        this.room.broadcast(GameEventIdentifiers.PhaseStageChangeEvent, event);
      }
    });
  }

  private async onHandleGameStartEvent(
    identifier: GameEventIdentifiers.GameStartEvent,
    event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    this.room.broadcast(GameEventIdentifiers.GameStartEvent, event);
    return await this.iterateEachStage(identifier, event, onActualExecuted);
  }

  private async onHandleLoseHpEvent(
    identifier: GameEventIdentifiers.LoseHpEvent,
    event: ServerEventFinder<GameEventIdentifiers.LoseHpEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const victim = this.room.getPlayerById(event.toId);
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (victim.Dead) {
        EventPacker.terminate(event);
        return;
      }

      if (stage === LoseHpStage.LosingHp) {
        if (event.translationsMessage === undefined) {
          event.translationsMessage = TranslationPack.translationJsonPatcher(
            '{0} lost {1} hp',
            TranslationPack.patchPlayerInTranslation(victim),
            event.lostHp,
          ).extract();
        }

        const hpChangeEvent: ServerEventFinder<GameEventIdentifiers.HpChangeEvent> = {
          toId: victim.Id,
          amount: event.lostHp,
          byReaon: 'lostHp',
        };
        await this.onHandleIncomingEvent(GameEventIdentifiers.HpChangeEvent, hpChangeEvent, async stage => {
          if (stage === HpChangeStage.HpChanging) {
            this.room.broadcast(identifier, event);
          }
          return true;
        });
        EventPacker.copyPropertiesTo(hpChangeEvent, event);
        if (EventPacker.isTerminated(event)) {
          return;
        }

        const dyingEvent: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent> = {
          dying: victim.Id,
        };

        if (victim.Hp <= 0) {
          await this.onHandleIncomingEvent(
            GameEventIdentifiers.PlayerDyingEvent,
            EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerDyingEvent, dyingEvent),
          );
        }
      }
    });
  }

  private async onHandleHpChangeEvent(
    identifier: GameEventIdentifiers.HpChangeEvent,
    event: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const to = this.room.getPlayerById(event.toId);
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === HpChangeStage.HpChanging) {
        if (event.byReaon === 'recover') {
          to.changeHp(event.amount);
        } else {
          to.changeHp(0 - event.amount);
        }
      }
    });
  }

  private async onHandleRecoverEvent(
    identifier: GameEventIdentifiers.RecoverEvent,
    event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const to = this.room.getPlayerById(event.toId);
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (to.Dead) {
        EventPacker.terminate(event);
        return;
      }

      if (stage === RecoverEffectStage.RecoverEffecting) {
        const hpChangeEvent: ServerEventFinder<GameEventIdentifiers.HpChangeEvent> = {
          fromId: event.recoverBy,
          toId: to.Id,
          amount: event.recoveredHp,
          byReaon: 'recover',
          byCardIds: event.cardIds,
        };
        await this.onHandleIncomingEvent(GameEventIdentifiers.HpChangeEvent, hpChangeEvent, async stage => {
          if (stage === HpChangeStage.HpChanging) {
            this.room.broadcast(identifier, event);
          }
          return true;
        });
        EventPacker.copyPropertiesTo(hpChangeEvent, event);
      }
    });
  }

  private async onHandleChainLockedEvent(
    identifier: GameEventIdentifiers.ChainLockedEvent,
    event: ServerEventFinder<GameEventIdentifiers.ChainLockedEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === ChainLockStage.Chaining) {
        const player = this.room.getPlayerById(event.toId);
        player.ChainLocked = event.linked;
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandlePlayerTurnOverEvent(
    identifier: GameEventIdentifiers.PlayerTurnOverEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === TurnOverStage.TurningOver) {
        const player = this.room.getPlayerById(event.toId);
        player.turnOver();

        if (event.translationsMessage === undefined) {
          event.translationsMessage = TranslationPack.translationJsonPatcher(
            '{0} turned over the charactor card, who is {1} right now',
            TranslationPack.patchPlayerInTranslation(player),
            player.isFaceUp() ? 'facing up' : 'turning over',
          ).extract();
        }

        this.room.broadcast(identifier, event);
      }
    });
  }

  public insertPlayerRound(player: PlayerId) {
    this.playRoundInsertions.push(player);
  }

  public async turnToNextPlayer() {
    this.tryToThrowNotStartedError();
    this.playerStages = [];
    let chosen = false;

    if (this.playRoundInsertions.length > 0) {
      while (this.playRoundInsertions.length > 0 && !chosen) {
        const player = this.room.getPlayerById(this.playRoundInsertions.shift()!);
        if (player.Dead) {
          continue;
        } else {
          this.dumpedLastPlayerPositionIndex = this.playerPositionIndex;
          this.playerPositionIndex = player.Position;
          chosen = true;
          break;
        }
      }
    }

    while (!chosen) {
      const nextIndex =
        (this.dumpedLastPlayerPositionIndex >= 0 ? this.dumpedLastPlayerPositionIndex : this.playerPositionIndex) + 1;
      this.dumpedLastPlayerPositionIndex = -1;

      this.playerPositionIndex = nextIndex % this.room.Players.length;
      chosen = !this.room.Players[this.playerPositionIndex].Dead;
    }
  }

  public get CurrentPlayer() {
    this.tryToThrowNotStartedError();
    return this.room.Players[this.playerPositionIndex];
  }

  public get CurrentPhasePlayer() {
    this.tryToThrowNotStartedError();
    return this.currentPhasePlayer!;
  }

  public get CurrentPlayerPhase() {
    this.tryToThrowNotStartedError();
    return this.currentPlayerPhase!;
  }
  public get CurrentPlayerStage() {
    this.tryToThrowNotStartedError();
    return this.currentPlayerStage!;
  }

  public get CurrentProcessingStage() {
    this.tryToThrowNotStartedError();
    return this.currentProcessingStage;
  }
}
