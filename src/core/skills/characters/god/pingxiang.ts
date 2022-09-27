import { VirtualCard } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, RulesBreakerSkill, ShadowSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'pingxiang', description: 'pingxiang_description' })
export class PingXiang extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return (
      room.CurrentPhasePlayer === owner && room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && owner.MaxHp > 9
    );
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.changeMaxHp(skillUseEvent.fromId, -9);
    const from = room.getPlayerById(skillUseEvent.fromId);
    let slashCount = 9;
    const virtualFireSlash = VirtualCard.create({ cardName: 'fire_slash', bySkill: this.Name });
    while (slashCount-- > 0) {
      const availableTargets = room
        .getOtherPlayers(skillUseEvent.fromId)
        .filter(player => room.canAttack(from, player, virtualFireSlash.Id) && room.withinAttackDistance(from, player));

      if (availableTargets.length === 0) {
        break;
      }

      const response = await room.doAskForCommonly(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          toId: skillUseEvent.fromId,
          players: availableTargets.map(player => player.Id),
          requiredAmount: 1,
          conversation: 'please choose one target to use fire slash',
        },
        skillUseEvent.fromId,
      );

      const { selectedPlayers } = response;
      if (!selectedPlayers) {
        break;
      }

      await room.useCard({
        fromId: skillUseEvent.fromId,
        cardId: virtualFireSlash.Id,
        targetGroup: [selectedPlayers],
        triggeredBySkills: [this.Name],
        extraUse: true,
      });
    }

    await room.loseSkill(skillUseEvent.fromId, 'jiufa', true);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PingXiang.GeneralName, description: PingXiang.Description })
export class PingXiangShadow extends RulesBreakerSkill {
  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.hasUsed(PingXiang.Name) ? owner.MaxHp : -1;
  }
}
