import { Precondition } from 'core/shares/libs/precondition/precondition';
import { SkillType } from 'core/skills/skill';
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
