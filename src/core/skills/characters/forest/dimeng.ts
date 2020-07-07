import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({name: 'dimeng', description: 'dimeng_description'})
export class Dimeng extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 2;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return true;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ) {
    if (selectedTargets.length === 0) {
      return owner !== target;
    }
    const selected = room.getPlayerById(selectedTargets![0]);
    return owner !== target;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (skillUseEvent.cardIds) {
      await room.dropCards(
        CardMoveReason.SelfDrop,
        skillUseEvent.cardIds,
        skillUseEvent.fromId,
        skillUseEvent.fromId,
        this.Name,
      );
    }

    const fromId = skillUseEvent.fromId;
    const firstId = skillUseEvent.toIds![0];
    const secondId = skillUseEvent.toIds![1];
    const from = room.getPlayerById(fromId);
    const first = room.getPlayerById(firstId);
    const second = room.getPlayerById(secondId);

    room.moveCards({
        moveReason: CardMoveReason.PassiveMove,
        movingCards: first.getCardIds(PlayerCardsArea.HandArea).map(cardId => ({card: cardId, fromArea: PlayerCardsArea.HandArea})),
        fromId: firstId,
        toId: secondId,
        toArea: CardMoveArea.HandArea,
        proposer: fromId,
        movedByReason: this.Name,
    });
    
    await room.moveCards({
      moveReason: CardMoveReason.PassiveMove,
      movingCards: second.getCardIds(PlayerCardsArea.HandArea).map(cardId => ({card: cardId, fromArea: PlayerCardsArea.HandArea})),
      fromId: second.Id,
      toId: first.Id,
      toArea: CardMoveArea.HandArea,
      proposer: fromId,
      movedByReason: this.Name,
    });
    
    return true;
  }
}
