import { ZhengRong } from './zhengrong';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'qingce', description: 'qingce_description' })
export class QingCe extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return (
      owner.getCardIds(PlayerCardsArea.OutsideArea, ZhengRong.Name).length > 0 &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 2;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const to = room.getPlayerById(target);
    return to.getCardIds(PlayerCardsArea.EquipArea).length > 0 || to.getCardIds(PlayerCardsArea.JudgeArea).length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    const ownerPlayer = room.getPlayerById(owner);
    if (selectedCards.length > 0) {
      return ownerPlayer.cardFrom(cardId) === PlayerCardsArea.HandArea && room.canDropCard(owner, cardId);
    }

    return ownerPlayer.getCardIds(PlayerCardsArea.OutsideArea, ZhengRong.Name).includes(cardId);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.OutsideArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: cardIds[0], fromArea: CardMoveArea.OutsideArea }],
      fromId,
      toId: fromId,
      moveReason: CardMoveReason.ActiveMove,
      toArea: CardMoveArea.HandArea,
      proposer: fromId,
      movedByReason: this.Name,
    });

    await room.moveCards({
      movingCards: [{ card: cardIds[1], fromArea: CardMoveArea.HandArea }],
      fromId,
      moveReason: CardMoveReason.PlaceToDropStack,
      toArea: CardMoveArea.DropStack,
      proposer: fromId,
      movedByReason: this.Name,
    });

    const to = room.getPlayerById(toIds[0]);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
    };

    const chooseCardEvent = {
      fromId,
      toId: toIds[0],
      options,
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
    if (!response) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
      fromId: toIds[0],
      toArea: CardMoveArea.DropStack,
      moveReason: CardMoveReason.PassiveDrop,
      proposer: fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}
