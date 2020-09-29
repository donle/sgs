import * as React from 'react';
import styles from './audio.module.css';

export type AudioPlayerProps = {
  url: string;
  loop?: boolean;
  onEnd?(): void;
};

export const AudioPlayer = (props: AudioPlayerProps) => {
  const [end, onEnds] = React.useState(false);
  const onAudioCreated = (instance: HTMLAudioElement | null) => {
    if (!instance || props.loop) {
      return;
    }

    instance.addEventListener('ended', (event: Event) => {
      onEnds(true);
      props.onEnd && props.onEnd();
    });
  };

  return end ? (
    <div />
  ) : (
    <audio className={styles.audio} ref={onAudioCreated} src={props.url} loop={props.loop} autoPlay={true} />
  );
};
