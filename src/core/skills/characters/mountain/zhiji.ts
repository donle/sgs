import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@AwakeningSkill({ name: 'zhiji', description: 'zhiji_description' })
export class ZhiJi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id && owner.getCardIds(PlayerCardsArea.HandArea).length <= 0;
  }

  public async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillEffectEvent;
    const from = room.getPlayerById(fromId);

    await room.changeMaxHp(fromId, -1);

    if (from.Hp >= from.MaxHp) {
      await room.drawCards(2, fromId, undefined, fromId, this.Name);
    } else {
      const askForChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        toId: fromId,
        options: ['zhiji:drawcards', 'zhiji:recover'],
        conversation: TranslationPack.translationJsonPatcher('{0}: please choose', this.Name).extract(),
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoose),
        fromId,
      );

      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        fromId,
      );

      if (selectedOption === undefined || selectedOption === 'zhiji:drawcards') {
        await room.drawCards(2, fromId, undefined, fromId, this.Name);
      } else {
        await room.recover({
          toId: fromId,
          recoveredHp: 1,
          recoverBy: fromId,
          triggeredBySkills: [this.Name],
        });
      }
    }

    await room.obtainSkill(fromId, 'guanxing', true);

    return true;
  }
}
