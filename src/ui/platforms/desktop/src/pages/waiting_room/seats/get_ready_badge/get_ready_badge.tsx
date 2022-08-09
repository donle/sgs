import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { Messages } from '../messages';
import styles from './get_ready_badge.module.css';

export const GetReadyBadge = React.memo(
  ({ translator, className }: { className?: string; translator: ClientTranslationModule }) => {
    return <div className={classNames(styles.getReadyBadge, className)}>{translator.tr(Messages.getReady())}</div>;
  },
);
