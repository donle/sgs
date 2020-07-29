import { CharacterId } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { HuaShen } from './huashen';

@CommonSkill({ name: 'xinsheng', description: 'xinsheng_description' })
export class XinSheng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return event.toId === owner.Id;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): number {
    return event.damage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const huashenCards = room
      .getPlayerById(skillEffectEvent.fromId)
      .getCardIds<CharacterId>(PlayerCardsArea.OutsideArea, HuaShen.GeneralName);
    const huashen = room.getRandomCharactersFromLoadedPackage(1, huashenCards);
    room.setCharacterOutsideAreaCards(skillEffectEvent.fromId, HuaShen.GeneralName, [...huashenCards, ...huashen]);

    return true;
  }
}
