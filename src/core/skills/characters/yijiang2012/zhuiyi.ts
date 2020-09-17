import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDiedStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhuiyi', description: 'zhuiyi_description' })
export class ZhuiYi extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
  ): boolean {
    return content.playerId === owner.Id;
  }

  public async beforeUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const playerDiedEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>;

    const players = room.getAlivePlayersFrom()
      .filter(player => player.Id !== playerDiedEvent.killedBy)
      .map(player => player.Id);

    if (players.length < 1) {
      return false;
    }

    const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: fromId,
      players,
      requiredAmount: 1,
      conversation: playerDiedEvent.killedBy
        ? TranslationPack.translationJsonPatcher(
            '{0}: please choose a target except {1} to draw 3 cards and recover 1 hp',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(playerDiedEvent.killedBy)),
          ).extract()
        : TranslationPack.translationJsonPatcher(
            '{0}: please choose a target to draw 3 cards and recover 1 hp',
            this.Name,
          ).extract(),
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      askForPlayerChoose,
      fromId,
    );

    const resp = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingPlayerEvent, fromId);
    if (!resp.selectedPlayers) {
      return false;
    }

    event.toIds = resp.selectedPlayers;

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = event;

    await room.drawCards(3, toIds![0], 'top', fromId, this.Name);
    await room.recover({
      toId: toIds![0],
      recoveredHp: 1,
      recoverBy: fromId,
    });

    return true;
  }
}
