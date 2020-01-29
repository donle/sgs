import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterId } from 'core/characters/character';
import { Skill } from 'core/skills/skill';
import { GameCardExtensions, GameCharacterExtensions } from './game_props';
import { CardLoader } from './package_loader/loader.cards';
import { CharacterLoader } from './package_loader/loader.characters';
import { SkillLoader } from './package_loader/loader.skills';
import { coreVersion } from './version';

export class Sanguosha {
  private static skills: Skill[];
  private static cards: Card[];
  private static characters: Character[];

  private static tryToThrowUninitializedError() {
    if (
      Sanguosha.skills === undefined ||
      Sanguosha.cards === undefined ||
      Sanguosha.characters === undefined
    ) {
      throw new Error('Uninitialized game engine');
    }
  }

  public static initialize() {
    Sanguosha.skills = SkillLoader.getInstance().getAllSkills();
    Sanguosha.cards = CardLoader.getInstance().getAllCards();
    Sanguosha.characters = CharacterLoader.getInstance().getAllCharacters();
  }

  public static loadCards(...cards: GameCardExtensions[]) {
    return Sanguosha.cards.filter(card => cards.includes(card.Package));
  }

  public static loadCharacters(
    disabledCharacters: CharacterId[] = [],
    ...characters: GameCharacterExtensions[]
  ) {
    return Sanguosha.characters.filter(
      character =>
        characters.includes(character.Package) &&
        !disabledCharacters.includes(character.Id),
    );
  }

  public static getCharacterById(characterId: CharacterId) {
    this.tryToThrowUninitializedError();

    const character = Sanguosha.characters.find(
      character => character.Id === characterId,
    );
    if (!character) {
      throw new Error(`Unable to find character by id: ${characterId}`);
    }

    return character;
  }

  public static getCardById<T extends Card>(cardId: CardId): T {
    this.tryToThrowUninitializedError();

    const card = Sanguosha.cards.find(card => card.Id === cardId) as
      | T
      | undefined;
    if (!card) {
      throw new Error(`Unable to find the card by id: ${cardId}`);
    }
    return card;
  }

  public static getCardByName<T extends Card>(cardName: string): T {
    this.tryToThrowUninitializedError();

    const card = Sanguosha.cards.find(card => card.GeneralName === cardName) as
      | T
      | undefined;
    if (!card) {
      throw new Error(`Unable to find the card by name: ${cardName}`);
    }
    return card;
  }

  public static getSkillBySkillName<T extends Skill = Skill>(name: string): T {
    this.tryToThrowUninitializedError();

    const skill = Sanguosha.skills.find(skill => skill.Name === name) as
      | T
      | undefined;
    if (!skill) {
      throw new Error(`Unable to find the skill by name: ${name}`);
    }
    return skill;
  }

  public static getCharacterByCharaterName(name: string) {
    this.tryToThrowUninitializedError();

    const character = Sanguosha.characters.find(
      character => character.Name === name,
    );
    if (!character) {
      throw new Error(`Unable to find character by name: ${name}`);
    }

    return character;
  }

  public static get Version() {
    return coreVersion;
  }
}
