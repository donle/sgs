import { Card } from 'core/cards/card';
import { StandardCardPackage } from 'core/cards/standard';
import { GameCardExtensions } from '../game_props';

export type CardPackages = {
  [K in GameCardExtensions]: Card[];
};
export type CardPackage<Extension extends GameCardExtensions> = {
  [K in Extension]: Card[];
};
export type CardPackageLoader = (index: number) => CardPackage<GameCardExtensions>;

const allPackageLoaders: CardPackageLoader[] = [StandardCardPackage];

export class CardLoader {
  private cards: CardPackages = {} as any;
  private static instance: CardLoader;

  private constructor() {
    this.loadCards();
  }

  private loadCards() {
    let index = 0;

    for (const loader of allPackageLoaders) {
      const packages = loader(index);
      for (const [packageName, cards] of Object.entries(packages) as [GameCardExtensions, Card[]][]) {
        this.cards[packageName] = cards;

        index += cards.length;
      }
    }
  }

  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = new CardLoader();
    }

    return this.instance;
  }

  public getAllCards() {
    return Object.values(this.cards).reduce<Card[]>(
      (addedCards, cards) => addedCards.concat(cards),
      [],
    );
  }

  public getPackages(...extensions: GameCardExtensions[]): Card[] {
    return extensions.reduce<Card[]>(
      (addedCards, extension) => addedCards.concat(this.cards[extension]),
      [],
    );
  }
}
