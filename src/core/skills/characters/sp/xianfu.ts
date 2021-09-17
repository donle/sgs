import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage, GameBeginStage, RecoverEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'xianfu', description: 'xianfu_description' })
export class XianFu extends TriggerSkill {
  public static readonly XianFuPlayer = 'xianfu_player';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>, stage?: AllStage): boolean {
    return stage === GameBeginStage.AfterGameBegan;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const others = room.getOtherPlayers(event.fromId).map(player => player.Id);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: others,
        toId: event.fromId,
        requiredAmount: 1,
        conversation: 'xianfu: please choose another player to be your ‘Xian Fu’ player',
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedPlayers = response.selectedPlayers || [others[Math.floor(Math.random() * others.length)]];

    room.getPlayerById(event.fromId).setFlag<PlayerId>(this.Name, response.selectedPlayers[0]);
    room.setFlag<boolean>(response.selectedPlayers[0], XianFu.XianFuPlayer, false, this.Name, [event.fromId]);

    return true;
  }
}

@ShadowSkill
@PersistentSkill({ stubbornSkill: true })
@CommonSkill({ name: XianFu.Name, description: XianFu.Description })
export class XianFuChained extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === RecoverEffectStage.AfterRecoverEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent>,
  ): boolean {
    return (
      !(
        EventPacker.getIdentifier(content) === GameEventIdentifiers.DamageEvent && room.getPlayerById(content.toId).Dead
      ) &&
      owner.getFlag<PlayerId>(this.GeneralName) === content.toId &&
      !(EventPacker.getIdentifier(content) === GameEventIdentifiers.RecoverEvent && owner.LostHp < 1)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (!room.getFlag<boolean>(unknownEvent.toId, XianFu.XianFuPlayer)) {
      room.removeFlag(unknownEvent.toId, XianFu.XianFuPlayer);
      room.setFlag<boolean>(unknownEvent.toId, XianFu.XianFuPlayer, true, this.GeneralName);
    }

    if (identifier === GameEventIdentifiers.DamageEvent) {
      await room.damage({
        toId: event.fromId,
        damage: (unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    } else {
      await room.recover({
        toId: event.fromId,
        recoveredHp: (unknownEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>).recoveredHp,
        recoverBy: event.fromId,
      });
    }

    return true;
  }
}
