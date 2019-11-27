import { Card } from 'cards/card';
import { Player } from 'sgs/core/player';

export type CardUseEvent = {
  from: Player;
  card: Card;
  to?: Player;
};

export type SkillUseEvent = {
  from: Player;
  cards?: Card[];
  tos?: Player[];
};

export type DamageEvent = {
  attacker?: Player;
  cards?: Card[];
  target: Player;
};

export type PinDianEvent = {
  attacker: Player;
  displayedCardByAttacker: Card;
  target: Player;
  displayedCardByTarget: Card;
};
