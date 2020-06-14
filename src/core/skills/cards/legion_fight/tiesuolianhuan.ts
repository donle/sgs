import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'tiesuolianhuan', description: 'tiesuolianhuan_description' })
export class TieSuoLianHuanSkill extends ActiveSkill {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return [1, 2];
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return room.getPlayerById(owner).canUseCardTo(room, containerCard, target);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds } = event;
    for (const toId of toIds!) {
      await room.chainedOn(toId);
    }
    return true;
  }
}
