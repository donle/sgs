import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardResponseStage, CardUseStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'leiji', description: 'leiji_description' })
export class LeiJi extends TriggerSkill {
  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ) {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ) {
    const card = Sanguosha.getCardById(content.cardId);
    return owner.Id === content.fromId && (card.GeneralName === 'jink' || card.GeneralName === 'lightning');
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.judge(skillUseEvent.fromId, undefined, this.Name);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LeiJi.Name, description: LeiJi.Description })
export class LeiJiShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.AfterJudgeEffect && Sanguosha.getCardById(event.judgeCardId).isBlack();
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.JudgeEvent>) {
    return owner.Id === content.toId;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const target = skillUseEvent.toIds![0];
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1} to {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(target)),
    ).extract();
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
    const judgeCard = Sanguosha.getCardById(judgeEvent.judgeCardId);
    const from = room.getPlayerById(skillUseEvent.fromId);
    const target = skillUseEvent.toIds![0];

    if (judgeCard.Suit === CardSuit.Club) {
      if (from.Hp < from.MaxHp) {
        await room.recover({ recoveredHp: 1, recoverBy: from.Id, toId: from.Id, triggeredBySkills: [this.Name] });
      }

      await room.damage({
        fromId: from.Id,
        toId: target,
        damage: 1,
        damageType: DamageType.Thunder,
        triggeredBySkills: [this.Name],
      });
    } else if (judgeCard.Suit === CardSuit.Spade) {
      await room.damage({
        fromId: from.Id,
        toId: target,
        damage: 2,
        damageType: DamageType.Thunder,
        triggeredBySkills: [this.Name],
      });
    }
    return true;
  }
}
