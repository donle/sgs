import { CardId } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class GuanShiFuSkill extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.AfterCardUseEffect;
  }

  constructor() {
    super('guanshifu', 'guanshifu_description');
  }

  canUse(room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (!content) {
      return false;
    }

    const { responseToEvent } = content;
    if (!responseToEvent) {
      return false;
    }
    const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    return (
      Sanguosha.getCardById(slashEvent.cardId).GeneralName === 'slash' &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'jink' &&
      slashEvent.fromId === owner.Id
    );
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[], containerCard?: CardId) {
    return cardId !== containerCard;
  }

  cardFilter(room: Room, cards: CardId[]) {
    return cards.length === 2;
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    event.cardIds && (await room.dropCards(CardLostReason.ActiveDrop, event.cardIds, event.fromId));
    const { triggeredOnEvent } = event;
    const jinkEvent = Precondition.exists(triggeredOnEvent, 'Unable to get jink event') as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent
    >;
    EventPacker.terminate(jinkEvent);
    return true;
  }
}
