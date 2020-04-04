import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class QingLongYanYueDaoSkill extends TriggerSkill {
  constructor() {
    super('qinglongyanyuedao', 'qinglongyanyuedao_description');
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage) {
    return stage === CardEffectStage.AfterCardEffect;
  }

  canUse(room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
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

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return Sanguosha.getCardById(cardId).GeneralName === 'slash';
  }

  cardFilter(room: Room, cards: CardId[]) {
    return cards.length === 1;
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds, triggeredOnEvent } = skillUseEvent;
    const jinkEvent = Precondition.exists(triggeredOnEvent, 'Unable to get jink event') as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent
    >;
    const slashEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId,
      cardId: cardIds![0],
      toIds: [jinkEvent.fromId!],
    };

    await room.useCard(slashEvent);
    return true;
  }
}
