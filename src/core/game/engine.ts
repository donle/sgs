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
    hiddenSkills: Skill[] = [],
  ) {
    Sanguosha.cards = cards;
    Sanguosha.characters = characters;

    Sanguosha.skills = hiddenSkills;
    for (const character of Sanguosha.characters) {
      Sanguosha.skills = Sanguosha.skills.concat(character.Skills);
    }
  }

  public static getCharacterById(characterId: CharacterId) {
    return Sanguosha.characters.find(character => character.Id === characterId);
  }

  public static getCardById<T extends Card>(cardId: CardId): T | undefined {
    return Sanguosha.cards.find(card => card.Id === cardId) as T | undefined;
  }

  public static getCardByName<T extends Card>(cardName: string): T | undefined {
    return Sanguosha.cards.find(card => card.Name === cardName) as T | undefined;
  }

  public static getSkillBySkillName<T extends Skill = Skill>(name: string): T | undefined {
    return Sanguosha.skills.find(skill => skill.Name === name) as T | undefined;
  }

  public static getCharacterByCharaterName(name: string) {
    return Sanguosha.characters.find(character => character.Name === name);
  }
}
