import { CharacterNationality } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, LordSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LordSkill
@CommonSkill({ name: 'baonve', description: 'baonve_description' })
export class BaoNve extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    const { fromId } = event;
    if (fromId === undefined || room.getPlayerById(fromId).Dead) {
      return false;
    }

    return owner.Id !== fromId && room.getPlayerById(fromId).Nationality === CharacterNationality.Qun;
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    content.translationsMessage = undefined;

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    if (fromId === undefined) {
      return false;
    }

    const askForInvokeSkill: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      toId: fromId,
      options: ['yes', 'no'],
      conversation: TranslationPack.translationJsonPatcher(
        'do you want to trigger skill {0} from {1} ?',
        this.Name,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      ).extract(),
    };

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForInvokeSkill, fromId);
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      fromId,
    );

    if (selectedOption === 'yes') {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} used skill {1}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          this.Name,
        ).extract(),
      });

      const judge = await room.judge(event.fromId, undefined, this.Name, JudgeMatcherEnum.BaoNve);

      if (JudgeMatcher.onJudge(judge.judgeMatcherEnum!, Sanguosha.getCardById(judge.judgeCardId))) {
        await room.recover({
          toId: event.fromId,
          recoveredHp: 1,
          recoverBy: event.fromId,
        });

        await room.moveCards({
          movingCards: [{ card: judge.judgeCardId, fromArea: CardMoveArea.ProcessingArea }],
          toArea: CardMoveArea.HandArea,
          toId: event.fromId,
          moveReason: CardMoveReason.ActivePrey,
          movedByReason: this.Name,
          proposer: event.fromId,
        });
      }
    }

    return true;
  }
}
