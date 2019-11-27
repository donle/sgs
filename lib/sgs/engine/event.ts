import { Card } from 'cards/card';
import { Player } from 'sgs/player';

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
  from?: Player;
  cards?: Card[];
  to: Player;
};
