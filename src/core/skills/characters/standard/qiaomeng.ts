import { CardType } from 'core/cards/card';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
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
      (content.toId === owner.Id
        ? to.getCardIds().filter(id => room.canDropCard(owner.Id, id)).length > 0
        : to.getCardIds().length > 0) &&
      !!damageCard &&
      damageCard.GeneralName === 'slash' &&
      !content.isFromChainedDamage
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId, toId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const to = room.getPlayerById(toId);

    const options: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
    };

    const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
      options,
      fromId: fromId!,
      toId,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(askForChooseCardEvent, askForChooseCardEvent.fromId, true, true);

    if (response && response.selectedCard !== undefined) {
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
