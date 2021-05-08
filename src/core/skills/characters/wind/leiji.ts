import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardResponseStage, CardUseStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
// import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
// import { Precondition } from 'core/shares/libs/precondition/precondition';

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

  isAutoTrigger() {
    return true;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.JudgeEvent>) {
    const judgeCard = Sanguosha.getCardById(content.judgeCardId);
    return owner.Id === content.toId && (judgeCard.Suit === CardSuit.Club || judgeCard.Suit === CardSuit.Spade);
  }

  // isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
  //   return owner !== target;
  // }

  // targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
  //   return targets.length === 1;
  // }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
    const judgeCard = Sanguosha.getCardById(judgeEvent.judgeCardId);
    const from = room.getPlayerById(skillUseEvent.fromId);

    if (judgeCard.Suit !== CardSuit.Spade && judgeCard.Suit !== CardSuit.Club) {
      return false;
    }

    const thunderDamageNum = judgeCard.Suit === CardSuit.Spade ? 2 : 1;
    const askForChoosePlayer: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: from.Id,
      players: room.AlivePlayers.filter(player => player.Id !== from.Id).map(player => player.Id),
      requiredAmount: 1,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose a target to deal {1} damage?',
        this.Name,
        thunderDamageNum,
      ).extract(),
      triggeredBySkills: [this.GeneralName],
    };

    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForChoosePlayer, from.Id);

    const resp = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingPlayerEvent, from.Id);

    if (resp.selectedPlayers !== undefined && resp.selectedPlayers[0] !== undefined) {
      await room.damage({
        fromId: from.Id,
        toId: resp.selectedPlayers[0],
        damage: thunderDamageNum,
        damageType: DamageType.Thunder,
        triggeredBySkills: [this.Name],
      });

      if (judgeCard.Suit === CardSuit.Club) {
        if (from.Hp < from.MaxHp) {
          await room.recover({ recoveredHp: 1, recoverBy: from.Id, toId: from.Id, triggeredBySkills: [this.Name] });
        }
      }
    }

    return true;
  }
}
