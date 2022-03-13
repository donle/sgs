import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, DamageEffectStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'powei', description: 'powei_description' })
export class PoWei extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['shenzhuo'];
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PlayerDyingEvent
    >,
    stage?: AllStage,
  ): boolean {
    return (
      stage === DamageEffectStage.DamageEffect ||
      stage === CardUseStage.CardUseFinishedEffect ||
      stage === PlayerDyingStage.PlayerDying
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PlayerDyingEvent
    >,
  ): boolean {
    if (owner.getFlag<boolean>(this.Name) !== undefined) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.fromId === owner.Id &&
        room.getPlayerById(damageEvent.toId).getMark(MarkEnum.Wei) > 0 &&
        damageEvent.cardIds !== undefined &&
        Sanguosha.getCardById(damageEvent.cardIds[0]).GeneralName === 'slash'
      );
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash' &&
        room.getAlivePlayersFrom().find(player => player.getMark(MarkEnum.Wei) > 0) === undefined
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      const playerDyingEvent = content as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;
      return playerDyingEvent.dying === owner.Id && owner.Hp < 1;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PlayerDyingEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      room.addMark(damageEvent.toId, MarkEnum.Wei, -1);
      damageEvent.damage = 0;
      EventPacker.terminate(damageEvent);
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      room.setFlag<boolean>(fromId, this.Name, true, 'powei:succeeded');
      await room.obtainSkill(fromId, 'shenzhuo');
    } else {
      room.setFlag<boolean>(fromId, this.Name, false, 'powei:failed');
      const equips = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.EquipArea);
      equips.length > 0 && (await room.dropCards(CardMoveReason.SelfDrop, equips, fromId, fromId, this.Name));
      await room.recover({
        toId: fromId,
        recoveredHp: 1 - room.getPlayerById(fromId).Hp,
        recoverBy: fromId,
      });
    }

    return true;
  }
}
