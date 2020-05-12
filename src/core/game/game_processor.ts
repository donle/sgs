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
  CardDropStage,
  CardEffectStage,
  CardMoveStage,
  CardResponseStage,
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  GameEventStage,
  GameStartStage,
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
import { Skill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ServerRoom } from '../room/room.server';
import { Sanguosha } from './engine';
import { GameCommonRules } from './game_rules';

export class GameProcessor {
  private playerPositionIndex = 0;
  private room: ServerRoom;
  private currentPlayerStage: PlayerPhaseStages | undefined;
  private currentPlayerPhase: PlayerPhase | undefined;
  private currentPhasePlayer: Player;
  private playerStages: PlayerPhaseStages[] = [];

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
    this.room.getPlayerById(playerId).obtainCardIds(...cardIds);
  }

  public async gameStart(room: ServerRoom, selectableCharacters: Character[]) {
    this.room = room;

    const playersInfo = this.room.Players.map(player => player.getPlayerInfo());
    await this.chooseCharacters(playersInfo, selectableCharacters);

    for (const player of playersInfo) {
      const gameStartEvent: ServerEventFinder<GameEventIdentifiers.GameStartEvent> = {
        currentPlayer: player,
        otherPlayers: playersInfo.filter(info => info.Id !== player.Id),
      };

      await this.onHandleIncomingEvent(GameEventIdentifiers.GameStartEvent, gameStartEvent, async stage => {
        if (stage === GameStartStage.BeforeGameStart) {
          await this.drawGameBeginsCards(player.Id);
        }

        return true;
      });
    }

    while (this.room.isPlaying() && !this.room.isGameOver() && !this.room.isClosed()) {
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
          this.room.addProcessingCards(judgeCardId.toString(), judgeCardId);

          await this.onHandleIncomingEvent(GameEventIdentifiers.CardEffectEvent, cardEffectEvent);

          this.room.endProcessOnTag(judgeCardId.toString());
          this.room.bury(judgeCardId);
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
            await this.room.useCard(response.event as ClientEventFinder<GameEventIdentifiers.CardUseEvent>);
          } else {
            await this.room.useSkill(response.event as ClientEventFinder<GameEventIdentifiers.SkillUseEvent>);
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
          const { responseEvent } = await this.room.askForCardDrop(
            this.CurrentPlayer.Id,
            discardAmount,
            [PlayerCardsArea.HandArea],
            true,
          );
          if (responseEvent) {
            await this.room.dropCards(CardMoveReason.SelfDrop, responseEvent.droppedCards, responseEvent.fromId);
          }
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

  private async play(player: Player, specifiedStages?: PlayerPhaseStages[]) {
    let lastPlayer = this.currentPhasePlayer;
    this.currentPhasePlayer = player;

    this.playerStages = specifiedStages ? specifiedStages : this.stageProcessor.createPlayerStage();

    while (this.playerStages.length > 0) {
      const nextPhase = this.stageProcessor.getInsidePlayerPhase(this.playerStages[0]);
      if (nextPhase !== this.currentPlayerPhase) {
        const phaseChangeEvent = EventPacker.createIdentifierEvent(GameEventIdentifiers.PhaseChangeEvent, {
          from: this.currentPlayerPhase,
          to: nextPhase,
          fromPlayer: lastPlayer?.Id,
          toPlayer: player.Id,
        });
        await this.onHandleIncomingEvent(GameEventIdentifiers.PhaseChangeEvent, phaseChangeEvent, async stage => {
          if (stage === PhaseChangeStage.BeforePhaseChange) {
            for (const player of this.room.AlivePlayers) {
              for (const skill of player.getSkills()) {
                if (this.currentPlayerPhase === PlayerPhase.PrepareStage) {
                  player.resetCardUseHistory();
                } else {
                  player.resetCardUseHistory('slash');
                }

                if (skill.isRefreshAt(nextPhase)) {
                  player.resetSkillUseHistory(skill.Name);
                }
              }
            }
          } else if (stage === PhaseChangeStage.PhaseChanged) {
            this.currentPlayerPhase = this.stageProcessor.getInsidePlayerPhase(this.playerStages[0]);
          }

          return true;
        });
        if (EventPacker.isTerminated(phaseChangeEvent)) {
          continue;
        }

        await this.onPhase(this.currentPlayerPhase!);
      }

      this.currentPlayerStage = this.playerStages[0];
      this.playerStages.shift();

      await this.onHandleIncomingEvent(
        GameEventIdentifiers.PhaseStageChangeEvent,
        EventPacker.createIdentifierEvent(GameEventIdentifiers.PhaseStageChangeEvent, {
          toStage: this.currentPlayerStage,
          playerId: this.CurrentPlayer.Id,
        }),
      );

      if (lastPlayer !== this.currentPhasePlayer) {
        lastPlayer = this.currentPhasePlayer;
      }
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
        if (!player.hasCard(new CardMatcher({ name: ['wuxiekeji'] }))) {
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
                    ? TranslationPack.wrapArrayParams(
                        ...event.toIds.map(toId => this.room.getPlayerById(toId).Character.Name),
                      )
                    : '',
                ).extract()
              : TranslationPack.translationJsonPatcher(
                  'do you wanna use {0} for {1}' + (event.toIds ? ' to {2}' : ''),
                  'wuxiekeji',
                  TranslationPack.patchCardInTranslation(event.cardId),
                  event.toIds
                    ? TranslationPack.wrapArrayParams(
                        ...event.toIds.map(toId => this.room.getPlayerById(toId).Character.Name),
                      )
                    : '',
                ).extract(),
          cardMatcher: new CardMatcher({
            name: ['wuxiekeji'],
          }).toSocketPassenger(),
          byCardId: event.cardId,
          cardUserId: event.fromId,
        };
        this.room.notify(GameEventIdentifiers.AskForCardUseEvent, wuxiekejiEvent, player.Id);

        pendingResponses[player.Id] = this.room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForCardUseEvent,
          player.Id,
        );
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
      }

      if (EventPacker.isTerminated(event)) {
        event.isCancelledOut = true;
        await this.room.trigger(event, CardEffectStage.CardEffectCancelledOut);

        EventPacker.isTerminated(event) && card.Skill.onEffectRejected(this.room, event);
      }
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

        const result = await this.room.askForCardUse(askForUseCardEvent, toId);
        const { responseEvent } = result;
        if (responseEvent && responseEvent.cardId !== undefined) {
          const jinkUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
            fromId: toId,
            cardId: responseEvent.cardId,
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
        await this.onHandleAskForPinDianEvent(
          identifier as GameEventIdentifiers.AskForPinDianCardEvent,
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
    let eventStage: GameEventStage | undefined = this.stageProcessor.involve(identifier);
    while (true) {
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      await this.room.trigger<typeof event>(event, eventStage);
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      if (onActualExecuted) {
        await onActualExecuted(eventStage!);
      }
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      if (processor) {
        await processor(eventStage!);
      }
      if (EventPacker.isTerminated(event)) {
        this.stageProcessor.skipEventProcess(identifier);
        break;
      }

      const nextStage = this.stageProcessor.getNextStage();
      if (this.stageProcessor.isInsideEvent(identifier, nextStage)) {
        eventStage = this.stageProcessor.next();
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

      if (stage === DrawCardStage.CardDrawing) {
        if (!event.translationsMessage) {
          event.translationsMessage = TranslationPack.translationJsonPatcher(
            '{0} draws {1} cards',
            TranslationPack.patchPlayerInTranslation(from),
            event.drawAmount,
          ).extract();
        }
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleDropCardEvent(
    identifier: GameEventIdentifiers.CardDropEvent,
    event: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    if (!event.translationsMessage) {
      event.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} drops cards {1}' + (event.droppedBy === event.fromId ? '' : ' by {2}'),
        TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(event.fromId)),
        TranslationPack.patchCardInTranslation(...Card.getActualCards(event.cardIds)),
        TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(event.droppedBy)),
      ).extract();
    }

    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardDropStage.CardDropping) {
        this.room.broadcast(identifier, event);
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
        const { toId, damage, damageType } = event;
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

        to.onDamage(damage);
        this.room.broadcast(identifier, event);

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
      }
    });
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

            this.room.notify(
              GameEventIdentifiers.AskForPeachEvent,
              {
                fromId: player.Id,
                toId: to.Id,
                conversation: TranslationPack.translationJsonPatcher(
                  '{0} asks for a peach',
                  TranslationPack.patchPlayerInTranslation(to),
                ).extract(),
              },
              player.Id,
            );

            const response = await this.room.onReceivingAsyncReponseFrom(
              GameEventIdentifiers.AskForPeachEvent,
              player.Id,
            );

            if (response.cardId !== undefined) {
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
    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === PlayerDiedStage.PlayerDied) {
        this.room.broadcast(identifier, event);
        const deadPlayer = this.room.getPlayerById(event.playerId);
        deadPlayer.bury();
        EventPacker.terminate(event);
        this.playerStages = [];

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
      const deadPlayer = this.room.getPlayerById(playerId);
      const allCards = deadPlayer.getCardIds();
      await this.room.moveCards({
        moveReason: CardMoveReason.PlaceToDropStack,
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
          const lordCards = killer.getPlayerCards();
          await this.room.moveCards({
            moveReason: CardMoveReason.PlaceToDropStack,
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

      if (stage == CardEffectStage.PreCardEffect) {
        await this.doCardEffect(identifier, event);
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
        if (Card.isVirtualCardId(event.cardId)) {
          const card = Sanguosha.getCardById<VirtualCard>(event.cardId);
          event.translationsMessage =
            card.ActualCardIds.length === 0
              ? TranslationPack.translationJsonPatcher(
                  '{0} used skill {1}, use card {2}' + (event.toIds ? ' to {3}' : ''),
                  TranslationPack.patchPlayerInTranslation(from),
                  card.GeneratedBySkill,
                  TranslationPack.patchCardInTranslation(card.Id),
                  event.toIds
                    ? TranslationPack.patchPlayerInTranslation(...event.toIds.map(id => this.room.getPlayerById(id)))
                    : '',
                ).extract()
              : TranslationPack.translationJsonPatcher(
                  '{0} used skill {1}, transformed {2} as {3} card' + (event.toIds ? ' used to {4}' : ' to use'),
                  TranslationPack.patchPlayerInTranslation(from),
                  card.GeneratedBySkill || '',
                  TranslationPack.patchCardInTranslation(...card.ActualCardIds),
                  TranslationPack.patchCardInTranslation(card.Id),
                  event.toIds
                    ? TranslationPack.patchPlayerInTranslation(...event.toIds.map(id => this.room.getPlayerById(id)))
                    : '',
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
    }

    this.room.broadcast(GameEventIdentifiers.CustomGameDialog, { translationsMessage: event.translationsMessage });
    event.translationsMessage = undefined;

    if (!event.skipDrop) {
      await this.room.moveCards({
        fromId: event.fromId,
        movingCards: [
          {
            card: event.cardId,
            fromArea: from.cardFrom(event.cardId),
          },
        ],
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.CardUse,
        hideBroadcast: true,
      });
    }

    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      event.toIds = event.toIds && this.room.deadPlayerFilters(event.toIds);
      if (stage === CardUseStage.CardUsing) {
        if (!card.is(CardType.Equip)) {
          await card.Skill.onUse(this.room, event);
          event.animation = event.animation || card.Skill.getAnimationSteps(event);

          if (card.is(CardType.DelayedTrick)) {
            EventPacker.terminate(event);
          }
        } else {
          await this.room.moveCards({
            movingCards: [{ card: card.Id, fromArea: from.cardFrom(card.Id) }],
            moveReason: CardMoveReason.CardUse,
            toId: from.Id,
            toArea: CardMoveArea.EquipArea,
          });
          EventPacker.terminate(event);
        }

        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleCardResponseEvent(
    identifier: GameEventIdentifiers.CardResponseEvent,
    event: EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const from = this.room.getPlayerById(event.fromId);

    if (!event.translationsMessage) {
      if (Card.isVirtualCardId(event.cardId)) {
        const card = Sanguosha.getCardById<VirtualCard>(event.cardId);
        event.translationsMessage =
          card.ActualCardIds.length === 0
            ? TranslationPack.translationJsonPatcher(
                '{0} used skill {1}, response card {2}',
                TranslationPack.patchPlayerInTranslation(from),
                card.GeneratedBySkill,
                TranslationPack.patchCardInTranslation(card.Id),
              ).extract()
            : TranslationPack.translationJsonPatcher(
                '{0} used skill {1}, transformed {2} as {3} card to response',
                TranslationPack.patchPlayerInTranslation(from),
                card.GeneratedBySkill,
                TranslationPack.patchCardInTranslation(...card.ActualCardIds),
                TranslationPack.patchCardInTranslation(card.Id),
              ).extract();
      } else {
        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} responses card {1}',
          TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(event.fromId)),
          TranslationPack.patchCardInTranslation(event.cardId),
        ).extract();
      }
    }
    this.room.broadcast(GameEventIdentifiers.CustomGameDialog, { translationsMessage: event.translationsMessage });
    event.translationsMessage = undefined;

    if (this.room.getProcessingCards(event.cardId.toString()).includes(event.cardId)) {
      await this.room.moveCards({
        movingCards: [
          {
            card: event.cardId,
            fromArea: from.cardFrom(event.cardId),
          },
        ],
        toArea: CardMoveArea.DropStack,
        fromId: event.fromId,
        moveReason: CardMoveReason.CardResponse,
        hideBroadcast: true,
      });
    }

    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardResponseStage.CardResponsing) {
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleMoveCardEvent(
    identifier: GameEventIdentifiers.MoveCardEvent,
    event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const { fromId, toArea, toId, movingCards, toOutsideArea, hideBroadcast, placeAtTheBottomOfDrawStack } = event;
    const to = toId && this.room.getPlayerById(toId);
    const from = fromId && this.room.getPlayerById(fromId);
    const cardIds = movingCards.map(cardInfo => cardInfo.card);

    if (!hideBroadcast) {
      if (from) {
        event.messages = event.messages || [];
        const lostCards = movingCards
          .filter(cardInfo => cardInfo.fromArea === CardMoveArea.EquipArea)
          .map(cardInfo => cardInfo.card);
        if (lostCards.length > 0 && fromId !== toId) {
          event.messages.push(
            TranslationPack.translationJsonPatcher(
              '{0} lost cards {1}',
              TranslationPack.patchPlayerInTranslation(from),
              TranslationPack.patchCardInTranslation(...Card.getActualCards(lostCards)),
            ).toString(),
          );
        } else {
          const moveOwnedCards = movingCards
            .filter(cardInfo => cardInfo.fromArea === CardMoveArea.HandArea)
            .map(cardInfo => cardInfo.card);
          if (moveOwnedCards.length > 0 && fromId !== toId) {
            event.messages.push(
              TranslationPack.translationJsonPatcher(
                '{0} lost {1} cards',
                TranslationPack.patchPlayerInTranslation(from),
                moveOwnedCards.length,
              ).toString(),
            );
          }
        }
      }
      if (to) {
        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} obtains cards {1}' + (fromId ? ' from {2}' : ''),
          TranslationPack.patchPlayerInTranslation(to),
          TranslationPack.patchCardInTranslation(...Card.getActualCards(cardIds)),
          fromId ? TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(fromId)) : '',
        ).extract();
        if (toArea === PlayerCardsArea.HandArea) {
          event.engagedPlayerIds = [];
          fromId && event.engagedPlayerIds.push(fromId);
          toId && event.engagedPlayerIds.push(toId);

          event.unengagedMessage = TranslationPack.translationJsonPatcher(
            '{0} obtains {1} cards' + (fromId ? ' from {2}' : ''),
            TranslationPack.patchPlayerInTranslation(to),
            cardIds.length,
            fromId ? TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(fromId)) : '',
          ).extract();
        }
      }
    }

    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === CardMoveStage.CardMoving) {
        Precondition.assert(event.toArea !== CardMoveArea.ProcessingArea, 'Unable to move cards into processing area');

        for (const { card, fromArea } of movingCards) {
          if (fromArea === CardMoveArea.DrawStack) {
            this.room.getCardFromDrawStack(card);
          } else if (fromArea === CardMoveArea.DropStack) {
            this.room.getCardFromDropStack(card);
          } else if (fromArea === CardMoveArea.ProcessingArea) {
            this.room.endProcessOnCard(card);
          } else if (from) {
            fromArea === CardMoveArea.JudgeArea ? from.dropCards(card) : from.dropCards(...Card.getActualCards([card]));
          }
        }

        if (toArea === CardMoveArea.DrawStack) {
          this.room.putCards(placeAtTheBottomOfDrawStack ? 'bottom' : 'top', ...cardIds);
        } else if (toArea === CardMoveArea.DropStack) {
          this.room.bury(...cardIds);
        } else {
          if (to) {
            if (toArea === CardMoveArea.EquipArea) {
              for (const cardId of cardIds) {
                const card = Sanguosha.getCardById<EquipCard>(cardId);
                const existingEquip = to.getEquipment(card.EquipType);
                if (existingEquip !== undefined) {
                  await this.room.moveCards({
                    fromId: to.Id,
                    moveReason: CardMoveReason.PlaceToDropStack,
                    toArea: CardMoveArea.DropStack,
                    movingCards: [{ card: existingEquip, fromArea: CardMoveArea.EquipArea }],
                  });
                }

                to.equip(card);
              }
            } else if (toArea === CardMoveArea.OutsideArea) {
              to.getCardIds((toArea as unknown) as PlayerCardsArea, toOutsideArea).push(...cardIds);
            } else {
              to.getCardIds(toArea as PlayerCardsArea).push(...cardIds);
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
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
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
        event.translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} got judged card {2} on {1}',
          TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(toId)),
          byCard ? TranslationPack.patchCardInTranslation(byCard) : bySkill!,
          TranslationPack.patchCardInTranslation(judgeCardId),
        ).extract();

        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleAskForPinDianEvent(
    identifier: GameEventIdentifiers.AskForPinDianCardEvent,
    event: ServerEventFinder<GameEventIdentifiers.AskForPinDianCardEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(identifier, event, onActualExecuted);
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
    return await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === GameStartStage.GameStarting) {
        this.room.broadcast(GameEventIdentifiers.GameStartEvent, event);
      }
    });
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

        victim.onLoseHp(event.lostHp);
        this.room.broadcast(GameEventIdentifiers.LoseHpEvent, event);

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
        to.onRecoverHp(event.recoveredHp);
        this.room.broadcast(GameEventIdentifiers.RecoverEvent, event);
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

  public async turnToNextPlayer() {
    this.tryToThrowNotStartedError();
    this.playerStages = [];
    let chosen = false;
    do {
      this.playerPositionIndex = (this.playerPositionIndex + 1) % this.room.Players.length;
      chosen = !this.room.Players[this.playerPositionIndex].Dead;
      if (!this.room.Players[this.playerPositionIndex].isFaceUp()) {
        await this.room.turnOver(this.room.Players[this.playerPositionIndex].Id);
        chosen = false;
        continue;
      }
    } while (!chosen);
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
}
