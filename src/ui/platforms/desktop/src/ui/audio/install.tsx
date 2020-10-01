import { AudioLoader } from 'audio_loader/audio_loader';
import { CharacterGender } from 'core/characters/character';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { AudioPlayer } from './audio';

export interface AudioService {
  playSkillAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<void>;
  playCardAudio(skillName: string, gender: CharacterGender, characterName?: string): Promise<void>;
  playDeathAudio(characterName: string): Promise<void>;
  playDamageAudio(damage: number): void;
  playLoseHpAudio(): void;
  playEquipAudio(): void;
  playRoomBGM(): void;
  playLobbyBGM(): void;
  stop(): void;
}

class AudioPlayerService implements AudioService {
  public playList: Set<string> = new Set<string>();

  constructor(private loader: AudioLoader) {}
  async playSkillAudio(skillName: string, gender: CharacterGender, characterName?: string) {
    if (this.playList.has(skillName)) {
      return;
    }
    const audioUrl = await this.loader.getSkillAudio(skillName, gender, characterName);
    this.play(audioUrl, undefined, skillName);
  }
  async playCardAudio(cardName: string, gender: CharacterGender, characterName?: string) {
    const audioUrl = await this.loader.getCardAudio(cardName, gender, characterName);
    this.play(audioUrl);
  }

  async playDeathAudio(characterName: string) {
    const audioUrl = await this.loader.getDeathAudio(characterName);
    this.play(audioUrl);
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

  playRoomBGM() {
    const audioUrl = this.loader.getRoomBackgroundMusic();
    this.play(audioUrl, true);
  }
  playLobbyBGM() {
    const audioUrl = this.loader.getLobbyBackgroundMusic();
    this.play(audioUrl, true);
  }

  private play(url: string, loop?: boolean, nodeName?: string) {
    const container = document.createElement('div');
    container.setAttribute('name', 'audioPlayer');
    document.getElementById('root')?.append(container);
    nodeName && this.playList.add(nodeName);
    const onEnd = () => {
      container.remove();
      nodeName && this.playList.delete(nodeName);
    };
    const player = <AudioPlayer url={url} loop={loop} onEnd={onEnd} />;
    ReactDOM.render(player, container);
  }

  public stop() {
    const elements = document.getElementsByName('audioPlayer');
    for (const el of elements) {
      el.remove();
    }
  }
}

let serviceInstance: AudioPlayerService | undefined;

export function installAudioPlayerService(audioLoader: AudioLoader) {
  if (serviceInstance === undefined) {
    serviceInstance = new AudioPlayerService(audioLoader);
  }
  return serviceInstance;
}
