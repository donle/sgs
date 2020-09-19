import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'ganlu', description: 'ganlu_description' })
export class GanLu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 2;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    if (selectedTargets.length === 1) {
      const first = room.getPlayerById(selectedTargets[0]);
      const second = room.getPlayerById(target);
      const firstEquipsNum = first.getCardIds(PlayerCardsArea.EquipArea).length;
      const secondEquipsNum = second.getCardIds(PlayerCardsArea.EquipArea).length;

      if (firstEquipsNum === 0 && secondEquipsNum === 0) {
        return false;
      }

      return (
        selectedTargets[0] === owner ||
        target === owner ||
        Math.abs(firstEquipsNum - secondEquipsNum) <= room.getPlayerById(owner).LostHp
      );
    }

    return true;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const fromId = skillUseEvent.fromId;
    const firstId = skillUseEvent.toIds![0];
    const secondId = skillUseEvent.toIds![1];
    const first = room.getPlayerById(firstId);
    const second = room.getPlayerById(secondId);

    const firstCards = first.getCardIds(PlayerCardsArea.EquipArea).slice();
    const secondCards = second.getCardIds(PlayerCardsArea.EquipArea).slice();
    await room.asyncMoveCards([
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: firstCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.EquipArea })),
        fromId: firstId,
        toArea: CardMoveArea.ProcessingArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [firstId],
      },
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: secondCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.EquipArea })),
        fromId: secondId,
        toArea: CardMoveArea.ProcessingArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [secondId],
      },
    ]);

    await room.asyncMoveCards([
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: secondCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
        toId: firstId,
        toArea: CardMoveArea.EquipArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [firstId, secondId],
      },
      {
        moveReason: CardMoveReason.PassiveMove,
        movingCards: firstCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
        toId: secondId,
        toArea: CardMoveArea.EquipArea,
        proposer: fromId,
        movedByReason: this.Name,
        engagedPlayerIds: [firstId, secondId],
      },
    ]);

    return true;
  }
}
