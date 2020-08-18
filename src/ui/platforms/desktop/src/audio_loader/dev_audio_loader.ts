import { CharacterGender } from 'core/characters/character';
import { AudioLoader } from './audio_loader';

export class DevAudioLoader implements AudioLoader {
  getLobbyBackgroundMusic() {
    return 'https://web.sanguosha.com/10/pc/res/assets/runtime/voice/bgm/outbgm_2.mp3';
  }
  getRoomBackgroundMusic() {
    return 'https://aod.cos.tx.xmcdn.com/group24/M02/CF/E6/wKgJMFi6G1bgZDjzAB9BygnpYEI443.m4a';
  }
  async getSkillAudio(skillName: string, gender: CharacterGender, characterName?: string) {
    return `http://doublebit.gitee.io/pictest/audio/${
      gender === CharacterGender.Female ? 'female' : 'male'
    }/${skillName}.ogg`;
  }
}
