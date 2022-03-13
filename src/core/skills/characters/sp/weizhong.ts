import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'weizhong', description: 'weizhong_description' })
export class WeiZhong extends TriggerSkill {
  public audioIndex(): number {
    return 1;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.ChangeMaxHpEvent>): boolean {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.ChangeMaxHpEvent;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.ChangeMaxHpEvent>): boolean {
    return content.toId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(
      room
        .getOtherPlayers(event.fromId)
        .find(
          player =>
            room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length >
            player.getCardIds(PlayerCardsArea.HandArea).length,
        )
        ? 1
        : 2,
      event.fromId,
      'top',
      event.fromId,
      this.Name,
    );

    return true;
  }
}
