import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, AskForQueryStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class JinkSkill extends ResponsiveSkill {
  constructor() {
    super('jink', 'jink_skill_description');
  }

  isAutoTrigger() {
    return false;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      | GameEventIdentifiers.AskForCardResponseEvent
      | GameEventIdentifiers.AskForCardUseEvent
    >,
  ) {
    const { carMatcher } = content;
    return CardMatcher.match(carMatcher, {
      name: ['jink'],
    });
  }

  isTriggerable(stage: AskForQueryStage): boolean {
    return (
      stage === AskForQueryStage.AskForCardUseStage ||
      stage === AskForQueryStage.AskForCardResponseStage
    );
  }

  async onTrigger(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {1}',
      Sanguosha.getCardById(event.fromId).Name,
      this.name,
    );

    return true;
  }

  async onEffect() {
    return true;
  }
}
