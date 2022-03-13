import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'quji', description: 'quji_description' })
export class QuJi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.LostHp > 0;
  }

  public numberOfTargets() {
    return [];
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length > 0 && targets.length <= owner.LostHp;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getPlayerById(target).LostHp > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === owner.LostHp;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    for (const toId of event.toIds) {
      await room.recover({
        toId,
        recoveredHp: 1,
        recoverBy: event.fromId,
      });
    }

    event.cardIds.find(id => Sanguosha.getCardById(id).isBlack()) && (await room.loseHp(event.fromId, 1));

    return true;
  }
}
