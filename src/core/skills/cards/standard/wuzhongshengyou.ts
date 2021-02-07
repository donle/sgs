import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, SelfTargetSkill } from 'core/skills/skill';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'wuzhongshengyou', description: 'wuzhongshengyou_description' })
@SelfTargetSkill
export class WuZhongShengYouSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    return containerCard !== undefined && owner.canUseCardTo(room, containerCard, owner.Id);
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

  public isCardAvailableTarget(): boolean {
    return true;
  }

  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    event.targetGroup = [[event.fromId]];
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const toId = Precondition.exists(event.toIds, 'Unknown targets in wuzhongshengyou')[0];
    await room.drawCards(2, toId, undefined, toId, this.Name);
    return true;
  }
}
