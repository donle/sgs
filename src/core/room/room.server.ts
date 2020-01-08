import { Card, CardId } from 'core/cards/card';
import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import {
  AllStage,
  GameEventStage,
  GameStages,
  PlayerStage,
} from 'core/game/stage';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import {
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
} from 'core/player/player_props';
import { Languages } from 'translations/languages';

import { Character } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { GameInfo } from 'core/game/game_props';
import { CardLoader } from 'core/game/package_loader/loader.cards';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { TriggerSkill } from 'core/skills/skill';
import { Room } from './room';

type RoomId = number;

export class ServerRoom extends Room<WorkPlace.Server> {
  protected currentGameEventStage: GameEventStage;
  protected currentPlayerStage: PlayerStage;
  protected currentPlayer: Player;

  private loadedCharacters: Character[];
  private loadedCards: Card[];

  private cards: CardId[];
  private drawDile: CardId[];
  private dropDile: CardId[];

  constructor(
    protected roomId: RoomId,
    protected gameInfo: GameInfo,
    protected socket: ServerSocket,
    protected players: Player[],
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
  public gameStart() {}

  public createPlayer(playerInfo: PlayerInfo, playerLanguage: Languages) {
    const { Id, Name, Position, CharacterId } = playerInfo;
    this.players.push(
      new ServerPlayer(Id, Name, Position, playerLanguage, CharacterId),
    );
  }

  public notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
    to: PlayerId,
  ) {
    this.socket.sendEvent(type, content, to);
  }

  public async broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
    pendingMessage?: (language: Languages) => string,
  ) {
    this.socket.Clients.forEach(client => {
      if (pendingMessage) {
        const language = this.getPlayerById(client.id).PlayerLanguage;
        content.message = pendingMessage(language);
      }

      client.send(JSON.stringify({ type, content }));
    });

    const stages: GameEventStage[] = GameStages[type];
    for (const stage of stages) {
      this.currentGameEventStage = stage;
      if (
        !this.currentGameEventStage.startsWith('Before') &&
        !this.currentGameEventStage.startsWith('After')
      ) {
        const skill = Sanguosha.getSkillBySkillName(
          content.triggeredBySkillName,
        );
        if (skill) {
          const { invoke } = await this.socket.waitForResponse<
            EventPicker<
              GameEventIdentifiers.AskForInvokeEvent,
              WorkPlace.Client
            >
          >('@skill_response');
          invoke && skill.onEffect(this, content);
        }
      }

      this.trigger(stage, content);
    }
  }

  public async trigger(
    stage: AllStage,
    content: EventPicker<GameEventIdentifiers, WorkPlace.Server>,
  ) {
    const start = this.players.length % this.CurrentPlayer.Position;
    for (
      let i = start;
      i !== this.CurrentPlayer.Position;
      i = this.players.length % (i + 1)
    ) {
      if (this.players[i].Dead) {
        continue;
      }

      const skills = this.players[i].getSkills<TriggerSkill>('trigger');
      for (const skill of skills) {
        if (
          skill.isTriggerable(stage) &&
          skill.canUse(this, this.players[i], content)
        ) {
          if (skill.isAutoTrigger()) {
            skill.onTrigger(this, this.players[i], content);
          } else {
            const { invoke } = await this.socket.waitForResponse<
              EventPicker<
                GameEventIdentifiers.AskForInvokeEvent,
                WorkPlace.Client
              >
            >('@skill_response');
            invoke && skill.onTrigger(this, this.players[i], content);
          }
        }
      }
    }
  }

  public drawCards(numberOfCards: number, player?: Player) {
    const drawCards = this.drawDile.slice(0, numberOfCards);
    this.drawDile = this.drawDile.slice(numberOfCards);
    player
      ? player.drawCardIds(...drawCards)
      : this.currentPlayer.drawCardIds(...drawCards);
  }

  public dropCards(cardIds: CardId[], player?: Player) {}

  public moveCard(
    cardId: CardId,
    from: Player,
    to: Player,
    toArea: PlayerCardsArea,
  ) {}

  public get RoomId() {
    return this.roomId;
  }

  public get CurrentPlayer() {
    return this.currentPlayer;
  }
}
