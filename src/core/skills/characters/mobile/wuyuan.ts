import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'wuyuan', description: 'wuyuan_description' })
export class WuYuan extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).GeneralName === 'slash';
  }

  public availableCardAreas(): PlayerCardsArea[] {
    return [PlayerCardsArea.HandArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    const { fromId } = event;
    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: CardMoveArea.HandArea }],
      fromId,
      toId: event.toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      triggeredBySkills: [this.Name],
    });

    await room.recover({
      toId: fromId,
      recoveredHp: 1,
      recoverBy: fromId,
    });

    const cardGiven = Sanguosha.getCardById(event.cardIds[0]);
    await room.drawCards(
      ['thunder_slash', 'fire_slash'].includes(cardGiven.Name) ? 2 : 1,
      event.toIds[0],
      'top',
      fromId,
      this.Name,
    );

    if (cardGiven.isRed()) {
      await room.recover({
        toId: event.toIds[0],
        recoveredHp: 1,
        recoverBy: fromId,
      });
    }

    return true;
  }
}
