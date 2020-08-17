import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, LordSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LordSkill
@CommonSkill({ name: 'songwei', description: 'songwei_description' })
export class SongWei extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.AfterJudgeEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.JudgeEvent>) {
    const to = room.getPlayerById(content.toId);
    return (
      owner.Id !== content.toId &&
      to.Nationality === CharacterNationality.Wei &&
      Sanguosha.getCardById(content.judgeCardId).isBlack()
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;

    const askForInvokeSkill: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      toId: judgeEvent.toId,
      options: ['yes', 'no'],
      conversation: TranslationPack.translationJsonPatcher(
        'do you want to trigger skill {0} from {1} ?',
        this.GeneralName,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      ).extract(),
    };

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForInvokeSkill, judgeEvent.toId);
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      judgeEvent.toId,
    );

    if (selectedOption === 'yes') {
      await room.drawCards(1, skillUseEvent.fromId, undefined, skillUseEvent.fromId, this.Name);
    }

    return true;
  }
}
