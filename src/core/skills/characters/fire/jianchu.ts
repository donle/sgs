import { CardType } from 'core/cards/card';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jianchu', description: 'jianchu_description' })
export class Jianchu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAim &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }
  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    if (!event) {
      return false;
    }
    const { fromId, toId } = event;
    const target = room.getPlayerById(toId);

    return fromId === owner.Id && !target.Dead && target.getPlayerCards().length > 0;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const to = room.getPlayerById(aimEvent.toId);

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: aimEvent.fromId!,
      toId: to.Id,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      aimEvent.fromId,
    );

    const response = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      aimEvent.fromId!,
    );

    if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.dropCards(
      CardMoveReason.PassiveDrop,
      [response.selectedCard],
      chooseCardEvent.toId,
      chooseCardEvent.fromId,
      this.Name,
    );

    if (Sanguosha.getCardById(response.selectedCard!).is(CardType.Equip)) {
      EventPacker.setDisresponsiveEvent(aimEvent);
    } else if (aimEvent.byCardId && room.getCardOwnerId(aimEvent.byCardId) === undefined) {
      await room.moveCards({
        movingCards: [{ card: aimEvent.byCardId, fromArea: CardMoveArea.ProcessingArea }],
        moveReason: CardMoveReason.ActivePrey,
        toArea: CardMoveArea.HandArea,
        toId: to.Id,
      });
    }

    return true;
  }
}
