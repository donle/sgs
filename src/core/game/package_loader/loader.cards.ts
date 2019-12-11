import { Card } from 'core/cards/card';
import { StandardCardPackage } from 'core/cards/standard';
import { GameCardExtensions } from '../game_props';

export type CardPackages = {
  [K in GameCardExtensions]: Card[];
};

export type CardPackage<Extension extends GameCardExtensions> = {
  [K in Extension]: (new (id: number) => Card)[];
};

const allPackages: CardPackage<GameCardExtensions> = {
  ...StandardCardPackage,
};

export class CardLoader {
  private cards: CardPackages;
  private id: 0;
  private instance: CardLoader;

  private constructor(packages: CardPackage<GameCardExtensions>) {
    this.loadCards(packages);
  }

  private loadCards(packages: CardPackage<GameCardExtensions>) {
    this.cards = {} as any;

    for (const [extension, cardPackage] of Object.entries(packages)) {
      this.cards[extension] = cardPackage.map(card => new card(this.id++));
    }
  }

  public getInstance() {
    if (this.instance === undefined) {
      this.instance = new CardLoader(allPackages);
    }

    return this.instance;
  }

  public getAllCards() {
    return Object.values(this.cards).reduce<Card[]>((addedCards, cards) => addedCards.concat(cards), []);
  }

  public getPackages(...extensions: GameCardExtensions[]): Card[] {
    return extensions.reduce<Card[]>((addedCards, extension) => addedCards.concat(this.cards[extension]), []);
  }
}
