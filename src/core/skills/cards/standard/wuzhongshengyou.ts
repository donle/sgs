import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, SelfTargetSkill } from 'core/skills/skill';

@CommonSkill({ name: 'wuzhongshengyou', description: 'wuzhongshengyou_description' })
@SelfTargetSkill
export class WuZhongShengYouSkill extends ActiveSkill {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 0;
  }
  
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    event.toIds = [event.fromId];
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    await room.drawCards(2, Precondition.exists(event.toIds, 'Unknown targets in wuzhongshengyou')[0]);
    return true;
  }
}
