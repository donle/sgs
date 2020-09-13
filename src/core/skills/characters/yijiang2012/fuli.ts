import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { DangXian } from './dangxian';

@LimitSkill({ name: 'fuli', description: 'fuli_description' })
export class FuLi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return content.dying === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const from = room.getPlayerById(skillUseEvent.fromId);
    from.setFlag<boolean>(DangXian.Name, true);
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    const drawAmount = nations.length - from.getCardIds(PlayerCardsArea.HandArea).length;
    if (drawAmount > 0) {
      await room.drawCards(drawAmount, from.Id, undefined, from.Id, this.Name);
    }

    await room.recover({
      recoveredHp: nations.length,
      recoverBy: from.Id,
      triggeredBySkills: [this.Name],
      toId: from.Id,
    });

    if (drawAmount < 3) {
      await room.turnOver(from.Id);
    }

    return true;
  }
}
