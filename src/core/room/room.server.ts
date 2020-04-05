import {
  CardLostReason,
  CardObtainedReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { AllStage, CardResponseStage, CardUseStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';

import { Card, CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardId, CardTargetEnum } from 'core/cards/libs/card_props';
import { Character } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { GameInfo, getRoles } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { CardLoader } from 'core/game/package_loader/loader.cards';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Logger } from 'core/shares/libs/logger/logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { SkillType, TriggerSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { GameProcessor } from '../game/game_processor';
import { Room, RoomId } from './room';

export class ServerRoom extends Room<WorkPlace.Server> {
  private loadedCharacters: Character[] = [];

  private drawStack: CardId[] = [];
  private dropStack: CardId[] = [];
  private round = 0;

  constructor(
    protected roomId: RoomId,
    protected gameInfo: GameInfo,
    protected socket: ServerSocket,
    protected gameProcessor: GameProcessor,
    protected players: Player[] = [],
    private logger: Logger,
  ) {
    super();
    this.init();
  }

  protected init() {
    this.loadedCharacters = CharacterLoader.getInstance().getPackages(...this.gameInfo.characterExtensions);
    this.drawStack = CardLoader.getInstance()
      .getPackages(...this.gameInfo.cardExtensions)
      .map(card => card.Id);
    this.dropStack = [];

    this.socket.emit(this);
  }

  private shuffle() {
    if (this.dropStack.length > 0) {
      this.drawStack = this.drawStack.concat(this.dropStack);
      this.dropStack = [];
    }

    Algorithm.shuffle(this.drawStack);
  }

  private shuffleSeats() {
    Algorithm.shuffle(this.players);
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].Position = i;
    }
    this.sortPlayers();
  }

  public assignRoles() {
    const roles = getRoles(this.gameInfo.numberOfPlayers);
    Algorithm.shuffle(roles);
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].Role = roles[i];
    }
    const lordIndex = this.players.findIndex(player => player.Role === PlayerRole.Lord);
    if (lordIndex !== 0) {
      [this.players[0], this.players[lordIndex]] = [this.players[lordIndex], this.players[0]];
      [this.players[0].Position, this.players[lordIndex].Position] = [
        this.players[lordIndex].Position,
        this.players[0].Position,
      ];
    }
  }

  private readonly sleep = async (timeDuration: number) =>
    new Promise(r => {
      setTimeout(r, timeDuration);
    });

  public async gameStart() {
    this.shuffle();
    this.shuffleSeats();
    this.assignRoles();

    const event: ServerEventFinder<GameEventIdentifiers.GameReadyEvent> = {
      gameStartInfo: {
        numberOfDrawStack: this.DrawStack.length,
        round: 0,
        currentPlayerId: this.players[0].Id,
      },
      gameInfo: this.Info,
      playersInfo: this.Players.map(player => player.getPlayerInfo()),
      messages: ['game will start within 3 seconds'],
    };
    this.broadcast(GameEventIdentifiers.GameReadyEvent, event);

    this.gameStarted = true;
    await this.sleep(3000);
    await this.gameProcessor.gameStart(this, this.loadedCharacters);
  }

  public createPlayer(playerInfo: PlayerInfo) {
    const { Id, Name, Position, CharacterId } = playerInfo;
    this.players.push(new ServerPlayer(Id, Name, Position, CharacterId));
  }

  public clearSocketSubscriber(identifier: GameEventIdentifiers, to: PlayerId) {
    this.socket.clearSubscriber(identifier, to);
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>, to: PlayerId) {
    this.socket.notify(type, EventPacker.createIdentifierEvent(type, content), to);
  }

  public broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>) {
    if (this.isPlaying()) {
      content = EventPacker.wrapGameRunningInfo(content, {
        numberOfDrawStack: this.drawStack.length,
        round: this.round,
        currentPlayerId: this.CurrentPlayer.Id,
      });
    }

    this.socket.broadcast(type, EventPacker.createIdentifierEvent(type, content));
  }

  public async trigger<T = never>(
    content: T extends never ? ServerEventFinder<GameEventIdentifiers> : T,
    stage?: AllStage,
  ) {
    if (!this.CurrentPlayer || !this.isPlaying()) {
      return;
    }
    const { triggeredBySkills } = content as ServerEventFinder<GameEventIdentifiers>;
    const bySkills = triggeredBySkills
      ? triggeredBySkills.map(skillName => Sanguosha.getSkillBySkillName(skillName))
      : undefined;

    for (const player of this.getAlivePlayersFrom()) {
      const canTriggerSkills: TriggerSkill[] = [];
      for (const equip of player.getCardIds(PlayerCardsArea.EquipArea)) {
        const equipCard = Sanguosha.getCardById(equip);
        if (!(equipCard.Skill instanceof TriggerSkill)) {
          continue;
        }

        const canTrigger = bySkills
          ? bySkills.find(skill => !UniqueSkillRule.canTriggerCardSkillRule(skill, equipCard)) === undefined
          : UniqueSkillRule.canTriggerSkillRule(equipCard.Skill, player);
        if (canTrigger) {
          canTriggerSkills.push(equipCard.Skill);
        }
      }

      for (const skill of player.getPlayerSkills<TriggerSkill>('trigger')) {
        const canTrigger = bySkills
          ? bySkills.find(bySkill => !UniqueSkillRule.prohibitedBySkillRule(bySkill, skill)) === undefined
          : UniqueSkillRule.canTriggerSkillRule(skill, player);

        if (canTrigger) {
          canTriggerSkills.push(skill);
        }
      }

      for (const skill of canTriggerSkills) {
        if (EventPacker.isTerminated(content)) {
          break;
        }

        if (skill.isTriggerable(content, stage) && skill.canUse(this, player, content)) {
          const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
            fromId: player.Id,
            skillName: skill.Name,
            triggeredOnEvent: content,
          };
          if (
            skill.isAutoTrigger() ||
            skill.SkillType === SkillType.Compulsory ||
            skill.SkillType === SkillType.Awaken
          ) {
            await this.useSkill(triggerSkillEvent);
          } else {
            this.notify(
              GameEventIdentifiers.AskForSkillUseEvent,
              {
                invokeSkillNames: [skill.Name],
                to: player.Id,
              },
              player.Id,
            );
            const { invoke, cardIds, toIds } = await this.onReceivingAsyncReponseFrom(
              GameEventIdentifiers.AskForSkillUseEvent,
              player.Id,
            );
            triggerSkillEvent.toIds = toIds;
            triggerSkillEvent.cardIds = cardIds;
            if (invoke) {
              await this.useSkill(triggerSkillEvent);
            }
          }
        }
      }
    }
  }

  public async onReceivingAsyncReponseFrom<T extends GameEventIdentifiers>(
    identifier: T,
    playerId: PlayerId,
  ): Promise<ClientEventFinder<T>> {
    return await this.socket.waitForResponse<T>(identifier, playerId);
  }

  public bury(...cardIds: CardId[]) {
    for (const cardId of cardIds) {
      this.dropStack.push(cardId);
    }
  }
  public isBuried(cardId: CardId): boolean {
    return this.dropStack.includes(cardId);
  }

  public async equip(card: EquipCard, player: Player) {
    const prevEquipment = player.getEquipment(card.EquipType);
    if (prevEquipment !== undefined) {
      await this.dropCards(CardLostReason.PlaceToDropStack, [prevEquipment], player.Id);
    }

    const event: ServerEventFinder<GameEventIdentifiers.EquipEvent> = {
      fromId: player.Id,
      cardId: card.Id,
    };
    this.broadcast(GameEventIdentifiers.EquipEvent, event);
    player.equip(card);
  }

  public async askForCardUse(event: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>, to: PlayerId) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardUseEvent, event);
    await this.trigger<typeof event>(event);
    if (EventPacker.isTerminated(event)) {
      return {
        terminated: true,
      };
    }

    this.notify(GameEventIdentifiers.AskForCardUseEvent, event, to);

    return {
      responseEvent: await this.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForCardUseEvent, to),
    };
  }
  public async askForCardResponse(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>,
    to: PlayerId,
  ) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardResponseEvent, event);
    await this.trigger<typeof event>(event);
    if (EventPacker.isTerminated(event)) {
      return {
        terminated: true,
      };
    }

    this.notify(GameEventIdentifiers.AskForCardResponseEvent, event, to);
    return {
      responseEvent: await this.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForCardResponseEvent, to),
    };
  }

  public async useCard(content: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardUseEvent, content);

    await super.useCard(content);
    const from = this.getPlayerById(content.fromId);
    const card = Sanguosha.getCardById(content.cardId);
    if (card.is(CardType.Equip)) {
      await this.equip(card as EquipCard, from);
    } else if (!card.is(CardType.DelayedTrick)) {
      await this.loseCards({
        reason: CardLostReason.CardUse,
        cardIds: [content.cardId],
        fromId: content.fromId,
      });
    }

    this.addProcessingCards(card.Id.toString(), card.Id);
    return await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardUseEvent, content, async stage => {
      if (stage === CardUseStage.AfterCardUseEffect) {
        if (EventPacker.isTerminated(content)) {
          return false;
        }

        if (content.toIds === undefined && card.AOE === CardTargetEnum.Single) {
          content.toIds = [content.fromId];
        }

        const onAim = async (...targets: PlayerId[]) => {
          const cardAimEvent: ServerEventFinder<GameEventIdentifiers.AimEvent> = {
            fromId: content.fromId,
            byCardId: content.cardId,
            toIds: targets,
          };

          await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.AimEvent, cardAimEvent);

          if (!EventPacker.isTerminated(cardAimEvent)) {
            if (cardAimEvent.triggeredBySkills) {
              content.triggeredBySkills = content.triggeredBySkills
                ? [...content.triggeredBySkills, ...cardAimEvent.triggeredBySkills]
                : cardAimEvent.triggeredBySkills;
            }
            return cardAimEvent.toIds;
          }

          return [];
        };

        if (card.AOE === CardTargetEnum.Single) {
          content.toIds = await onAim(
            ...Precondition.exists(content.toIds, `Invalid target number of card: ${card.Name}`),
          );
        } else {
          let newToIds: PlayerId[] = [];
          for (const toId of content.toIds || []) {
            newToIds = [...newToIds, ...(await onAim(toId))];
          }
          content.toIds = newToIds;
        }

        await card.Skill.beforeEffect(this, content);
        if ([CardTargetEnum.Others, CardTargetEnum.Multiple, CardTargetEnum.Globe].includes(card.AOE)) {
          for (const toId of content.toIds) {
            const cardEffectEvent: ServerEventFinder<GameEventIdentifiers.CardEffectEvent> = {
              ...content,
              toIds: [toId],
            };

            if (!card.is(CardType.DelayedTrick)) {
              await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardEffectEvent, cardEffectEvent);
            }
          }
        } else {
          if (!card.is(CardType.DelayedTrick) && !card.is(CardType.Equip)) {
            await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardEffectEvent, content);
          }
        }
        await card.Skill.afterEffect(this, content);
      } else if (stage === CardUseStage.CardUseFinishedEffect) {
        card.reset();
        this.endProcessOnTag(card.Id.toString());

        if (this.getCardOwnerId(card.Id) === undefined) {
          this.bury(card.Id);
        }
      }

      return true;
    });
  }

  public async useSkill(content: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    await super.useSkill(content);
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.SkillUseEvent, content);
    if (!EventPacker.isTerminated(content)) {
      await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.SkillEffectEvent, content);
    }
  }

  public loseSkill(playerId: PlayerId, skillName: string) {
    const player = this.getPlayerById(playerId);
    player.loseSkill(skillName);
    this.notify(
      GameEventIdentifiers.LoseSkillEvent,
      {
        toId: playerId,
        skillName,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} lost skill {1}',
          player.Name,
          skillName,
        ).extract(),
      },
      playerId,
    );
  }
  public obtainSkill(playerId: PlayerId, skillName: string) {
    this.getPlayerById(playerId).obtainSkill(skillName);
    this.notify(
      GameEventIdentifiers.ObtainSkillEvent,
      {
        toId: playerId,
        skillName,
      },
      playerId,
    );
  }

  public loseHp(playerId: PlayerId, lostHp: number) {
    const player = this.getPlayerById(playerId);
    this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.LoseHpEvent, {
      toId: playerId,
      lostHp,
      translationsMessage: TranslationPack.translationJsonPatcher('{0} lost {1} hp', player.Name, lostHp).extract(),
    });
  }

  public getCards(numberOfCards: number, from: 'top' | 'bottom') {
    const cards: CardId[] = [];
    while (numberOfCards-- > 0) {
      if (this.drawStack.length === 0) {
        this.shuffle();
      }

      let card: CardId | undefined;
      if (from === 'top') {
        card = this.drawStack[0];
        this.drawStack.shift();
      } else {
        card = this.drawStack.pop();
      }
      cards.push(card!);
    }

    return cards;
  }

  public async drawCards(
    numberOfCards: number,
    playerId?: PlayerId,
    from: 'top' | 'bottom' = 'top',
    askedBy?: PlayerId,
  ) {
    askedBy = askedBy || playerId || this.CurrentPlayer.Id;
    playerId = playerId || this.CurrentPlayer.Id;

    const drawEvent: ServerEventFinder<GameEventIdentifiers.DrawCardEvent> = {
      drawAmount: numberOfCards,
      fromId: playerId,
      askedBy,
    };

    let drawedCards: CardId[] = [];
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.DrawCardEvent, drawEvent, async stage => {
      if (stage === DrawCardStage.CardDrawing) {
        drawedCards = this.getCards(drawEvent.drawAmount, from);
        await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.ObtainCardEvent, {
          reason: CardObtainedReason.CardDraw,
          cardIds: drawedCards,
          toId: drawEvent.fromId,
        });
      }

      return true;
    });

    return drawedCards;
  }

  public async obtainCards(event: ServerEventFinder<GameEventIdentifiers.ObtainCardEvent>) {
    event.givenBy = event.givenBy || event.fromId;
    event.translationsMessage =
      event.translationsMessage ||
      TranslationPack.translationJsonPatcher(
        '{0} obtains cards {1}',
        TranslationPack.patchPlayerInTranslation(this.getPlayerById(event.toId)),
        TranslationPack.patchCardInTranslation(...Card.getActualCards(event.cardIds)),
      ).extract();

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.ObtainCardEvent, event);
  }

  public async dropCards(reason: CardLostReason, cardIds: CardId[], playerId?: PlayerId, droppedBy?: PlayerId) {
    droppedBy = droppedBy || playerId || this.CurrentPlayer.Id;
    playerId = playerId || this.CurrentPlayer.Id;

    const dropEvent: ServerEventFinder<GameEventIdentifiers.CardDropEvent> = {
      cardIds,
      fromId: playerId,
      droppedBy,
    };

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardDropEvent, dropEvent);
    await this.loseCards({
      reason,
      cardIds,
      fromId: playerId,
      droppedBy,
    });
    this.bury(...cardIds);
  }

  public async loseCards(event: ServerEventFinder<GameEventIdentifiers.CardLostEvent>) {
    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.CardLostEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.CardLostEvent, event),
    );
  }

  public async moveCards(
    cardIds: CardId[],
    fromId: PlayerId | undefined,
    toId: PlayerId,
    fromReason: CardLostReason | undefined,
    fromArea: PlayerCardsArea | undefined,
    toArea: PlayerCardsArea,
    toReason: CardObtainedReason | undefined,
    proposer?: PlayerId,
  ) {
    const to = this.getPlayerById(toId);

    const from = fromId && this.getPlayerById(fromId);
    if (from) {
      let translationsMessage: PatchedTranslationObject | undefined;
      if (
        fromArea !== PlayerCardsArea.JudgeArea &&
        fromReason !== undefined &&
        ![CardLostReason.CardResponse, CardLostReason.CardUse].includes(fromReason)
      ) {
        translationsMessage = TranslationPack.translationJsonPatcher(
          '{0} lost card {1}',
          TranslationPack.patchPlayerInTranslation(from),
          TranslationPack.patchCardInTranslation(...cardIds),
        ).extract();
      }

      fromReason = Precondition.exists(fromReason, 'Unknown card move from reason');
      if (fromArea !== PlayerCardsArea.JudgeArea) {
        await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardLostEvent, {
          fromId: from.Id,
          cardIds,
          droppedBy: proposer,
          reason: fromReason,
          translationsMessage,
        });
      } else {
        this.broadcast(GameEventIdentifiers.CardLostEvent, {
          fromId: from.Id,
          cardIds,
          droppedBy: proposer,
          reason: fromReason,
          translationsMessage,
        });
        from.dropCards(...cardIds);
      }
    }

    if (toArea !== PlayerCardsArea.HandArea) {
      this.broadcast(GameEventIdentifiers.MoveCardEvent, {
        fromId,
        toId,
        fromArea,
        toArea,
        cardIds,
      });
    }

    if (toArea === PlayerCardsArea.EquipArea) {
      //TODO: refactor equip event trigger process if there are any skills triggered by wearing equipments
      for (const cardId of cardIds) {
        await this.equip(Sanguosha.getCardById<EquipCard>(cardId), to);
      }
    } else if (toArea === PlayerCardsArea.HandArea) {
      await this.obtainCards({
        reason: toReason!,
        cardIds,
        toId,
        fromId,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} obtains cards {1}' + (fromId ? ' from {2}' : ''),
          TranslationPack.patchPlayerInTranslation(to),
          TranslationPack.patchCardInTranslation(...Card.getActualCards(cardIds)),
          fromId ? TranslationPack.patchPlayerInTranslation(this.getPlayerById(fromId)) : '',
        ).extract(),
        unengagedMessage: TranslationPack.translationJsonPatcher(
          '{0} obtains {1} cards' + (fromId ? ' from {2}' : ''),
          TranslationPack.patchPlayerInTranslation(to),
          1,
          fromId ? TranslationPack.patchPlayerInTranslation(this.getPlayerById(fromId)) : '',
        ).extract(),
      });
    } else {
      for (const cardId of cardIds) {
        to.getCardIds(toArea).push(cardId);
      }
    }
  }

  public async damage(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): Promise<void> {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.DamageEvent, event);

    event.translationsMessage =
      event.fromId === undefined
        ? TranslationPack.translationJsonPatcher(
            '{0} got hurt for {1} hp with {2} property',
            TranslationPack.patchPlayerInTranslation(this.getPlayerById(event.toId)),
            event.damage,
            event.damageType,
          ).extract()
        : TranslationPack.translationJsonPatcher(
            '{0} hits {1} {2} hp of damage type {3}',
            TranslationPack.patchPlayerInTranslation(this.getPlayerById(event.fromId)),
            TranslationPack.patchPlayerInTranslation(this.getPlayerById(event.toId)),
            event.damage,
            event.damageType,
          ).extract();

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.DamageEvent, event);
  }

  public async recover(event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>): Promise<void> {
    event.translationsMessage =
      event.recoverBy !== undefined
        ? TranslationPack.translationJsonPatcher(
            '{0} recovered {2} hp for {1}',
            TranslationPack.patchPlayerInTranslation(this.getPlayerById(event.recoverBy)),
            TranslationPack.patchPlayerInTranslation(this.getPlayerById(event.toId)),
            event.recoveredHp,
          ).extract()
        : TranslationPack.translationJsonPatcher(
            '{0} recovered {1} hp',
            TranslationPack.patchPlayerInTranslation(this.getPlayerById(event.toId)),
            event.recoveredHp,
          ).extract();

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.RecoverEvent, event);
  }

  public async responseCard(event: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>): Promise<void> {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardResponseEvent, event);
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardResponseEvent, event, async stage => {
      if (stage === CardResponseStage.AfterCardResponseEffect) {
        if (event.responseToEvent) {
          EventPacker.terminate(event.responseToEvent);
          return false;
        }
      }

      return true;
    });

    await this.loseCards({
      reason: CardLostReason.CardResponse,
      cardIds: [event.cardId],
      fromId: event.fromId,
    });
    this.bury(event.cardId);
  }

  public async judge(
    to: PlayerId,
    byCard?: CardId,
    bySkill?: string,
  ): Promise<ServerEventFinder<GameEventIdentifiers.JudgeEvent>> {
    const judgeCardId = this.getCards(1, 'top')[0];
    const event: ServerEventFinder<GameEventIdentifiers.JudgeEvent> = {
      toId: to,
      judgeCardId,
      byCard,
      bySkill,
    };

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.JudgeEvent, event);

    if (this.getCardOwnerId(event.judgeCardId) === undefined) {
      this.bury(event.judgeCardId);
    }

    return event;
  }

  public skip(player: PlayerId, phase?: PlayerPhase) {
    if (this.CurrentPhasePlayer.Id === player) {
      this.gameProcessor.skip(phase);
    }
  }

  public syncGameCommonRules(playerId: PlayerId, updateActions: (user: Player) => void) {
    const player = this.getPlayerById(playerId);
    updateActions(player);
    this.notify(
      GameEventIdentifiers.SyncGameCommonRulesEvent,
      {
        toId: playerId,
        commonRules: GameCommonRules.toSocketObject(player),
      },
      playerId,
    );
  }

  public get CurrentPhasePlayer() {
    return this.gameProcessor.CurrentPhasePlayer;
  }

  public get CurrentPlayerStage() {
    return this.gameProcessor.CurrentPlayerPhase;
  }

  public get CurrentPlayer(): Player {
    return this.gameProcessor.CurrentPlayer;
  }

  public get DrawStack(): ReadonlyArray<CardId> {
    return this.drawStack;
  }
  public get DropStack(): ReadonlyArray<CardId> {
    return this.dropStack;
  }

  public get Logger(): Readonly<Logger> {
    return this.logger;
  }
}
