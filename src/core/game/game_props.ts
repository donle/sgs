import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { PlayerId, PlayerRole } from 'core/player/player_props';
import { Flavor } from 'core/shares/types/host_config';

export const INFINITE_TRIGGERING_TIMES = 1000;
export const NONE_TRIGGERING_TIMES = -9999;
export const INFINITE_DISTANCE = 1000;
export const INFINITE_ATTACK_RANGE = 1000;

export const enum GameCharacterExtensions {
  Standard = 'standard',
  Wind = 'wind',
  Fire = 'fire',
  Forest = 'forest',
  Mountain = 'mountain',
  // SP,
  // NewStandard,
  God = 'god',
  YiJiang2011 = 'yijiang2011',
  YiJiang2012 = 'yijiang2012',
}

export const enum GameCardExtensions {
  Standard = 'standard',
  LegionFight = 'legion_fight',
}

export type GameInfo = {
  characterExtensions: GameCharacterExtensions[];
  cardExtensions: GameCardExtensions[];
  numberOfPlayers: number;
  roomName: string;
  multiCharacters?: boolean;
  flavor: Flavor;
};

export type GameRunningInfo = {
  numberOfDrawStack: number;
  numberOfDropStack: number;
  round: number;
  currentPlayerId: PlayerId;
};

export const enum DamageType {
  Normal = 'normal_property',
  Fire = 'fire_property',
  Thunder = 'thunder_property',
}

export type FinalPlayersData = {
  playerName: string;
  playerCharacterName: string;
  playerRole: PlayerRole;
  playerDead: boolean;
}[];

export type GameCommonRuleObject = {
  cards: {
    cardMatcher: CardMatcherSocketPassenger;
    additionalTargets: number;
    additionalUsableTimes: number;
    additionalUsableDistance: number;
  }[];
  additionalOffenseDistance: number;
  additionalDefenseDistance: number;
  additionalHold: number;
  additionalAttackDistance: number;
};

export function getRoles(totalPlayers: number): PlayerRole[] {
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
