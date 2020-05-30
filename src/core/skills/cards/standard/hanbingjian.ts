import { CardChoosingOptions } from 'core/cards/libs/card_props';
import {
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, HpChangeStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'hanbingjian', description: 'hanbingjian_description' })
export class HanBingJianSkill extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>, stage?: AllStage): boolean {
    return stage === HpChangeStage.HpChanging;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>): boolean {
    if (
      event.byReaon !== 'damage' ||
      !event.byCardIds ||
      Sanguosha.getCardById(event.byCardIds[0]).GeneralName !== 'slash'
    ) {
      return false;
    }
    const to = room.getPlayerById(event.toId);
    const handCardsNum = to.getCardIds(PlayerCardsArea.HandArea).length;
    const equipCardsNum = to.getCardIds(PlayerCardsArea.EquipArea).length;
    return handCardsNum + equipCardsNum > 0;
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const hpChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.HpChangeEvent>;
    const to = room.getPlayerById(hpChangeEvent.toId);

    EventPacker.terminate(hpChangeEvent);
    for (let i = 0; i < 2; i++) {
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

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        event.fromId,
      );

      if (response.selectedCard === undefined) {
        response.selectedCard = to.getCardIds(PlayerCardsArea.HandArea)[response.selectedCardIndex!];
      }

      await room.dropCards(
        CardMoveReason.PassiveDrop,
        [response.selectedCard],
        chooseCardEvent.toId,
        chooseCardEvent.fromId,
        this.Name,
      );

      const handCardsNum = to.getCardIds(PlayerCardsArea.HandArea).length;
      const equipCardsNum = to.getCardIds(PlayerCardsArea.EquipArea).length;
      if (handCardsNum + equipCardsNum === 0) {
        break;
      }
    }

    return true;
  }
}
