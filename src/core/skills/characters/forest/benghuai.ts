import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { JiuChi } from './jiuchi';

@CompulsorySkill({ name: 'benghuai', description: 'benghuai_description' })
export class BengHuai extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage): boolean {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id === event.playerId &&
      PlayerPhaseStages.FinishStageStart === event.toStage &&
      room.getFlag<boolean>(owner.Id, JiuChi.Used) !== true &&
      !room.getOtherPlayers(owner.Id).every(player => owner.Hp <= player.Hp)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const options: string[] = ['benghuai:maxhp'];

    if (from.Hp > 0) {
      options.unshift('benghuai:hp');
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher('{0}: please choose', this.Name).extract(),
      toId: fromId,
    });

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, fromId);

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);

    response.selectedOption = response.selectedOption || options[0];
    if (response.selectedOption === 'benghuai:hp') {
      await room.loseHp(fromId, 1);
    } else {
      await room.changeMaxHp(fromId, -1);
    }

    return true;
  }
}
