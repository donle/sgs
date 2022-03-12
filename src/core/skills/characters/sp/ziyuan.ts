import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'ziyuan', description: 'ziyuan_description' })
export class ZiYuan extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return (
      cards.length > 0 &&
      cards.reduce<number>((sum, id) => {
        return (sum += Sanguosha.getCardById(id).CardNumber);
      }, 0) === 13
    );
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    if (selectedCards.length > 0) {
      return (
        Sanguosha.getCardById(cardId).CardNumber <=
        13 -
          selectedCards.reduce<number>((sum, id) => {
            return (sum += Sanguosha.getCardById(id).CardNumber);
          }, 0)
      );
    }

    return Sanguosha.getCardById(cardId).CardNumber <= 13;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
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
      movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    await room.recover({
      toId: toIds[0],
      recoveredHp: 1,
      recoverBy: fromId,
    });

    return true;
  }
}
