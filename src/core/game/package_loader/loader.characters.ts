import { Character } from 'core/characters/character';
import { FireCharacterPackage } from 'core/characters/fire';
import { ForestCharacterPackage } from 'core/characters/forest';
import { GodCharacterPackage } from 'core/characters/god';
import { MountainCharacterPackage } from 'core/characters/mountain';
import { StandardCharacterPackage } from 'core/characters/standard';
import { WindCharacterPackage } from 'core/characters/wind';
import { YiJiang2011Package } from 'core/characters/yijiang2011';
import { YiJiang2012Package } from 'core/characters/yijiang2012';
import { GameCharacterExtensions } from 'core/game/game_props';

export type CharacterPackages = {
  [K in GameCharacterExtensions]: Character[];
};
export type CharacterPackage<Extension extends GameCharacterExtensions> = {
  [K in Extension]: Character[];
};
export type CharacterPackageLoader = (index: number) => Character[];

const allCharacterLoaders: {
  [P in GameCharacterExtensions]: CharacterPackageLoader;
} = {
  [GameCharacterExtensions.Standard]: StandardCharacterPackage,
  [GameCharacterExtensions.Wind]: WindCharacterPackage,
  [GameCharacterExtensions.Fire]: FireCharacterPackage,
  [GameCharacterExtensions.Forest]: ForestCharacterPackage,
  [GameCharacterExtensions.Mountain]: MountainCharacterPackage,
  [GameCharacterExtensions.God]: GodCharacterPackage,
  [GameCharacterExtensions.YiJiang2011]: YiJiang2011Package,
  [GameCharacterExtensions.YiJiang2012]: YiJiang2012Package,
};

export class CharacterLoader {
  private static instance: CharacterLoader;
  private characters: CharacterPackages = {} as any;

  private constructor() {
    this.loadCharacters();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CharacterLoader();
    }

    return this.instance;
  }

  private loadCharacters() {
    let index = 0;
    for (const [packageName, loader] of Object.entries(allCharacterLoaders)) {
      const characters = loader(index);
      this.characters[packageName] = characters;

      index += characters.length;
    }
  }

  public getAllCharacters() {
    return Object.values(this.characters).reduce<Character[]>(
      (addedCards, characters) => addedCards.concat(characters),
      [],
    );
  }

  public getPackages(...extensions: GameCharacterExtensions[]): Character[] {
    return extensions.reduce<Character[]>((addedCards, extension) => addedCards.concat(this.characters[extension]), []);
  }
}
