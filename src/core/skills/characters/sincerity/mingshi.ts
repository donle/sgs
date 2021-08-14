import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'mingshi', description: 'mingshi_description' })
export class MingShi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.toId === owner.Id &&
      content.fromId !== undefined &&
      !room.getPlayerById(content.fromId).Dead &&
      room.getPlayerById(content.fromId).getPlayerCards().length > 0
    );
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const source = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;
    
    const sourceCards = room.getPlayerById(source).getPlayerCards();
    if (sourceCards.length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: source,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please drop a card',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        source,
        true,
      );

      response.selectedCards = response.selectedCards || sourceCards[Math.floor(Math.random() * sourceCards.length)];

      await room.dropCards(CardMoveReason.SelfDrop, response.selectedCards, source, source, this.Name);
    }

    return true;
  }
}
