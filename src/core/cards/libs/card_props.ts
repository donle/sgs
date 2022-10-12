import { PlayerCardsArea } from 'core/player/player_props';

export const enum CardSuit {
  NoSuit,
  Spade,
  Heart,
  Club,
  Diamond,
}

export const enum CardColor {
  Red,
  Black,
  None,
}

export type CardId = RealCardId | VirtualCardId;
export type RealCardId = number;
export type VirtualCardId = string;

export type CardChoosingOptions = {
  [K in string | PlayerCardsArea]?: number | CardId[];
};

export type VirtualCardIdProps = {
  cardNumber: number;
  cardSuit: CardSuit;
  name: string;
  skillName?: string;
  bySkill: string;
  containedCardIds: CardId[];
  hideActualCard?: boolean;
};

export const enum CardTargetEnum {
  None,
  Single,
  Multiple,
  Others,
  Globe,
}

export enum DamageCardEnum {
  Slash = 'slash',
  Duel = 'duel',
  FireAttack = 'fire_attack',
  NanManRuQin = 'nanmanruqin',
  WanJianQiFa = 'wanjianqifa',
}

// equip priority is [80, 100]
export type CardValue = {
  value: number;
  wane: number;
  priority: number;
};
