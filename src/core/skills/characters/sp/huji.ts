import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Slash } from 'core/cards/standard/slash';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { OffenseHorseSkill } from 'core/skills/cards/standard/offense_horse';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'huji', description: 'huji_description' })
export class HuJi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return owner.Id === content.toId && room.CurrentPlayer !== owner;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const judge = await room.judge(fromId, undefined, this.Name, JudgeMatcherEnum.HuJi);

    const sourceId = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId;
    const source = sourceId && room.getPlayerById(sourceId);
    if (!source || source.Dead) {
      return false;
    }

    if (JudgeMatcher.onJudge(judge.judgeMatcherEnum!, Sanguosha.getCardById(judge.judgeCardId))) {
      room.getPlayerById(fromId).canUseCardTo(room, new CardMatcher({ name: ['slash'] }), sourceId!) &&
        (await room.useCard({
          fromId,
          targetGroup: [[sourceId!]],
          cardId: VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.Name }).Id,
          triggeredBySkills: [this.Name],
        }));
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: HuJi.Name, description: HuJi.Description })
export class HuJiShadow extends OffenseHorseSkill {}
