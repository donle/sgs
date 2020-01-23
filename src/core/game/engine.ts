import { Card, CardId } from 'core/cards/card';
import { Character, CharacterId } from 'core/characters/character';
import { Skill } from 'core/skills/skill';

export class Sanguosha {
  private static skills: Skill[];
  private static cards: Card[];
  private static characters: Character[];

  public static load(
    cards: Card[],
    characters: Character[],
    invisibleSkills: Skill[] = [],
  ) {
    Sanguosha.cards = cards;
    Sanguosha.characters = characters;

    Sanguosha.skills = invisibleSkills;
    for (const character of Sanguosha.characters) {
      Sanguosha.skills = Sanguosha.skills.concat(character.Skills);
    }
  }

  public static getCharacterById(characterId: CharacterId) {
    const character = Sanguosha.characters.find(character => character.Id === characterId);
    if (!character) {
      throw new Error(`Unable to find character by id: ${characterId}`);
    }

    return character;
  }

  public static getCardById<T extends Card>(cardId: CardId): T {
    const card = Sanguosha.cards.find(card => card.Id === cardId) as T | undefined;
    if (!card) {
      throw new Error(`Unable to find the card by id: ${cardId}`);
    }
    return card;
  }

  public static getCardByName<T extends Card>(cardName: string): T {
    const card = Sanguosha.cards.find(card => card.Name === cardName) as T | undefined;
    if (!card) {
      throw new Error(`Unable to find the card by name: ${cardName}`);
    }
    return card;
  }

  public static getSkillBySkillName<T extends Skill = Skill>(name: string): T {
    const skill = Sanguosha.skills.find(skill => skill.Name === name) as T | undefined;
    if (!skill) {
      throw new Error(`Unable to find the skill by name: ${name}`);
    }
    return skill;
  }

  public static getCharacterByCharaterName(name: string) {
    const character = Sanguosha.characters.find(character => character.Name === name);
    if (!character) {
      throw new Error(`Unable to find character by name: ${name}`);
    }

    return character;
  }
}
