import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qinglongyanyuedao', description: 'qinglongyanyuedao_description' })
export class QingLongYanYueDaoSkill extends TriggerSkill {
  isAutoTrigger() {
    return false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage) {
    return stage === CardEffectStage.CardEffectCancelledOut;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    return content.fromId === owner.Id && Sanguosha.getCardById(content.cardId).GeneralName === 'slash';
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const slashEffectEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;

    const askForSlash: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
      toId: slashEffectEvent.fromId!,
      scopedTargets: slashEffectEvent.toIds,
      extraUse: true,
      cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
      conversation: TranslationPack.translationJsonPatcher('please select to use a {0}', 'slash').extract(),
    };

    const response = await room.askForCardUse(askForSlash, slashEffectEvent.fromId!);
    if (response.responseEvent && response.responseEvent.cardId !== undefined) {
      const slashEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: response.responseEvent.fromId,
        cardId: response.responseEvent.cardId!,
        toIds: slashEffectEvent.toIds,
      };

      await room.useCard(slashEvent);
    } else {
      return true;
    }

    return true;
  }
}
