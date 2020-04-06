import { CardId } from 'core/cards/libs/card_props';
import { CardLostReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';

@CommonSkill
@TriggerableTimes(1)
export class ZhiHeng extends ActiveSkill {
  constructor() {
    super('zhiheng', 'zhiheng_description');
  }

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.name);
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

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.cardIds = Precondition.exists(skillUseEvent.cardIds, 'Unable to get zhiheng cards');

    await room.dropCards(CardLostReason.ActiveDrop, skillUseEvent.cardIds, skillUseEvent.fromId);

    let drawAdditionalCards = 0;
    if (room.getPlayerById(skillUseEvent.fromId).getCardIds(PlayerCardsArea.HandArea).length === 0) {
      drawAdditionalCards++;
    }

    await room.drawCards(skillUseEvent.cardIds.length + drawAdditionalCards);

    return true;
  }
}
