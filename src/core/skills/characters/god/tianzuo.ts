import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage, GameBeginStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'tianzuo', description: 'tianzuo_description' })
export class TianZuo extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>, stage?: AllStage) {
    return stage === GameBeginStage.AfterGameBegan;
  }

  isAutoTrigger() {
    return true;
  }

  canUse() {
    return true;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.messages = skillUseEvent.messages || [];
    skillUseEvent.messages.push(
      TranslationPack.translationJsonPatcher(
        '{0} shuffled 8 {1} cards into the draw stack',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
        'qizhengxiangsheng',
      ).toString(),
    );
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardIds = Sanguosha.getSkillGeneratedCards(this.Name).map(card => card.Id);
    room.shuffleCardsIntoDrawStack(cardIds);
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: TianZuo.Name, description: TianZuo.Description })
export class TianZuoShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage): boolean {
    return stage === CardEffectStage.PreCardEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    return (
      content.toIds !== undefined &&
      content.toIds.includes(owner.Id) &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'qizhengxiangsheng'
    );
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const cardEffectEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, nullify {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
      TranslationPack.patchCardInTranslation(cardEffectEvent.cardId),
    ).extract();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardEffectEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    cardEffectEvent.nullifiedTargets?.push(event.fromId);

    return true;
  }
}
