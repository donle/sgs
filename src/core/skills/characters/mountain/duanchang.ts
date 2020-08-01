import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'duanchang', description: 'duanchang_description' })
export class DuanChang extends TriggerSkill{
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage) {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>) {
    return content.killedBy !== undefined
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { killedBy } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>;
    const to = room.getPlayerById(killedBy!);
    const skills = to.getPlayerSkills()
    skills.forEach(skills=>{ 
      to.loseSkill(skills.GeneralName);}
    )
    room.setFlag<boolean>(killedBy!, this.GeneralName, true);
    return true;
  }
}
