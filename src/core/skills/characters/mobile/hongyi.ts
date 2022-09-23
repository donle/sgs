import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'hongyi', description: 'hongyi_description' })
export class HongYi extends ActiveSkill {
  public static readonly Targets = 'hongyi_targets';

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const originalTargets = room.getFlag<PlayerId[]>(event.fromId, HongYi.Targets) || [];
    originalTargets.push(event.toIds[0]);
    room.setFlag<PlayerId[]>(event.fromId, HongYi.Targets, originalTargets);

    room.getFlag<boolean>(event.toIds[0], this.Name) ||
      room.setFlag<boolean>(event.toIds[0], this.Name, true, this.Name);
    room.getPlayerById(event.toIds[0]).hasShadowSkill(HongYiDebuff.Name) ||
      (await room.obtainSkill(event.toIds[0], HongYiDebuff.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: HongYi.Name, description: HongYi.Description })
export class HongYiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayer === room.getPlayerById(owner) &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  private async removeDebuff(room: Room, player: Player) {
    const targets = player.getFlag<PlayerId[]>(HongYi.Targets) || [];
    if (targets.length > 0) {
      for (const target of targets) {
        await room.loseSkill(target, HongYiDebuff.Name);
      }
    }

    player.removeFlag(HongYi.Targets);
  }

  public async whenDead(room: Room, player: Player) {
    await this.removeDebuff(room, player);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === content.toPlayer &&
      content.to === PlayerPhase.PhaseBegin &&
      owner.getFlag<PlayerId[]>(HongYi.Targets) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const from = room.getPlayerById(event.fromId);
    await this.removeDebuff(room, from);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_hongyi_debuff', description: 's_hongyi_debuff_description' })
export class HongYiDebuff extends TriggerSkill implements OnDefineReleaseTiming {
  public isAutoTrigger(): boolean {
    return true;
  }

  public async whenLosingSkill(room: Room, owner: Player) {
    owner.getFlag<boolean>(HongYi.Name) && room.removeFlag(owner.Id, HongYi.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return content.fromId === owner.Id && owner.getFlag<boolean>(HongYi.Name);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const judgeEvent = await room.judge(event.fromId, undefined, HongYi.Name);
    if (Sanguosha.getCardById(judgeEvent.judgeCardId).isRed()) {
      const victim = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId;
      room.getPlayerById(victim).Dead || (await room.drawCards(1, victim, 'top', event.fromId, HongYi.Name));
    } else if (Sanguosha.getCardById(judgeEvent.judgeCardId).isBlack()) {
      const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage -= 1;
      damageEvent.damage < 1 && EventPacker.terminate(damageEvent);
    }

    return true;
  }
}
