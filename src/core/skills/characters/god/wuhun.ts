import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'wuhun', description: 'wuhun_description' })
export class WuHun extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return owner.Id === content.toId && !!content.fromId && !room.getPlayerById(content.fromId).Dead;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): number {
    return event.damage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    room.addMark(damageEvent.fromId!, MarkEnum.Nightmare, 1);
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: WuHun.Name, description: WuHun.Description })
export class WuHunDeath extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }
  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return owner.Id === content.playerId && !!content.killedBy;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    const alivePlayers = room.getAlivePlayersFrom();
    let maxMarkNum = 0;
    for (const player of alivePlayers) {
      if (player.getMark(MarkEnum.Nightmare) > maxMarkNum) {
        maxMarkNum = player.getMark(MarkEnum.Nightmare);
      }
    }

    const revengeList: Player[] = [];
    for (const player of alivePlayers) {
      if (player.getMark(MarkEnum.Nightmare) === maxMarkNum) {
        revengeList.push(player);
      }
      if (player.getMark(MarkEnum.Nightmare) > 0) {
        room.removeMark(player.Id, MarkEnum.Nightmare);
      }
    }

    let sacrificer: Player;
    if (revengeList.length === 1) {
      sacrificer = revengeList[0];
    } else if (revengeList.length > 1) {
      const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        players: revengeList.map(player => player.Id),
        toId: owner.Id,
        requiredAmount: 1,
        conversation: 'wuhun:Please choose a target to die with you',
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(choosePlayerEvent),
        owner.Id,
      );

      const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        owner.Id,
      );

      sacrificer = room.getPlayerById(choosePlayerResponse.selectedPlayers![0]);
    } else {
      return false;
    }

    const judge = await room.judge(sacrificer.Id, undefined, this.GeneralName, JudgeMatcherEnum.WuHun);
    const judgeCard = Sanguosha.getCardById(judge.judgeCardId);
    if (JudgeMatcher.onJudge(judge.judgeMatcherEnum!, judgeCard)) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} use skill {1}, bring {2} to hell',
          TranslationPack.patchPlayerInTranslation(owner),
          this.GeneralName,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(sacrificer.Id)),
        ).extract(),
      });

      await room.kill(sacrificer, owner.Id);
    }
    return true;
  }
}
