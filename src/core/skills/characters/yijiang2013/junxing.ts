import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'junxing', description: 'junxing_description' })
export class JunXing extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds, toIds } = skillEffectEvent;
    const toId = toIds![0];

    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);

    const dropCardsNum = cardIds!.length;
    const playerCardsNum = room.getPlayerById(toId).getPlayerCards().length;

    if (playerCardsNum < dropCardsNum) {
      await room.turnOver(toId);
      await room.drawCards(dropCardsNum, toId, undefined, fromId, this.Name);
    } else {
      const response = await room.askForCardDrop(
        toId,
        dropCardsNum,
        [PlayerCardsArea.EquipArea, PlayerCardsArea.HandArea],
        false,
        undefined,
        this.Name,
        TranslationPack.translationJsonPatcher('{0}: drop {1} cards or turn over', this.Name, dropCardsNum).toString(),
      );

      if (response.droppedCards.length === dropCardsNum) {
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId);
        await room.loseHp(toId, 1);
      } else {
        await room.turnOver(toId);
        await room.drawCards(dropCardsNum, toId, undefined, fromId, this.Name);
      }
    }

    return true;
  }
}
