import { CharacterGender } from 'core/characters/character';

export interface AudioLoader {
  getRoomBackgroundMusic(): string;
  getLobbyBackgroundMusic(): string;
  getGameStartAudio(): string;
  getCardAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<string>;
  getSkillAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<string>;
  getDeathAudio(characterName: string): Promise<string>;
  getDamageAudio(damage: number): string;
  getLoseHpAudio(): string;
  getEquipAudio(): string;
  getChainAudio(): string;
  getCharacterSkinAudio(
    characterName: string,
    skinName: string,
    skillName: string,
    gender?: CharacterGender,
  ): Promise<string>;
}
