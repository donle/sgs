import { CardType } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'qiaomeng', description: 'qiaomeng_description' })
export class QiaoMeng extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    const damageCard = content.cardIds && Sanguosha.getCardById(content.cardIds[0]);
    const to = room.getPlayerById(content.toId);
    return (
      owner.Id === content.fromId &&
      to.getCardIds().length > 0 &&
      !!damageCard &&
      damageCard.GeneralName === 'slash'
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId, toId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const to = room.getPlayerById(toId);
    const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
      options: {
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
      },
      fromId: fromId!,
      toId,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(askForChooseCardEvent),
      fromId!,
    );
    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      fromId!,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    } else if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds();
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    if (response.selectedCard !== undefined) {
      const card = Sanguosha.getCardById(response.selectedCard);
      await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard], toId, fromId, this.Name);

      if ((card.is(CardType.DefenseRide) || card.is(CardType.OffenseRide)) && room.isCardInDropStack(card.Id)) {
        await room.moveCards({
          movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.DropStack }],
          moveReason: CardMoveReason.ActivePrey,
          fromId: toId,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
        });
      }
    }

    return true;
  }
}
