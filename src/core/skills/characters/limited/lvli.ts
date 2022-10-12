import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'lvli', description: 'lvli_description' })
export class LvLi extends TriggerSkill {
  protected readonly LvLiNames = ['lvli', 'lvli_I', 'lvli_II', 'lvli_EX'];

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      !this.LvLiNames.find(name => owner.hasUsedSkill(name)) &&
      (owner.getCardIds(PlayerCardsArea.HandArea).length < owner.Hp ||
        (owner.getCardIds(PlayerCardsArea.HandArea).length > owner.Hp && owner.LostHp > 0))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const diff =
      room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length -
      room.getPlayerById(event.fromId).Hp;
    if (diff > 0) {
      await room.recover({
        toId: event.fromId,
        recoveredHp: diff,
        recoverBy: event.fromId,
        triggeredBySkills: [this.Name],
      });
    } else {
      await room.drawCards(-diff, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}

@CommonSkill({ name: 'lvli_I', description: 'lvli_I_description' })
export class LvLiI extends LvLi {
  public get GeneralName(): string {
    return LvLi.Name;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      (room.CurrentPlayer === owner
        ? this.LvLiNames.reduce<number>((sum, name) => sum + owner.hasUsedSkillTimes(name), 0) < 2
        : !this.LvLiNames.find(name => owner.hasUsedSkill(name))) &&
      (owner.getCardIds(PlayerCardsArea.HandArea).length < owner.Hp ||
        (owner.getCardIds(PlayerCardsArea.HandArea).length > owner.Hp && owner.LostHp > 0))
    );
  }
}

@CommonSkill({ name: 'lvli_II', description: 'lvli_II_description' })
export class LvLiII extends LvLi {
  public get GeneralName(): string {
    return LvLi.Name;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      ((stage === DamageEffectStage.AfterDamageEffect && content.fromId === owner.Id) ||
        (stage === DamageEffectStage.AfterDamagedEffect && content.toId === owner.Id)) &&
      !this.LvLiNames.find(name => owner.hasUsedSkill(name)) &&
      (owner.getCardIds(PlayerCardsArea.HandArea).length < owner.Hp ||
        (owner.getCardIds(PlayerCardsArea.HandArea).length > owner.Hp && owner.LostHp > 0))
    );
  }
}

@CommonSkill({ name: 'lvli_EX', description: 'lvli_EX_description' })
export class LvLiEX extends LvLi {
  public get GeneralName(): string {
    return LvLi.Name;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      ((stage === DamageEffectStage.AfterDamageEffect && content.fromId === owner.Id) ||
        (stage === DamageEffectStage.AfterDamagedEffect && content.toId === owner.Id)) &&
      (room.CurrentPlayer === owner
        ? this.LvLiNames.reduce<number>((sum, name) => sum + owner.hasUsedSkillTimes(name), 0) < 2
        : !this.LvLiNames.find(name => owner.hasUsedSkill(name))) &&
      (owner.getCardIds(PlayerCardsArea.HandArea).length < owner.Hp ||
        (owner.getCardIds(PlayerCardsArea.HandArea).length > owner.Hp && owner.LostHp > 0))
    );
  }
}
