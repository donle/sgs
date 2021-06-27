import { CharacterGender } from 'core/characters/character';
import { AudioLoader } from './audio_loader';
import { CharacterSkinInfo } from 'skins/skins';

const remoteRoot: string = 'http://doublebit.gitee.io/pictest/backup_remote';

export class DevAudioLoader implements AudioLoader {
  getLobbyBackgroundMusic() {
    return 'https://web.sanguosha.com/10/pc/res/assets/runtime/voice/bgm/outbgm_2.mp3';
  }
  getRoomBackgroundMusic() {
    return 'https://aod.cos.tx.xmcdn.com/group24/M02/CF/E6/wKgJMFi6G1bgZDjzAB9BygnpYEI443.m4a';
  }
  getGameStartAudio() {
    return 'http://doublebit.gitee.io/pictest/audio/common/gamestart.ogg';
  }
  getDamageAudio(damage: number) {
    return `${remoteRoot}/audios/` + (damage === 1 ? 'damage' : 'damage2') + '.mp3';
  }
  getLoseHpAudio(): string {
    return `${remoteRoot}/audios/loseHp.mp3`;
  }
  getEquipAudio(): string {
    return `${remoteRoot}/audios/equip.mp3`;
  }
  getChainAudio(): string {
    return `${remoteRoot}/audios/chain.mp3`;
  }
  async getSkillAudio(skillName: string, gender: CharacterGender, characterName?: string) {
    const randomIndex = Math.round(Math.random() * 1) + 1;
    return `${remoteRoot}/audios/characters/${skillName}${randomIndex}.mp3`;
  }
  async getCardAudio(cardName: string, gender: CharacterGender, characterName?: string) {
    return `${remoteRoot}/audios/cards/${gender === CharacterGender.Female ? 'female' : 'male'}/${cardName}.ogg`;
  }
  async getDeathAudio(characterName: string): Promise<string> {
    return `${remoteRoot}/audios/characters/${characterName}.mp3`;
  }

  async getCharacterSkinAudio(
    characterName: string,
    skinName: string,
    skillName: string,
    skinData: CharacterSkinInfo[],
    gender?: CharacterGender,
  ): Promise<string> {
    let voice: string;
    if (skillName === 'death') {
      voice = await this.getDeathAudio(characterName);
    } else {
      voice = await this.getSkillAudio(skillName, gender!, characterName);
    }

    return voice;
  }
}
