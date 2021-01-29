import * as React from 'react';
import styles from './audio.module.css';

export type AudioPlayerProps = {
  url: string;
  loop?: boolean;
  onEnd?(): void;
  type: 'bgm' | 'game';
  defaultVolume?: number;
};

export const AudioPlayer = (props: AudioPlayerProps) => {
  const [end, onEnds] = React.useState(false);
  const onAudioCreated = (instance: HTMLAudioElement | null) => {
    if (!instance) {
      return;
    }

    if (props.defaultVolume) {
      const fixedVolume = props.defaultVolume / 100;
      if (fixedVolume <= 0.01) {
        instance.volume = 0;
      } else {
        instance.volume = fixedVolume;
      }
    } else {
      instance.volume = 0.5;
    }

    if (!props.loop) {
      instance.addEventListener('ended', (event: Event) => {
        onEnds(true);
        props.onEnd && props.onEnd();
      });
    }
  };

  return end ? (
    <div />
  ) : (
    <audio
      className={styles.audio}
      //@ts-ignore
      type={props.type}
      ref={onAudioCreated}
      src={props.url}
      loop={props.loop}
      autoPlay={true}
    />
  );
};
