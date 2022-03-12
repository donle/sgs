import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'baiyi', description: 'baiyi_description' })
export class BaiYi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return owner.LostHp > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 2;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const firstPosition = room.getPlayerById(event.toIds[0]).Position;
    const secondPosition = room.getPlayerById(event.toIds[1]).Position;

    room.changePlayerProperties({
      changedProperties: [
        { toId: event.toIds[0], playerPosition: secondPosition },
        { toId: event.toIds[1], playerPosition: firstPosition },
      ],
    });

    return true;
  }
}
