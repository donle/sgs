import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerPhase, RecoverEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'liangzhu', description: 'liangzhu_description' })
export class LiangZhu extends TriggerSkill {
  private readonly LiangZhuOptions = ['liangzhu:you', 'luangzhu:opponent'];

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>, stage?: AllStage): boolean {
    return stage === RecoverEffectStage.AfterRecoverEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.RecoverEvent>): boolean {
    return (
      room.CurrentPhasePlayer &&
      room.CurrentPhasePlayer.Id === content.toId &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options: this.LiangZhuOptions,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose liangzhu options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(
            room.getPlayerById((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>).toId),
          ),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    if (response.selectedOption) {
      EventPacker.addMiddleware({ tag: this.Name, data: response.selectedOption }, event);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const chosen = EventPacker.getMiddleware<string>(this.Name, event);

    if (chosen === this.LiangZhuOptions[1]) {
      const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>).toId;
      await room.drawCards(2, toId, 'top', fromId, this.Name);

      const originalPlayers = room.getFlag<PlayerId[]>(fromId, this.Name) || [];
      originalPlayers.includes(toId) || originalPlayers.push(toId);
      room.getPlayerById(fromId).setFlag<PlayerId[]>(this.Name, originalPlayers);
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}
