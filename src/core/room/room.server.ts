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
  AimStage,
  AllStage,
  CardResponseStage,
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  JudgeEffectStage,
  PinDianStage,
  PlayerDiedStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer, SmartPlayer } from 'core/player/player.server';
import { PlayerCardsArea, PlayerId, PlayerInfo } from 'core/player/player_props';

import { Card, CardType, VirtualCard } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { Character, CharacterEquipSections, CharacterId } from 'core/characters/character';
import { MoveCardEventInfos, PinDianProcedure, PinDianReport } from 'core/event/event.server';
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
import { AimGroupUtil, AimStatus } from 'core/shares/libs/utils/aim_group';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { FlagEnum } from 'core/shares/types/flag_list';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import {
  OnDefineReleaseTiming,
  ResponsiveSkill,
  Skill,
  SkillLifeCycle,
  SkillProhibitedSkill,
  SkillType,
  TriggerSkill,
  ViewAsSkill,
} from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { Room, RoomId } from './room';
import { RoomEventStacker } from './utils/room_event_stack';

export class ServerRoom extends Room<WorkPlace.Server> {
  private loadedCharacters: Character[] = [];
  private selectedCharacters: CharacterId[] = [];

  private drawStack: CardId[] = [];
  private dropStack: CardId[] = [];
  private numOfCards: number;

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
    protected gameCommonRules: GameCommonRules,
    protected eventStack: RoomEventStacker<WorkPlace.Server>,
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
    this.numOfCards = this.drawStack.length;
    this.dropStack = [];

