import classNames from 'classnames';
import { PlayerPhase } from 'core/game/stage_processor';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './badge.module.css';

export type BadgeProps = {
  vertical?: boolean;
  className?: string;
  children?: React.ReactNode;
  text?: string;

  translator: ClientTranslationModule;
};

export const Badge = (props: BadgeProps) => {
  const { vertical = false, children, className, text, translator } = props;
  return (
    <div
      className={classNames(styles.badge, className, {
        [styles.vertical]: vertical,
      })}
    >
      {text && <span className={styles.content}>{translator.tr(text)}</span>}
      {children}
    </div>
  );
};

export type NationalityBadgeProps = BadgeProps & {
  variant: 'wei' | 'shu' | 'wu' | 'qun' | 'god';
};

export const NationalityBadge = (props: NationalityBadgeProps) => {
  const { variant, className, ...badgeProps } = props;
  return (
    <Badge
      {...badgeProps}
      text={variant}
      className={classNames(className, {
        [styles.wei]: variant === 'wei',
        [styles.shu]: variant === 'shu',
        [styles.wu]: variant === 'wu',
        [styles.qun]: variant === 'qun',
        [styles.god]: variant === 'god',
      })}
    />
  );
};

export const PlayerPhaseBadge = (props: {
  stage: PlayerPhase;
  translator: ClientTranslationModule;
  className?: string;
}) => {
  const { stage, translator, className } = props;
  return (
    <Badge
      translator={translator}
      text={Functional.getPlayerPhaseRarText(stage)}
      className={classNames(styles.playerPhase, className, {
        [styles.prepareStage]: stage === PlayerPhase.PrepareStage,
        [styles.judgeStage]: stage === PlayerPhase.JudgeStage,
        [styles.drawStage]: stage === PlayerPhase.DrawCardStage,
        [styles.playStage]: stage === PlayerPhase.PlayCardStage,
        [styles.dropStage]: stage === PlayerPhase.DropCardStage,
        [styles.finishStage]: stage === PlayerPhase.FinishStage,
      })}
    />
  );
};
