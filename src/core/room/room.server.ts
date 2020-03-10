import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import {
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
} from 'core/player/player_props';

import { CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardId } from 'core/cards/libs/card_props';
import { Character } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { GameInfo, getRoles } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { CardLoader } from 'core/game/package_loader/loader.cards';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Logger } from 'core/shares/libs/logger/logger';
import { TriggerSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { GameProcessor } from '../game/game_processor';
import { Room, RoomId } from './room';

export class ServerRoom extends Room<WorkPlace.Server> {
  private loadedCharacters: Character[] = [];

  private drawStack: CardId[] = [];
  private dropStack: CardId[] = [];
  private round = 0;
  private onProcessingCard: CardId | undefined;

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
    this.loadedCharacters = CharacterLoader.getInstance().getPackages(
      ...this.gameInfo.characterExtensions,
    );
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

  public notify<I extends GameEventIdentifiers>(
    type: I,
    content: ServerEventFinder<I>,
    to: PlayerId,
  ) {
    this.socket.notify(
      type,
      EventPacker.createIdentifierEvent(type, content),
      to,
    );
  }

  public broadcast<I extends GameEventIdentifiers>(
    type: I,
    content: ServerEventFinder<I>,
  ) {
    if (this.isPlaying()) {
      content = EventPacker.wrapGameRunningInfo(content, {
        numberOfDrawStack: this.drawStack.length,
        round: this.round,
        currentPlayerId: this.CurrentPlayer.Id,
      });
    }

    this.socket.broadcast(
      type,
      EventPacker.createIdentifierEvent(type, content),
    );
  }

  public async trigger<T = never>(
    content: T extends never ? ServerEventFinder<GameEventIdentifiers> : T,
    stage?: AllStage,
  ) {
    if (!this.CurrentPlayer) {
      throw new Error('current player is undefined');
    }

    for (const player of this.getAlivePlayersFrom()) {
      if (player.Dead) {
        continue;
      }

      const { triggeredBySkillName } = content as ServerEventFinder<
        GameEventIdentifiers
      >;
      const canTriggerSkills: TriggerSkill[] = [];
      const bySkill =
        triggeredBySkillName &&
        Sanguosha.getSkillBySkillName(triggeredBySkillName);
      for (const equip of player.getCardIds(PlayerCardsArea.EquipArea)) {
        const equipCard = Sanguosha.getCardById(equip);
        if (
          bySkill &&
          UniqueSkillRule.canTriggerCardSkillRule(bySkill, equipCard) &&
          equipCard.Skill instanceof TriggerSkill
        ) {
          canTriggerSkills.push(equipCard.Skill);
        }
      }
      for (const skill of player.getPlayerSkills<TriggerSkill>('trigger')) {
        if (bySkill && UniqueSkillRule.canUseSkillRule(bySkill, skill)) {
          canTriggerSkills.push(skill);
        }
      }
      for (const skill of canTriggerSkills) {
        if (
          skill.isTriggerable(content, stage) &&
          skill.canUse(this, player, content)
        ) {
          const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
            fromId: player.Id,
            skillName: skill.Name,
            triggeredOnEvent: content,
          };
          if (skill.isAutoTrigger()) {
            await this.useSkill(triggerSkillEvent);
          } else {
            this.notify(
              GameEventIdentifiers.AskForInvokeEvent,
              {
                invokeSkillNames: [skill.Name],
                to: player.Id,
              },
              player.Id,
            );
            const { invoke } = await this.onReceivingAsyncReponseFrom(
              GameEventIdentifiers.AskForInvokeEvent,
              player.Id,
            );
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

  public getOnProcessingCard(): CardId | undefined {
    return this.onProcessingCard;
  }
  public clearOnProcessingCard(): void {
    this.onProcessingCard = undefined;
  }

  public bury(cardId: CardId | undefined) {
    cardId !== undefined && this.dropStack.push(cardId);
  }
  public isBuried(cardId: CardId): boolean {
    return this.dropStack.includes(cardId);
  }

  public async equip(card: EquipCard, player: Player) {
    const prevEquipment = player.hasEquipment(card.EquipType);
    if (prevEquipment !== undefined) {
      await this.dropCards([prevEquipment], player.Id);
    }

    const event: ServerEventFinder<GameEventIdentifiers.EquipEvent> = {
      fromId: player.Id,
      cardId: card.Id,
    };
    this.broadcast(GameEventIdentifiers.EquipEvent, event);
    player.equip(card);
  }

  public async useCard(
    content: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    await super.useCard(content);
    const from = this.getPlayerById(content.fromId);
    const card = Sanguosha.getCardById(content.cardId);
    if (card instanceof EquipCard) {
      await this.equip(card, from);
    } else if (!card.is(CardType.DelayedTrick)) {
      const usedEvent: ServerEventFinder<GameEventIdentifiers.CardDropEvent> = {
        fromId: content.fromId,
        cardIds: [content.cardId],
      };
      this.notify(
        GameEventIdentifiers.CardDropEvent,
        usedEvent,
        content.fromId,
      );
      from.dropCards(content.cardId);
    }

    this.onProcessingCard = content.cardId;
    return await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.CardUseEvent,
      content,
      async stage => {
        if (stage === CardUseStage.AfterCardUseEffect) {
          const cardAimEvent:
            | ServerEventFinder<GameEventIdentifiers.AimEvent>
            | undefined = content.toIds
            ? {
                fromId: content.fromId,
                byCardId: content.cardId,
                toIds: content.toIds,
              }
            : undefined;
          if (
            !EventPacker.isTerminated(content) &&
            cardAimEvent !== undefined
          ) {
            await this.gameProcessor.onHandleIncomingEvent(
              GameEventIdentifiers.AimEvent,
              cardAimEvent,
            );
          }

          if (
            cardAimEvent &&
            !EventPacker.isTerminated(cardAimEvent) &&
            !card.is(CardType.DelayedTrick)
          ) {
            await this.gameProcessor.onHandleIncomingEvent(
              GameEventIdentifiers.CardEffectEvent,
              EventPacker.recall(content),
            );
          }
        } else if (stage === CardUseStage.CardUseFinishedEffect) {
          if (!card.is(CardType.Equip) && !card.is(CardType.DelayedTrick)) {
            this.bury(this.onProcessingCard);
          }
          this.clearOnProcessingCard();
        }

        return true;
      },
    );
  }

  public async useSkill(
    content: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    await super.useSkill(content);
    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.SkillUseEvent,
      content,
    );
    if (!EventPacker.isTerminated(content)) {
      await this.gameProcessor.onHandleIncomingEvent(
        GameEventIdentifiers.SkillEffectEvent,
        content,
      );
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
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} lost {1} hp',
        player.Name,
        lostHp,
      ).extract(),
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
  ) {
    const cardIds = this.getCards(numberOfCards, from);
    const drawEvent: ServerEventFinder<GameEventIdentifiers.DrawCardEvent> = {
      cardIds,
      playerId: playerId || this.CurrentPlayer.Id,
    };

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.DrawCardEvent,
      drawEvent,
    );

    return cardIds;
  }

  public async dropCards(cardIds: CardId[], playerId?: PlayerId) {
    const dropEvent: ServerEventFinder<GameEventIdentifiers.CardDropEvent> = {
      cardIds,
      fromId: playerId || this.CurrentPlayer.Id,
    };

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.CardDropEvent,
      dropEvent,
    );

    this.dropStack.push(...cardIds);
  }

  public async obtainCards(cardIds: CardId[], to: PlayerId, fromId?: PlayerId) {
    const obtainCardEvent = {
      cardIds,
      toId: to,
      fromId,
    };
    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.ObtainCardEvent,
      obtainCardEvent,
    );
  }

  public async moveCards(
    cardIds: CardId[],
    fromId: PlayerId | undefined,
    toId: PlayerId,
    fromArea: PlayerCardsArea,
    toArea: PlayerCardsArea,
  ) {
    //TODO: fill this function
  }

  public async moveCard(
    cardId: CardId,
    fromId: PlayerId | undefined,
    toId: PlayerId,
    fromArea: PlayerCardsArea,
    toArea: PlayerCardsArea,
  ) {
    const to = this.getPlayerById(toId);
    const from = fromId && this.getPlayerById(fromId);

    if (toArea === PlayerCardsArea.EquipArea) {
      const card = Sanguosha.getCardById<EquipCard>(cardId);
      const equipped = to.hasEquipment(card.EquipType);
      if (equipped !== undefined) {
        const event: ServerEventFinder<GameEventIdentifiers.CardDropEvent> = {
          fromId: to.Id,
          cardIds: [equipped],
        };
        await this.gameProcessor.onHandleIncomingEvent(
          GameEventIdentifiers.CardDropEvent,
          event,
        );
      }

      //TODO: refactor equip event trigger process if there are any skills triggered by wearing equipments
      this.equip(card, to);
      const equipEvent: ServerEventFinder<GameEventIdentifiers.EquipEvent> = {
        fromId: to.Id,
        cardId,
      };
      this.broadcast(GameEventIdentifiers.EquipEvent, equipEvent);
    } else {
      if (toArea === PlayerCardsArea.HandArea) {
        await this.gameProcessor.onHandleIncomingEvent(
          GameEventIdentifiers.ObtainCardEvent,
          {
            fromId,
            toId,
            cardIds: [cardId],
          },
        );
      } else {
        this.broadcast<GameEventIdentifiers.MoveCardEvent>(
          GameEventIdentifiers.MoveCardEvent,
          {
            fromId,
            toId,
            fromArea,
            toArea,
            cardId,
          },
        );

        if (from) {
          const fromAreaCards = from.getCardIds(fromArea);
          const lostIndex = fromAreaCards.findIndex(id => id === cardId);
          fromAreaCards.splice(lostIndex, 1);
        }

        to.getCardIds(toArea).push(cardId);
      }
    }
  }

  public async damage(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): Promise<void> {
    event.translationsMessage =
      event.fromId === undefined
        ? TranslationPack.translationJsonPatcher(
            '{0} got hurt for {1} hp with {2} property',
            this.getPlayerById(event.toId).Character.Name,
            event.damage,
            event.damageType,
          ).extract()
        : TranslationPack.translationJsonPatcher(
            '{0} hits {1} {2} hp of damage type {3}',
            this.getPlayerById(event.fromId).Character.Name,
            this.getPlayerById(event.toId).Character.Name,
            event.damage,
            event.damageType,
          ).extract();

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.DamageEvent,
      event,
    );
  }

  public async recover(
    event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>,
  ): Promise<void> {
    event.translationsMessage =
      event.recoverBy !== undefined
        ? TranslationPack.translationJsonPatcher(
            '{0} recovered {2} hp for {1}',
            this.getPlayerById(event.recoverBy).Character.Name,
            this.getPlayerById(event.toId).Character.Name,
            event.recoveredHp,
          ).extract()
        : TranslationPack.translationJsonPatcher(
            '{0} recovered {1} hp',
            this.getPlayerById(event.toId).Character.Name,
            event.recoveredHp,
          ).extract();

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.RecoverEvent,
      event,
    );
  }

  public async responseCard(
    event: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>,
  ): Promise<void> {
    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.CardResponseEvent,
      event,
    );
  }

  public async judge(
    event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>,
  ): Promise<void> {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} starts a judge of {1}',
      this.getPlayerById(event.toId).Character.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();

    await this.gameProcessor.onHandleIncomingEvent(
      GameEventIdentifiers.JudgeEvent,
      event,
    );

    if (this.getCardOwnerId(event.judgeCardId) === undefined) {
      this.bury(event.judgeCardId);
    }
  }

  public syncGameCommonRules(
    playerId: PlayerId,
    updateActions: (user: Player) => void,
  ) {
    updateActions(this.getPlayerById(playerId));

    this.notify(
      GameEventIdentifiers.SyncGameCommonRulesEvent,
      {
        toId: playerId,
        commonRules: GameCommonRules.toSocketObject(
          this.getPlayerById(playerId),
        ),
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
