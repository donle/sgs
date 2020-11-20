import { Precondition } from 'core/shares/libs/precondition/precondition';
import { SkillType } from 'core/skills/skill';
import { LobbyButton } from 'props/game_props';
import { SkillButtonImageProps } from './image_loader';

function getSkillTypeNameText(type: SkillType) {
  switch (type) {
    case SkillType.Common:
      return 'common_';
    case SkillType.Compulsory:
      return 'compulsory_';
    case SkillType.Limit:
      return 'limit_';
    case SkillType.Awaken:
      return 'awaken_';
    default:
      throw Precondition.UnreachableError(type);
  }
}

const lobbyButtons: {
  [T in LobbyButton]: string;
} = {
  record: 'record_button',
  settings: 'settings_button',
  charactersList: 'characters_list_button',
  feedback: 'feedback_button',
  acknowledge: 'acknowledge_button',
};

export function getSkillButtonImages(type: SkillType, size: 'wide' | 'normal', rootUrl: string): SkillButtonImageProps {
  const prefix = size === 'wide' ? 'wide_' : '';
  const skillTypeName = getSkillTypeNameText(type);
  return {
    default: `${rootUrl}/images/skills/${prefix + skillTypeName}normal.png`,
    hover: `${rootUrl}/images/skills/${prefix + skillTypeName}hover.png`,
    down: `${rootUrl}/images/skills/${prefix + skillTypeName}down.png`,
    disabled: `${rootUrl}/images/skills/${prefix + skillTypeName}disabled.png`,
  };
}

export function getLobbyButtonImage(variant: LobbyButton, rootUrl: string) {
  return `${rootUrl}/images/lobby/${lobbyButtons[variant]}.png`;
}
