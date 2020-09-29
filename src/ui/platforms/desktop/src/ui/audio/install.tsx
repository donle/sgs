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
  playRecoverAudio(): void;
  playRoomBGM(): void;
  playLobbyBGM(): void;
  stop(): void;
}

class AudioPlayerService implements AudioService {
  constructor(private loader: AudioLoader) {}
  async playSkillAudio(skillName: string, gender: CharacterGender, characterName?: string) {
    const audioUrl = await this.loader.getSkillAudio(skillName, gender, characterName);
    this.play(audioUrl);
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
  playRecoverAudio() {
    this.play(this.loader.getRecoverAudio());
  }

  playRoomBGM() {
    const audioUrl = this.loader.getRoomBackgroundMusic();
    this.play(audioUrl, true);
  }
  playLobbyBGM() {
    const audioUrl = this.loader.getLobbyBackgroundMusic();
    this.play(audioUrl, true);
  }

  private play(url: string, loop?: boolean) {
    const container = document.createElement('div');
    container.setAttribute('name', 'audioPlayer');
    document.getElementById('root')?.append(container);
    const onEnd = () => {
      container.remove();
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
