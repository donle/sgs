import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import {
  AllStage,
  CardResponseStage,
  CardUseStage,
  DrawCardStage,
  PinDianStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';

import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardTargetEnum } from 'core/cards/libs/card_props';
import { Character } from 'core/characters/character';
import { PinDianResultType } from 'core/event/event.server';
import { Sanguosha } from 'core/game/engine';
import { GameInfo, getRoles } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { CardLoader } from 'core/game/package_loader/loader.cards';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { RecordAnalytics } from 'core/game/record_analytics';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Functional } from 'core/shares/libs/functional';
import { Logger } from 'core/shares/libs/logger/logger';
import { OnDefineReleaseTiming, Skill, SkillHooks, SkillType, TriggerSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { GameProcessor } from '../game/game_processor';
import { Room, RoomId } from './room';

export class ServerRoom extends Room<WorkPlace.Server> {
  private loadedCharacters: Character[] = [];

  private drawStack: CardId[] = [];
  private dropStack: CardId[] = [];

  private hookedSkills: {
    player: Player;
    skill: Skill;
  }[] = [];

  constructor(
    protected roomId: RoomId,
    protected gameInfo: GameInfo,
    protected socket: ServerSocket,
    protected gameProcessor: GameProcessor,
    protected analytics: RecordAnalytics,
    protected players: Player[] = [],
    private logger: Logger,
  ) {
    super();
    this.init();
  }

  private onClosedCallback: () => void;
  private roomClosed = false;

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

  public insertPlayerRound(player: PlayerId) {
    this.gameProcessor.insertPlayerRound(player);
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
        numberOfDropStack: this.DropStack.length,
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

  public clearHeaded(toId: PlayerId) {
    this.getPlayerById(toId).clearHeaded();
    this.broadcast(GameEventIdentifiers.DrunkEvent, { toId, drunk: false });
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>, to: PlayerId) {
    this.socket.notify(type, EventPacker.createIdentifierEvent(type, content), to);
  }

  public broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>) {
    if (this.isPlaying()) {
      content = EventPacker.wrapGameRunningInfo(content, {
        numberOfDrawStack: this.drawStack.length,
        numberOfDropStack: this.dropStack.length,
        round: this.round,
        currentPlayerId: this.CurrentPlayer.Id,
      });
    }

    this.analytics.record(content, this.isPlaying() ? this.CurrentPlayerPhase : undefined);
    this.socket.broadcast(type, EventPacker.createIdentifierEvent(type, content));
  }

  //TODO: to resolve the case that multi skills triggered at the same time
  public async trigger<T = never>(
    content: T extends never ? ServerEventFinder<GameEventIdentifiers> : T,
    stage?: AllStage,
  ) {
    if (!this.CurrentPlayer || !this.isPlaying()) {
      return;
    }

    const executedHookedSkillsIndex: number[] = [];
    for (let i = 0; i < this.hookedSkills.length; i++) {
      const { skill, player } = this.hookedSkills[i];
      const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
      if (hookedSkill.onLosingSkill && hookedSkill.onLosingSkill(this, player.Id)) {
        await skill.onEffect(this, { fromId: player.Id, skillName: skill.Name, triggeredOnEvent: content });
        executedHookedSkillsIndex.push(i);
      }
      if (hookedSkill.onDeath && hookedSkill.onDeath(this, player.Id)) {
        executedHookedSkillsIndex.push(i);
        await skill.onEffect(this, { fromId: player.Id, skillName: skill.Name, triggeredOnEvent: content });
      }
    }
    this.hookedSkills = this.hookedSkills.filter((hookedSkill, index) => !executedHookedSkillsIndex.includes(index));

    const { triggeredBySkills } = content as ServerEventFinder<GameEventIdentifiers>;
    const bySkills = triggeredBySkills
      ? triggeredBySkills.map(skillName => Sanguosha.getSkillBySkillName(skillName))
      : undefined;

    for (const player of this.getAlivePlayersFrom()) {
      const canTriggerSkills: TriggerSkill[] = [];
      for (const skill of player.getPlayerSkills<TriggerSkill>('trigger')) {
        const canTrigger = bySkills
          ? bySkills.find(bySkill => UniqueSkillRule.isProhibitedBySkillRule(bySkill, skill)) === undefined
          : true;

        if (canTrigger) {
          canTriggerSkills.push(skill);
        }
      }

      for (const equip of player.getCardIds(PlayerCardsArea.EquipArea)) {
        const equipCard = Sanguosha.getCardById(equip);
        if (!(equipCard.Skill instanceof TriggerSkill) || UniqueSkillRule.isProhibited(equipCard.Skill, player)) {
          continue;
        }

        const canTrigger = bySkills
          ? bySkills.find(skill => !UniqueSkillRule.canTriggerCardSkillRule(skill, equipCard)) === undefined
          : true;
        if (canTrigger) {
          canTriggerSkills.push(equipCard.Skill);
        }
      }

      const skillsInPriorities: [TriggerSkill[], TriggerSkill[], TriggerSkill[]] = [[], [], []];
      for (const skill of canTriggerSkills) {
        skillsInPriorities[skill.Priority].push(skill);
      }

      for (const skills of skillsInPriorities) {
        for (const skill of skills) {
          if (skill.isTriggerable(content, stage) && skill.canUse(this, player, content)) {
            for (let i = 0; i < skill.triggerableTimes(content); i++) {
              const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                fromId: player.Id,
                skillName: skill.Name,
                triggeredOnEvent: content,
              };
              if (
                skill.isAutoTrigger(this, content) ||
                skill.SkillType === SkillType.Compulsory ||
                skill.SkillType === SkillType.Awaken
              ) {
                await this.useSkill(triggerSkillEvent);
              } else {
                this.notify(
                  GameEventIdentifiers.AskForSkillUseEvent,
                  {
                    invokeSkillNames: [skill.Name],
                    toId: player.Id,
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
      if (this.getCardOwnerId(cardId) !== undefined) {
        continue;
      }

      if (Card.isVirtualCardId(cardId)) {
        this.bury(...Sanguosha.getCardById<VirtualCard>(cardId).ActualCardIds);
      } else {
        Sanguosha.getCardById(cardId).reset();
        this.dropStack.push(cardId);
      }
    }
  }
  public isBuried(cardId: CardId): boolean {
    return this.dropStack.includes(cardId);
  }

  public putCards(place: 'top' | 'bottom', ...cardIds: CardId[]) {
    if (place === 'top') {
      for (let i = cardIds.length - 1; i >= 0; i--) {
        const cardId = cardIds[i];
        if (Card.isVirtualCardId(cardId)) {
          this.putCards(place, ...Sanguosha.getCardById<VirtualCard>(cardId).ActualCardIds);
        }
        this.drawStack.unshift(cardId);
      }
    } else {
      for (const cardId of cardIds) {
        if (Card.isVirtualCardId(cardId)) {
          this.putCards(place, ...Sanguosha.getCardById<VirtualCard>(cardId).ActualCardIds);
        } else {
          this.drawStack.push(cardId);
        }
      }
    }
  }

  public async chainedOn(playerId: PlayerId) {
    const player = this.getPlayerById(playerId);
    const linked = !player.ChainLocked;
    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.ChainLockedEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.ChainLockedEvent, {
        toId: playerId,
        linked,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} {1} character card',
          TranslationPack.patchPlayerInTranslation(player),
          linked ? 'rotate' : 'reset',
        ).extract(),
      }),
    );
  }

  public async askForCardDrop(
    playerId: PlayerId,
    discardAmount: number,
    fromArea: PlayerCardsArea[],
    uncancellable?: boolean,
    except?: CardId[],
    bySkill?: string,
    conversation?: string | PatchedTranslationObject,
  ) {
    const event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent> = EventPacker.createIdentifierEvent(
      GameEventIdentifiers.AskForCardDropEvent,
      {
        cardAmount: discardAmount,
        fromArea,
        toId: this.CurrentPlayer.Id,
        except,
        triggeredBySkills: bySkill ? [bySkill] : undefined,
        conversation,
      },
    );
    if (uncancellable) {
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardDropEvent>(event);
    }
    await this.trigger(event);
    if (event.responsedEvent) {
      EventPacker.terminate(event);
      return event.responsedEvent;
    }

    this.notify(GameEventIdentifiers.AskForCardDropEvent, event, playerId);
    return await this.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForCardDropEvent, playerId);
  }

  public async askForPeach(event: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForPeachEvent, event);
    await this.trigger(event);
    if (this.getPlayerById(event.toId).Hp > 0) {
      return;
    }
    const player = this.getPlayerById(event.fromId);

    let responseEvent: ClientEventFinder<GameEventIdentifiers.AskForPeachEvent> | undefined;
    do {
      this.notify(GameEventIdentifiers.AskForPeachEvent, event, event.fromId);
      responseEvent = await this.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForPeachEvent, event.fromId);
      const preUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: responseEvent.fromId,
        toIds: [event.toId],
        cardId: responseEvent.cardId!,
      };

      if (responseEvent.cardId === undefined || (await this.preUseCard(preUseEvent))) {
        responseEvent.cardId = preUseEvent.cardId;
        responseEvent.fromId = preUseEvent.fromId;
        EventPacker.copyPropertiesTo(preUseEvent, responseEvent);
        break;
      } else {
        responseEvent.cardId = undefined;
      }
    } while (
      player.hasCard(this, new CardMatcher({ name: event.fromId === event.toId ? ['peach', 'alcohol'] : ['peach'] }))
    );

    return responseEvent;
  }

  public async askForCardUse(event: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>, to: PlayerId) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardUseEvent, event);
    await this.trigger<typeof event>(event);
    if (event.responsedEvent) {
      EventPacker.terminate(event);
      return event.responsedEvent;
    }
    const player = this.getPlayerById(to);

    let responseEvent: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> | undefined;
    do {
      this.notify(GameEventIdentifiers.AskForCardUseEvent, event, to);
      responseEvent = await this.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForCardUseEvent, to);
      const preUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: to,
        toIds: responseEvent.toIds,
        cardId: responseEvent.cardId!,
      };

      if (responseEvent.cardId === undefined || (await this.preUseCard(preUseEvent))) {
        responseEvent.cardId = preUseEvent.cardId;
        responseEvent.toIds = preUseEvent.toIds;
        responseEvent.fromId = preUseEvent.fromId;
        break;
      } else {
        responseEvent.cardId = undefined;
      }
    } while (player.hasCard(this, new CardMatcher(event.cardMatcher)));

    return responseEvent;
  }

  public async askForCardResponse(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>,
    to: PlayerId,
  ) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForCardResponseEvent, event);
    await this.trigger<typeof event>(event);
    if (event.responsedEvent) {
      EventPacker.terminate(event);
      return event.responsedEvent;
    }
    const player = this.getPlayerById(to);

    let responseEvent: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> | undefined;
    do {
      this.notify(GameEventIdentifiers.AskForCardResponseEvent, event, to);
      responseEvent = await this.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForCardResponseEvent, to);
      const preResponseEvent: ServerEventFinder<GameEventIdentifiers.CardResponseEvent> = {
        fromId: to,
        cardId: responseEvent.cardId!,
      };

      if (responseEvent.cardId === undefined || (await this.preResponseCard(preResponseEvent))) {
        responseEvent.cardId = preResponseEvent.cardId;
        responseEvent.fromId = preResponseEvent.fromId;
        break;
      }
    } while (player.hasCard(this, new CardMatcher(event.cardMatcher)));

    return responseEvent;
  }

  public async reforge(cardId: CardId, from: Player) {
    await this.moveCards({
      fromId: from.Id,
      movingCards: [{ card: cardId, fromArea: CardMoveArea.HandArea }],
      moveReason: CardMoveReason.PlaceToDropStack,
      toArea: CardMoveArea.DropStack,
      proposer: from.Id,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} reforged card {1}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(cardId),
      ).extract(),
    });
    await this.drawCards(1, from.Id);
  }

  public async preUseCard(cardUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): Promise<boolean> {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardUseEvent, cardUseEvent);
    const card = Sanguosha.getCardById<VirtualCard>(cardUseEvent.cardId);
    await card.Skill.onUse(this, cardUseEvent);

    if (Card.isVirtualCardId(cardUseEvent.cardId)) {
      const from = this.getPlayerById(cardUseEvent.fromId);

      await this.useSkill({
        fromId: cardUseEvent.fromId,
        skillName: card.GeneratedBySkill,
        toIds: cardUseEvent.toIds,
        animation: card.Skill.getAnimationSteps(cardUseEvent),
        translationsMessage:
          card.ActualCardIds.length === 0 || card.isActualCardHidden()
            ? TranslationPack.translationJsonPatcher(
                '{0} used skill {1}, use card {2}' + (cardUseEvent.toIds ? ' to {3}' : ''),
                TranslationPack.patchPlayerInTranslation(from),
                card.GeneratedBySkill,
                TranslationPack.patchCardInTranslation(card.Id),
                cardUseEvent.toIds
                  ? TranslationPack.patchPlayerInTranslation(...cardUseEvent.toIds.map(id => this.getPlayerById(id)))
                  : '',
              ).extract()
            : TranslationPack.translationJsonPatcher(
                '{0} used skill {1}, transformed {2} as {3} card' + (cardUseEvent.toIds ? ' used to {4}' : ' to use'),
                TranslationPack.patchPlayerInTranslation(from),
                card.GeneratedBySkill || '',
                TranslationPack.patchCardInTranslation(...card.ActualCardIds),
                TranslationPack.patchCardInTranslation(card.Id),
                cardUseEvent.toIds
                  ? TranslationPack.patchPlayerInTranslation(...cardUseEvent.toIds.map(id => this.getPlayerById(id)))
                  : '',
              ).extract(),
      });
    }

    await this.trigger(cardUseEvent, CardUseStage.PreCardUse);
    return !EventPacker.isTerminated(cardUseEvent);
  }
  public async preResponseCard(
    cardResponseEvent: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>,
  ): Promise<boolean> {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardResponseEvent, cardResponseEvent);
    if (cardResponseEvent.cardId !== undefined && Card.isVirtualCardId(cardResponseEvent.cardId)) {
      const from = this.getPlayerById(cardResponseEvent.fromId);
      const card = Sanguosha.getCardById<VirtualCard>(cardResponseEvent.cardId);
      await this.useSkill({
        fromId: cardResponseEvent.fromId,
        skillName: card.GeneratedBySkill,
        translationsMessage:
          card.ActualCardIds.length === 0 || card.isActualCardHidden()
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
              ).extract(),
      });
    }

    await this.trigger(cardResponseEvent, CardResponseStage.PreCardResponse);
    return !EventPacker.isTerminated(cardResponseEvent);
  }

  private readonly onAim = async (
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    toId: PlayerId,
    allTargets: PlayerId[],
    nullifiedTargets: PlayerId[],
    isFirstTarget?: boolean,
  ) => {
    const cardAimEvent: ServerEventFinder<GameEventIdentifiers.AimEvent> = EventPacker.createIdentifierEvent(
      GameEventIdentifiers.AimEvent,
      {
        fromId: event.fromId,
        byCardId: event.cardId,
        toId,
        nullifiedTargets,
        allTargets,
        isFirstTarget,
      },
    );
    EventPacker.copyPropertiesTo(event, cardAimEvent);

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.AimEvent, cardAimEvent);

    if (!EventPacker.isTerminated(cardAimEvent)) {
      if (cardAimEvent.triggeredBySkills) {
        event.triggeredBySkills = event.triggeredBySkills
          ? [...event.triggeredBySkills, ...cardAimEvent.triggeredBySkills]
          : cardAimEvent.triggeredBySkills;
      }
    }

    return cardAimEvent;
  };

  public async useCard(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardUseEvent, event);

    await super.useCard(event);
    const card = Sanguosha.getCardById(event.cardId);

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardUseEvent, event, async stage => {
      if (stage === CardUseStage.AfterCardUseEffect) {
        event.toIds = event.toIds || [event.fromId];

        const aimEventCollaborators: { [player: string]: ServerEventFinder<GameEventIdentifiers.AimEvent> } = {};
        let nullifiedTargets: PlayerId[] = event.nullifiedTargets || [];
        const toIds = card.Skill.nominateForwardTarget(event.toIds);
        toIds === event.toIds && this.sortPlayersByPosition(toIds!);

        const nonTargetToIds = toIds === event.toIds ? [] : event.toIds?.filter(id => !toIds?.includes(id));
        let cardEffectToIds: PlayerId[] | undefined = toIds;

        if (toIds) {
          for (const toId of toIds) {
            const response = await this.onAim(event, toId, toIds, nullifiedTargets, toId === toIds[0]);
            aimEventCollaborators[toId] = response;
            cardEffectToIds = response.allTargets;
            if (event.toIds && nonTargetToIds && nonTargetToIds.length > 0) {
              event.toIds = [...response.allTargets, ...nonTargetToIds];
            }
            nullifiedTargets = response.nullifiedTargets;
          }
        }

        if (card.is(CardType.Equip) || card.is(CardType.DelayedTrick)) {
          return true;
        }

        const cardEffectEvent: ServerEventFinder<GameEventIdentifiers.CardEffectEvent> = {
          ...event,
          toIds: cardEffectToIds,
          nullifiedTargets,
          allTargets: event.toIds,
        };

        await card.Skill.beforeEffect(this, cardEffectEvent);

        if ([CardTargetEnum.Others, CardTargetEnum.Multiple, CardTargetEnum.Globe].includes(card.AOE)) {
          for (const toId of cardEffectToIds || []) {
            if (nullifiedTargets.includes(toId) || this.getPlayerById(toId).Dead) {
              continue;
            }

            const singleCardEffectEvent = {
              ...cardEffectEvent,
              toIds: [toId],
              allTargets: cardEffectToIds,
            };
            if (aimEventCollaborators[toId]) {
              EventPacker.copyPropertiesTo(aimEventCollaborators[toId], singleCardEffectEvent);
            }

            await this.gameProcessor.onHandleIncomingEvent(
              GameEventIdentifiers.CardEffectEvent,
              EventPacker.createIdentifierEvent(GameEventIdentifiers.CardEffectEvent, singleCardEffectEvent),
            );
          }
        } else {
          if (toIds && aimEventCollaborators[toIds[0]]) {
            EventPacker.copyPropertiesTo(aimEventCollaborators[toIds[0]], cardEffectEvent);
          }
          if (
            cardEffectToIds &&
            (nullifiedTargets.includes(cardEffectToIds[0]) || this.getPlayerById(cardEffectToIds[0]).Dead)
          ) {
            EventPacker.terminate(cardEffectEvent);
          }

          await this.gameProcessor.onHandleIncomingEvent(
            GameEventIdentifiers.CardEffectEvent,
            EventPacker.createIdentifierEvent(GameEventIdentifiers.CardEffectEvent, cardEffectEvent),
          );
          EventPacker.copyPropertiesTo(cardEffectEvent, event);
        }
        await card.Skill.afterEffect(this, cardEffectEvent);
      }

      return true;
    });
  }

  public async useSkill(content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    await super.useSkill(content);
    const acutalTargets =
      content.toIds && Sanguosha.getSkillBySkillName(content.skillName).nominateForwardTarget(content.toIds);
    if (acutalTargets && acutalTargets.length > 1) {
      this.sortPlayersByPosition(content.toIds!);
    }

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.SkillUseEvent, content);
    if (!EventPacker.isTerminated(content)) {
      await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.SkillEffectEvent, content);
    }
  }

  public async loseSkill(playerId: PlayerId, skillName: string, broadcast?: boolean) {
    const player = this.getPlayerById(playerId);
    const lostSkill = player.loseSkill(skillName);
    this.broadcast(GameEventIdentifiers.LoseSkillEvent, {
      toId: playerId,
      skillName,
      translationsMessage: broadcast
        ? TranslationPack.translationJsonPatcher('{0} lost skill {1}', player.Name, skillName).extract()
        : undefined,
    });

    for (const skill of lostSkill) {
      const outsideCards = player.getCardIds(PlayerCardsArea.OutsideArea, skill.Name);
      if (SkillHooks.isHookedUpOnLosingSkill(skill)) {
        this.hookedSkills.push({ player, skill });
      } else if (outsideCards) {
        await this.moveCards({
          movingCards: outsideCards.map(card => ({ card, fromArea: PlayerCardsArea.OutsideArea })),
          fromId: player.Id,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
        });
      }
    }
  }
  public obtainSkill(playerId: PlayerId, skillName: string, broadcast?: boolean) {
    const player = this.getPlayerById(playerId);
    player.obtainSkill(skillName);
    this.broadcast(GameEventIdentifiers.ObtainSkillEvent, {
      toId: playerId,
      skillName,
      translationsMessage: broadcast
        ? TranslationPack.translationJsonPatcher(
            '{0} obtained skill {1}',
            TranslationPack.patchPlayerInTranslation(player),
            skillName,
          ).extract()
        : undefined,
    });
  }

  public async loseHp(playerId: PlayerId, lostHp: number) {
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.LoseHpEvent, {
      toId: playerId,
      lostHp,
    });
  }

  public async changeMaxHp(playerId: PlayerId, additionalMaxHp: number) {
    const lostMaxHpEvent: ServerEventFinder<GameEventIdentifiers.ChangeMaxHpEvent> = {
      toId: playerId,
      additionalMaxHp,
      translationsMessage: TranslationPack.translationJsonPatcher(
        `{0} ${additionalMaxHp >= 0 ? 'obtained' : 'lost'} {1} max hp`,
        TranslationPack.patchPlayerInTranslation(this.getPlayerById(playerId)),
        Math.abs(additionalMaxHp),
      ).extract(),
    };
    this.broadcast(GameEventIdentifiers.ChangeMaxHpEvent, lostMaxHpEvent);

    const player = this.getPlayerById(playerId);
    player.MaxHp += additionalMaxHp;
    if (player.Hp > player.MaxHp) {
      player.Hp = player.MaxHp;
    }

    if (player.MaxHp <= 0) {
      await this.kill(player);
    }
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
    byReason?: string,
  ) {
    askedBy = askedBy || playerId || this.CurrentPlayer.Id;
    playerId = playerId || this.CurrentPlayer.Id;

    const drawEvent: ServerEventFinder<GameEventIdentifiers.DrawCardEvent> = {
      drawAmount: numberOfCards,
      fromId: playerId,
      askedBy,
      triggeredBySkills: byReason ? [byReason] : undefined,
      from,
    };

    let drawedCards: CardId[] = [];
    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.DrawCardEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.DrawCardEvent, drawEvent),
      async stage => {
        if (stage === DrawCardStage.CardDrawing) {
          drawedCards = this.drawStack.slice(0, drawEvent.drawAmount);
        }

        return true;
      },
    );

    return drawedCards;
  }

  public async dropCards(
    moveReason: CardMoveReason,
    cardIds: CardId[],
    playerId?: PlayerId,
    droppedBy?: PlayerId,
    byReason?: string,
  ) {
    if (cardIds.length === 0) {
      return;
    }

    droppedBy = droppedBy || playerId || this.CurrentPlayer.Id;
    playerId = playerId || this.CurrentPlayer.Id;
    const player = this.getPlayerById(playerId);

    await this.moveCards({
      movingCards: cardIds.map(card => ({ card, fromArea: player.cardFrom(card) })),
      fromId: playerId,
      toArea: CardMoveArea.DropStack,
      moveReason,
      movedByReason: byReason,
      proposer: droppedBy,
    });
  }

  public async turnOver(playerId: PlayerId) {
    const turnOverEvent: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent> = {
      toId: playerId,
    };

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.PlayerTurnOverEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerTurnOverEvent, turnOverEvent),
    );
  }

  public async moveCards(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.MoveCardEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.MoveCardEvent, event),
    );
  }

  public async damage(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): Promise<void> {
    event.beginnerOfTheDamage = event.beginnerOfTheDamage || event.fromId;
    EventPacker.createIdentifierEvent(GameEventIdentifiers.DamageEvent, event);
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.DamageEvent, event);
  }

  public async recover(event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>): Promise<void> {
    const to = this.getPlayerById(event.toId);
    if (to.Hp === to.MaxHp) {
      return;
    }

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

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.JudgeEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.JudgeEvent, event),
    );

    return event;
  }

  public async pindian(fromId: PlayerId, toIds: PlayerId[]) {
    const from = this.getPlayerById(fromId);
    const askForEvent = EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForPinDianCardEvent, {
      fromId,
      toIds,
      toId: '',
      conversation: TranslationPack.translationJsonPatcher(
        '{0} proposed a pindian event, please choose a hand card to pindian',
        TranslationPack.patchPlayerInTranslation(from),
      ).extract(),
    });
    let pindianResult: PinDianResultType | undefined;

    const pindianEvent: ServerEventFinder<GameEventIdentifiers.PinDianEvent> = {
      attackerId: fromId,
      toIds: [fromId, ...toIds],
    };

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.PinDianEvent, pindianEvent, async stage => {
      if (stage === PinDianStage.PinDianEffect) {
        if (pindianEvent.toIds.length <= 1) {
          EventPacker.terminate(askForEvent);
          return false;
        }

        for (const target of pindianEvent.toIds) {
          this.notify(
            GameEventIdentifiers.AskForPinDianCardEvent,
            {
              ...askForEvent,
              toId: target,
            },
            target,
          );
        }

        const responses = await Promise.all(
          pindianEvent.toIds.map(to =>
            this.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForPinDianCardEvent, to).then(async result => {
              await this.moveCards({
                movingCards: [{ card: result.pindianCard, fromArea: PlayerCardsArea.HandArea }],
                fromId: result.fromId,
                toArea: CardMoveArea.ProcessingArea,
                moveReason: CardMoveReason.ActiveMove,
              });

              return result;
            }),
          ),
        );

        const winners: PlayerId[] = [];
        const pindianCards: {
          fromId: string;
          cardId: CardId;
        }[] = [];
        const pindianResults: {
          fromId: string;
          cardNumber: number;
        }[] = [];
        let proposerCardNumber: number | undefined;

        for (const result of responses) {
          const pindianCard = Sanguosha.getCardById(result.pindianCard);
          if (result.fromId === pindianEvent.attackerId) {
            proposerCardNumber = pindianCard.CardNumber;
          } else {
            pindianResults.push({ fromId: result.fromId, cardNumber: pindianCard.CardNumber });
          }
          pindianCards.push({
            fromId: result.fromId,
            cardId: result.pindianCard,
          });
        }

        for (const { fromId, cardNumber } of pindianResults) {
          if (cardNumber > proposerCardNumber!) {
            !winners.includes(fromId) && winners.push(fromId);
          } else if (cardNumber < proposerCardNumber!) {
            !winners.includes(pindianEvent.attackerId) && winners.push(pindianEvent.attackerId);
          }
        }
        pindianResult = {
          winners,
          pindianCards,
        };

        this.broadcast(GameEventIdentifiers.ObserveCardsEvent, {
          cardIds: pindianCards.map(pindianCard => pindianCard.cardId),
          selected: pindianCards.map(pindianCard => ({ card: pindianCard.cardId, player: pindianCard.fromId })),
          messages: pindianCards.map(pindianCard =>
            TranslationPack.translationJsonPatcher(
              '{0} used {1} to respond pindian',
              TranslationPack.patchPlayerInTranslation(this.getPlayerById(pindianCard.fromId)),
              TranslationPack.patchCardInTranslation(pindianCard.cardId),
            ).toString(),
          ),
          translationsMessage: TranslationPack.translationJsonPatcher(
            'pindian result:' + (pindianResult.winners.length > 0 ? '{0} win' : 'draw'),
            TranslationPack.patchPlayerInTranslation(
              ...pindianResult.winners.map(winner => this.getPlayerById(winner)),
            ),
          ).extract(),
        });
        await this.sleep(2000);
        this.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {});
      }

      return true;
    });

    if (pindianResult) {
      const droppedCards: CardId[] = [];
      for (const { cardId } of pindianResult.pindianCards) {
        if (this.isCardOnProcessing(cardId)) {
          this.endProcessOnCard(cardId);
          this.getCardOwnerId(cardId) === undefined && droppedCards.push(cardId);
        }
      }

      droppedCards.length > 0 &&
        (await this.moveCards({
          movingCards: droppedCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
        }));
    }

    return pindianResult;
  }

  public skip(player: PlayerId, phase?: PlayerPhase) {
    if (this.CurrentPhasePlayer.Id === player) {
      this.gameProcessor.skip(phase);
    }
  }

  public endPhase(phase: PlayerPhase) {
    this.gameProcessor.endPhase(phase);
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

  public async kill(deadPlayer: Player, killedBy?: PlayerId) {
    const playerDiedEvent: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent> = {
      playerId: deadPlayer.Id,
      killedBy,
      messages: [
        TranslationPack.translationJsonPatcher(
          '{0} was killed' + (killedBy === undefined ? '' : ' by {1}'),
          TranslationPack.patchPlayerInTranslation(deadPlayer),
          killedBy ? TranslationPack.patchPlayerInTranslation(this.getPlayerById(killedBy)) : '',
        ).toString(),
      ],
      translationsMessage: TranslationPack.translationJsonPatcher(
        'the role of {0} is {1}',
        TranslationPack.patchPlayerInTranslation(deadPlayer),
        Functional.getPlayerRoleRawText(deadPlayer.Role),
      ).extract(),
    };

    for (const skill of deadPlayer.getPlayerSkills()) {
      if (SkillHooks.isHookedUpOnDeath(skill)) {
        this.hookedSkills.push({ player: deadPlayer, skill });
      }
    }

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.PlayerDiedEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerDiedEvent, playerDiedEvent),
    );
  }

  public clearFlags(player: PlayerId) {
    this.broadcast(GameEventIdentifiers.ClearFlagEvent, {
      to: player,
    });
    super.clearFlags(player);
  }
  public removeFlag(player: PlayerId, name: string) {
    this.broadcast(GameEventIdentifiers.RemoveFlagEvent, {
      to: player,
      name,
    });
    super.removeFlag(player, name);
  }
  public setFlag<T>(player: PlayerId, name: string, value: T, playerTag?: boolean): T {
    this.broadcast(GameEventIdentifiers.SetFlagEvent, {
      to: player,
      value,
      name,
      invisible: !playerTag,
    });
    return super.setFlag(player, name, value);
  }
  public getFlag<T>(player: PlayerId, name: string): T {
    return this.getPlayerById(player).getFlag(name);
  }

  public clearMarks(player: PlayerId) {
    this.broadcast(GameEventIdentifiers.ClearMarkEvent, {
      to: player,
    });
    super.clearMarks(player);
  }
  public removeMark(player: PlayerId, name: string) {
    this.broadcast(GameEventIdentifiers.RemoveMarkEvent, {
      to: player,
      name,
    });
    super.removeMark(player, name);
  }
  public setMark(player: PlayerId, name: string, value: number) {
    this.broadcast(GameEventIdentifiers.SetMarkEvent, {
      to: player,
      name,
      value,
    });
    return super.setMark(player, name, value);
  }
  public addMark(player: PlayerId, name: string, value: number) {
    this.broadcast(GameEventIdentifiers.AddMarkEvent, {
      to: player,
      value,
      name,
    });
    return super.addMark(player, name, value);
  }

  public isCardInDropStack(cardId: CardId): boolean {
    return this.dropStack.includes(cardId);
  }
  public isCardInDrawStack(cardId: CardId): boolean {
    return this.drawStack.includes(cardId);
  }

  public getCardFromDropStack(cardId: CardId): CardId | undefined {
    const index = this.dropStack.findIndex(card => card === cardId);
    return index < 0 ? undefined : this.dropStack.splice(index, 1)[0];
  }
  public getCardFromDrawStack(cardId: CardId): CardId | undefined {
    const index = this.drawStack.findIndex(card => card === cardId);
    return index < 0 ? undefined : this.drawStack.splice(index, 1)[0];
  }

  public get CurrentPhasePlayer() {
    return this.gameProcessor.CurrentPhasePlayer;
  }

  public get CurrentPlayerPhase() {
    return this.gameProcessor.CurrentPlayerPhase;
  }

  public get CurrentPlayerStage() {
    return this.gameProcessor.CurrentPlayerStage;
  }

  public get CurrentPlayer(): Player {
    return this.gameProcessor.CurrentPlayer;
  }

  public get CurrentProcessingStage() {
    return this.gameProcessor.CurrentProcessingStage;
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

  public close() {
    this.onClosedCallback && this.onClosedCallback();
    this.roomClosed = true;
  }

  public isClosed() {
    return this.roomClosed;
  }

  public onClosed(fn: () => void) {
    this.onClosedCallback = fn;
  }
}
