import { Skill } from 'skills/skill';

export type CardProps = {
  id: number;
  number: number;
  suit: CardSuit;
  name: string;
  description: string;
  skills: Skill[];
};

export abstract class Card {
  protected number: number;
  protected suit: CardSuit;
  protected name: string;
  protected description: string;
  protected skills: Skill[];

  protected constructor(props: CardProps) {
    for (const [key, value] of Object.entries(props)) {
      this[key] = value;
    }
  }
}

export const enum CardSuit {
  NoSuit,
  Spade,
  Heart,
  Club,
  Diamond,
}
