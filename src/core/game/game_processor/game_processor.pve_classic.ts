import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { StandardGameProcessor } from './game_processor.standard';
import { Player } from 'core/player/player';
import { Sanguosha } from '../engine';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Character } from 'core/characters/character';
import { GameEventStage, PlayerDiedStage } from '../stage_processor';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { GameMode } from 'core/shares/types/room_props';
import { Functional } from 'core/shares/libs/functional';
import { CardId } from 'core/cards/libs/card_props';
import { VirtualCard } from 'core/cards/card';
import { PveClassicGu } from 'core/skills';
import { PveClassicAi } from 'core/skills/game_mode/pve/pve_classic_ai';
import { MarkEnum } from 'core/shares/types/mark_list';
import { Algorithm } from 'core/shares/libs/algorithm';

export class PveClassicGameProcessor extends StandardGameProcessor {
  private level: number = 0;
  private mark_list: MarkEnum[] = [];
  private human: Player[];
  private activate_ai: Player[];

  public getLevelMark() {
    if (this.mark_list.length === 0) {
      this.mark_list = [
        MarkEnum.PveJi,
        MarkEnum.PveJian,
        MarkEnum.PveXi,
        MarkEnum.PveYing,
        MarkEnum.PveYu,
        MarkEnum.PveZhi,
      ];
      Algorithm.shuffle(this.mark_list);
    }
    return this.mark_list.splice(0, this.level * this.human.length * this.activate_ai.length);
  }

  public assignRoles(players: Player[]) {
    const ais = players.filter(player => player.isSmartAI());
    const humans = players.filter(player => !player.isSmartAI());
    players = [...ais, ...humans];
    for (let i = 0; i < players.length; i++) {
      console.log(`player ${i} is ${players[i].Id}`);
      players[i].Role = players[i].isSmartAI() ? PlayerRole.Rebel : PlayerRole.Loyalist;
      players[i].Position = i;
    }
  }

  protected async beforeGameStartPreparation() {
    this.level = 1;
    this.human = this.room.Players.filter(player => !player.isSmartAI());
    if (this.human.length === 1) {
      this.room.obtainSkill(this.human[0].Id, PveClassicGu.Name);
    }

    const allAI = this.room.Players.filter(player => player.isSmartAI());
    allAI.map(player => this.room.obtainSkill(player.Id, PveClassicAi.Name));
    Algorithm.shuffle(allAI);
    const changedProperties: {
      toId: PlayerId;
      activate: boolean;
    }[] = [];
    const deactiveAis = allAI.splice(0, 2);
    deactiveAis.map(player => changedProperties.push({ toId: player.Id, activate: false }));
    this.room.changePlayerProperties({ changedProperties });

    this.activate_ai = this.room.AlivePlayers.filter(player => player.isSmartAI());

    let marks = this.getLevelMark();
    for (let i = 0; i < this.human.length; i++) {
      this.activate_ai.map(player => {
        const mark = marks.pop()!;
        this.room.addMark(player.Id, mark, 1);
        return [];
      });
    }
  }

