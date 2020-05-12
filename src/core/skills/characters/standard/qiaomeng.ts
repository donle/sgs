import { CardType } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
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
      to.getCardIds(PlayerCardsArea.EquipArea).length > 0 &&
      !!damageCard &&
      damageCard.GeneralName === 'slash' &&
      damageCard.isBlack()
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
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      },
      fromId: fromId!,
      toId,
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardFromPlayerEvent, askForChooseCardEvent, fromId!);
    const { selectedCard } = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      fromId!,
    );

    if (selectedCard) {
      const card = Sanguosha.getCardById(selectedCard);
      await room.dropCards(CardMoveReason.PassiveDrop, [selectedCard], toId, fromId, this.Name);

      if ((card.is(CardType.DefenseRide) || card.is(CardType.OffenseRide)) && room.isCardInDropStack(card.Id)) {
        await room.moveCards({
          movingCards: [{ card: selectedCard, fromArea: CardMoveArea.DropStack }],
          moveReason: CardMoveReason.ActivePrey,
          toId,
          toArea: CardMoveArea.HandArea,
        });
      }
    }

    return true;
  }
}
