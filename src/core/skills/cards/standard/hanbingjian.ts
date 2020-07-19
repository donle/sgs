import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'hanbingjian', description: 'hanbingjian_description' })
export class HanBingJianSkill extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect && event.isFromChainedDamage !== true;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    if (!event.cardIds || Sanguosha.getCardById(event.cardIds[0]).GeneralName !== 'slash') {
      return false;
    }

    return event.fromId === owner.Id && room.getPlayerById(event.toId).getPlayerCards().length > 0;
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const to = room.getPlayerById(damageEvent.toId);

    EventPacker.terminate(damageEvent);
    for (let i = 0; i < 2; i++) {
      if (to.getPlayerCards().length === 0) {
        return false;
      }

      const options: CardChoosingOptions = {
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId: to.Id,
        options,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
        event.fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        event.fromId,
      );

      if (response.selectedCard === undefined) {
        const handCardIds = to.getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = handCardIds[Math.floor(Math.random() * handCardIds.length)];
      }

      await room.dropCards(
        CardMoveReason.PassiveDrop,
        [response.selectedCard],
        chooseCardEvent.toId,
        chooseCardEvent.fromId,
        this.Name,
      );
    }

    return true;
  }
}
