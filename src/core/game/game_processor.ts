import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Character, CharacterId } from 'core/characters/character';
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
  CardLoseStage,
  CardResponseStage,
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  GameEventStage,
  GameStartStage,
  JudgeEffectStage,
  LoseHpStage,
  ObtainCardStage,
  PhaseChangeStage,
  PinDianStage,
  PlayerDyingStage,
  PlayerPhase,
  PlayerStageListEnum,
  RecoverEffectStage,
  SkillEffectStage,
  SkillUseStage,
  StageProcessor,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import {
  getPlayerRoleRawText,
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
  PlayerRole,
} from 'core/player/player_props';
import { Logger } from 'core/shares/libs/logger/logger';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ServerRoom } from '../room/room.server';
import { Sanguosha } from './engine';
import { GameCommonRules } from './game_rules';

export class GameProcessor {
  private playerPositionIndex = 0;
  private room: ServerRoom;
  private currentPlayerStage: PlayerStageListEnum | undefined;
  private currentPlayerPhase: PlayerPhase | undefined;
  private currentPhasePlayer: Player;

  constructor(private stageProcessor: StageProcessor, private logger: Logger) {}

  private tryToThrowNotStartedError() {
    if (!this.room) {
      throw new Error('Game is not started yet');
    }
  }

  private async chooseCharacters(
    playersInfo: PlayerInfo[],
    selectableCharacters: Character[],
  ) {
    const lordInfo = playersInfo[0];
    const gameStartEvent = EventPacker.createUncancellableEvent<
      GameEventIdentifiers.AskForChooseCharacterEvent
    >({
      characterIds: Sanguosha.getLordCharacters(
        this.room.Info.characterExtensions,
      ).map(character => character.Id),
      role: lordInfo.Role,
      isGameStart: true,
      translationsMessage: TranslationPack.translationJsonPatcher(
        'your role is {0}, please choose a lord',
        getPlayerRoleRawText(lordInfo.Role!),
      ).extract(),
    });
    this.room.notify(
      GameEventIdentifiers.AskForChooseCharacterEvent,
      gameStartEvent,
      lordInfo.Id,
    );

    const lordResponse = await this.room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChooseCharacterEvent,
      lordInfo.Id,
    );
    this.room.getPlayerById(lordInfo.Id).CharacterId =
      lordResponse.chosenCharacter;
    lordInfo.CharacterId = lordResponse.chosenCharacter;

    const sequentialAsyncResponse: Promise<
      ClientEventFinder<GameEventIdentifiers.AskForChooseCharacterEvent>
    >[] = [];

    const selectedCharacters: CharacterId[] = [lordInfo.CharacterId];
    for (let i = 1; i < playersInfo.length; i++) {
      const characters = Sanguosha.getRandomCharacters(
        3,
        selectableCharacters,
        selectedCharacters,
      );
      characters.forEach(character => selectedCharacters.push(character.Id));

      const playerInfo = playersInfo[i];
      this.room.notify(
        GameEventIdentifiers.AskForChooseCharacterEvent,
        {
          characterIds: characters.map(character => character.Id),
          lordInfo: {
            lordCharacter: lordInfo.CharacterId,
            lordId: lordInfo.Id,
          },
          role: playerInfo.Role,
          isGameStart: true,
          translationsMessage: TranslationPack.translationJsonPatcher(
            'lord is {0}, your role is {1}, please choose a character',
            Sanguosha.getCharacterById(lordInfo.CharacterId).Name,
            getPlayerRoleRawText(playerInfo.Role!),
          ).extract(),
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
        askedBy: player.Id,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} draws {1} cards',
          player.Name,
          4,
        ).extract(),
      };

