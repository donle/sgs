import { GameCardExtensions } from '../game_props';
import { Card } from 'core/cards/card';
import { SkillsGeneratedCardPackage } from 'core/cards/character_skills';
import { LegionFightCardPackage } from 'core/cards/legion_fight';
import { StandardCardPackage } from 'core/cards/standard';
import { Precondition } from 'core/shares/libs/precondition/precondition';

export type CardPackages = {
  [K in GameCardExtensions]: Card[];
};
export type CardPackageLoader = (index: number) => Card[];

const allPackageLoaders: {
  [P in GameCardExtensions]: CardPackageLoader;
} = {
  [GameCardExtensions.Standard]: StandardCardPackage,
  [GameCardExtensions.LegionFight]: LegionFightCardPackage,
  [GameCardExtensions.CharacterSkills]: SkillsGeneratedCardPackage,
};

export class CardLoader {
  private cards: CardPackages = {} as any;
  private uniquCards: Map<string, Card[]> = new Map();
  private static instance: CardLoader;

  private constructor() {
    this.loadCards();
  }

  private loadCards() {
    let index = 1;

    for (const [packageName, loader] of Object.entries(allPackageLoaders)) {
      const cards = loader(index);
      this.cards[packageName] = [];
      for (const card of cards) {
        if (!card.isUniqueCard()) {
          this.cards[packageName].push(card);
        } else {
          const bySkill = Precondition.exists(card.generatedBySkill(), `unknown unique card generator: ${card.Name}`);
          const cardSet = this.uniquCards.get(bySkill);
          if (cardSet) {
            cardSet.push(card);
          } else {
            this.uniquCards.set(bySkill, [card]);
          }
        }
      }

      index += cards.length;
    }
  }

  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = new CardLoader();
    }

    return this.instance;
  }

  public getAllCards() {
    return Object.values(this.cards).reduce<Card[]>((addedCards, cards) => addedCards.concat(cards), []);
  }

  public getPackages(...extensions: GameCardExtensions[]): Card[] {
    return extensions.reduce<Card[]>((addedCards, extension) => addedCards.concat(this.cards[extension]), []);
  }

  public getUniquCards() {
    return this.uniquCards;
  }
}
