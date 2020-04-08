import { CardMatcher } from 'core/cards/libs/card_matcher';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class QingLongYanYueDaoSkill extends TriggerSkill {
  constructor() {
    super('qinglongyanyuedao', 'qinglongyanyuedao_description');
  }

  isAutoTrigger() {
    return true;
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

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const jinkEffectEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;

    const askForSlash: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
      toId: content.fromId,
      scopedTargets: [jinkEffectEvent.fromId!],
      cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
      conversation: TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', this.name).extract(),
    };

    room.notify(GameEventIdentifiers.AskForCardUseEvent, askForSlash, content.fromId);
    const response = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForCardUseEvent, content.fromId);
    if (response.cardId === undefined) {
      EventPacker.terminate(content);
      return false;
    }

    const slashEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId: response.fromId,
      cardId: response.cardId,
      toIds: [jinkEffectEvent.fromId!],
    };

    EventPacker.addMiddleware(
      {
        tag: this.name,
        data: slashEvent,
      },
      content,
    );

    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const slashEvent = EventPacker.getMiddleware<ServerEventFinder<GameEventIdentifiers.CardUseEvent>>(
      this.name,
      skillUseEvent,
    );
    if (!slashEvent) {
      return false;
    }

    await room.useCard(slashEvent);
    return true;
  }
}
