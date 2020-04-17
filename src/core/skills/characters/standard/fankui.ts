import { CardChoosingOptions } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  CardObtainedReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class FanKui extends TriggerSkill {
  constructor() {
    super('fankui', 'fankui_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    const damageFrom = content.fromId !== undefined && room.getPlayerById(content.fromId);
    return owner.Id === content.toId && damageFrom && damageFrom.getPlayerCards().length > 0 && !damageFrom.Dead;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (fromId !== undefined) {
      const damageFrom = room.getPlayerById(fromId);
      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: damageFrom.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: damageFrom.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: skillUseEvent.fromId,
        toId: fromId,
        options,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
        skillUseEvent.fromId,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        skillUseEvent.fromId,
      );

      if (response.selectedCard === undefined) {
        response.selectedCard = damageFrom.getCardIds(PlayerCardsArea.HandArea)[response.selectedCardIndex!];
      }

      await room.moveCards(
        [response.selectedCard],
        chooseCardEvent.toId,
        chooseCardEvent.fromId,
        CardLostReason.PassiveMove,
        response.fromArea,
        PlayerCardsArea.HandArea,
        CardObtainedReason.ActivePrey,
        chooseCardEvent.fromId,
      );
    }
    return true;
  }
}
