import { PlayerAI } from 'core/ai/ai';
import { SmartAI } from 'core/ai/smart_ai';
import { TrustAI } from 'core/ai/trust_ai';
import { CharacterId, HegemonyCharacter } from 'core/characters/character';
import { HegemonyPlayer, Player } from 'core/player/player';
import { GameMode } from 'core/shares/types/room_props';
import { PlayerCards, PlayerCardsArea, PlayerCardsOutside, PlayerId, PlayerStatus } from './player_props';

export class ServerPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
    ai: PlayerAI = TrustAI.Instance,
  ) {
    super(playerCards, playerCharacterId, ai);
  }

  protected status = PlayerStatus.Online;
}

export class SmartPlayer extends ServerPlayer {
  constructor(protected playerPosition: number, gameMode: GameMode) {
    super(`SmartAI-${playerPosition}:${Date.now()}`, 'AI', playerPosition, undefined, undefined, SmartAI.Instance);
    this.delegateOnSmartAI();
  }
}

export class HegemonyServerPlayer extends HegemonyPlayer {
  protected playerSecondaryCharacter: HegemonyCharacter | undefined;
  protected playerSecondaryCharacterId: CharacterId | undefined;

  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
    ai: PlayerAI = TrustAI.Instance,
  ) {
    super(playerCards, playerCharacterId, ai);
  }

  protected status = PlayerStatus.Online;
}
