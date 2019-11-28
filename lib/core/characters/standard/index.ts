import { CharacterGender, CharacterProps } from 'core/characters/character';
import { ZhiHeng } from 'core/skills/characters/standard/zhiheng';

export const SunQuan: CharacterProps = {
  gender: CharacterGender.Male,
  maxHp: 4,
  name: 'sunquan',
  skills: [new ZhiHeng('zhiheng', '')],
};
