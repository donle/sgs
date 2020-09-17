import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AwakeningSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { PaiYi } from './paiyi';
import { QuanJi } from './quanji';

@AwakeningSkill({ name: 'zili', description: 'zili_description' })
export class ZiLi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && owner.getCardIds(PlayerCardsArea.OutsideArea, QuanJi.Name).length > 2;
  }

  public async onTrigger(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    await room.changeMaxHp(fromId, -1);

    if (from.Hp >= from.MaxHp) {
      await room.drawCards(2, fromId, undefined, fromId, this.Name);
    } else {
      const askForChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        toId: fromId,
        options: ['zili:drawcards', 'zili:recover'],
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

      if (selectedOption === undefined || selectedOption === 'zili:drawcards') {
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

    await room.obtainSkill(event.fromId, PaiYi.Name, true);

    return true;
  }
}
