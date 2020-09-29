import { CharacterGender } from 'core/characters/character';
import lobbyBGM from './audios/bgm/lobby.mp3';
import roomBGM from './audios/bgm/room.mp3';
import damageAudio from './audios/damage.mp3';
import seriousDamageAudio from './audios/damage2.mp3';
import lostHpAudio from './audios/loseHp.mp3';
import recoverAudio from './audios/recover.mp3';
import { AudioLoader } from './audio_loader';

export class ProdAudioLoader implements AudioLoader {
  getLobbyBackgroundMusic() {
    return lobbyBGM;
  }

  getRoomBackgroundMusic() {
    return roomBGM;
  }

  getDamageAudio(damage: number) {
    return damage === 1 ? damageAudio : seriousDamageAudio;
  }
  getLoseHpAudio(): string {
    return lostHpAudio;
  }
  getRecoverAudio(): string {
    return recoverAudio;
  }

  async getCardAudio(cardName: string, gender: CharacterGender, characterName?: string): Promise<string> {
    return (await import(`./audios/cards/${gender === CharacterGender.Female ? 'female' : 'male'}/${cardName}.ogg`))
      .default;
  }

  async getSkillAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<string> {
    const randomIndex = Math.round(Math.random() * 1) + 1;
    return (await import(`./audios/characters/${skillName}${randomIndex}.mp3`)).default;
  }

  async getDeathAudio(characterName: string): Promise<string> {
    return (await import(`./audios/characters/${characterName}.mp3`)).default;
  }
}
