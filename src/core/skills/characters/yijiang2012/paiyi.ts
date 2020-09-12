import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder
} from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { QuanJi } from './quanji';

@CommonSkill({ name: 'paiyi', description: 'paiyi_description' })
export class PaiYi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, QuanJi.Name).length > 0
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const player = room.getPlayerById(owner);
    return player.getCardIds(PlayerCardsArea.OutsideArea, QuanJi.Name).includes(cardId);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.OutsideArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    await room.moveCards({
      movingCards: [{ card: cardIds![0], fromArea: CardMoveArea.OutsideArea }],
      fromId,
      moveReason: CardMoveReason.PlaceToDropStack,
      toArea: CardMoveArea.DropStack,
      proposer: fromId,
      movedByReason: this.Name,
    });

    await room.drawCards(2, toIds![0], 'top', fromId, this.Name);
    if (fromId === toIds![0]) {
      return true;
    }

    const fromHandNum = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea).length;
    const toHandNum = room.getPlayerById(toIds![0]).getCardIds(PlayerCardsArea.HandArea).length;
    if (toHandNum > fromHandNum) {
      await room.damage({
        fromId,
        toId: toIds![0],
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      })
    }

    return true;
  }
}
