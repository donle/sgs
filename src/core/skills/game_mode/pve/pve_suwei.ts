import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TriggerSkill } from 'core/skills/skill';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { ServerEventFinder, GameEventIdentifiers, EventPacker, CardMoveReason } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { PlayerCardsArea } from 'core/player/player_props';

@CompulsorySkill({ name: 'pve_suwei', description: 'pve_suwei_description' })
export class PveSuWei extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed && event.byCardId !== undefined;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return event.toId === owner.Id && event.fromId !== owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toId } = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const attacker = room.getPlayerById(fromId);

    await room.drawCards(1, toId, 'top', toId, this.Name);

    if (room.getPlayerById(fromId).getPlayerCards().length > 0) {
      const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
        options: {
          [PlayerCardsArea.EquipArea]: attacker.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: attacker.getCardIds(PlayerCardsArea.HandArea).length,
        },
        fromId: toId,
        toId: fromId,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
          askForChooseCardEvent,
        ),
        toId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        toId,
      );

      if (response.selectedCardIndex !== undefined) {
        const cardIds = attacker.getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      } else if (response.selectedCard === undefined) {
        const cardIds = attacker.getPlayerCards();
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      }
      if (response.selectedCard !== undefined) {
        await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard], fromId, toId, this.Name);
      }
    }
    return true;
  }
}
