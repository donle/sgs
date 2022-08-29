import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'wanggui', description: 'wanggui_description' })
export class WangGui extends TriggerSkill {
  private readonly WangGuiStage = 'wanggui_stage';

  public isAutoTrigger(): boolean {
    return true;
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
    const canUse =
      stage === DamageEffectStage.AfterDamageEffect
        ? content.fromId === owner.Id && !owner.getFlag<boolean>(this.Name)
        : content.toId === owner.Id;

    if (canUse) {
      owner.setFlag<AllStage>(this.WangGuiStage, stage!);
    }

    return canUse;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    let targets: PlayerId[] = [];
    let conversation =
      'wangggui: do you want to choose a player with the different nationality from you to deal 1 damage?';
    if (room.getFlag<AllStage>(event.fromId, this.WangGuiStage) === DamageEffectStage.AfterDamageEffect) {
      targets = room
        .getOtherPlayers(event.fromId)
        .filter(player => player.Nationality !== room.getPlayerById(event.fromId).Nationality)
        .map(player => player.Id);
    } else {
      targets = room.AlivePlayers.filter(
        player => player.Nationality === room.getPlayerById(event.fromId).Nationality,
      ).map(player => player.Id);

      conversation =
        'wanggui: do you want to choose a player with the same nationality with you to let he/she draw a card?';
    }

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: targets,
        toId: event.fromId,
        requiredAmount: 1,
        conversation,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    if (response.selectedPlayers && response.selectedPlayers.length > 0) {
      event.toIds = response.selectedPlayers;
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    if (room.getFlag<AllStage>(event.fromId, this.WangGuiStage) === DamageEffectStage.AfterDamageEffect) {
      room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);

      await room.damage({
        fromId: event.fromId,
        toId: event.toIds[0],
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    } else {
      await room.drawCards(1, event.toIds[0], 'top', event.fromId, this.Name);
      event.toIds[0] !== event.fromId && (await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WangGui.Name, description: WangGui.Description })
export class WangGuiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(this.GeneralName) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
