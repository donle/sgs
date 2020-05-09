import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'slash', description: 'slash_description' })
export class SlashSkill extends ActiveSkill {
  protected damageType: DamageType = DamageType.Normal;

  public canUse() {
    return true;
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, cards: CardId[]) {
    return cards.length === 0;
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ) {
    return room.canAttack(room.getPlayerById(owner), room.getPlayerById(target), containerCard);
  }

  private readonly DrunkTag = 'drunkLevel';

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const player = room.getPlayerById(event.fromId);
    EventPacker.addMiddleware(
      {
        tag: this.DrunkTag,
        data: player.hasDrunk(),
      },
      event,
    );
    //TODO: broadcast clearHeaded status
    player.clearHeaded();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const addtionalDrunkDamage = EventPacker.getMiddleware<number>(this.DrunkTag, event) || 0;
    const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
      fromId,
      toId: toIds![0],
      damage: 1 + addtionalDrunkDamage,
      damageType: this.damageType,
      cardIds: [cardId],
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
    };

    await room.damage(damageEvent);

    return true;
  }
}

export class ThunderSlashSkill extends SlashSkill {
  protected damageType = DamageType.Thunder;
}

export class FireSlashSkill extends SlashSkill {
  protected damageType = DamageType.Fire;
}
