import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'songsang', description: 'songsang_description' })
export class SongSang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return content.playerId !== owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    if (room.getPlayerById(fromId).LostHp > 0) {
      await room.recover({
        toId: fromId,
        recoveredHp: 1,
        recoverBy: fromId,
      });
    } else {
      await room.changeMaxHp(fromId, 1);
    }

    await room.obtainSkill(fromId, 'zhanji');

    return true;
  }
}
