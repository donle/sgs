import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'taoyuanjieyi', description: 'taoyuanjieyi_description' })
export class TaoYuanJieYiSkill extends ActiveSkill {
  public canUse() {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
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
    const from = room.getPlayerById(event.fromId);
    const allPlayers = room.getAlivePlayersFrom().filter(player => from.canUseCardTo(room, event.cardId, player.Id));
    event.toIds = allPlayers.map(player => player.Id);
    event.nullifiedTargets = allPlayers.filter(player => player.Hp === player.MaxHp).map(player => player.Id);
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;
    await room.recover({
      cardIds: [cardId],
      recoveredHp: 1,
      toId: Precondition.exists(toIds, 'Unknown targets in taoyuanjieyi')[0],
    });

    return true;
  }
}
