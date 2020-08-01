import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'taoyuanjieyi', description: 'taoyuanjieyi_description' })
export class TaoYuanJieYiSkill extends ActiveSkill {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    if (containerCard) {
      for (const target of room.getAlivePlayersFrom()) {
        if (owner.canUseCardTo(room, containerCard, target.Id)) {
          return true;
        }
      }
    }

    return false;
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
