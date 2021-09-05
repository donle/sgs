import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'shenxing', description: 'shenxing_description' })
export class ShenXing extends ActiveSkill {
  canUse() {
    return true;
  }

  numberOfTargets(): number {
    return 0;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 2;
  }

  isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.cardIds = Precondition.exists(skillUseEvent.cardIds, 'Unable to get shenxing cards');

    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    await room.drawCards(1, skillUseEvent.fromId, undefined, skillUseEvent.fromId, this.Name);
    return true;
  }
}