    this.socket.emit(this);
    this.initAIPlayers();
  }

  private initAIPlayers() {
    if (this.gameMode === GameMode.Pve && this.Players.length === 0) {
      const fakePlayer = new SmartPlayer(this.Players.length, this.gameMode);
      this.addPlayer(fakePlayer);
    }
  }

  public updatePlayerStatus(status: 'online' | 'offline' | 'quit' | 'trusted' | 'player' | 'smart-ai', toId: PlayerId) {
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

    Precondition.debugBlock(this.gameInfo.flavor, () => {
      const cardsInProcessing = Object.values(this.onProcessingCards).reduce<number>((total, cards) => {
        total += cards.length;
        return total;
      }, 0);
      const gameCards = this.getInGameCards();
      Precondition.alarm(
        this.numOfCards !== this.drawStack.length + gameCards.length + cardsInProcessing ? undefined : true,
        `some cards are lost: current total cards: ${
          this.drawStack.length + gameCards.length + cardsInProcessing
        }, should be: ${this.numOfCards}`,
      );

      const allCards = CardLoader.getInstance()
        .getPackages(...this.gameInfo.cardExtensions)
        .map(card => card.Id);

      const missingCards = Algorithm.unique(allCards, [...this.drawStack, ...gameCards]);
      missingCards.length > 0 &&
        this.logger.error(
          'missing cards:',
          missingCards
            .map(id => {
              const card = Sanguosha.getCardById(id);
              return card.Name + ' ' + card.CardNumber + ' ' + Functional.getCardSuitRawText(card.Suit);
            })
            .join(', '),
        );
    });
  }

  private getInGameCards() {
    const totalCards: CardId[] = [];
    for (const player of this.AlivePlayers) {
      totalCards.push(...player.getAllGameCards());
    }

    return totalCards;
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
        circle: 0,
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

    content = EventPacker.createIdentifierEvent(type, EventPacker.minifyPayload(content));
    this.eventStack.push(content);

    this.socket.notify(type, content, to);
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
        circle: this.circle,
        currentPlayerId: this.CurrentPlayer.Id,
      });
    }

    EventPacker.createIdentifierEvent(type, content);
    if (type !== GameEventIdentifiers.NotifyEvent) {
      EventPacker.setTimestamp(content);
      this.analytics.record(content, this.isPlaying() ? this.CurrentPlayerPhase : undefined);
    }

    content = EventPacker.createIdentifierEvent(type, EventPacker.minifyPayload(content));
    this.eventStack.push(content);

    this.socket.broadcast(type, content);
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
      const hookedSkills = player.HookedSkills.reduce<TriggerSkill[]>((skills, skill) => {
        skill instanceof TriggerSkill && skills.push(skill);
        return skills;
      }, []);

      const playerSkills =
        player.Dead && stage !== PlayerDiedStage.PlayerDied && stage !== PlayerDiedStage.AfterPlayerDied
          ? hookedSkills
          : player.getPlayerSkills<TriggerSkill>('trigger');
      for (const skill of [...playerSkills]) {
        const canTrigger = bySkills
          ? bySkills.find(bySkill => UniqueSkillRule.isProhibitedBySkillRule(bySkill, skill)) === undefined
          : true;
        if (
          canTrigger &&
          skill.isTriggerable(content, stage) &&
          skill.canUse(this, player, content, stage) &&
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
          equipCard.Skill.canUse(this, player, content, stage) &&
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
      this.logger.debug('Do Not Need to Trigger Skill Because GameEnd Or Not CurrentPlayer');
      return;
    }

    const effectedSkillList: Skill[] = [];
    const nullifySkillList: Skill[] = [];
    for (const player of this.getAlivePlayersFrom()) {
      for (const pSkill of player.getSkillProhibitedSkills()) {
        if ((pSkill as SkillProhibitedSkill).toDeactivateSkills(this, player, content, stage)) {
          for (const playerSkill of player.getSkillProhibitedSkills(true)) {
            (pSkill as SkillProhibitedSkill).skillFilter(playerSkill, player) && nullifySkillList.push(playerSkill);
          }
        } else if ((pSkill as SkillProhibitedSkill).toActivateSkills(this, player, content, stage)) {
          for (const playerSkill of player.getSkillProhibitedSkills(true)) {
            if (effectedSkillList.includes(playerSkill)) {
              continue;
            }

            if ((pSkill as SkillProhibitedSkill).skillFilter(playerSkill, player, undefined, true)) {
              await SkillLifeCycle.executeHookedOnEffecting(playerSkill, this, player);
              effectedSkillList.push(playerSkill);
            }
          }
        }
      }

      for (const nullifySkill of nullifySkillList) {
        await SkillLifeCycle.executeHookedOnNullifying(nullifySkill, this, player);
      }
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
                    triggeredOnEvent: content,
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
                  const skillsUsing = player.getFlag<string[]>(FlagEnum.SkillsUsing);
                  if (!invoke && skillsUsing && skillsUsing.includes(skill.Name)) {
                    await this.loseSkill(player.Id, skill.Name, true);
                  }
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

                  return (
                    canTrigger && skill.isTriggerable(content, stage) && skill.canUse(this, player, content, stage)
                  );
                });
              }
            }
          }

          triggeredSkills.push(...canTriggerSkills);
          canTriggerSkills = this.playerTriggerableSkills(player, skillFrom, content, stage, triggeredSkills);
        } while (canTriggerSkills.length > 0);
      }
    }

    for (const p of this.getAlivePlayersFrom()) {
      if (p.HookedSkills.length === 0) {
        continue;
      }

      const toUnhook = p.HookedSkills.filter(skill => {
        const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
        if (hookedSkill.afterLosingSkill && hookedSkill.afterLosingSkill(this, p.Id, content, stage)) {
          return true;
        }
        if (hookedSkill.afterDead && hookedSkill.afterDead(this, p.Id, content, stage)) {
          return true;
        }
        return false;
      });

      if (toUnhook.length > 0) {
        p.removeHookedSkills(toUnhook);
        this.broadcast(GameEventIdentifiers.UnhookSkillsEvent, {
          toId: p.Id,
          skillNames: toUnhook.map(skill => skill.Name),
        });
      }
    }
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

    let newCurrentPlayerPosition: number | undefined;
    for (const property of changedProperties) {
      const player = this.getPlayerById(property.toId);
      property.characterId !== undefined && (player.CharacterId = property.characterId);
      property.maxHp !== undefined && (player.MaxHp = property.maxHp);
      property.hp !== undefined && (player.Hp = property.hp);
      property.nationality !== undefined && (player.Nationality = property.nationality);
      property.gender !== undefined && (player.Gender = property.gender);
      property.revive !== undefined && property.revive && player.Dead && player.revive();
      if (property.playerPosition !== undefined) {
        player.Position = property.playerPosition;
        player === this.CurrentPlayer && (newCurrentPlayerPosition = property.playerPosition);
      }
    }

    if (changedProperties.find(property => property.playerPosition)) {
      this.sortPlayers();
      newCurrentPlayerPosition !== undefined && this.gameProcessor.fixCurrentPosition(newCurrentPlayerPosition);
    }

    this.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, event);
  }

  public async changeGeneral(
    event: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent>,
    keepSkills?: boolean,
  ) {
    const { changedProperties } = event;

    if (!keepSkills) {
      for (const property of changedProperties) {
        if (!property.characterId) {
          continue;
        }

        const player = this.getPlayerById(property.toId);
        const skills = player.getPlayerSkills(undefined, true).filter(skill => !skill.isShadowSkill());
        for (const skill of skills) {
          await this.loseSkill(property.toId, skill.Name);
        }
      }
    }

    this.changePlayerProperties(event);

    for (const property of changedProperties) {
      if (!property.characterId) {
        continue;
      }

      const character = Sanguosha.getCharacterById(property.characterId);
      for (const skill of character.Skills) {
        skill.isShadowSkill() || (await this.obtainSkill(property.toId, skill.Name));
      }
    }
  }

  public async askForCardDrop(
    playerId: PlayerId,
    discardAmount: number | [number, number],
    fromArea: PlayerCardsArea[],
    uncancellable?: boolean,
    except?: CardId[],
    bySkill?: string,
    conversation?: string | PatchedTranslationObject,
  ) {
    const cannotDropIds: CardId[] = [];
    except = except || [];
    const cardFilter = (id: CardId) => !(this.canDropCard(playerId, id) || except!.includes(id));

    for (const area of fromArea) {
      cannotDropIds.push(...this.getPlayerById(playerId).getCardIds(area).filter(cardFilter));
    }

    if (cannotDropIds.length > 0) {
      except = except || [];
      except.push(...cannotDropIds);
    }

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

    const canDropCards: CardId[] = [];
    const autoResponse: ClientEventFinder<GameEventIdentifiers.AskForCardDropEvent> = {
      fromId: playerId,
      droppedCards: [],
    };
    if (event.cardAmount <= 0) {
      return autoResponse;
    }

    if (event.responsedEvent) {
      EventPacker.terminate(event);
      return event.responsedEvent;
    } else if (EventPacker.isUncancellableEvent(event)) {
      for (const area of fromArea) {
        canDropCards.push(
          ...this.getPlayerById(playerId)
            .getCardIds(area)
            .filter(id => !except?.includes(id)),
        );
      }

      if (canDropCards.length <= 0) {
        return autoResponse;
      } else if (canDropCards.length <= (event.cardAmount instanceof Array ? event.cardAmount[0] : event.cardAmount)) {
        autoResponse.droppedCards = canDropCards;
        return autoResponse;
      }
    }

    this.notify(GameEventIdentifiers.AskForCardDropEvent, event, playerId);
    const response = await this.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardDropEvent, playerId);

    if (EventPacker.isUncancellableEvent(event) && response.droppedCards.length === 0) {
      while (
        canDropCards.length === 0 ||
        response.droppedCards.length === (event.cardAmount instanceof Array ? event.cardAmount[0] : event.cardAmount)
      ) {
        const index = Math.floor(Math.random() * canDropCards.length);
        response.droppedCards.push(canDropCards[index]);
        canDropCards.splice(index, 1);
      }
    }

    return response;
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
        targetGroup: [[event.toId]],
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

    let responseEvent: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> | undefined = {
      fromId: to,
    };

    if (this.isGameOver()) {
      EventPacker.terminate(event);
      return responseEvent;
    }

    do {
      this.logger.debug('notify AskForCardUseEvent of socket');
      this.notify(GameEventIdentifiers.AskForCardUseEvent, event, to);
      responseEvent = await this.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardUseEvent, to);
      const preUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: to,
        targetGroup: responseEvent.toIds && [responseEvent.toIds],
        cardId: responseEvent.cardId!,
      };

      if (responseEvent.cardId === undefined || (await this.preUseCard(preUseEvent))) {
        responseEvent.cardId = preUseEvent.cardId;
        responseEvent.toIds = TargetGroupUtil.getRealTargets(preUseEvent.targetGroup);
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

  public async askForChoosingPlayerCard(
    event: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>,
    to: PlayerId,
    toDiscard?: boolean,
    uncancellable?: boolean,
  ): Promise<ClientEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> | void> {
    uncancellable &&
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(event);

    if (to === event.toId) {
      const newOption: CardChoosingOptions = {};
      for (const [area, cardIds] of Object.entries(event.options)) {
        if (cardIds) {
          let ids =
            (Number(area) as PlayerCardsArea) === PlayerCardsArea.HandArea
              ? this.getPlayerById(to).getCardIds(PlayerCardsArea.HandArea)
              : cardIds;
          if (ids instanceof Array) {
            toDiscard && (ids = ids.filter(id => this.canDropCard(to, id)));
            ids.length > 0 && (newOption[area] = ids);
          } else {
            newOption[area] = ids;
          }
        }
      }

      event.options = newOption;
    }

    if (Object.values(event.options).length === 0) {
      return;
    }

    this.notify(GameEventIdentifiers.AskForChoosingCardFromPlayerEvent, event, to);

    const response = await this.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      to,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds =
        to === event.toId
          ? this.getPlayerById(to)
              .getCardIds(PlayerCardsArea.HandArea)
              .filter(id => this.canDropCard(to, id))
          : this.getPlayerById(event.toId).getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    } else if (EventPacker.isUncancellableEvent(event) && response.selectedCard === undefined) {
      const cardIds = Object.values(event.options).reduce<CardId[]>((allIds, option) => {
        if (option) {
          return allIds.concat(option);
        }

        return allIds;
      }, []);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    return response;
  }

  public async doAskForCommonly<T extends GameEventIdentifiers>(
    type: T,
    event: ServerEventFinder<T>,
    toId: PlayerId,
    uncancellable?: boolean,
  ): Promise<ClientEventFinder<T>> {
    if (uncancellable) {
      EventPacker.createUncancellableEvent(event);
    }

    this.notify<T>(type, event, toId);

    return await this.onReceivingAsyncResponseFrom(type, toId);
  }

  public async reforge(cardId: CardId, from: Player) {
    await this.moveCards({
      fromId: from.Id,
      movingCards: [{ card: cardId, fromArea: CardMoveArea.HandArea }],
      moveReason: CardMoveReason.Reforge,
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
    if (card.is(CardType.Equip) && !cardUseEvent.targetGroup) {
      cardUseEvent.targetGroup = [[cardUseEvent.fromId]];
    }

    if (Card.isVirtualCardId(cardUseEvent.cardId)) {
      const from = this.getPlayerById(cardUseEvent.fromId);
      const skill = Sanguosha.getSkillBySkillName(card.GeneratedBySkill);
      const skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
        fromId: cardUseEvent.fromId,
        skillName: card.GeneratedBySkill,
        toIds: TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup),
        animation: card.Skill.getAnimationSteps(cardUseEvent),
        translationsMessage:
          card.ActualCardIds.length === 0 || card.isActualCardHidden()
            ? TranslationPack.translationJsonPatcher(
                '{0} used skill {1}, use card {2}' + (cardUseEvent.targetGroup ? ' to {3}' : ''),
                TranslationPack.patchPlayerInTranslation(from),
                card.GeneratedBySkill,
                TranslationPack.patchCardInTranslation(card.Id),
                cardUseEvent.targetGroup
                  ? TranslationPack.patchPlayerInTranslation(
                      ...TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).map(id => this.getPlayerById(id)),
                    )
                  : '',
              ).extract()
            : TranslationPack.translationJsonPatcher(
                '{0} used skill {1}, transformed {2} as {3} card' +
                  (cardUseEvent.targetGroup ? ' used to {4}' : ' to use'),
                TranslationPack.patchPlayerInTranslation(from),
                card.GeneratedBySkill || '',
                TranslationPack.patchCardInTranslation(...card.ActualCardIds),
                TranslationPack.patchCardInTranslation(card.Id),
                cardUseEvent.targetGroup
                  ? TranslationPack.patchPlayerInTranslation(
                      ...TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).map(id => this.getPlayerById(id)),
                    )
                  : '',
              ).extract(),
      };
      if (skill instanceof ViewAsSkill) {
        const result = await this.useSkill(skillUseEvent);
        if (!result) {
          return false;
        }
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
      const result = await this.useSkill({
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

      if (!result) {
        return false;
      }
    }

    await this.trigger(cardResponseEvent, CardResponseStage.PreCardResponse);
    return !EventPacker.isTerminated(cardResponseEvent);
  }

  private readonly onAim = async (
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    aimEventCollaborators: { [player: string]: ServerEventFinder<GameEventIdentifiers.AimEvent>[] },
  ) => {
    const stages = [AimStage.OnAim, AimStage.OnAimmed, AimStage.AfterAim, AimStage.AfterAimmed];
    for (const stage of stages) {
      const involvedPlayerIds = TargetGroupUtil.getAllTargets(event.targetGroup);
      if (!involvedPlayerIds) {
        return false;
      }
      this.sortByPlayersPosition(involvedPlayerIds, ids => this.getPlayerById(ids[0]));
      event.targetGroup = involvedPlayerIds;
      let aimGroup = AimGroupUtil.initAimGroup(involvedPlayerIds.map(ids => ids[0]));

      const collabroatorsIndex: { [player: string]: number } = {};
      let isFirstTarget = true;
      do {
        const toId = AimGroupUtil.getUndoneOrDoneTargets(aimGroup)[0];
        let aimEvent: ServerEventFinder<GameEventIdentifiers.AimEvent>;
        let initialEvent = false;
        collabroatorsIndex[toId] = collabroatorsIndex[toId] || 0;
        if (!aimEventCollaborators[toId] || collabroatorsIndex[toId] >= aimEventCollaborators[toId].length) {
          aimEvent = EventPacker.createIdentifierEvent(GameEventIdentifiers.AimEvent, {
            fromId: event.fromId,
            byCardId: event.cardId,
            toId,
            targetGroup: event.targetGroup,
            nullifiedTargets: event.nullifiedTargets || [],
            allTargets: aimGroup,
            isFirstTarget,
            additionalDamage: event.additionalDamage,
            extraUse: event.extraUse,
          });

          EventPacker.copyPropertiesTo(event, aimEvent);
          collabroatorsIndex[toId] = 1;
          initialEvent = true;
        } else {
          aimEvent = aimEventCollaborators[toId][collabroatorsIndex[toId]];
          aimEvent.fromId = event.fromId;
          aimEvent.byCardId = event.cardId;
          aimEvent.allTargets = aimGroup;
          aimEvent.targetGroup = event.targetGroup;
          aimEvent.nullifiedTargets = event.nullifiedTargets || [];
          aimEvent.isFirstTarget = isFirstTarget;
          aimEvent.extraUse = event.extraUse;
        }

        isFirstTarget = false;

        await this.trigger(aimEvent, stage);
        AimGroupUtil.removeDeadTargets(this, aimEvent);

        let aimEventTargetGroup = aimEvent.targetGroup;
        if (aimEventTargetGroup) {
          const aimEventTargets = TargetGroupUtil.getAllTargets(aimEventTargetGroup);
          aimEventTargets && this.sortByPlayersPosition(aimEventTargets, ids => this.getPlayerById(ids[0]));
          aimEventTargetGroup = aimEventTargets;
        }

        event.fromId = aimEvent.fromId;
        event.targetGroup = aimEventTargetGroup;
        event.nullifiedTargets = aimEvent.nullifiedTargets;
        if (aimEvent.triggeredBySkills) {
          event.triggeredBySkills = event.triggeredBySkills
            ? [...event.triggeredBySkills, ...aimEvent.triggeredBySkills]
            : aimEvent.triggeredBySkills;
        }
        event.extraUse = aimEvent.extraUse;
        if (AimGroupUtil.getAllTargets(aimEvent.allTargets).length === 0) {
          return false;
        }

        const cancelledTargets = AimGroupUtil.getCancelledTargets(aimEvent.allTargets);
        if (cancelledTargets.length > 0) {
          for (const target of cancelledTargets) {
            aimEventCollaborators[target] = [];
            collabroatorsIndex[target] = 0;
          }
        }
        aimEvent.allTargets[AimStatus.Cancelled] = [];

        aimEventCollaborators[toId] = aimEventCollaborators[toId] || [];
        if (!(EventPacker.isTerminated(aimEvent) || this.getPlayerById(toId).Dead)) {
          initialEvent
            ? aimEventCollaborators[toId].push(aimEvent)
            : (aimEventCollaborators[toId][collabroatorsIndex[toId]] = aimEvent);
          collabroatorsIndex[toId]++;
        }

        EventPacker.isTerminated(aimEvent) || AimGroupUtil.setTargetDone(aimGroup, toId);
        aimGroup = aimEvent.allTargets;
      } while (AimGroupUtil.getUndoneOrDoneTargets(aimGroup).length > 0);
    }

    return true;
  };

  public async useCard(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, declared?: boolean) {
    EventPacker.createIdentifierEvent(GameEventIdentifiers.CardUseEvent, event);
    if (!declared && !(await this.preUseCard(event))) {
      return;
    }

    await super.useCard(event);

    if (
      event.responseToEvent &&
      EventPacker.getIdentifier(event.responseToEvent) === GameEventIdentifiers.CardEffectEvent
    ) {
      const cardEffectEvent = event.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      cardEffectEvent.cardIdsResponded = cardEffectEvent.cardIdsResponded || [];
      cardEffectEvent.cardIdsResponded.push(event.cardId);
    }

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.CardUseEvent, event, async stage => {
      if (
        stage !== CardUseStage.CardUseFinishedEffect &&
        Sanguosha.getCardById(event.cardId).Skill instanceof ResponsiveSkill
          ? !event.toCardIds || event.toCardIds.length === 0
          : TargetGroupUtil.getRealTargets(event.targetGroup).length === 0
      ) {
        return true;
      }

      if (stage === CardUseStage.AfterCardUseEffect) {
        const card = Sanguosha.getCardById(event.cardId);
        const aimEventCollaborators: { [player: string]: ServerEventFinder<GameEventIdentifiers.AimEvent>[] } = {};

        if (TargetGroupUtil.getAllTargets(event.targetGroup) && !(await this.onAim(event, aimEventCollaborators))) {
          return true;
        }

        if (card.is(CardType.Equip)) {
          if (this.isCardOnProcessing(event.cardId)) {
            const from = this.getPlayerById(event.fromId);

            if (from.Dead) {
              await this.moveCards({
                movingCards: [{ card: card.Id, fromArea: CardMoveArea.ProcessingArea }],
                moveReason: CardMoveReason.PlaceToDropStack,
                toArea: CardMoveArea.DropStack,
              });
            } else {
              let existingEquipId = from.getEquipment((card as EquipCard).EquipType);
              if (card.isVirtualCard()) {
                const actualEquip = Sanguosha.getCardById<EquipCard>((card as VirtualCard).ActualCardIds[0]);
                existingEquipId = from.getEquipment(actualEquip.EquipType);
              }

              if (existingEquipId !== undefined) {
                await this.moveCards(
                  {
                    fromId: from.Id,
                    moveReason: CardMoveReason.PlaceToDropStack,
                    toArea: CardMoveArea.DropStack,
                    movingCards: [{ card: existingEquipId, fromArea: CardMoveArea.EquipArea }],
                  },
                  {
                    movingCards: [{ card: card.Id, fromArea: CardMoveArea.ProcessingArea }],
                    moveReason: CardMoveReason.CardUse,
                    toId: from.Id,
                    toArea: CardMoveArea.EquipArea,
                  },
                );
              } else {
                await this.moveCards({
                  movingCards: [{ card: card.Id, fromArea: CardMoveArea.ProcessingArea }],
                  moveReason: CardMoveReason.CardUse,
                  toId: from.Id,
                  toArea: CardMoveArea.EquipArea,
                });
              }
            }
          }

          this.endProcessOnTag(card.Id.toString());
          return true;
        } else if (card.is(CardType.DelayedTrick)) {
          const realTargets = TargetGroupUtil.getAllTargets(event.targetGroup);
          const moveToIds = realTargets?.map(ids => ids[0]);
          const to = moveToIds && this.getPlayerById(moveToIds[0]);
          if (to && !to.Dead && this.isCardOnProcessing(event.cardId)) {
            await this.moveCards({
              fromId: event.fromId,
              movingCards: [{ card: card.Id, fromArea: CardMoveArea.ProcessingArea }],
              toId: to.Id,
              toArea: CardMoveArea.JudgeArea,
              moveReason: CardMoveReason.CardUse,
            });
          } else {
            await this.moveCards({
              fromId: event.fromId,
              movingCards: [{ card: card.Id, fromArea: CardMoveArea.ProcessingArea }],
              toArea: CardMoveArea.DropStack,
              moveReason: CardMoveReason.PlaceToDropStack,
            });
          }

          this.endProcessOnTag(card.Id.toString());
          return true;
        }

        const cardEffectEvent: ServerEventFinder<GameEventIdentifiers.CardEffectEvent> = {
          ...event,
          allTargets: TargetGroupUtil.getRealTargets(event.targetGroup),
        };

        await card.Skill.beforeEffect(this, cardEffectEvent);

        const onCardEffect = async (ev: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) => {
          await this.gameProcessor.onHandleIncomingEvent(
            GameEventIdentifiers.CardEffectEvent,
            EventPacker.createIdentifierEvent(GameEventIdentifiers.CardEffectEvent, ev),
          );

          EventPacker.copyPropertiesTo(ev, event);
        };

        const list = event.disresponsiveList;
        if (card.Skill instanceof ResponsiveSkill) {
          cardEffectEvent.disresponsiveList = EventPacker.isDisresponsiveEvent(event, true)
            ? this.getAllPlayersFrom().map(player => player.Id)
            : event.disresponsiveList;
          await onCardEffect(cardEffectEvent);
        } else {
          const collabroatorsIndex: { [player: string]: number } = {};
          for (const groupTargets of TargetGroupUtil.getAllTargets(event.targetGroup) || []) {
            const toId = groupTargets[0];
            const nullifiedTargets = event.nullifiedTargets || [];
            if (nullifiedTargets.includes(toId) || this.getPlayerById(toId).Dead) {
              continue;
            }

            const singleCardEffectEvent = {
              ...cardEffectEvent,
              toIds: groupTargets,
              nullifiedTargets,
            };

            if (aimEventCollaborators[toId]) {
              collabroatorsIndex[toId] = collabroatorsIndex[toId] || 0;
              const aimEvent = aimEventCollaborators[toId][collabroatorsIndex[toId]];
              EventPacker.copyPropertiesTo(aimEvent, singleCardEffectEvent);
              singleCardEffectEvent.additionalDamage = aimEvent.additionalDamage;
              if (
                !EventPacker.isDisresponsiveEvent(singleCardEffectEvent) &&
                list &&
                list.length > 0 &&
                list.includes(toId)
              ) {
                EventPacker.setDisresponsiveEvent(singleCardEffectEvent);
              }
              collabroatorsIndex[toId]++;
            }

            await onCardEffect(singleCardEffectEvent);

            if (singleCardEffectEvent.cardIdsResponded) {
              event.cardIdsResponded = event.cardIdsResponded || [];
              event.cardIdsResponded.push(...singleCardEffectEvent.cardIdsResponded);
            }
          }
        }

        await card.Skill.afterEffect(this, cardEffectEvent);
      }

      return true;
    });
  }

  public async useSkill(content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const skill = Sanguosha.getSkillBySkillName(content.skillName);
    if (EventPacker.isTerminated(content) || !(await skill.beforeUse(this, content))) {
      return false;
    }

    if (!(await super.useSkill(content))) {
      return false;
    }

    content.toIds && skill.resortTargets() && this.sortPlayersByPosition(content.toIds);

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.SkillUseEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.SkillUseEvent, content),
    );
    if (!EventPacker.isTerminated(content)) {
      await this.gameProcessor.onHandleIncomingEvent(
        GameEventIdentifiers.SkillEffectEvent,
        EventPacker.createIdentifierEvent(GameEventIdentifiers.SkillEffectEvent, content),
      );
    }

    return true;
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
  public async obtainSkill(playerId: PlayerId, skillName: string, broadcast?: boolean, insertIndex?: number) {
    const player = this.getPlayerById(playerId);
    player.obtainSkill(skillName, insertIndex);
    this.broadcast(GameEventIdentifiers.ObtainSkillEvent, {
      toId: playerId,
      skillName,
      insertIndex,
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

  public async updateSkill(playerId: PlayerId, oldSkillName: string, newSkillName: string) {
    const player = this.getPlayerById(playerId);
    const index = player.getPlayerSkills(undefined, true).findIndex(skill => skill.Name === oldSkillName);
    if (index === -1) {
      return;
    }

    await this.loseSkill(playerId, oldSkillName);
    await this.obtainSkill(playerId, newSkillName, false, index);
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
    if (droppedBy !== undefined && droppedBy === playerId && moveReason === CardMoveReason.SelfDrop) {
      cardIds = cardIds.filter(id => this.canDropCard(droppedBy!, id));
    }

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

  public async moveCards(...infos: MoveCardEventInfos[]) {
    const toRemove: MoveCardEventInfos[] = [];
    for (const info of infos) {
      if (info.movingCards.length === 0) {
        toRemove.push(info);
        continue;
      }

      const from = info.fromId ? this.getPlayerById(info.fromId) : undefined;
      info.movingCards = info.movingCards.reduce<
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
    }

    infos.filter(info => !toRemove.includes(info));
    if (!infos || infos.length === 0) {
      return;
    }

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.MoveCardEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.MoveCardEvent, { infos }),
    );
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
    if (to.Hp === to.MaxHp || event.recoveredHp < 1) {
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
    const event: ServerEventFinder<GameEventIdentifiers.JudgeEvent> = {
      toId: to,
      judgeCardId: -1,
      realJudgeCardId: -1,
      byCard,
      bySkill,
      judgeMatcherEnum,
    };

    await this.trigger(
      EventPacker.createIdentifierEvent(GameEventIdentifiers.JudgeEvent, event),
      JudgeEffectStage.BeforeJudge,
    );

    if (event.realJudgeCardId === -1) {
      const judgeCardId = this.getCards(1, 'top')[0];
      event.judgeCardId = judgeCardId;
      event.realJudgeCardId = judgeCardId;
    } else {
      event.judgeCardId = event.realJudgeCardId;
    }

    await this.gameProcessor.onHandleIncomingEvent(GameEventIdentifiers.JudgeEvent, event);

    return event;
  }

  public async pindian(fromId: PlayerId, toIds: PlayerId[], bySkill: string) {
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
          triggeredBySkills: [bySkill],
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

        const moveCardInfos: MoveCardEventInfos[] = [];
        for (const target of targetList) {
          const currentResponse = responses.find(resp => resp.fromId === target);
          if (!currentResponse) {
            continue;
          }

          moveCardInfos.push({
            movingCards: [{ card: currentResponse.pindianCard, fromArea: PlayerCardsArea.HandArea }],
            fromId: target,
            toArea: CardMoveArea.ProcessingArea,
            moveReason: CardMoveReason.ActiveMove,
          });
        }

        await this.moveCards(...moveCardInfos);

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
            procedure.winner
              ? TranslationPack.translationJsonPatcher(
                  'pindian result:{0} win',
                  TranslationPack.patchPlayerInTranslation(this.getPlayerById(procedure.winner)),
                ).toString()
              : 'pindian result:draw',
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
        const event = EventPacker.createIdentifierEvent(GameEventIdentifiers.PhaseSkippedEvent, {
          playerId: player,
          skippedPhase: phase,
        });
        this.analytics.record(event, this.isPlaying() ? this.CurrentPlayerPhase : undefined);
        await this.trigger(event);
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
        commonRules: this.CommonRules.toSocketObject(player),
      },
      playerId,
    );
  }

  public async kill(deadPlayer: Player, killedBy?: PlayerId, killedByCards?: CardId[]) {
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
      killedByCards,
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
            const toHookUp: Skill[] = [];
            if (SkillLifeCycle.isHookedAfterDead(skill)) {
              toHookUp.push(skill);
            }

            if (toHookUp.length > 0) {
              deadPlayer.hookUpSkills(toHookUp);
              this.broadcast(GameEventIdentifiers.HookUpSkillsEvent, {
                toId: deadPlayer.Id,
                skillNames: toHookUp.map(skill => skill.Name),
              });
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
  public setFlag<T>(player: PlayerId, name: string, value: T, tagName?: string, visiblePlayers?: PlayerId[]): T {
    this.broadcast(GameEventIdentifiers.SetFlagEvent, {
      to: player,
      value,
      name,
      tagName,
      visiblePlayers,
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

  public displayCards(
    fromId: PlayerId,
    displayCards: CardId[],
    toIds?: PlayerId[],
    translations?: PatchedTranslationObject,
  ): void {
    const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId,
      engagedPlayerIds: toIds,
      displayCards,
      unengagedMessage: toIds
        ? TranslationPack.translationJsonPatcher(
            '{0} displayed {1} cards to {2}',
            TranslationPack.patchPlayerInTranslation(this.getPlayerById(fromId)),
            displayCards.length,
            TranslationPack.patchPlayerInTranslation(...toIds.map(id => this.getPlayerById(id))),
          ).extract()
        : undefined,
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

  public installSideEffectSkill(applier: System.SideEffectSkillApplierEnum, skillName: string, sourceId: PlayerId) {
    super.installSideEffectSkill(applier, skillName, sourceId);
    this.broadcast(GameEventIdentifiers.UpgradeSideEffectSkillsEvent, {
      sideEffectSkillApplier: applier,
      skillName,
      sourceId,
    });
  }

  public uninstallSideEffectSkill(applier: System.SideEffectSkillApplierEnum) {
    super.uninstallSideEffectSkill(applier);
    this.broadcast(GameEventIdentifiers.UpgradeSideEffectSkillsEvent, {
      sideEffectSkillApplier: applier,
      skillName: undefined,
    });
  }

  public async abortPlayerEquipSections(playerId: PlayerId, ...abortSections: CharacterEquipSections[]) {
    const player = this.getPlayerById(playerId);
    player.abortEquipSections(...abortSections);

    const abortEvent: ServerEventFinder<GameEventIdentifiers.AbortOrResumePlayerSectionsEvent> = {
      toId: playerId,
      toSections: abortSections,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} aborted {1} equip section',
        TranslationPack.patchPlayerInTranslation(player),
        TranslationPack.wrapArrayParams(...abortSections),
      ).extract(),
    };
    this.broadcast(GameEventIdentifiers.AbortOrResumePlayerSectionsEvent, abortEvent);

    const equipSectionMapper = {
      [CharacterEquipSections.Weapon]: CardType.Weapon,
      [CharacterEquipSections.Shield]: CardType.Shield,
      [CharacterEquipSections.DefenseRide]: CardType.DefenseRide,
      [CharacterEquipSections.OffenseRide]: CardType.OffenseRide,
      [CharacterEquipSections.Precious]: CardType.Precious,
    };

    const droppedEquips: CardId[] = [];
    for (const section of abortSections) {
      const equip = player.getEquipment(equipSectionMapper[section]);
      if (equip !== undefined) {
        droppedEquips.push(equip);
      }
    }

    await this.dropCards(CardMoveReason.PlaceToDropStack, droppedEquips, playerId);
  }

  public resumePlayerEquipSections(playerId: PlayerId, ...abortSections: CharacterEquipSections[]) {
    const player = this.getPlayerById(playerId);
    player.resumeEquipSections(...abortSections);

    const abortEvent: ServerEventFinder<GameEventIdentifiers.AbortOrResumePlayerSectionsEvent> = {
      toId: playerId,
      toSections: abortSections,
      isResumption: true,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} resumed {1} equip section',
        TranslationPack.patchPlayerInTranslation(player),
        TranslationPack.wrapArrayParams(...abortSections),
      ).extract(),
    };
    this.broadcast(GameEventIdentifiers.AbortOrResumePlayerSectionsEvent, abortEvent);
  }

  public async abortPlayerJudgeArea(playerId: PlayerId) {
    const player = this.getPlayerById(playerId);
    const judgeAreaCards = player.getCardIds(PlayerCardsArea.JudgeArea);
    judgeAreaCards.length > 0 &&
      (await this.dropCards(CardMoveReason.PlaceToDropStack, judgeAreaCards, playerId, playerId));

    player.abortJudgeArea();

    const abortEvent: ServerEventFinder<GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent> = {
      toId: playerId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} aborted judge area',
        TranslationPack.patchPlayerInTranslation(player),
      ).extract(),
    };
    this.broadcast(GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent, abortEvent);
  }

  public resumePlayerJudgeArea(playerId: PlayerId) {
    const player = this.getPlayerById(playerId);
    player.resumeJudgeArea();

    const abortEvent: ServerEventFinder<GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent> = {
      toId: playerId,
      isResumption: true,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} resumed judge area',
        TranslationPack.patchPlayerInTranslation(player),
      ).extract(),
    };
    this.broadcast(GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent, abortEvent);
  }

  public refreshPlayerOnceSkill(playerId: PlayerId, skillName: string) {
    const player = this.getPlayerById(playerId);
    if (!player.refreshOnceSkill(skillName)) {
      return;
    }

    const refreshEvent: ServerEventFinder<GameEventIdentifiers.RefreshOnceSkillEvent> = {
      toId: playerId,
      skillName,
    };
    this.broadcast(GameEventIdentifiers.RefreshOnceSkillEvent, refreshEvent);
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
