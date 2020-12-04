import { Player } from 'core/player/player';
import { PlayerRole } from 'core/player/player_props';
import { GameMode } from 'core/shares/types/room_props';

export function getRoles(players: number, gameMode: GameMode) {
  switch (gameMode) {
    case GameMode.OneVersusTwo:
      return [PlayerRole.Lord, PlayerRole.Rebel, PlayerRole.Rebel];
    case GameMode.Standard:
    default:
      return getStandardGameModeRoles(players);
  }
}

function getStandardGameModeRoles(totalPlayers: number): PlayerRole[] {
  switch (totalPlayers) {
    case 2:
      return [PlayerRole.Lord, PlayerRole.Rebel];
    case 3:
      return [PlayerRole.Lord, PlayerRole.Rebel, PlayerRole.Renegade];
    case 4:
      return [PlayerRole.Lord, PlayerRole.Rebel, PlayerRole.Loyalist, PlayerRole.Renegade];
    case 5:
      return [PlayerRole.Lord, PlayerRole.Rebel, PlayerRole.Rebel, PlayerRole.Loyalist, PlayerRole.Renegade];
    case 6:
      return [
        PlayerRole.Lord,
        PlayerRole.Rebel,
        PlayerRole.Rebel,
        PlayerRole.Rebel,
        PlayerRole.Loyalist,
        PlayerRole.Renegade,
      ];
    case 7:
      return [
        PlayerRole.Lord,
        PlayerRole.Rebel,
        PlayerRole.Rebel,
        PlayerRole.Rebel,
        PlayerRole.Loyalist,
        PlayerRole.Loyalist,
        PlayerRole.Renegade,
      ];
    case 8:
      return [
        PlayerRole.Lord,
        PlayerRole.Rebel,
        PlayerRole.Rebel,
        PlayerRole.Rebel,
        PlayerRole.Rebel,
        PlayerRole.Loyalist,
        PlayerRole.Loyalist,
        PlayerRole.Renegade,
      ];
    default:
      throw new Error('Unable to create roles with invalid number of players');
  }
}

export function getWinners(players: Player[], gameMode: GameMode) {
  switch (gameMode) {
    case GameMode.OneVersusTwo:
      return getOneVersusTwoGameWinners(players);
    case GameMode.Standard:
    default:
      return getStandardGameWinners(players);
  }
}

function getOneVersusTwoGameWinners(players: Player[]) {
  const rebels = players.filter(player => player.Role === PlayerRole.Rebel);
  const lord = players.find(player => player.Role === PlayerRole.Lord)!;

  if (lord.Dead) {
    return rebels;
  } else if (rebels.every(rebel => rebel.Dead)) {
    return [lord];
  }
}

function getStandardGameWinners(players: Player[]) {
  const rebellion: Player[] = [];
  let renegade: Player | undefined;
  const loyalist: Player[] = [];
  let lordDied = false;

  for (const player of players) {
    if (player.Dead) {
      if (player.Role === PlayerRole.Lord) {
        lordDied = true;
      }
      continue;
    }

    switch (player.Role) {
      case PlayerRole.Lord:
      case PlayerRole.Loyalist:
        loyalist.push(player);
        break;
      case PlayerRole.Rebel:
        rebellion.push(player);
        break;
      case PlayerRole.Renegade:
        renegade = player;
        break;
      default:
    }
  }

  if (lordDied) {
    if (rebellion.length > 0) {
      return players.filter(player => player.Role === PlayerRole.Rebel);
    } else if (renegade) {
      return [renegade];
    }
  } else if (renegade === undefined && rebellion.length === 0) {
    return players.filter(player => player.Role === PlayerRole.Lord || player.Role === PlayerRole.Loyalist);
  }
}
