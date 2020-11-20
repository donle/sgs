import { SkillType } from 'core/skills/skill';
import { LobbyButton } from 'props/game_props';
import { SkillButtonImageSize } from './image_loader';

import lobbyAcknowledgeButtonImage from './images/lobby/acknowledge_button.png';
import lobbyCharactersListButtonImage from './images/lobby/characters_list_button.png';
import lobbyFeedbackButtonImage from './images/lobby/feedback_button.png';
import lobbyRecordButtonImage from './images/lobby/record_button.png';
import lobbySettingsButtonImage from './images/lobby/settings_button.png';

import compulsoryDisabledImage from './images/skills/compulsory_disabled.png';
import compulsoryDownImage from './images/skills/compulsory_down.png';
import compulsoryHoverImage from './images/skills/compulsory_hover.png';
import compulsoryImage from './images/skills/compulsory_normal.png';
import wideCompulsoryDisabledImage from './images/skills/wide_compulsory_disabled.png';
import wideCompulsoryDownImage from './images/skills/wide_compulsory_down.png';
import wideCompulsoryHoverImage from './images/skills/wide_compulsory_hover.png';
import wideCompulsoryImage from './images/skills/wide_compulsory_normal.png';

import commonDisabledImage from './images/skills/common_disabled.png';
import commonDownImage from './images/skills/common_down.png';
import commonHoverImage from './images/skills/common_hover.png';
import commonImage from './images/skills/common_normal.png';
import wideCommonDisabledImage from './images/skills/wide_common_disabled.png';
import wideCommonDownImage from './images/skills/wide_common_down.png';
import wideCommonHoverImage from './images/skills/wide_common_hover.png';
import wideCommonImage from './images/skills/wide_common_normal.png';

import awakenDisabledImage from './images/skills/awaken_disabled.png';
import awakenDownImage from './images/skills/awaken_down.png';
import awakenHoverImage from './images/skills/awaken_hover.png';
import awakenImage from './images/skills/awaken_normal.png';
import wideAwakenDisabledImage from './images/skills/wide_awaken_disabled.png';
import wideAwakenDownImage from './images/skills/wide_awaken_down.png';
import wideAwakenHoverImage from './images/skills/wide_awaken_hover.png';
import wideAwakenImage from './images/skills/wide_awaken_normal.png';

import limitDisabledImage from './images/skills/limit_disabled.png';
import limitDownImage from './images/skills/limit_down.png';
import limitHoverImage from './images/skills/limit_hover.png';
import limitImage from './images/skills/limit_normal.png';
import wideLimitDisabledImage from './images/skills/wide_limit_disabled.png';
import wideLimitDownImage from './images/skills/wide_limit_down.png';
import wideLimitHoverImage from './images/skills/wide_limit_hover.png';
import wideLimitImage from './images/skills/wide_limit_normal.png';

const lobbyButtons: {
  [T in LobbyButton]: string;
} = {
  record: lobbyRecordButtonImage,
  settings: lobbySettingsButtonImage,
  charactersList: lobbyCharactersListButtonImage,
  feedback: lobbyFeedbackButtonImage,
  acknowledge: lobbyAcknowledgeButtonImage,
};

const skillButtons: {
  [T in SkillType]: SkillButtonImageSize;
} = {
  [SkillType.Common]: {
    wide: {
      default: wideCommonImage,
      hover: wideCommonHoverImage,
      down: wideCommonDownImage,
      disabled: wideCommonDisabledImage,
    },
    normal: {
      default: commonImage,
      hover: commonHoverImage,
      down: commonDownImage,
      disabled: commonDisabledImage,
    },
  },
  [SkillType.Compulsory]: {
    wide: {
      default: wideCompulsoryImage,
      hover: wideCompulsoryHoverImage,
      down: wideCompulsoryDownImage,
      disabled: wideCompulsoryDisabledImage,
    },
    normal: {
      default: compulsoryImage,
      hover: compulsoryHoverImage,
      down: compulsoryDownImage,
      disabled: compulsoryDisabledImage,
    },
  },
  [SkillType.Limit]: {
    wide: {
      default: wideLimitImage,
      hover: wideLimitHoverImage,
      down: wideLimitDownImage,
      disabled: wideLimitDisabledImage,
    },
    normal: {
      default: limitImage,
      hover: limitHoverImage,
      down: limitDownImage,
      disabled: limitDisabledImage,
    },
  },
  [SkillType.Awaken]: {
    wide: {
      default: wideAwakenImage,
      hover: wideAwakenHoverImage,
      down: wideAwakenDownImage,
      disabled: wideAwakenDisabledImage,
    },
    normal: {
      default: awakenImage,
      hover: awakenHoverImage,
      down: awakenDownImage,
      disabled: awakenDisabledImage,
    },
  },
};

export function getSkillButtonImages(type: SkillType, size: 'wide' | 'normal') {
  return skillButtons[type][size];
}

export function getLobbyButtonImage(variant: LobbyButton) {
  return lobbyButtons[variant];
}
