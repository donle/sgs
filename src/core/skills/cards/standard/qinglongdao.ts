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
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage) {
    return stage === CardEffectStage.CardEffectCancelledOut;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    return content.fromId === owner.Id && Sanguosha.getCardById(content.cardId).GeneralName === 'slash';
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    content.translationsMessage = undefined;
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const slashEffectEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    const from = room.getPlayerById(skillUseEvent.fromId);
    const askForSlash: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
      toId: slashEffectEvent.fromId!,
      scopedTargets: slashEffectEvent.toIds,
      extraUse: true,
      cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
      conversation: TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', this.Name).extract(),
    };

    const response = await room.askForCardUse(askForSlash, slashEffectEvent.fromId!);
    if (response.cardId !== undefined) {
      const slashEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: response.fromId,
        cardId: response.cardId,
        toIds: slashEffectEvent.toIds,
        extraUse: true,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} used skill {1}',
          TranslationPack.patchPlayerInTranslation(from),
          this.Name,
        ).extract(),
      };

      await room.useCard(slashEvent, true);
    }

    return response.cardId !== undefined;
  }
}
