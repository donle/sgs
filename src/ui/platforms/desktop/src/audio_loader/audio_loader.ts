import { CharacterGender } from 'core/characters/character';

export interface AudioLoader {
  getRoomBackgroundMusic(): string;
  getLobbyBackgroundMusic(): string;
  getSkillAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<string>;
  getDeathAudio(characterName: string): Promise<string>;
}
