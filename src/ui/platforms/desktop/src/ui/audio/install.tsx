import { AudioLoader } from 'audio_loader/audio_loader';
import { CharacterGender } from 'core/characters/character';
import { ElectronLoader } from 'electron_loader/electron_loader';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { AudioPlayer } from './audio';
import { CharacterSkinInfo } from 'skins/skins';

export interface AudioService {
  playSkillAudio(
    skillName: string,
    gender: CharacterGender,
    skinData: CharacterSkinInfo[],
    characterName?: string,
    skinName?: string,
  ): Promise<void>;
  playCardAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<void>;
  playDeathAudio(characterName: string, skinDara: CharacterSkinInfo[], skinName?: string): Promise<void>;
  playDamageAudio(damage: number): void;
  playLoseHpAudio(): void;
  playEquipAudio(): void;
  playChainAudio(): void;
  playRoomBGM(): void;
  playLobbyBGM(): void;
  playGameStartAudio(): void;
  stop(): void;
}

class AudioPlayerService implements AudioService {
  public playList: Set<string> = new Set<string>();
  public badResourcesList: Set<string> = new Set<string>();

  private readonly nodeNameOfLobbyBGM = 'lobby-bgm';
  private readonly nodeNameOfRoomBGM = 'room-bgm';

  constructor(private loader: AudioLoader, private electronLoader: ElectronLoader) {}
  async playSkillAudio(
    skillName: string,
    gender: CharacterGender,
    skinData: CharacterSkinInfo[],
    characterName?: string,
    skinName?: string,
  ) {
    if (this.playList.has(skillName) || this.badResourcesList.has(skillName)) {
      return;
    }
    try {
      if (skinName) {
        const audioUrl = await this.loader.getCharacterSkinAudio(characterName!, skinName, skillName, skinData, gender);
        this.play(audioUrl, undefined, skillName);
      } else {
        const audioUrl = await this.loader.getSkillAudio(skillName, gender, characterName);
        this.play(audioUrl, undefined, skillName);
      }
    } catch {
      // tslint:disable-next-line: no-console
      console.warn(`The resource of '${skillName}' doesn't exist`);
      this.badResourcesList.add(skillName);
    }
  }

  async playCardAudio(cardName: string, gender: CharacterGender, characterName?: string) {
    try {
      const audioUrl = await this.loader.getCardAudio(cardName, gender, characterName);
      this.play(audioUrl);
    } catch {
      // tslint:disable-next-line: no-console
      console.warn(`The resource of '${cardName}' doesn't exist`);
    }
  }

  async playDeathAudio(characterName: string, skinData: CharacterSkinInfo[], skinName?: string) {
    try {
      if (skinName) {
        const audioUrl = await this.loader.getCharacterSkinAudio(characterName, skinName, 'death', skinData, undefined);
        this.play(audioUrl);
      } else {
        const audioUrl = await this.loader.getDeathAudio(characterName);
        this.play(audioUrl);
      }
    } catch {
      // tslint:disable-next-line: no-console
      console.warn(`The resource of '${characterName}' doesn't exist`);
    }
  }

  playDamageAudio(damage: number) {
    const audioUrl = this.loader.getDamageAudio(damage);
    this.play(audioUrl);
  }
  playLoseHpAudio() {
    this.play(this.loader.getLoseHpAudio());
  }
  playEquipAudio() {
    this.play(this.loader.getEquipAudio());
  }
  playChainAudio() {
    const chainAudioIdentifier = 'chainAudioIdentifier';
    if (this.playList.has(chainAudioIdentifier)) {
      return;
    }
    this.play(this.loader.getChainAudio(), undefined, chainAudioIdentifier);
  }

  playRoomBGM() {
    const audioUrl = this.loader.getRoomBackgroundMusic();
    this.play(audioUrl, true, this.nodeNameOfRoomBGM, 'bgm');
  }
  playLobbyBGM() {
    const audioUrl = this.loader.getLobbyBackgroundMusic();
    this.play(audioUrl, true, this.nodeNameOfLobbyBGM, 'bgm');
  }
  playGameStartAudio() {
    this.play(this.loader.getGameStartAudio());
  }

  isPlayingLobbyBGM() {
    return this.playList.has(this.nodeNameOfLobbyBGM);
  }
  isPlayingRoomBGM() {
    return this.playList.has(this.nodeNameOfRoomBGM);
  }

  private play(url: string, loop?: boolean, nodeName?: string, type: 'bgm' | 'game' = 'game') {
    const container = document.createElement('div');
    container.setAttribute('name', 'audioPlayer');
    document.getElementById('root')?.append(container);
    nodeName && this.playList.add(nodeName);
    const onEnd = () => {
      container.remove();
      nodeName && this.playList.delete(nodeName);
    };

    const volumeString: string = this.electronLoader.getData(type === 'bgm' ? 'mainVolume' : 'gameVolume');
    const volume = volumeString ? parseInt(volumeString, 10) : undefined;
    const player = <AudioPlayer defaultVolume={volume} type={type} url={url} loop={loop} onEnd={onEnd} />;
    ReactDOM.render(player, container);
  }

  public stop() {
    const elements = document.getElementsByName('audioPlayer');
    for (const el of elements) {
      el.remove();
    }
    this.playList.clear();
  }

  public changeBGMVolume() {
    const volumeString: string = this.electronLoader.getData('mainVolume');
    if (!volumeString) {
      return;
    }

    const volume = parseInt(volumeString, 10);
    const elements = document.getElementsByTagName('audio');
    for (const element of elements) {
      if (element.getAttribute('type') === 'bgm') {
        const fixedVolume = volume / 100;
        if (fixedVolume <= 0.01) {
          element.volume = 0;
        } else {
          element.volume = fixedVolume;
        }
      }
    }
  }

  public changeGameVolume() {
    const volumeString: string = this.electronLoader.getData('gameVolume');
    if (!volumeString) {
      return;
    }

    const volume = parseInt(volumeString, 10);
    const elements = document.getElementsByTagName('audio');
    for (const element of elements) {
      if (element.getAttribute('type') === 'game') {
        const fixedVolume = volume / 100;
        if (fixedVolume <= 0.01) {
          element.volume = 0;
        } else {
          element.volume = fixedVolume;
        }
      }
    }
  }
}

let serviceInstance: AudioPlayerService | undefined;

export function installAudioPlayerService(audioLoader: AudioLoader, electronLoader: ElectronLoader) {
  if (serviceInstance === undefined) {
    serviceInstance = new AudioPlayerService(audioLoader, electronLoader);
  }
  return serviceInstance;
}
