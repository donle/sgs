import { CardId } from 'core/cards/libs/card_props';
import { CardLostReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class GuanShiFuSkill extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.AfterCardUseEffect;
  }

  constructor() {
    super('guanshifu', 'guanshifu_description');
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const { responseToEvent } = content;
    if (!responseToEvent) {
      return false;
    }
    const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    return (
      slashEvent.fromId === owner.Id &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'jink' &&
      Sanguosha.getCardById(slashEvent.cardId).GeneralName === 'slash'
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { responseEvent, terminated } = await room.askForCardDrop(event.fromId, 2, [
      PlayerCardsArea.EquipArea,
      PlayerCardsArea.HandArea,
    ]);

    if (responseEvent?.droppedCards.length === 0) {
      EventPacker.terminate(event);
      return false;
    }

    if (responseEvent) {
      EventPacker.addMiddleware(
        {
          tag: this.name,
          data: responseEvent!.droppedCards,
        },
        event,
      );
    } else if (terminated) {
      EventPacker.addMiddleware(
        {
          tag: this.name,
          data: [],
        },
        event,
      );
    }
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cards = EventPacker.getMiddleware<CardId[]>(this.name, event);
    if (!cards) {
      return false;
    }

    await room.dropCards(CardLostReason.ActiveDrop, cards, event.fromId);
    const { triggeredOnEvent } = event;
    const jinkEvent = Precondition.exists(triggeredOnEvent, 'Unable to get jink event') as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent
    >;
    EventPacker.terminate(jinkEvent);
    return true;
  }
}
