import { CardMoveArea, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'guzheng', description: 'guzheng_description' })
export class GuZheng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event => {
        return (
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          event.toArea === CardMoveArea.DropStack &&
          event.fromId === room.CurrentPlayer.Id
        )
      },
      content.playerId,
      true,
      [PlayerPhase.DropCardStage],
    );
    return content.playerId !== owner.Id;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const erzhang = room.getPlayerById(fromId);
    return true;
  }
}