  protected async beforeGameBeginPreparation() {
    const levelBeginEvent: ServerEventFinder<GameEventIdentifiers.LevelBeginEvent> = {};
    await this.onHandleIncomingEvent(
      GameEventIdentifiers.LevelBeginEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.LevelBeginEvent, levelBeginEvent),
    );
  }

  protected async chooseCharacters(playersInfo: PlayerInfo[], selectableCharacters: Character[]) {
    const bossCharacter = Sanguosha.getCharacterByCharaterName('pve_soldier');
    const bossInfos = playersInfo.filter(info => this.room.getPlayerById(info.Id).isSmartAI());
    for (let i = 0; i < bossInfos.length; i++) {
      console.log(bossInfos[i]);
      const bossPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
        changedProperties: [{ toId: bossInfos[i].Id, characterId: bossCharacter.Id, playerPosition: i }],
      };
      this.room.changePlayerProperties(bossPropertiesChangeEvent);
    }

    const otherPlayersInfo = playersInfo.filter(info => !this.room.getPlayerById(info.Id).isSmartAI())!;

    await this.sequentialChooseCharacters(otherPlayersInfo, selectableCharacters, [bossCharacter]);
  }

  public getWinners(players: Player[]) {
    const alivePlayers = players.filter(player => !player.Dead);
    if (alivePlayers.every(player => player.isSmartAI()) || alivePlayers.every(player => !player.isSmartAI())) {
      return alivePlayers;
    }
  }

  protected async onHandlePlayerDiedEvent(
    identifier: GameEventIdentifiers.PlayerDiedEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    console.log('handle died event');
    const deadPlayer = this.room.getPlayerById(event.playerId);
    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === PlayerDiedStage.PrePlayerDied) {
        this.room.broadcast(identifier, event);
        deadPlayer.bury();
        const winners = this.room.getGameWinners();
        console.log(`winners is ${winners !== undefined && winners[0]}`);
        if (winners !== undefined && winners[0].Role === PlayerRole.Loyalist) {
          this.stageProcessor.clearProcess();
          this.playerStages = [];
          this.room.gameOver();
          this.room.broadcast(GameEventIdentifiers.GameOverEvent, {
            translationsMessage: TranslationPack.translationJsonPatcher(
              'game over, winner is {0}',
              Functional.getPlayerRoleRawText(winners[0].Role, GameMode.Pve),
            ).extract(),
            winnerIds: winners.map(winner => winner.Id),
            loserIds: this.room.Players.filter(player => !winners.includes(player)).map(player => player.Id),
          });
        }
      } else if (stage === PlayerDiedStage.PlayerDied) {
        const { killedBy, playerId } = event;
        await this.room.moveCards({
          moveReason: CardMoveReason.SelfDrop,
          fromId: playerId,
          movingCards: deadPlayer
            .getPlayerCards()
            .map(cardId => ({ card: cardId, fromArea: deadPlayer.cardFrom(cardId) })),
          toArea: CardMoveArea.DropStack,
        });

        const outsideCards = Object.entries(deadPlayer.getOutsideAreaCards()).reduce<CardId[]>(
          (allCards, [areaName, cards]) => {
            if (!deadPlayer.isCharacterOutsideArea(areaName)) {
              allCards.push(...cards);
            }
            return allCards;
          },
          [],
        );

        const allCards = [...deadPlayer.getCardIds(PlayerCardsArea.JudgeArea), ...outsideCards];
        await this.room.moveCards({
          moveReason: CardMoveReason.PlaceToDropStack,
          fromId: playerId,
          movingCards: allCards.map(cardId => ({ card: cardId, fromArea: deadPlayer.cardFrom(cardId) })),
          toArea: CardMoveArea.DropStack,
        });

        if (killedBy) {
          const killer = this.room.getPlayerById(killedBy);

          if (deadPlayer.Role === PlayerRole.Rebel && !killer.Dead) {
            await this.room.drawCards(3, killedBy, 'top', undefined, undefined, CardDrawReason.KillReward);
          } else if (deadPlayer.Role === PlayerRole.Loyalist && killer.Role === PlayerRole.Lord) {
            const lordCards = VirtualCard.getActualCards(killer.getPlayerCards());
            await this.room.moveCards({
              moveReason: CardMoveReason.SelfDrop,
              fromId: killer.Id,
              movingCards: lordCards.map(cardId => ({ card: cardId, fromArea: killer.cardFrom(cardId) })),
              toArea: CardMoveArea.DropStack,
            });
          }
        }
      } else if (stage === PlayerDiedStage.AfterPlayerDied) {
        const bossCharacter = Sanguosha.getCharacterByCharaterName('pve_soldier');
        const bossPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
          changedProperties: [{ toId: deadPlayer.Id, characterId: bossCharacter.Id, hp: 3, revive: true }],
        };

        // this.room.changePlayerProperties(bossPropertiesChangeEvent);
      }
    });

    if (!this.room.isGameOver() && this.room.CurrentPhasePlayer.Id === event.playerId) {
      await this.room.skip(event.playerId);
    }
  }
}
