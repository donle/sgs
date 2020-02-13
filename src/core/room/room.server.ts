import { Card } from 'core/cards/card';
import {
  ClientEventFinder,
  EventPacker,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { AllStage, DrawCardStage } from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import {
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
} from 'core/player/player_props';

import { EquipCard } from 'core/cards/equip_card';
import { CardId } from 'core/cards/libs/card_props';
import { Character } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { GameInfo, getRoles } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { CardLoader } from 'core/game/package_loader/loader.cards';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { RoomInfo } from 'core/shares/types/server_types';
import { TriggerSkill } from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { GameProcessor } from '../game/game_processor';
import { Room, RoomId } from './room';

export class ServerRoom extends Room<WorkPlace.Server> {
  protected currentPlayer: Player | undefined;

  private loadedCharacters: Character[] = [];
  private loadedCards: Card[] = [];

  private cards: CardId[] = [];
  private drawDile: CardId[] = [];
  private dropDile: CardId[] = [];
  private gameStarted: boolean = false;

  constructor(
    protected roomId: RoomId,
    protected gameInfo: GameInfo,
    protected socket: ServerSocket,
    protected gameProcessor: GameProcessor,
    protected players: Player[] = [],
  ) {
    super();
  }

  protected init() {
    this.loadedCharacters = CharacterLoader.getInstance().getPackages(
      ...this.gameInfo.characterExtensions,
    );
    this.loadedCards = CardLoader.getInstance().getPackages(
      ...this.gameInfo.cardExtensions,
    );
    this.drawDile = this.cards.slice();
    this.dropDile = [];

    this.socket.emit(this);
  }

  private shuffle() {
    if (this.dropDile.length > 0) {
      this.drawDile = this.drawDile.concat(this.dropDile);
      this.dropDile = [];
    }

    for (let i = 0; i < this.drawDile.length - 1; i++) {
      const swapCardIndex =
        Math.floor(Math.random() * (this.drawCards.length - i)) + i;
      if (swapCardIndex !== i) {
        [this.drawDile[i], this.drawDile[swapCardIndex]] = [
          this.drawDile[swapCardIndex],
          this.drawDile[i],
        ];
      }
    }
  }

  // @@TODO: TBA here
  public async gameStart() {
    this.gameStarted = true;

    await this.gameProcessor.gameStart(this);
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
    this.socket.sendEvent(type, content, to);
  }

  public broadcast<I extends GameEventIdentifiers = GameEventIdentifiers>(
    type: I,
    content: EventPicker<I, WorkPlace.Server>,
  ) {
    this.socket.ClientIds.forEach(clientId => {
      if (content.messages && typeof content.messages === 'string') {
        content.messages = [content.messages];
      }
      if (content.translationsMessage) {
        content.messages
          ? content.messages.push(content.translationsMessage.toString())
          : (content.messages = [content.translationsMessage.toString()]);
      }
      this.socket.getSocketById(clientId).emit(type.toString(), content);
    });
  }

  public async trigger<T = never>(
    content: T extends never ? ServerEventFinder<GameEventIdentifiers> : T,
    stage?: AllStage,
  ) {
    if (!this.CurrentPlayer) {
      throw new Error('current player is undefined');
    }

    const start = this.players.length % this.CurrentPlayer.Position;
    for (
      let i = start;
      i !== this.CurrentPlayer.Position;
      i = this.players.length % (i + 1)
    ) {
      if (this.players[i].Dead) {
        continue;
      }

      const { triggeredBySkillName } = content as ServerEventFinder<
        GameEventIdentifiers
      >;
      const canTriggerSkills: TriggerSkill[] = [];
      const bySkill =
        triggeredBySkillName &&
        Sanguosha.getSkillBySkillName(triggeredBySkillName);
      for (const equip of this.players[i].getCardIds(
        PlayerCardsArea.EquipArea,
      )) {
        const equipCard = Sanguosha.getCardById(equip);
        if (
          bySkill &&
          UniqueSkillRule.canTriggerCardSkillRule(bySkill, equipCard)
        ) {
          canTriggerSkills.push(equipCard.Skill as TriggerSkill);
        }
      }
      for (const skill of this.players[i].getPlayerSkills<TriggerSkill>(
        'trigger',
      )) {
        if (bySkill && UniqueSkillRule.canUseSkillRule(bySkill, skill)) {
          canTriggerSkills.push(skill);
        }
      }

      for (const skill of canTriggerSkills) {
        if (
          skill.isTriggerable(content, stage) &&
          skill.canUse(this, this.players[i], content)
        ) {
          const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
            fromId: this.players[i].Id,
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
                to: this.players[i].Id,
              },
              this.players[i].Id,
            );

            const { invoke } = await this.onReceivingAsyncReponseFrom(
              GameEventIdentifiers.AskForInvokeEvent,
              this.players[i].Id,
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

  public async useCard(
    content: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      from.useCard(content.cardId);
    }
    await this.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.CardUseEvent,
      content,
    );
    const cardAimEvent:
      | ServerEventFinder<GameEventIdentifiers.AimEvent>
      | undefined = content.toIds
      ? {
          fromId: content.fromId,
          byCardId: content.cardId,
          toIds: content.toIds,
        }
      : undefined;
    if (!EventPacker.isTerminated(content) && cardAimEvent !== undefined) {
      await this.Processor.onHandleIncomingEvent(
        GameEventIdentifiers.AimEvent,
        cardAimEvent,
      );
    }
    if (cardAimEvent && !EventPacker.isTerminated(cardAimEvent)) {
      await this.Processor.onHandleIncomingEvent(
        GameEventIdentifiers.CardEffectEvent,
        EventPacker.recall(content),
      );
    }
  }

  public async useSkill(
    content: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      from.useSkill(content.skillName);
    }
    await this.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.SkillUseEvent,
      content,
    );
    if (!EventPacker.isTerminated(content)) {
      await this.Processor.onHandleIncomingEvent(
        GameEventIdentifiers.SkillEffectEvent,
        content,
      );
    }
  }

  public getCards(numberOfCards: number, from: 'top' | 'bottom') {
    const cards: CardId[] = [];
    while (numberOfCards-- > 0) {
      if (this.drawDile.length === 0) {
        this.shuffle();
      }

      const card = (from === 'top'
        ? this.drawDile.shift()
        : this.drawDile.pop()) as CardId;
      cards.push(card);
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

    await this.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.DrawCardEvent,
      EventPacker.createIdentifierEvent(
        GameEventIdentifiers.DrawCardEvent,
        drawEvent,
      ),
      async stage => {
        if (stage === DrawCardStage.CardDrawing) {
          this.getPlayerById(drawEvent.playerId).obtainCardIds(...cardIds);
        }

        return true;
      },
    );

    return cardIds;
  }

  public async dropCards(cardIds: CardId[], playerId?: PlayerId) {
    const dropEvent: ServerEventFinder<GameEventIdentifiers.CardDropEvent> = {
      cardIds,
      fromId: playerId || this.CurrentPlayer.Id,
    };

    await this.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.CardDropEvent,
      EventPacker.createIdentifierEvent(
        GameEventIdentifiers.CardDropEvent,
        dropEvent,
      ),
    );

    this.dropDile.push(...cardIds);
    this.drawDile.filter(cardId => !cardIds.includes(cardId));
  }

  public async obtainCards(cardIds: CardId[], to: PlayerId, fromId?: PlayerId) {
    const obtainCardEvent = EventPacker.createIdentifierEvent(
      GameEventIdentifiers.ObtainCardEvent,
      {
        cardIds,
        toId: to,
        fromId,
      },
    );
    await this.Processor.onHandleIncomingEvent(
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
    const from = fromId ? this.getPlayerById(fromId) : undefined;
    if (from) {
      this.onLoseCard(from, cardId);
    }

    const to = this.getPlayerById(toId);

    const card = Sanguosha.getCardById<EquipCard>(cardId);
    if (toArea === PlayerCardsArea.EquipArea) {
      const lostCardId = to.equip(card);
      lostCardId !== undefined && this.onLoseCard(to, lostCardId);
    } else {
      to.getCardIds(toArea).push(cardId);

      if (toArea === PlayerCardsArea.HandArea) {
        await this.Processor.onHandleIncomingEvent(
          GameEventIdentifiers.ObtainCardEvent,
          EventPacker.createIdentifierEvent(
            GameEventIdentifiers.ObtainCardEvent,
            {
              fromId,
              toId,
              cardIds: [cardId],
              translationsMessage: TranslationPack.translationJsonPatcher(
                '{0} obtained cards {1}',
                to.Name,
                TranslationPack.patchCardInTranslation(cardId),
              ),
            },
          ),
        );
      } else {
        this.broadcast<GameEventIdentifiers.MoveCardEvent>(
          GameEventIdentifiers.MoveCardEvent,
          {
            translationsMessage: TranslationPack.translationJsonPatcher(
              '{0} obtains card {1}',
              to.Name,
              TranslationPack.patchCardInTranslation(cardId),
            ),
            fromId,
            toId,
            fromArea,
            toArea,
          },
        );
      }
    }
  }

  public onLoseCard(player: Player, cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    card.Skill.onLoseSkill(player);

    player.dropCards(cardId);
  }

  public getCardOwnerId(card: CardId) {
    for (const player of this.AlivePlayers) {
      if (player.getCardId(card) !== undefined) {
        return player.Id;
      }
    }
  }

  public get RoomId() {
    return this.roomId;
  }

  public getRoomInfo(): RoomInfo {
    return {
      name: this.gameInfo.roomName,
      activePlayers: this.players.length,
      totalPlayers: this.gameInfo.numberOfPlayers,
      packages: this.gameInfo.characterExtensions,
      status: this.gameStarted ? 'playing' : 'waiting',
    };
  }

  public syncGameCommonRules(
    playerId: PlayerId,
    updateActions: (user: Player) => void,
  ) {
    updateActions(this.getPlayerById(playerId));

    this.broadcast(GameEventIdentifiers.SyncGameCommonRulesEvent, {
      toId: playerId,
      commonRules: GameCommonRules.toSocketObject(this.getPlayerById(playerId)),
    });
  }

  public assignRoles(): PlayerInfo[] {
    const playerInfo: PlayerInfo[] = [];

    const lordIndex = Math.floor(Math.random() * this.players.length);
    [this.players[0], this.players[lordIndex]] = [
      this.players[lordIndex],
      this.players[0],
    ];

    const roles = getRoles(this.gameInfo.numberOfPlayers);

    this.players[0].Role = roles[0];
    this.players[0].Position = 0;
    playerInfo.push({
      Id: this.players[0].Id,
      Name: this.players[0].Name,
      Position: this.players[0].Position,
      CharacterId: undefined,
      Role: this.players[0].Role,
    });

    for (let i = 1; i < this.players.length; i++) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [this.players[i], this.players[randomIndex]] = [
        this.players[randomIndex],
        this.players[i],
      ];
      const randomRoleIndex = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[randomRoleIndex]] = [roles[randomRoleIndex], roles[i]];

      this.players[i].Position = i;
      this.players[i].Role = roles[i];

      playerInfo.push({
        Id: this.players[i].Id,
        Name: this.players[i].Name,
        Position: this.players[i].Position,
        CharacterId: undefined,
        Role: this.players[i].Role,
      });
    }

    return playerInfo;
  }

  public get CurrentPlayerStage() {
    return this.gameProcessor.CurrentPlayerPhase;
  }

  public get CurrentPlayer(): Player {
    return this.gameProcessor.CurrentPlayer;
  }

  public get Processor() {
    return this.gameProcessor;
  }
}