      this.room.broadcast(GameEventIdentifiers.DrawCardEvent, drawEvent);
      this.room.getPlayerById(player.Id).obtainCardIds(...cardIds);
    }
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

      await this.onHandleIncomingEvent(
        GameEventIdentifiers.GameStartEvent,
        gameStartEvent,
      );
    }
    this.drawGameBeginsCards(playersInfo);

    while (this.room.AlivePlayers.length > 1) {
      await this.play(this.CurrentPlayer);
      this.turnToNextPlayer();
    }
  }

  private async onPhase(phase: PlayerPhase) {
    if (phase === undefined) {
      throw new Error('Undefined phase');
    }
    switch (phase) {
      case PlayerPhase.JudgeStage:
        this.logger.debug('enter judge cards phase');
        const judgeCardIds = this.CurrentPlayer.getCardIds(
          PlayerCardsArea.JudgeArea,
        );
        for (const judgeCardId of judgeCardIds) {
          const cardEffectEvent: ServerEventFinder<GameEventIdentifiers.CardEffectEvent> = {
            cardId: judgeCardId,
            toIds: [this.CurrentPlayer.Id],
          };
          await this.onHandleCardEffectEvent(
            GameEventIdentifiers.CardEffectEvent,
            cardEffectEvent,
          );
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
              fromId: this.CurrentPlayer.Id,
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
            await this.room.useCard(
              response.event as ClientEventFinder<
                GameEventIdentifiers.CardUseEvent
              >,
            );
          } else {
            await this.room.useSkill(
              response.event as ClientEventFinder<
                GameEventIdentifiers.SkillUseEvent
              >,
            );
          }
        } while (true);
        return;
      case PlayerPhase.DropCardStage:
        this.logger.debug('enter drop cards phase');
        const maxCardHold =
          this.CurrentPlayer.Hp +
          GameCommonRules.getAdditionalHoldCardNumber(this.CurrentPlayer);
        const discardAmount =
          this.CurrentPlayer.getCardIds(PlayerCardsArea.HandArea).length -
          maxCardHold;
        if (discardAmount > 0) {
          this.room.notify(
            GameEventIdentifiers.AskForCardDropEvent,
            EventPacker.createUncancellableEvent<
              GameEventIdentifiers.AskForCardDropEvent
            >({
              cardAmount: discardAmount,
              fromArea: [PlayerCardsArea.HandArea],
              toId: this.CurrentPlayer.Id,
            }),
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
        break;
    }
  }

  private async play(player: Player, specifiedStages?: PlayerStageListEnum[]) {
    this.currentPhasePlayer = player;

    const playerStages = specifiedStages
      ? specifiedStages
      : this.stageProcessor.createPlayerStage();

    while (playerStages.length > 0) {
      this.currentPlayerStage = playerStages[0];
      playerStages.shift();
      const nextPhase = this.stageProcessor.getInsidePlayerPhase(
        this.currentPlayerStage,
      );
      if (nextPhase !== this.currentPlayerPhase) {
        await this.onHandlePhaseChangeEvent(
          GameEventIdentifiers.PhaseChangeEvent,
          {
            from: this.currentPlayerPhase,
            to: nextPhase,
            fromPlayer: player.Id,
            toPlayer: player.Id,
          },
          async stage => {
            if (stage === PhaseChangeStage.PhaseChanged) {
              this.CurrentPlayer.resetCardUseHistory();
              //TODO: to reset skills
              this.currentPlayerPhase = nextPhase;
            }

            return true;
          },
        );

        await this.onPhase(this.currentPlayerPhase!);
      }
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
        await this.onHandleDamgeEvent(
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
      case GameEventIdentifiers.CardLoseEvent:
        await this.onHandleDropLoseEvent(
          identifier as GameEventIdentifiers.CardLoseEvent,
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
        break;
      case GameEventIdentifiers.ObtainCardEvent:
        await this.onHandleObtainCardEvent(
          identifier as GameEventIdentifiers.ObtainCardEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.LoseHpEvent:
        await this.onHandleLoseHpEvent(
          identifier as GameEventIdentifiers.LoseHpEvent,
          event as any,
          onActualExecuted,
        );
        break;
      case GameEventIdentifiers.RecoverEvent:
        await this.onHandleRecoverEvent(
          identifier as GameEventIdentifiers.RecoverEvent,
          event as any,
          onActualExecuted,
        );
        break;
      default:
        throw new Error(`Unknown incoming event: ${identifier}`);
    }

    return;
  }

  private deadPlayerFilters(...playerIds: PlayerId[]) {
    return playerIds.filter(
      playerId => !this.room.getPlayerById(playerId).Dead,
    );
  }

  private iterateEachStage = async <T extends GameEventIdentifiers>(
    identifier: T,
    event: EventPicker<GameEventIdentifiers, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
    processor?: (stage: GameEventStage) => Promise<void>,
  ) => {
    let eventStage: GameEventStage | undefined = this.stageProcessor.involve(
      identifier,
    );
    while (this.stageProcessor.isInsideEvent(identifier, eventStage)) {
      await this.room.trigger<typeof event>(event, eventStage!);
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

      eventStage = this.stageProcessor.nextInstantEvent();
    }
  };

  private async onHandleObtainCardEvent(
    identifier: GameEventIdentifiers.ObtainCardEvent,
    event: ServerEventFinder<GameEventIdentifiers.ObtainCardEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === ObtainCardStage.CardObtaining) {
          event.toId = this.deadPlayerFilters(event.toId)[0];
          const to = this.room.getPlayerById(event.toId);
          to.obtainCardIds(...event.cardIds);

          if (!event.translationsMessage) {
            event.translationsMessage = TranslationPack.translationJsonPatcher(
              '{0} obtains cards {1}' + (event.fromId ? ' from {2}' : ''),
              to.Character.Name,
              TranslationPack.patchCardInTranslation(...event.cardIds),
              event.fromId
                ? this.room.getPlayerById(event.fromId).Character.Name
                : '',
            ).extract();
          }
          this.room.broadcast(identifier, event);
        }
      },
    );
  }

  private async onHandleDrawCardEvent(
    identifier: GameEventIdentifiers.DrawCardEvent,
    event: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    if (!event.translationsMessage) {
      event.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} draws {1} cards',
        this.room.getPlayerById(event.playerId).Character.Name,
        event.cardIds.length,
      ).extract();
    }

    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === DrawCardStage.CardDrawing) {
          event.playerId = this.deadPlayerFilters(event.playerId)[0];

          const { cardIds, playerId } = event;
          const to = this.room.getPlayerById(playerId);
          //TODO: How about xuyou?
          to.obtainCardIds(...cardIds);
          this.room.broadcast(identifier, event);
        }
      },
    );
  }

  private async onHandleDropCardEvent(
    identifier: GameEventIdentifiers.CardDropEvent,
    event: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    if (!event.translationsMessage) {
      event.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} drops cards {1}',
        this.room.getPlayerById(event.fromId).Character.Name,
        TranslationPack.patchCardInTranslation(...event.cardIds),
      ).extract();
    }

    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === CardDropStage.CardDropping) {
          const from = this.room.getPlayerById(event.fromId);
          from.dropCards(...event.cardIds);
          this.room.broadcast(identifier, event);
        }
      },
    );
  }

  private async onHandleDropLoseEvent(
    identifier: GameEventIdentifiers.CardLoseEvent,
    event: ServerEventFinder<GameEventIdentifiers.CardLoseEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    if (!event.translationsMessage) {
      event.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} lost cards {1}',
        this.room.getPlayerById(event.fromId).Character.Name,
        event.cardIds
          .map(cardId => TranslationPack.patchCardInTranslation(cardId))
          .join(','),
      ).extract();
    }

    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === CardLoseStage.CardLosing) {
          const from = this.room.getPlayerById(event.fromId);
          from.dropCards(...event.cardIds);
          this.room.broadcast(identifier, event);
        }
      },
    );
  }

  private async onHandleDamgeEvent(
    identifier: GameEventIdentifiers.DamageEvent,
    event: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async (stage: GameEventStage) => {
        if (stage === DamageEffectStage.DamagedEffect) {
          event.toId = this.deadPlayerFilters(event.toId)[0];
          const { toId, damage } = event;
          const to = this.room.getPlayerById(toId);

          to.onDamage(damage);
          this.room.broadcast(identifier, event);

          if (to.Hp <= 0) {
            await this.onHandleDyingEvent(
              GameEventIdentifiers.PlayerDyingEvent,
              {
                dying: to.Id,
                killedBy: event.fromId,
              },
            );
          }
        }
      },
    );
  }

  private async onHandleDyingEvent(
    identifier: GameEventIdentifiers.PlayerDyingEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    let result: void;
    result = await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === PlayerDyingStage.PlayerDying) {
          const { dying } = event;
          const to = this.room.getPlayerById(dying);

          if (to.Hp <= 0) {
            for (const player of this.room.getAlivePlayersFrom()) {
              let hasResponse = false;
              do {
                hasResponse = false;

                this.room.notify(
                  GameEventIdentifiers.AskForPeachEvent,
                  {
                    fromId: to.Id,
                  },
                  player.Id,
                );

                const response = await this.room.onReceivingAsyncReponseFrom(
                  GameEventIdentifiers.AskForPeachEvent,
                  to.Id,
                );

                if (response.cardId) {
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
        }
      },
    );

    const { dying, killedBy } = event;
    const to = this.room.getPlayerById(dying);
    if (to.Hp <= 0) {
      result = await this.onHandlePlayerDiedEvent(
        GameEventIdentifiers.PlayerDiedEvent,
        {
          playerInfo: to.getPlayerInfo(),
          killedBy,
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} was killed' + killedBy === undefined ? '' : ' by {1}',
            to.Character.Name,
            killedBy ? this.room.getPlayerById(killedBy).Character.Name : '',
          ).extract(),
        },
      );
    }

    return result;
  }

  private async onHandlePlayerDiedEvent(
    identifier: GameEventIdentifiers.PlayerDiedEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    let result: void;
    result = await this.iterateEachStage(identifier, event, onActualExecuted);
    const { killedBy, playerInfo } = event;
    //TODO: check game over
    if (playerInfo.Role === PlayerRole.Rebel && killedBy) {
      await this.room.drawCards(3, killedBy);
    }

    return result;
  }

  private async onHandleSkillUseEvent(
    identifier: GameEventIdentifiers.SkillUseEvent,
    event: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    if (!event.translationsMessage) {
      event.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} used skill {1}',
        this.room.getPlayerById(event.fromId).Character.Name,
        event.skillName,
      ).extract();
    }

    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === SkillUseStage.SkillUsing) {
          this.room.broadcast(identifier, event);
        }
      },
    );
  }
  private async onHandleSkillEffectEvent(
    identifier: GameEventIdentifiers.SkillEffectEvent,
    event: EventPicker<GameEventIdentifiers.SkillEffectEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === SkillEffectStage.SkillEffecting) {
          const { skillName } = event;
          await Sanguosha.getSkillBySkillName(skillName).onEffect(
            this.room,
            event,
          );
        }
      },
    );
  }

  private async onHandleAimEvent(
    identifier: GameEventIdentifiers.AimEvent,
    event: EventPicker<GameEventIdentifiers.AimEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    event.toIds = this.deadPlayerFilters(...event.toIds);

    return await this.iterateEachStage(identifier, event, onActualExecuted);
  }

  private async onHandleCardEffectEvent(
    identifier: GameEventIdentifiers.CardEffectEvent,
    event: EventPicker<GameEventIdentifiers.CardEffectEvent, WorkPlace.Server>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        const card = Sanguosha.getCardById(event.cardId);
        if (
          !EventPacker.isDisresponsiveEvent(event) &&
          card.is(CardType.Trick) &&
          stage == CardEffectStage.BeforeCardEffect
        ) {
          let cardUseEvent:
            | ServerEventFinder<GameEventIdentifiers.CardUseEvent>
            | undefined;

          for (const player of this.room.getAlivePlayersFrom(
            this.CurrentPlayer.Id,
          )) {
            if (!player.hasCard(new CardMatcher({ name: ['wuxiekeji'] }))) {
              continue;
            }

            const wuxiekejiEvent: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
              conversation:
                event.fromId !== undefined
                  ? TranslationPack.translationJsonPatcher(
                      'do you wanna use {0} for {1} from {2}',
                      'wuxiekeji',
                      TranslationPack.patchCardInTranslation(event.cardId),
                      this.room.getPlayerById(event.fromId).Character.Name,
                    ).extract()
                  : TranslationPack.translationJsonPatcher(
                      'do you wanna use {0} for {1}',
                      'wuxiekeji',
                      TranslationPack.patchCardInTranslation(event.cardId),
                    ).extract(),
              cardMatcher: new CardMatcher({
                name: ['wuxiekeji'],
              }).toSocketPassenger(),
              byCardId: event.cardId,
              cardUserId: event.fromId,
            };
            this.room.notify(
              GameEventIdentifiers.AskForCardUseEvent,
              wuxiekejiEvent,
              player.Id,
            );

            const response = await this.room.onReceivingAsyncReponseFrom(
              GameEventIdentifiers.AskForCardUseEvent,
              player.Id,
            );

            if (response.cardId !== undefined) {
              cardUseEvent = {
                fromId: response.fromId,
                cardId: response.cardId,
                toCardIds: [event.cardId],
                responseToEvent: event,
              };
              break;
            }
          }

          if (cardUseEvent) {
            await this.room.useCard(cardUseEvent);
          }

          if (EventPacker.isTerminated(event)) {
            card.Skill.onEffectRejected(this.room, event);
          }
        }

        if (stage === CardEffectStage.CardEffecting) {
          await card.Skill.onEffect(this.room, event);
        }
      },
    );
  }

  private async onHandleCardUseEvent(
    identifier: GameEventIdentifiers.CardUseEvent,
    event: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Client>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === CardUseStage.CardUsing) {
          if (!event.translationsMessage) {
            const card = Sanguosha.getCardById(event.cardId);
            if (card.is(CardType.Equip)) {
              event.translationsMessage = TranslationPack.translationJsonPatcher(
                '{0} equipped {1}',
                this.room.getPlayerById(event.fromId).Character.Name,
                TranslationPack.patchCardInTranslation(event.cardId),
              ).extract();
            } else {
              event.translationsMessage = TranslationPack.translationJsonPatcher(
                '{0} used card {1}' + (event.toIds ? ' to {2}' : ''),
                this.room.getPlayerById(event.fromId).Character.Name,
                TranslationPack.patchCardInTranslation(event.cardId),
                event.toIds
                  ? event.toIds
                      .map(id => this.room.getPlayerById(id).Character.Name)
                      .join(', ')
                  : '',
              ).extract();
            }
          }
          this.room.broadcast(identifier, event);
          await Sanguosha.getCardById(event.cardId).Skill.onUse(
            this.room,
            event,
          );
        }
      },
    );
  }

  private async onHandleCardResponseEvent(
    identifier: GameEventIdentifiers.CardResponseEvent,
    event: EventPicker<
      GameEventIdentifiers.CardResponseEvent,
      WorkPlace.Server
    >,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    if (!event.translationsMessage) {
      event.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} responses card {1}',
        this.room.getPlayerById(event.fromId).Character.Name,
        TranslationPack.patchCardInTranslation(event.cardId),
      ).extract();
    }

    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === CardResponseStage.CardResponsing) {
          this.room.getPlayerById(event.fromId).dropCards(event.cardId);
          this.room.broadcast(identifier, event);
        }
      },
    );
  }

  private async onHandleJudgeEvent(
    identifier: GameEventIdentifiers.JudgeEvent,
    event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === JudgeEffectStage.JudgeEffect) {
          const { toId, cardId, judgeCardId } = event;
          if (!event.translationsMessage) {
            event.translationsMessage = TranslationPack.translationJsonPatcher(
              '{0} got judged card {2} on card {1}',
              this.room.getPlayerById(toId).Character.Name,
              TranslationPack.patchCardInTranslation(cardId),
              TranslationPack.patchCardInTranslation(judgeCardId),
            ).extract();
          }
          this.room.broadcast(identifier, event);
        }
      },
    );
  }

  private async onHandlePinDianEvent(
    identifier: GameEventIdentifiers.PinDianEvent,
    event: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Client>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    let pindianResult: PinDianResultType | undefined;

    return await this.iterateEachStage(
      identifier,
      (pindianResult as any) || event,
      onActualExecuted,
      async stage => {
        if (stage === PinDianStage.PinDianEffect) {
          const { from, toIds } = event;
          this.room.notify(
            GameEventIdentifiers.AskForPinDianCardEvent,
            {
              from,
            },
            from,
          );
          toIds.forEach(to => {
            this.room.notify(
              GameEventIdentifiers.AskForPinDianCardEvent,

              {
                from: to,
              },
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

  private async onHandlePhaseChangeEvent(
    identifier: GameEventIdentifiers.PhaseChangeEvent,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === PhaseChangeStage.PhaseChanged) {
          this.room.broadcast(GameEventIdentifiers.PhaseChangeEvent, event);
        }
      },
    );
  }

  private async onHandleGameStartEvent(
    identifier: GameEventIdentifiers.GameStartEvent,
    event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === GameStartStage.GameStarting) {
          this.room.broadcast(GameEventIdentifiers.GameStartEvent, event);
        }
      },
    );
  }

  private async onHandleLoseHpEvent(
    identifier: GameEventIdentifiers.LoseHpEvent,
    event: ServerEventFinder<GameEventIdentifiers.LoseHpEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === LoseHpStage.LosingHp) {
          event.toId = this.deadPlayerFilters(event.toId)[0];
          if (!event.toId) {
            EventPacker.terminate(event);
            return;
          }

          this.room.getPlayerById(event.toId).onLoseHp(event.lostHp);
          this.room.broadcast(GameEventIdentifiers.LoseHpEvent, event);
        }
      },
    );
  }

  private async onHandleRecoverEvent(
    identifier: GameEventIdentifiers.RecoverEvent,
    event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    return await this.iterateEachStage(
      identifier,
      event,
      onActualExecuted,
      async stage => {
        if (stage === RecoverEffectStage.RecoverEffecting) {
          event.toId = this.deadPlayerFilters(event.toId)[0];
          if (!event.toId) {
            EventPacker.terminate(event);
            return;
          }

          this.room.getPlayerById(event.toId).onRecoverHp(event.recoveredHp);
          this.room.broadcast(GameEventIdentifiers.RecoverEvent, event);
        }
      },
    );
  }

  public async turnToNextPlayer() {
    this.tryToThrowNotStartedError();
    const prevPlayer = this.CurrentPlayer;
    do {
      this.playerPositionIndex =
        (this.playerPositionIndex + 1) % this.room.Players.length;
    } while (this.room.Players[this.playerPositionIndex].Dead);

    await this.onHandlePhaseChangeEvent(GameEventIdentifiers.PhaseChangeEvent, {
      fromPlayer: prevPlayer.Id,
      from: PlayerPhase.FinishStage,
      toPlayer: this.CurrentPlayer.Id,
      to: PlayerPhase.PrepareStage,
    });
  }

  public get CurrentPlayer() {
    this.tryToThrowNotStartedError();
    return this.room.Players[this.playerPositionIndex];
  }

  public get CurrentGameStage() {
    this.tryToThrowNotStartedError();
    return this.stageProcessor.CurrentGameEventStage;
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
