import { CharacterGender } from 'core/characters/character';
import lobbyBGM from './audios/bgm/lobby.mp3';
import roomBGM from './audios/bgm/room.mp3';
import { AudioLoader } from './audio_loader';

export class ProdAudioLoader implements AudioLoader {
  getLobbyBackgroundMusic() {
    return lobbyBGM;
  }

  getRoomBackgroundMusic() {
    return roomBGM;
  }

  async getSkillAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<string> {
    const randomIndex = Math.round(Math.random() * 2);
    return await import(`./audios/${skillName}${randomIndex}.mp3`);
  }

  async getDeathAudio(characterName: string): Promise<string> {
    return await import(`./audios/${characterName}.mp3`);
  }
}
