import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'zhiheng', description: 'zhiheng_description' })
export class ZhiHeng extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  isAvailableTarget(): boolean {
    return false;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const cardFromArea = room.CurrentPlayer.cardFrom(cardId);
    return cardFromArea !== undefined && [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].includes(cardFromArea);
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.cardIds = Precondition.exists(skillUseEvent.cardIds, 'Unable to get zhiheng cards');

    const handCards = room.getPlayerById(skillUseEvent.fromId).getCardIds(PlayerCardsArea.HandArea);
    let additionalCardDraw = 0;
    if (skillUseEvent.cardIds.filter(zhihengCard => handCards.includes(zhihengCard)).length === handCards.length) {
      additionalCardDraw++;
    }

    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    await room.drawCards(skillUseEvent.cardIds.length + additionalCardDraw, skillUseEvent.fromId);

    return true;
  }
}
