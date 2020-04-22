import { CardId } from 'core/cards/libs/card_props';
import { CardLostReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'kurou', description: 'kurou_description' })
export class KuRou extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    const handCards = owner.getCardIds(PlayerCardsArea.HandArea);
    const equipmentCards = owner.getCardIds(PlayerCardsArea.EquipArea);
    return !owner.hasUsedSkill(this.Name) && handCards.length + equipmentCards.length > 0;
  }

  public targetFilter(): boolean {
    return true;
  }

  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.dropCards(
      CardLostReason.ActiveDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    await room.loseHp(skillUseEvent.fromId, 1);

    return true;
  }
}
