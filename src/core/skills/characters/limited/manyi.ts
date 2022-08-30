import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'manyi', description: 'manyi_description' })
export class ManYi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage): boolean {
    return stage === CardEffectStage.PreCardEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>): boolean {
    return (
      event.toIds !== undefined &&
      event.toIds.includes(owner.Id) &&
      Sanguosha.getCardById(event.cardId).GeneralName === 'nanmanruqing'
    );
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const cardEffectEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, nullify {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
      TranslationPack.patchCardInTranslation(cardEffectEvent.cardId),
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardEffectEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    cardEffectEvent.nullifiedTargets?.push(event.fromId);

    return true;
  }
}
