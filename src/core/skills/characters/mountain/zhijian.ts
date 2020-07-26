import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zhijian', description: 'zhijian_description' })
export class ZhiJian extends ActiveSkill {
  canUse() {
    return true;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[], selectedTargets: PlayerId[], cardId?: CardId) {
    return cards.length === 1;
  }

  isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ) {
    return Sanguosha.getCardById(cardId).is(CardType.Equip);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  numberOfTargets() {
    return 1;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ) {
    if (selectedCards.length === 1) {
      return room.canPlaceCardTo(selectedCards[0], target);
    } else {
      return false;
    }
  }

  async onUse() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    const card = cardIds![0];

    await room.moveCards({
      movingCards: [{ card, fromArea: from.cardFrom(card) }],
      moveReason: CardMoveReason.ActiveMove,
      fromId,
      toId: toIds![0],
      toArea: CardMoveArea.EquipArea,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    await room.drawCards(1, fromId, undefined, fromId, this.Name);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZhiJian.Name, description: ZhiJian.Description })
export class ZhiJianShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const card = Sanguosha.getCardById(content.cardId);
    return content.fromId === owner.Id && card.is(CardType.Equip);
  }

  public getSkillLog(room: Room, owner: Player) {
    return 'zhijian: do you wanna use draw 1 card';
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId, undefined, event.fromId, this.GeneralName);
    return true;
  }
}
