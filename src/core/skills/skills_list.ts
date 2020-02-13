import { JinkSkill } from './cards/standard/jink';
import { NanManRuQingSkill } from './cards/standard/nanmanruqing';
import { PeachSkill } from './cards/standard/peach';
import { QingGangSkill } from './cards/standard/qinggang';
import { SlashSkill } from './cards/standard/slash';
import { WanJianQiFaSkill } from './cards/standard/wanjianqifa';
import { ZhuGeLianNuSlashSkill } from './cards/standard/zhugeliannu_slash';
import { ZiXinSkill } from './cards/standard/zixin';
import { Hujia } from './characters/standard/hujia';
import { JianXiong } from './characters/standard/jianxiong';
import { JiJiang, JiJiangShadow } from './characters/standard/jijiang';
import { JiuYuan } from './characters/standard/jiuyuan';
import { JiZhi } from './characters/standard/jizhi';
import { QiCai } from './characters/standard/qicai';
import { Rende } from './characters/standard/rende';
import { ZhiHeng } from './characters/standard/zhiheng';
import { HongYan } from './characters/wind/hongyan';

export const SkillsList = [
  new SlashSkill(),
  new PeachSkill(),
  new JinkSkill(),
  new ZiXinSkill(),
  new ZhuGeLianNuSlashSkill(),
  new QingGangSkill(),
  new NanManRuQingSkill(),
  new WanJianQiFaSkill(),

  new ZhiHeng(),
  new JiuYuan(),
  new Hujia(),
  new JianXiong(),
  new JiJiang(),
  new JiJiangShadow(),
  new JiZhi(),
  new QiCai(),
  new Rende(),
  new HongYan(),
];
