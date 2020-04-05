import { Card, VirtualCard } from 'core/cards/card';
import { CardId, VirtualCardId } from 'core/cards/libs/card_props';
import { Character, CharacterId } from 'core/characters/character';
import { Precondition } from 'core/shares/libs/precondition/precondition';
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
  private static version: string;

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
    Sanguosha.skills = SkillLoader.getInstance().getAllSkills();
    Sanguosha.cards = CardLoader.getInstance().getAllCards();
    Sanguosha.characters = CharacterLoader.getInstance().getAllCharacters();
    Sanguosha.parseCoreVersion();
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

    const character = Sanguosha.characters.find(character => character.Id === characterId);
    return Precondition.exists(character, `Unable to find character by id: ${characterId}`);
  }

  public static getVirtualCardById<T extends Card>(cardId: VirtualCardId): VirtualCard<T> {
    return VirtualCard.parseId(cardId) as VirtualCard<T>;
  }
  public static getCardById<T extends Card>(cardId: CardId): T {
    this.tryToThrowUninitializedError();

    if (typeof cardId === 'string') {
      return this.getVirtualCardById<T>(cardId) as any;
    }

    const card = Sanguosha.cards.find(card => card.Id === cardId) as T | undefined;
    return Precondition.exists(card, `Unable to find the card by id: ${cardId}`);
  }

  public static getCardByName<T extends Card>(cardName: string): T {
    this.tryToThrowUninitializedError();

    const card = Sanguosha.cards.find(card => card.GeneralName === cardName) as T | undefined;
    return Precondition.exists(card, `Unable to find the card by name: ${cardName}`);
  }

  public static getSkillBySkillName<T extends Skill = Skill>(name: string): T {
    this.tryToThrowUninitializedError();

    const skill = Sanguosha.skills.find(skill => skill.Name === name) as T | undefined;
    return Precondition.exists(skill, `Unable to find the skill by name: ${name}`);
  }
  public static getShadowSkillBySkillName<T extends Skill = Skill>(name: string): T {
    this.tryToThrowUninitializedError();

    const skill = Sanguosha.skills.find(skill => skill.Name === `#${name}`) as T | undefined;
    return Precondition.exists(skill, `Unable to find the shadow skill by name: ${name}`);
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
  ) {
    const characterIndex: number[] = [];
    const availableCharacters = charactersPool.filter(character => !except.includes(character.Id));
    for (let i = 0; i < availableCharacters.length; i++) {
      characterIndex.push(i);
    }

    const selectedCharacterIndex: number[] = [];
    while (numberOfCharacters > 0) {
      selectedCharacterIndex.push(characterIndex.splice(Math.floor(Math.random() * numberOfCharacters), 1)[0]);

      numberOfCharacters--;
    }

    return selectedCharacterIndex.map(index => availableCharacters[index]);
  }

  public static getLordCharacters(packages: GameCharacterExtensions[]) {
    return this.characters.filter(character => character.isLord() && packages.includes(character.Package));
  }

  public static isVirtualCardId(cardId: CardId) {
    return typeof cardId === 'string';
  }

  public static get Version() {
    return Sanguosha.version;
  }
}
