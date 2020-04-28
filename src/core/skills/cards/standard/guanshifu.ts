import { CardId } from 'core/cards/libs/card_props';
import { CardLostReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'guanshifu', description: 'guanshifu_description' })
export class GuanShiFuSkill extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 2;
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return cardId !== containerCard;
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
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.dropCards(CardLostReason.ActiveDrop, cardIds, event.fromId);
    const { triggeredOnEvent } = event;
    const jinkEvent = Precondition.exists(triggeredOnEvent, 'Unable to get jink event') as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent
    >;
    const { responseToEvent } = jinkEvent;
    responseToEvent && EventPacker.recall(responseToEvent);
    return true;
  }
}
