import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TagEnum } from 'core/shares/types/tag_list';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'slash', description: 'slash_description' })
export class SlashSkill extends ActiveSkill {
  protected damageType: DamageType = DamageType.Normal;

  public canUse(room: Room, owner: Player, contentOrContainerCard?: CardId) {
    return !owner.hasUsed(this.Name);
  }

  public isRefreshAt() {
    return true;
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
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

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const player = room.getPlayerById(event.fromId);
    EventPacker.addMiddleware(
      {
        tag: TagEnum.DrunkTag,
        data: player.hasDrunk(),
      },
      event,
    );
    room.clearHeaded(player.Id);

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const addtionalDrunkDamage = EventPacker.getMiddleware<number>(TagEnum.DrunkTag, event) || 0;
    const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
      fromId,
      toId: toIds![0],
      damage: 1 + addtionalDrunkDamage,
      damageType: this.damageType,
      cardIds: [cardId],
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
    };

    EventPacker.addMiddleware(
      {
        tag: TagEnum.DrunkTag,
        data: addtionalDrunkDamage,
      },
      damageEvent,
    );

    await room.damage(damageEvent);

    return true;
  }
}
