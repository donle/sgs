import { AlcoholSkillTrigger } from './cards/alcohol';
import { BaGuaZhenSkillTrigger } from './cards/baguazhen';
import { BingLiangCunDuanSkillTrigger } from './cards/bingliangcunduan';
import { DuelSkillTrigger } from './cards/duel';
import { FireAttackSkillTrigger } from './cards/fire_attack';
import { GuanShiFuSkillTrigger } from './cards/guanshifu';
import { GuoHeChaiQiaoSkillTrigger } from './cards/guohechaiqiao';
import { HanBingJianSkillTrigger } from './cards/hanbingjian';
import { JieDaoShaRenSkillTrigger } from './cards/jiedaosharen';
import { LeBuSiShuSkillTrigger } from './cards/lebusishu';
import { NanManRuQingSkillTrigger } from './cards/nanmanruqing';
import { PeachSkillTrigger } from './cards/peach';
import { QingLongDaoSkillTrigger } from './cards/qinglongdao';
import { ShunShouQianYangSkillTrigger } from './cards/shunshouqianyang';
import { SlashSkillTrigger } from './cards/slash';
import { TaoYuanJieYiSkillTrigger } from './cards/taoyuanjieyi';
import { TieSuoLianHuanSkillTrigger } from './cards/tiesuolianhuan';
import { WanJianQiFaSkillTrigger } from './cards/wanjianqifa';
import { WuGuFengDengSkillTrigger } from './cards/wugufengdeng';
import { ZhiHengSkillTrigger } from './characters/standard/zhiheng';

const slashTrigger = new SlashSkillTrigger();

export const activeSkillTriggerMapper = {
  zhiheng: new ZhiHengSkillTrigger(),
  fire_attack: new FireAttackSkillTrigger(),
  slash: slashTrigger,
  fire_slash: slashTrigger,
  thunder_slash: slashTrigger,
  alcohol: new AlcoholSkillTrigger(),
  peach: new PeachSkillTrigger(),
  shunshouqianyang: new ShunShouQianYangSkillTrigger(),
  guohechaiqiao: new GuoHeChaiQiaoSkillTrigger(),
  duel: new DuelSkillTrigger(),
  nanmanruqing: new NanManRuQingSkillTrigger(),
  wanjianqifa: new WanJianQiFaSkillTrigger(),
  lebusishu: new LeBuSiShuSkillTrigger(),
  bingliangcunduan: new BingLiangCunDuanSkillTrigger(),
  wugufengdeng: new WuGuFengDengSkillTrigger(),
  taoyuanjieyi: new TaoYuanJieYiSkillTrigger(),
  tiesuolianhuan: new TieSuoLianHuanSkillTrigger(),
  jiedaosharen: new JieDaoShaRenSkillTrigger(),
};

export const triggerSkillTriggerMapper = {
  qinglongyanyuedao: new QingLongDaoSkillTrigger(),
  baguazhen: new BaGuaZhenSkillTrigger(),
  hanbingjian: new HanBingJianSkillTrigger(),
  guanshifu: new GuanShiFuSkillTrigger(),
};

export const viewAsSkillTriggerMapper = {};
