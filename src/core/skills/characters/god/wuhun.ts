import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'wuhun', description: 'wuhun_description' })
export class WuHun extends TriggerSkill {
  public static readonly Nightmare: string = 'Nightmare';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return owner.Id === content.toId && !!content.fromId && !room.getPlayerById(content.fromId).Dead;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): number {
    return event.damage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    room.addMark(damageEvent.fromId!, WuHun.Nightmare, 1);
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: WuHun.Name, description: WuHun.Description })
export class WuHunDied extends TriggerSkill implements OnDefineReleaseTiming {
  public onDeath(room: Room): boolean {
    return room.CurrentProcessingStage === PlayerDiedStage.PlayerDied;
  }

  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const alivePlayers = room.getAlivePlayersFrom();
    let maxMarkNum = 0;
    const revengeList: Player[] = [];
    for (const player of alivePlayers) {
      const markNum = player.getMark(WuHun.Nightmare);
      room.removeMark(player.Id, WuHun.Nightmare);
      if (!markNum || markNum < maxMarkNum) {
        continue;
      }

      if (maxMarkNum && markNum > maxMarkNum) {
        maxMarkNum = markNum;
        revengeList.length = 0;
      }

      revengeList.push(player);
    }

    let sacrificer: Player;
    if (revengeList.length === 1) {
      sacrificer = revengeList[0];
    } else if (revengeList.length > 1) {
      const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        players: revengeList.map(player => player.Id),
        toId: skillUseEvent.fromId,
        requiredAmount: 1,
        conversation: 'wuhun:Please choose a target to die with you',
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(choosePlayerEvent),
        skillUseEvent.fromId,
      );

      const choosePlayerResponse = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        skillUseEvent.fromId,
      );

      sacrificer = room.getPlayerById(choosePlayerResponse.selectedPlayers![0]);
    } else {
      return false;
    }

    const judge = await room.judge(sacrificer.Id, undefined, this.GeneralName);
    const judgeCard = Sanguosha.getCardById(judge.judgeCardId);
    if (judgeCard.GeneralName !== 'peach' && judgeCard.GeneralName !== 'taoyuanjieyi') {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher('wuhunkill').extract(),
      });

      await room.kill(sacrificer, skillUseEvent.fromId);
    }

    return true;
  }
}
