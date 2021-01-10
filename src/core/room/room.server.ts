import {
  CardDrawReason,
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
  DamageEffectStage,
  DrawCardStage,
  PinDianStage,
  PlayerDiedStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';

import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardTargetEnum } from 'core/cards/libs/card_props';
import { Character, CharacterId } from 'core/characters/character';
import { PinDianProcedure, PinDianReport } from 'core/event/event.server';
import { Sanguosha } from 'core/game/engine';
import { GameProcessor } from 'core/game/game_processor/game_processor';
import { GameInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { CardLoader } from 'core/game/package_loader/loader.cards';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { RecordAnalytics } from 'core/game/record_analytics';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Functional } from 'core/shares/libs/functional';
import { JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { Logger } from 'core/shares/libs/logger/logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { System } from 'core/shares/libs/system';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { OnDefineReleaseTiming, Skill, SkillLifeCycle, SkillType, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { Room, RoomId } from './room';

export class ServerRoom extends Room<WorkPlace.Server> {
  private loadedCharacters: Character[] = [];
  private selectedCharacters: CharacterId[] = [];

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
    private flavor: Flavor,
    private logger: Logger,
    protected gameMode: GameMode,
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

  public updatePlayerStatus(status: 'online' | 'offline' | 'quit' | 'trusted' | 'player', toId: PlayerId) {
    super.updatePlayerStatus(status, toId);
    this.broadcast(GameEventIdentifiers.PlayerStatusEvent, { status, toId, ignoreNotifiedStatus: true });
  }

  public shuffle() {
    if (this.dropStack.length > 0) {
      Algorithm.shuffle(this.dropStack);
      this.drawStack = this.drawStack.concat(this.dropStack);
      this.dropStack = [];
    } else {
      Algorithm.shuffle(this.drawStack);
    }
  }

  private shuffleSeats() {
    Algorithm.shuffle(this.players);
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].Position = i;
    }
    this.sortPlayers();
  }

  public insertPlayerRound(player: PlayerId) {
    this.gameProcessor.insertPlayerRound(player);
  }
  public insertPlayerPhase(player: PlayerId, phase: PlayerPhase) {
    this.gameProcessor.insertPlayerPhase(player, phase);
  }

  public isExtraPhase() {
    return this.gameProcessor.isExtraPhase();
  }

  public async gameStart() {
    this.shuffle();
    this.shuffleSeats();
    this.gameProcessor.assignRoles(this.players);

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
    await this.gameProcessor.gameStart(this, this.loadedCharacters, () => {
      this.selectedCharacters = this.getAlivePlayersFrom().map(player => player.CharacterId) as CharacterId[];
    });
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

  public notify<I extends GameEventIdentifiers>(
    type: I,
    content: ServerEventFinder<I>,
    to: PlayerId,
    notificationTime: number = 60,
  ) {
    !content.ignoreNotifiedStatus &&
      this.broadcast(GameEventIdentifiers.NotifyEvent, { toIds: [to], notificationTime });
    this.socket.notify(type, EventPacker.createIdentifierEvent(type, EventPacker.minifyPayload(content)), to);
  }

  //TODO: enable to custom response time limit
  public doNotify(toIds: PlayerId[], notificationTime: number = 60) {
    this.broadcast(GameEventIdentifiers.NotifyEvent, { toIds, notificationTime });
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

    if (type !== GameEventIdentifiers.NotifyEvent) {
      EventPacker.setTimestamp(content);
      this.analytics.record(content, this.isPlaying() ? this.CurrentPlayerPhase : undefined);
    }
    this.socket.broadcast(type, EventPacker.minifyPayload(content));
  }

  private playerTriggerableSkills(
    player: Player,
    skillFrom: 'character' | 'equip',
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
    exclude: TriggerSkill[] = [],
  ) {
    const { triggeredBySkills } = content;
    const bySkills = triggeredBySkills
      ? triggeredBySkills.map(skillName => Sanguosha.getSkillBySkillName(skillName))
      : undefined;

    const canTriggerSkills: TriggerSkill[] = [];
    if (skillFrom === 'character') {
      const hookedSkills = this.hookedSkills.reduce<TriggerSkill[]>((skills, { player: skillOwner, skill }) => {
        if (skillOwner.Id === player.Id && skill instanceof TriggerSkill) {
          skills.push(skill);
        }
        return skills;
      }, []);

      const playerSkills =
        player.Dead && stage !== PlayerDiedStage.PlayerDied && stage !== PlayerDiedStage.AfterPlayerDied
          ? []
          : player.getPlayerSkills<TriggerSkill>('trigger');
      for (const skill of [...playerSkills, ...hookedSkills]) {
        const canTrigger = bySkills
          ? bySkills.find(bySkill => UniqueSkillRule.isProhibitedBySkillRule(bySkill, skill)) === undefined
          : true;
        if (
          canTrigger &&
          skill.isTriggerable(content, stage) &&
          skill.canUse(this, player, content) &&
          !exclude.includes(skill)
        ) {
          canTriggerSkills.push(skill);
        }
      }
    } else if (!player.Dead) {
      for (const equip of player.getCardIds(PlayerCardsArea.EquipArea)) {
        const equipCard = Sanguosha.getCardById(equip);
        if (
          !(equipCard.Skill instanceof TriggerSkill) ||
          UniqueSkillRule.isProhibited(equipCard.Skill, player, equipCard)
        ) {
          continue;
        }

        const canTrigger = bySkills
          ? bySkills.find(skill => !UniqueSkillRule.canTriggerCardSkillRule(skill, equipCard)) === undefined
          : true;
        if (
          canTrigger &&
          equipCard.Skill.isTriggerable(content, stage) &&
          equipCard.Skill.canUse(this, player, content) &&
          !exclude.includes(equipCard.Skill)
        ) {
          canTriggerSkills.push(equipCard.Skill);
        }
      }
    }

    return canTriggerSkills;
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

    const skillSource: Readonly<['character', 'equip']> = ['character', 'equip'];
    for (const player of this.getAllPlayersFrom()) {
      if (EventPacker.isTerminated(content)) {
        return;
      }

      for (const skillFrom of skillSource) {
        if (EventPacker.isTerminated(content)) {
          return;
        }

        let canTriggerSkills = this.playerTriggerableSkills(player, skillFrom, content, stage);
        const triggeredSkills: TriggerSkill[] = [];
        do {
          if (EventPacker.isTerminated(content)) {
            return;
          }

          const skillsInPriorities: TriggerSkill[][] = [];
          const skillTriggerableTimes: {
            [K: string]: number;
          } = {};
          for (const skill of canTriggerSkills) {
            const priority = skill.getPriority(this, player, content);
            skillsInPriorities[priority]
              ? skillsInPriorities[priority].push(skill)
              : (skillsInPriorities[priority] = [skill]);
            skillTriggerableTimes[skill.Name] = skill.triggerableTimes(content);
          }

          for (const skills of skillsInPriorities) {
            if (EventPacker.isTerminated(content)) {
              return;
            }
            if (!skills) {
              continue;
            }

            if (skills.length === 1) {
              const skill = skills[0];
              for (let i = 0; i < skill.triggerableTimes(content); i++) {
                const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                  fromId: player.Id,
                  skillName: skill.Name,
                  triggeredOnEvent: content,
                  mute: skill.Muted,
                };
                if (
                  skill.isAutoTrigger(this, player, content) ||
                  skill.SkillType === SkillType.Compulsory ||
                  skill.SkillType === SkillType.Awaken
                ) {
                  await this.useSkill(triggerSkillEvent);
                } else {
                  const event = {
                    invokeSkillNames: [skill.Name],
                    toId: player.Id,
                    conversation: skill.getSkillLog(this, player, content),
                  };
                  if (skill.isUncancellable(this, content)) {
                    EventPacker.createUncancellableEvent(event);
                  }
                  this.notify(GameEventIdentifiers.AskForSkillUseEvent, event, player.Id);
                  const { invoke, cardIds, toIds } = await this.onReceivingAsyncResponseFrom(
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
            } else {
              let awaitedSkills: TriggerSkill[] = [];
              for (const skill of skills) {
                if (skill.isFlaggedSkill(this, content, stage)) {
                  const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                    fromId: player.Id,
                    skillName: skill.Name,
                    triggeredOnEvent: content,
                    mute: skill.Muted,
                  };
                  await this.useSkill(triggerSkillEvent);
                } else {
                  awaitedSkills.push(skill);
                }
              }

              while (awaitedSkills.length > 0) {
                const uncancellableSkills = awaitedSkills.filter(
                  skill =>
                    skill.isAutoTrigger(this, player, content) ||
                    skill.SkillType === SkillType.Compulsory ||
                    skill.SkillType === SkillType.Awaken,
                );

                const event = {
                  invokeSkillNames: awaitedSkills.map(skill => skill.Name),
                  toId: player.Id,
                };
                if (awaitedSkills.length === 1 && uncancellableSkills.length === 1) {
                  const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                    fromId: player.Id,
                    skillName: awaitedSkills[0].Name,
                    triggeredOnEvent: content,
                    mute: awaitedSkills[0].Muted,
                  };
                  for (let i = 0; i < skillTriggerableTimes[awaitedSkills[0].Name]; i++) {
                    await this.useSkill(triggerSkillEvent);
                  }
                  break;
                }

                if (uncancellableSkills.length > 1) {
                  EventPacker.createUncancellableEvent(event);
                }
                this.notify(GameEventIdentifiers.AskForSkillUseEvent, event, player.Id);
                const { invoke, cardIds, toIds } = await this.onReceivingAsyncResponseFrom(
                  GameEventIdentifiers.AskForSkillUseEvent,
                  player.Id,
                );
                if (invoke === undefined) {
                  for (const skill of uncancellableSkills) {
                    const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                      fromId: player.Id,
                      skillName: skill.Name,
                      triggeredOnEvent: content,
                      mute: skill.Muted,
                    };
                    await this.useSkill(triggerSkillEvent);
                  }
                  break;
                }

                const awaitedSkill = awaitedSkills.find(skill => skill.Name === invoke);
                const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                  fromId: player.Id,
                  skillName: invoke,
                  triggeredOnEvent: content,
                  mute: awaitedSkill?.Muted,
                };
                triggerSkillEvent.toIds = toIds;
                triggerSkillEvent.cardIds = cardIds;
                await this.useSkill(triggerSkillEvent);

                const index = awaitedSkills.findIndex(skill => skill.Name === invoke);
                if (index >= 0) {
                  skillTriggerableTimes[awaitedSkills[index].Name]--;
                  if (skillTriggerableTimes[awaitedSkills[index].Name] <= 0) {
                    awaitedSkills.splice(index, 1);
                  }
                }

                awaitedSkills = awaitedSkills.filter(skill => {
                  const canTrigger = bySkills
                    ? bySkills.find(bySkill => UniqueSkillRule.isProhibitedBySkillRule(bySkill, skill)) === undefined
                    : true;

                  return canTrigger && skill.isTriggerable(content, stage) && skill.canUse(this, player, content);
                });
              }
            }
          }

          triggeredSkills.push(...canTriggerSkills);
          canTriggerSkills = this.playerTriggerableSkills(player, skillFrom, content, stage, triggeredSkills);
        } while (canTriggerSkills.length > 0);
      }
    }

    this.hookedSkills = this.hookedSkills.filter(({ skill, player }) => {
      const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
      if (hookedSkill.afterLosingSkill && hookedSkill.afterLosingSkill(this, player.Id)) {
        return false;
      }
      if (hookedSkill.afterDead && hookedSkill.afterDead(this, player.Id)) {
        return false;
      }
      return true;
    });
  }

  public async onReceivingAsyncResponseFrom<T extends GameEventIdentifiers>(
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

  public getRandomCharactersFromLoadedPackage(numberOfCharacter: number, except: CharacterId[] = []): CharacterId[] {
    const characters = Sanguosha.getRandomCharacters(numberOfCharacter, this.loadedCharacters, [
      ...this.selectedCharacters,
      ...except,
    ]).map(character => character.Id);

    return characters;
  }

  public setCharacterOutsideAreaCards(
    player: PlayerId,
    areaName: string,
    characterIds: CharacterId[],
    translationsMessage?: PatchedTranslationObject,
    unengagedMessage?: PatchedTranslationObject,
  ) {
    this.getPlayerById(player).setCharacterOutsideAreaCards(areaName, characterIds);
    this.broadcast(GameEventIdentifiers.SetOutsideCharactersEvent, {
      toId: player,
      characterIds,
      areaName,
      isPublic: false,
      translationsMessage,
      engagedPlayerIds: [player],
      unengagedMessage,
    });
  }

  public changePlayerProperties(event: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent>): void {
    const { changedProperties } = event;
    for (const property of changedProperties) {
      const player = this.getPlayerById(property.toId);
      property.characterId !== undefined && (player.CharacterId = property.characterId);
      property.maxHp !== undefined && (player.MaxHp = property.maxHp);
      property.hp !== undefined && (player.Hp = property.hp);
      property.nationality !== undefined && (player.Nationality = property.nationality);
      property.gender !== undefined && (player.Gender = property.gender);
    }

    this.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, event);
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
        toId: playerId,
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
    return await this.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardDropEvent, playerId);
  }

  public async askForPeach(event: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForPeachEvent, event);
    Precondition.assert(
      this.getPlayerById(event.toId).Hp <= 0,
      "room.server.ts -> askForPeach() : ask for peach while player's hp greater than 0",
    );
    const player = this.getPlayerById(event.fromId);

    let responseEvent: ClientEventFinder<GameEventIdentifiers.AskForPeachEvent> | undefined;
    const peachMatcher = new CardMatcher({ name: event.fromId === event.toId ? ['alcohol', 'peach'] : ['peach'] });
    do {
      this.notify(GameEventIdentifiers.AskForPeachEvent, event, event.fromId);
      responseEvent = await this.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForPeachEvent, event.fromId);
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
      player.hasCard(this, peachMatcher) ||
      this.GameParticularAreas.find(
        areaName => player.hasCard(this, peachMatcher, PlayerCardsArea.OutsideArea, areaName) === undefined,
      )
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

    let responseEvent: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> | undefined;
    do {
      this.notify(GameEventIdentifiers.AskForCardUseEvent, event, to);
      responseEvent = await this.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardUseEvent, to);
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
    } while (true);

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

    let responseEvent: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> | undefined;
    do {
      this.notify(GameEventIdentifiers.AskForCardResponseEvent, event, to);
      responseEvent = await this.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardResponseEvent, to);
      const preResponseEvent: ServerEventFinder<GameEventIdentifiers.CardResponseEvent> = {
        fromId: to,
        cardId: responseEvent.cardId!,
      };

      if (responseEvent.cardId === undefined || (await this.preResponseCard(preResponseEvent))) {
        responseEvent.cardId = preResponseEvent.cardId;
        responseEvent.fromId = preResponseEvent.fromId;
        break;
      }
    } while (true);

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
    await this.drawCards(1, from.Id, 'top', undefined, undefined, CardDrawReason.Reforge);
  }

  public async preUseCard(cardUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): Promise<boolean> {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardUseEvent, cardUseEvent);
    const card = Sanguosha.getCardById<VirtualCard>(cardUseEvent.cardId);
    await card.Skill.onUse(this, cardUseEvent);

    if (Card.isVirtualCardId(cardUseEvent.cardId)) {
      const from = this.getPlayerById(cardUseEvent.fromId);
      const skill = Sanguosha.getSkillBySkillName(card.GeneratedBySkill);
      const skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
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
      };
      if (skill instanceof ViewAsSkill) {
        await this.useSkill(skillUseEvent);
      } else {
        this.broadcast(GameEventIdentifiers.SkillUseEvent, skillUseEvent);
      }
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
      const skill = Sanguosha.getSkillBySkillName(card.GeneratedBySkill);
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
        mute: skill.Muted,
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

  public async useCard(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, declared?: boolean) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardUseEvent, event);
    if (!declared && !(await this.preUseCard(event))) {
      return;
    }

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

            EventPacker.copyPropertiesTo(singleCardEffectEvent, event);
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
    const skill = Sanguosha.getSkillBySkillName(content.skillName);
    if (EventPacker.isTerminated(content) || !(await skill.beforeUse(this, content))) {
      return;
    }

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

  public async loseSkill(playerId: PlayerId, skillName: string | string[], broadcast?: boolean) {
    const player = this.getPlayerById(playerId);
    const lostSkill = player.loseSkill(skillName);
    if (lostSkill.length === 0) {
      return;
    }
    const lostSkillNames = lostSkill.map(skill => skill.Name);
    this.broadcast(GameEventIdentifiers.LoseSkillEvent, {
      toId: playerId,
      skillName: lostSkillNames,
      translationsMessage: broadcast
        ? TranslationPack.translationJsonPatcher(
            '{0} lost skill {1}',
            TranslationPack.patchPlayerInTranslation(player),
            typeof skillName === 'string'
              ? skillName
              : TranslationPack.wrapArrayParams(
                  ...lostSkillNames.reduce<string[]>((total, currentSkill) => {
                    if (!total.find(skillName => currentSkill.endsWith(skillName))) {
                      total.push(currentSkill);
                    }
                    return total;
                  }, []),
                ),
          ).extract()
        : undefined,
    });

    for (const skill of lostSkill) {
      const outsideCards = player.getCardIds(PlayerCardsArea.OutsideArea, skill.Name);
      if (SkillLifeCycle.isHookedAfterLosingSkill(skill)) {
        this.hookedSkills.push({ player, skill });
      }
      await SkillLifeCycle.executeHookOnLosingSkill(skill, this, player);

      if (outsideCards) {
        if (player.isCharacterOutsideArea(skill.Name)) {
          outsideCards.splice(0, outsideCards.length);
        } else {
          await this.moveCards({
            movingCards: outsideCards.map(card => ({ card, fromArea: PlayerCardsArea.OutsideArea })),
            fromId: player.Id,
            toArea: CardMoveArea.DropStack,
            moveReason: CardMoveReason.PlaceToDropStack,
          });
        }
      }
    }
  }
  public async obtainSkill(playerId: PlayerId, skillName: string, broadcast?: boolean) {
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
    await SkillLifeCycle.executeHookOnObtainingSkill(Sanguosha.getSkillBySkillName(skillName), this, player);
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
    EventPacker.createIdentifierEvent(GameEventIdentifiers.ChangeMaxHpEvent, lostMaxHpEvent);
    this.broadcast(GameEventIdentifiers.ChangeMaxHpEvent, lostMaxHpEvent);

    const player = this.getPlayerById(playerId);
    player.MaxHp += additionalMaxHp;
    if (player.Hp > player.MaxHp) {
      player.Hp = player.MaxHp;
    }

    if (player.MaxHp <= 0) {
      await this.kill(player);
    }

    await this.trigger(lostMaxHpEvent);
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
    bySpecialReason?: CardDrawReason,
  ) {
    askedBy = askedBy || playerId || this.CurrentPlayer.Id;
    playerId = playerId || this.CurrentPlayer.Id;

    const drawEvent: ServerEventFinder<GameEventIdentifiers.DrawCardEvent> = {
      drawAmount: numberOfCards,
      fromId: playerId,
      askedBy,
      triggeredBySkills: byReason ? [byReason] : undefined,
      bySpecialReason,
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
    const from = event.fromId ? this.getPlayerById(event.fromId) : undefined;
    event.movingCards = event.movingCards.reduce<
      {
        card: CardId;
        fromArea?: CardMoveArea | PlayerCardsArea;
      }[]
    >((allCards, cardInfo) => {
      if (Card.isVirtualCardId(cardInfo.card)) {
        const card = Sanguosha.getCardById<VirtualCard>(cardInfo.card);
        if (!Sanguosha.isTransformCardSill(card.GeneratedBySkill)) {
          allCards.push(
            ...card.ActualCardIds.map(cardId => ({
              card: cardId,
              fromArea: from?.cardFrom(cardId),
              asideMove: true,
            })),
          );
        }
      }

      allCards.push(cardInfo);

      return allCards;
    }, []);

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.MoveCardEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.MoveCardEvent, event),
    );
  }

  public async asyncMoveCards(events: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[]) {
    events.sort((prev, next) => {
      if (prev.fromId !== undefined && next.fromId !== undefined) {
        const prevPosition = this.getPlayerById(prev.fromId).Position;
        const nextPosition = this.getPlayerById(next.fromId).Position;
        if (prevPosition < nextPosition) {
          return -1;
        } else if (prevPosition === nextPosition) {
          return 0;
        }
        return 1;
      } else if (prev.toId !== undefined && next.toId !== undefined) {
        const prevPosition = this.getPlayerById(prev.toId).Position;
        const nextPosition = this.getPlayerById(next.toId).Position;
        if (prevPosition < nextPosition) {
          return -1;
        } else if (prevPosition === nextPosition) {
          return 0;
        }
        return 1;
      }

      return -1;
    });

    await this.gameProcessor.onHandleAsyncMoveCardEvent(events);
  }

  public async damage(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): Promise<void> {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.DamageEvent, event);
    const processingEvent = this.gameProcessor.CurrentProcessingEvent;
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.DamageEvent, event, async stage => {
      if (stage === DamageEffectStage.DamagedEffect) {
        if (processingEvent && EventPacker.getIdentifier(processingEvent) === GameEventIdentifiers.CardEffectEvent) {
          EventPacker.setDamageSignatureInCardUse(
            processingEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
          );
        }
      }
      return true;
    });
  }

  public async recover(event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>): Promise<void> {
    const to = this.getPlayerById(event.toId);
    if (to.Hp === to.MaxHp) {
      return;
    }

    event.recoveredHp = Math.min(event.recoveredHp, to.MaxHp - to.Hp);
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
    EventPacker.createIdentifierEvent(GameEventIdentifiers.RecoverEvent, event);
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.RecoverEvent, event);
  }

  public async responseCard(event: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>): Promise<boolean> {
    let validResponse = false;
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardResponseEvent, event);
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardResponseEvent, event, async stage => {
      if (stage === CardResponseStage.AfterCardResponseEffect) {
        if (event.responseToEvent) {
          EventPacker.terminate(event.responseToEvent);
          validResponse = true;
        }
      }
      return true;
    });

    return validResponse;
  }

  public async judge(
    to: PlayerId,
    byCard?: CardId,
    bySkill?: string,
    judgeMatcherEnum?: JudgeMatcherEnum,
  ): Promise<ServerEventFinder<GameEventIdentifiers.JudgeEvent>> {
    const judgeCardId = this.getCards(1, 'top')[0];
    const event: ServerEventFinder<GameEventIdentifiers.JudgeEvent> = {
      toId: to,
      judgeCardId,
      realJudgeCardId: judgeCardId,
      byCard,
      bySkill,
      judgeMatcherEnum,
    };

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.JudgeEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.JudgeEvent, event),
    );

    return event;
  }

  public async pindian(fromId: PlayerId, toIds: PlayerId[]) {
    const from = this.getPlayerById(fromId);

    const pindianEvent: ServerEventFinder<GameEventIdentifiers.PinDianEvent> = {
      fromId,
      toIds,
      procedures: [],
      randomPinDianCardPlayer: [],
    };

    let responses: ClientEventFinder<GameEventIdentifiers.AskForPinDianCardEvent>[] = [];
    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.PinDianEvent, pindianEvent, async stage => {
      if (stage === PinDianStage.BeforePinDianEffect) {
        if (pindianEvent.toIds.length === 0) {
          return false;
        }

        const pindianEventTemplate = EventPacker.createIdentifierEvent(GameEventIdentifiers.AskForPinDianCardEvent, {
          fromId,
          toId: '',
          conversation: TranslationPack.translationJsonPatcher(
            '{0} proposed a pindian event, please choose a hand card to pindian',
            TranslationPack.patchPlayerInTranslation(from),
          ).extract(),
        });

        const targetList = [fromId, ...pindianEvent.toIds];
        this.doNotify(targetList);
        for (const target of targetList) {
          const askForPinDianEvent = {
            ...pindianEventTemplate,
            toId: target,
            randomPinDianCard: pindianEvent.randomPinDianCardPlayer.includes(target),
            ignoreNotifiedStatus: true,
          };
          this.notify(GameEventIdentifiers.AskForPinDianCardEvent, askForPinDianEvent, target);
        }

        responses = await Promise.all(
          targetList.map(target =>
            this.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForPinDianCardEvent, target).then(
              async result => {
                await this.moveCards({
                  movingCards: [{ card: result.pindianCard, fromArea: PlayerCardsArea.HandArea }],
                  fromId: result.fromId,
                  toArea: CardMoveArea.ProcessingArea,
                  moveReason: CardMoveReason.ActiveMove,
                  ignoreNotifiedStatus: true,
                });

                if (result.fromId === fromId) {
                  pindianEvent.cardId = result.pindianCard;
                }

                return result;
              },
            ),
          ),
        );

        responses.sort((p1, p2) => {
          const pos1 =
            (this.getPlayerById(p1.fromId).Position - from.Position + this.Players.length) % this.Players.length;
          const pos2 =
            (this.getPlayerById(p2.fromId).Position - from.Position + this.Players.length) % this.Players.length;

          return pos1 < pos2 ? 1 : -1;
        });

        return true;
      }

      if (stage === PinDianStage.PinDianEffect) {
        this.broadcast(GameEventIdentifiers.CustomGameDialog, {
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} used {1} to respond pindian',
            TranslationPack.patchPlayerInTranslation(from),
            TranslationPack.patchCardInTranslation(pindianEvent.cardId!),
          ).extract(),
        });

        for (const response of responses) {
          if (response.fromId === fromId) {
            continue;
          }

          const proposerCardNumber = Sanguosha.getCardById(pindianEvent.cardId!).CardNumber;
          const procedure: PinDianProcedure = {
            toId: response.fromId,
            cardId: response.pindianCard,
            winner: '',
          };
          const rivalCardNumber = Sanguosha.getCardById(procedure.cardId).CardNumber;
          if (proposerCardNumber > rivalCardNumber) {
            procedure.winner = fromId;
          } else if (proposerCardNumber < rivalCardNumber) {
            procedure.winner = procedure.toId;
          }
          pindianEvent.procedures.push(procedure);

          const messages = [
            TranslationPack.translationJsonPatcher(
              '{0} used {1} to respond pindian',
              TranslationPack.patchPlayerInTranslation(this.getPlayerById(procedure.toId)),
              TranslationPack.patchCardInTranslation(procedure.cardId),
            ).toString(),
            TranslationPack.translationJsonPatcher(
              procedure.winner ? 'pindian result:{0} win' : 'pindian result:draw',
              procedure.winner ? TranslationPack.patchPlayerInTranslation(this.getPlayerById(procedure.winner)) : '',
            ).toString(),
          ];

          this.broadcast(GameEventIdentifiers.ObserveCardsEvent, {
            cardIds: [pindianEvent.cardId!, procedure.cardId],
            selected: [
              { card: pindianEvent.cardId!, player: pindianEvent.fromId },
              { card: procedure.cardId, player: procedure.toId },
            ],
            messages,
          });

          await this.trigger(pindianEvent, PinDianStage.PinDianResultConfirmed);
          await this.sleep(2500);
          this.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {});
        }

        return true;
      }

      return true;
    });

    const droppedCards: CardId[] = pindianEvent.cardId ? [pindianEvent.cardId] : [];
    for (const { cardId } of pindianEvent.procedures) {
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

    const report: PinDianReport = {
      pindianCardId: pindianEvent.cardId,
      pindianRecord: pindianEvent.procedures,
    };

    return report;
  }

  public async skip(player: PlayerId, phase?: PlayerPhase) {
    if (this.CurrentPhasePlayer.Id === player) {
      this.gameProcessor.skip(phase);
      if (phase !== undefined) {
        const event: ServerEventFinder<GameEventIdentifiers.PhaseSkippedEvent> = {
          playerId: player,
          skippedPhase: phase,
        };
        await this.trigger(EventPacker.createIdentifierEvent(GameEventIdentifiers.PhaseSkippedEvent, event));
      }
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
    deadPlayer.Dying = false;
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
        Functional.getPlayerRoleRawText(deadPlayer.Role, this.gameMode),
      ).extract(),
    };

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.PlayerDiedEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerDiedEvent, playerDiedEvent),
      async stage => {
        if (stage === PlayerDiedStage.AfterPlayerDied) {
          for (const skill of deadPlayer.getPlayerSkills()) {
            if (SkillLifeCycle.isHookedAfterDead(skill)) {
              this.hookedSkills.push({ player: deadPlayer, skill });
            }
            await SkillLifeCycle.executeHookedOnDead(skill, this, deadPlayer);
          }
        }

        return true;
      },
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
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} {1} {2} {3} marks',
        TranslationPack.patchPlayerInTranslation(this.getPlayerById(player)),
        value > 0 ? 'obtained' : 'lost',
        value < 0 ? -value : value,
        name,
      ).extract(),
    });
    return super.setMark(player, name, value);
  }
  public addMark(player: PlayerId, name: string, value: number) {
    this.broadcast(GameEventIdentifiers.AddMarkEvent, {
      to: player,
      value,
      name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} {1} {2} {3} marks',
        TranslationPack.patchPlayerInTranslation(this.getPlayerById(player)),
        value > 0 ? 'obtained' : 'lost',
        value < 0 ? -value : value,
        name,
      ).extract(),
    });
    return super.addMark(player, name, value);
  }

  public findCardsByMatcherFrom(cardMatcher: CardMatcher, fromDrawStack: boolean = true): CardId[] {
    const fromStack = fromDrawStack ? this.drawStack : this.dropStack;
    return fromStack.filter(cardId => cardMatcher.match(Sanguosha.getCardById(cardId)));
  }

  public displayCards(fromId: PlayerId, displayCards: CardId[], translations?: PatchedTranslationObject): void {
    const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId,
      displayCards,
      translationsMessage:
        translations ||
        TranslationPack.translationJsonPatcher(
          '{0} displayed cards {1}',
          TranslationPack.patchPlayerInTranslation(this.getPlayerById(fromId)),
          TranslationPack.patchCardInTranslation(...displayCards),
        ).extract(),
    };
    this.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);
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

  public getCardsByNameFromStack(cardName: string, stackName: 'draw' | 'drop', amount: number = 0): CardId[] {
    const stack = stackName === 'draw' ? this.drawStack : this.dropStack;
    const cards = stack.filter(cardId => Sanguosha.getCardById(cardId).GeneralName === cardName);
    if (cards.length === 0) {
      return cards;
    }

    Algorithm.shuffle(cards);

    return amount === 0 ? cards : cards.slice(0, amount);
  }

  public installSideEffectSkill(applier: System.SideEffectSkillApplierEnum, skillName: string) {
    super.installSideEffectSkill(applier, skillName);
    this.broadcast(GameEventIdentifiers.UpgradeSideEffectSkillsEvent, {
      sideEffectSkillApplier: applier,
      skillName,
    });
  }

  public uninstallSideEffectSkill(applier: System.SideEffectSkillApplierEnum) {
    super.uninstallSideEffectSkill(applier);
    this.broadcast(GameEventIdentifiers.UpgradeSideEffectSkillsEvent, {
      sideEffectSkillApplier: applier,
      skillName: undefined,
    });
  }

  public getGameWinners(): Player[] | undefined {
    return this.gameProcessor.getWinners(this.players);
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

  public get Flavor() {
    return this.flavor;
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
