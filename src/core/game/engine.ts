import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, VirtualCardId } from 'core/cards/libs/card_props';
import { Character, CharacterId, CharacterNationality } from 'core/characters/character';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Skill, TransformSkill } from 'core/skills/skill';
import { GameCardExtensions, GameCharacterExtensions } from './game_props';
import { CardLoader } from './package_loader/loader.cards';
import { CharacterLoader } from './package_loader/loader.characters';
import { SkillLoader } from './package_loader/loader.skills';
import { coreVersion } from './version';

export class Sanguosha {
  private static skills: {
    [name: string]: Skill;
  } = {};
  private static cards: Card[];
  private static characters: Character[];
  private static version: string;
  private static transformSkills: string[] = [];
  private static cardCategories: {
    [K: string]: CardType[];
  } = {} as any;

  private static parseCoreVersion() {
    Sanguosha.version = coreVersion;
    const [major, ,] = coreVersion.split('.');
    if (major === '0') {
      Sanguosha.version += ' Alpha';
    }
  }

  private static tryToThrowUninitializedError() {
    Precondition.assert(!!Sanguosha.skills && !!Sanguosha.cards && !!Sanguosha.characters, 'Uninitialized game engine');
  }

  public static initialize() {
    for (const skill of SkillLoader.getInstance().getAllSkills()) {
      Sanguosha.skills[skill.Name] = skill;
      if (skill instanceof TransformSkill) {
        this.transformSkills.push(skill.Name);
      }
    }

    Sanguosha.cards = CardLoader.getInstance().getAllCards();
    Sanguosha.characters = CharacterLoader.getInstance().getAllCharacters();
    Sanguosha.parseCoreVersion();

    for (const card of this.cards) {
      if (!(card.Name in this.cardCategories)) {
        this.cardCategories[card.Name] = card.Type;
      }
    }
  }

  public static isTransformCardSill(skillName: string) {
    return this.transformSkills.includes(skillName);
  }

  public static getCardTypeByName(cardName: string) {
    return this.cardCategories[cardName];
  }

  public static getCardNameByType(finder: (types: CardType[]) => boolean) {
    const results: string[] = [];
    for (const [cardName, types] of Object.entries(this.cardCategories)) {
      if (finder(types)) {
        results.push(cardName);
      }
    }

    return results;
  }

  public static loadCards(...cards: GameCardExtensions[]) {
    return Sanguosha.cards.filter(card => cards.includes(card.Package));
  }

  public static loadCharacters(disabledCharacters: CharacterId[] = [], ...characters: GameCharacterExtensions[]) {
    return Sanguosha.characters.filter(
      character => characters.includes(character.Package) && !disabledCharacters.includes(character.Id),
    );
  }

  public static getCharacterById(characterId: CharacterId) {
    this.tryToThrowUninitializedError();

    const character = Sanguosha.characters[characterId] as Character;
    return Precondition.exists(character, `Unable to find the card by id: ${characterId}`);
  }

  public static getVirtualCardById<T extends Card>(cardId: VirtualCardId): VirtualCard<T> {
    return VirtualCard.parseId(cardId) as VirtualCard<T>;
  }
  public static getCardById<T extends Card>(cardId: CardId): T {
    this.tryToThrowUninitializedError();

    if (typeof cardId === 'string') {
      return this.getVirtualCardById<T>(cardId) as any;
    }

    // const card = Sanguosha.cards.find(card => card.Id === cardId) as T | undefined;
    const card = Sanguosha.cards[cardId - 1] as T;
    return Precondition.exists(card, `Unable to find the card by id: ${cardId}`);
  }

  public static getCardsByMatcher(matcher: CardMatcher) {
    return Sanguosha.cards.filter(card => matcher.match(card));
  }

  public static getCardByName<T extends Card>(cardName: string): T {
    this.tryToThrowUninitializedError();

    const card = Sanguosha.cards.find(card => card.Name === cardName) as T | undefined;
    return Precondition.exists(card, `Unable to find the card by name: ${cardName}`);
  }

  public static getSkillBySkillName<T extends Skill = Skill>(name: string): T {
    this.tryToThrowUninitializedError();

    const skill = Sanguosha.skills[name] as T | undefined;
    return Precondition.exists(skill, `Unable to find the skill by name: ${name}`);
  }
  public static getShadowSkillsBySkillName<T extends Skill = Skill>(name: string): T[] {
    this.tryToThrowUninitializedError();

    const shadowSkills: T[] = [];
    for (const [skillName, skill] of Object.entries(Sanguosha.skills)) {
      if (skillName.match(new RegExp(`#+${name}`))) {
        shadowSkills.push(skill as T);
      }
    }
    return shadowSkills;
  }

  public static isShadowSkillName(name: string): boolean {
    this.tryToThrowUninitializedError();
    return name.startsWith('#');
  }

  public static getCharacterByCharaterName(name: string) {
    this.tryToThrowUninitializedError();

    const character = Sanguosha.characters.find(character => character.Name === name);
    return Precondition.exists(character, `Unable to find character by name: ${name}`);
  }

  public static getRandomCharacters(
    numberOfCharacters: number,
    charactersPool: Character[] = this.characters,
    except: CharacterId[],
    filter?: (characer: Character) => boolean,
  ): Character[] {
    const characterIndex: number[] = [];
    const availableCharacters = charactersPool.filter(
      character => !except.includes(character.Id) && (filter ? filter(character) : true),
    );
    for (let i = 0; i < availableCharacters.length; i++) {
      characterIndex.push(i);
    }

    const selectedCharacterIndex: number[] = [];
    while (numberOfCharacters > 0) {
      selectedCharacterIndex.push(characterIndex.splice(Math.floor(Math.random() * characterIndex.length), 1)[0]);

      numberOfCharacters--;
    }
    return selectedCharacterIndex.map(index => availableCharacters[index]);
  }

  public static getAllCharacters(except: CharacterId[] = []) {
    return this.characters.filter(character => !except.includes(character.Id));
  }

  public static getLordCharacters(packages: GameCharacterExtensions[]) {
    return this.characters.filter(character => character.isLord() && packages.includes(character.Package));
  }

  public static isVirtualCardId(cardId: CardId) {
    return typeof cardId === 'string';
  }

  public static getGameCharacterExtensions() {
    return [
      GameCharacterExtensions.Standard,
      GameCharacterExtensions.Wind,
      GameCharacterExtensions.Fire,
      GameCharacterExtensions.Forest,
      GameCharacterExtensions.Mountain,
      GameCharacterExtensions.God,
      GameCharacterExtensions.YiJiang2011,
      GameCharacterExtensions.YiJiang2012,
    ];
  }

  public static getNationalitiesList() {
    return [
      CharacterNationality.Wei,
      CharacterNationality.Shu,
      CharacterNationality.Wu,
      CharacterNationality.Qun,
      CharacterNationality.God,
    ];
  }

  public static get Version() {
    return Sanguosha.version;
  }
  public static get PlainVersion() {
    return coreVersion;
  }
}
