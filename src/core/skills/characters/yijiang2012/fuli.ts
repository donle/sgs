import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'fuli', description: 'fuli_description' })
export class FuLi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.RequestRescue;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return content.rescuer === owner.Id && content.dying === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const from = room.getPlayerById(skillUseEvent.fromId);
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    const recoverAmount = nations.length - from.Hp;
    if (recoverAmount > 0) {
      await room.recover({
        recoveredHp: recoverAmount,
        recoverBy: from.Id,
        triggeredBySkills: [this.Name],
        toId: from.Id,
      });
    }

    const strongest = room.getOtherPlayers(from.Id).find(player => player.Hp >= from.Hp);
    if (strongest === undefined) {
      await room.turnOver(from.Id);
    }

    return true;
  }
}
