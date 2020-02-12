import { JinkSkill } from './cards/standard/jink';
import { NanManRuQingSkill } from './cards/standard/nanmanruqing';
import { PeachSkill } from './cards/standard/peach';
import { SlashSkill } from './cards/standard/slash';
import { WanJianQiFaSkill } from './cards/standard/wanjianqifa';
import { ZiXinSkill } from './cards/standard/zixin';
import { HujiaSkill } from './characters/standard/hujia';
import { JianXiongSkill } from './characters/standard/jianxiong';
import {
  JiJiangShadowSkill,
  JiJiangSkill,
} from './characters/standard/jijiang';
import { JiuYuan } from './characters/standard/jiuyuan';
import { JiZhiSkill } from './characters/standard/jizhi';
import { QiCaiSkill } from './characters/standard/qicai';
import { QingGangSkill } from './characters/standard/qinggang';
import { RendeSkill } from './characters/standard/rende';
import { ZhiHeng } from './characters/standard/zhiheng';
import { ZhuGeLianNuSlashSkill } from './characters/standard/zhugeliannu_slash';

export const SkillsList = [
  new SlashSkill(),
  new ZhiHeng(),
  new JiuYuan(),
  new ZiXinSkill(),
  new PeachSkill(),
  new JinkSkill(),
  new HujiaSkill(),
  new JianXiongSkill(),
  new JiJiangSkill(),
  new JiJiangShadowSkill(),
  new JiZhiSkill(),
  new QiCaiSkill(),
  new RendeSkill(),
  new ZhuGeLianNuSlashSkill(),
  new QingGangSkill(),
  new NanManRuQingSkill(),
  new WanJianQiFaSkill(),
];
