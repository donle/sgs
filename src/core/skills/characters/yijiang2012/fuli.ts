import { CharacterNationality } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'fuli', description: 'fuli_description' })
export class FuLi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>, stage?: AllStage): boolean {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForPeachEvent;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>): boolean {
    return content.fromId === owner.Id && content.toId === owner.Id;
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
