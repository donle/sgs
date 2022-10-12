import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { YingHun } from '../forest/yinghun';
import { HunZi } from '../mountain/hunzi';
import { YingZi } from '../standard/yingzi';

@LimitSkill({ name: 'xiongyi', description: 'xiongyi_description' })
export class XiongYi extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return [HunZi.Name, YingHun.Name, YingZi.Name];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.RequestRescue;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return content.dying === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!room.Players.find(player => player.Character.Name === 'xushi')) {
      await room.recover({
        toId: event.fromId,
        recoveredHp: 3 - room.getPlayerById(event.fromId).Hp,
        recoverBy: event.fromId,
      });

      await room.changeGeneral({
        changedProperties: [
          {
            toId: event.fromId,
            characterId: Sanguosha.getCharacterByCharaterName('xushi').Id,
            maxHp: room.getPlayerById(event.fromId).MaxHp,
            hp: room.getPlayerById(event.fromId).Hp,
          },
        ],
      });
    } else {
      await room.recover({
        toId: event.fromId,
        recoveredHp: 1 - room.getPlayerById(event.fromId).Hp,
        recoverBy: event.fromId,
      });

      await room.obtainSkill(event.fromId, HunZi.Name);
    }

    return true;
  }
}
