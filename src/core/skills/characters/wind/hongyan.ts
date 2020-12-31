import { Card, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, ShadowSkill, TransformSkill } from 'core/skills/skill';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'hongyan', description: 'hongyan_description' })
export class HongYan extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const cards = [owner.getCardIds(PlayerCardsArea.HandArea), owner.getCardIds(PlayerCardsArea.EquipArea)].map(cards =>
      cards.map(cardId => {
        if (this.canTransform(cardId)) {
          return this.forceToTransformCardTo(cardId).Id;
        }

        return cardId;
      }),
    );

    room.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, {
      changedProperties: [
        {
          toId: owner.Id,
          handCards: cards[0],
          equips: cards[1],
        },
      ],
    });
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const cards = [owner.getCardIds(PlayerCardsArea.HandArea), owner.getCardIds(PlayerCardsArea.EquipArea)].map(cards =>
      cards.map(cardId => {
        if (!Card.isVirtualCardId(cardId)) {
          return cardId;
        }

        const card = Sanguosha.getCardById<VirtualCard>(cardId);
        if (!card.findByGeneratedSkill(this.Name)) {
          return cardId;
        }

        return card.ActualCardIds[0];
      }),
    );

    room.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, {
      changedProperties: [
        {
          toId: owner.Id,
          handCards: cards[0],
          equips: cards[1],
        },
      ],
    });
  }

  canTransform(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return card.Suit === CardSuit.Spade;
  }

  public includesJudgeCard() {
    return true;
  }

  public forceToTransformCardTo(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return VirtualCard.create(
      {
        cardName: card.Name,
        cardNumber: card.CardNumber,
        cardSuit: CardSuit.Heart,
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}

@ShadowSkill
@CompulsorySkill({ name: HongYan.Name, description: HongYan.Description })
export class HongYanShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return (
      stage === CardMoveStage.AfterCardMoved &&
      event.movingCards.find(
        cardInfo =>
          (cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea) &&
          Sanguosha.getCardById(cardInfo.card).Suit === CardSuit.Heart,
      ) !== undefined
    );
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayer.Id !== owner.Id &&
      owner.getCardIds(PlayerCardsArea.HandArea).length < owner.Hp
    );
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.GeneralName,
    ).extract();
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, skillUseEvent.fromId, undefined, skillUseEvent.fromId, this.GeneralName);
    return true;
  }
}
