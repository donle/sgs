import { CommonSkill } from 'core/skills/skill_wrappers';
import { ActiveSkill } from 'core/skills/skill';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { KuangBao } from './kuangbao';

@CommonSkill({ name: 'wuqian', description: 'wuqian_description' })
export class WuQian extends ActiveSkill {
  public static readonly Invincibility = 'Invincibility';

  public canUse(room: Room, owner: Player): boolean {
    return room.getMark(owner.Id, KuangBao.Fury) >= 2;
  }

  public numberOfTargets(): number {
    return 1;
  }
}
