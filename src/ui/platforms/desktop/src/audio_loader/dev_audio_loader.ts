import { CharacterGender } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { CharacterSkinInfo } from 'skins/skins';
import { AudioLoader } from './audio_loader';

const baseHost: string = '/cdn';
const cosRepo: string = 'https://sgs-static-1256205614.cos.ap-nanjing.myqcloud.com/backup_remote';

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
    return `${cosRepo}/audios/` + (damage === 1 ? 'damage' : 'damage2') + '.mp3';
  }
  getLoseHpAudio(): string {
    return `${cosRepo}/audios/loseHp.mp3`;
  }
  getEquipAudio(): string {
    return `${cosRepo}/audios/equip.mp3`;
  }
  getChainAudio(): string {
    return `${cosRepo}/audios/chain.mp3`;
  }
  async getQuickChatAudio(index: number, gender: CharacterGender): Promise<string> {
    return `${cosRepo}/audios/quickChats/${gender === CharacterGender.Female ? 'female' : 'male'}/${index}.mp3`;
  }
  async getSkillAudio(
    skillName: string,
    gender: CharacterGender,
    characterName?: string,
    audioIndex?: number,
  ): Promise<string> {
    const skill = Sanguosha.getSkillBySkillName(skillName);

    if (!audioIndex) {
      audioIndex = Math.round(Math.random() * (skill.audioIndex(characterName) - 1)) + 1;
    }

    if (characterName) {
      characterName = skill.RelatedCharacters.includes(characterName) ? '.' + characterName : '';
    }

    return `${baseHost}/audios/characters/${skillName}${characterName ? characterName : ''}${audioIndex}.mp3`;
  }
  async getCardAudio(cardName: string, gender: CharacterGender, characterName?: string) {
    return `${baseHost}/audios/cards/${gender === CharacterGender.Female ? 'female' : 'male'}/${cardName}.ogg`;
  }
  async getDeathAudio(characterName: string): Promise<string> {
    return `${baseHost}/audios/characters/${characterName}.mp3`;
  }

  async getCharacterSkinAudio(
    characterName: string,
    skinName: string,
    skillName: string,
    audioIndex?: number,
    skinData?: CharacterSkinInfo[],
    gender?: CharacterGender,
  ): Promise<string> {
    let voice: string;
    if (skillName === 'death') {
      voice = await this.getDeathAudio(characterName);
    } else {
      voice = await this.getSkillAudio(skillName, gender!, characterName, audioIndex);
    }

    return voice;
  }
}
