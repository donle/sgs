import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CharacterId } from 'core/characters/character';
import { PlayerId, PlayerRole } from 'core/player/player_props';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';

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
  Shadow = 'shadow',
  Thunder = 'thunder',
  // SP,
  // NewStandard,
  God = 'god',
  YiJiang2011 = 'yijiang2011',
  YiJiang2012 = 'yijiang2012',
  YiJiang2013 = 'yijiang2013',
  YiJiang2014 = 'yijiang2014',
  YiJiang2015 = 'yijiang2015',
  SP = 'sp',
  Spark = 'spark',
  Decade = 'decade',
  Limited = 'limited',
  Biographies = 'biographies',
  Mobile = 'mobile',
  Wisdom = 'wisdom',
  Sincerity = 'sincerity',
  Pve = 'pve',
}

export const enum GameCardExtensions {
  Standard = 'standard',
  LegionFight = 'legion_fight',
  CharacterSkills = 'character_skills',
}

export type GameInfo = {
  characterExtensions: GameCharacterExtensions[];
  cardExtensions: GameCardExtensions[];
  numberOfPlayers: number;
  roomName: string;
  passcode?: string;
  multiCharacters?: boolean;
  excludedCharacters: CharacterId[];
  playingTimeLimit?: number;
  wuxiekejiTimeLimit?: number;
  allowObserver?: boolean;
  campaignMode: boolean;
  flavor: Flavor;
  gameMode: GameMode;
  coreVersion: string;
};

export type TemporaryRoomCreationInfo = {
  numberOfPlayers: number;
  roomName: string;
  gameMode: GameMode;
  passcode?: string;
  campaignMode?: boolean;
  multiCharacters?: boolean;
  excludedCharacters: CharacterId[];
  playingTimeLimit?: number;
  wuxiekejiTimeLimit?: number;
  allowObserver?: boolean;
  cardExtensions: GameCardExtensions[];
  characterExtensions: GameCharacterExtensions[];
  coreVersion: string;
  hostPlayerId: PlayerId;
};

export type GameRunningInfo = {
  numberOfDrawStack: number;
  numberOfDropStack: number;
  circle: number;
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

export type WaitingRoomGameSettings = Pick<
  TemporaryRoomCreationInfo,
  Exclude<keyof TemporaryRoomCreationInfo, 'roomName' | 'campaignMode' | 'coreVersion' | 'hostPlayerId'>
> & { pveNumberOfPlayers: number };
