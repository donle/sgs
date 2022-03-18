import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'weili', description: 'weili_description' })
export class WeiLi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      (owner.Hp > 0 || owner.getMark(MarkEnum.Orange) > 0)
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to gain 1 orange?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const options: string[] = [];
    room.getPlayerById(fromId).Hp > 0 && options.push('weili:loseHp');
    room.getMark(fromId, MarkEnum.Orange) > 0 && options.unshift('weili:loseOrange');

    if (options.length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose weili options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        }),
        fromId,
      );

      response.selectedOption = response.selectedOption || options[0];

      if (response.selectedOption === 'weili:loseOrange') {
        room.addMark(fromId, MarkEnum.Orange, -1);
      } else {
        await room.loseHp(fromId, 1);
      }

      room.addMark(toIds[0], MarkEnum.Orange, 1);
    }

    return true;
  }
}
