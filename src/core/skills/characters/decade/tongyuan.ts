import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, RecoverEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { CuiJian, CuiJianEX, CuiJianI, CuiJianII } from './cuijian';

@CompulsorySkill({ name: 'tongyuan', description: 'tongyuan_description' })
export class TongYuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPlayer !== owner &&
      !(owner.hasSkill(CuiJianEX.Name) && (owner.getFlag<number[]>(this.Name) || []).length < 2) &&
      ((Sanguosha.getCardById(content.cardId).GeneralName === 'wuxiekeji' && !owner.hasSkill(CuiJianI.Name)) ||
        (Sanguosha.getCardById(content.cardId).GeneralName === 'peach' && !owner.hasSkill(CuiJianII.Name)))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardName = Sanguosha.getCardById(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
    ).GeneralName;
    const from = room.getPlayerById(event.fromId);

    from.hasSkill(CuiJianI.Name) && (await room.updateSkill(event.fromId, CuiJianI.Name, CuiJianEX.Name));
    from.hasSkill(CuiJianII.Name) && (await room.updateSkill(event.fromId, CuiJianII.Name, CuiJianEX.Name));
    from.hasSkill(CuiJian.Name) &&
      (await room.updateSkill(event.fromId, CuiJian.Name, cardName === 'wuxiekeji' ? CuiJianI.Name : CuiJianII.Name));

    const flagNumber = cardName === 'wuxiekeji' ? 1 : 2;
    const flags = from.getFlag<number[]>(this.Name) || [];
    flags.includes(flagNumber) || flags.push(flagNumber);
    from.setFlag<number[]>(this.Name, flags);

    if (flags.length > 1 && !from.hasShadowSkill(TongYuanBuff.Name)) {
      await room.obtainSkill(event.fromId, TongYuanBuff.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill({ stubbornSkill: true })
@CommonSkill({ name: 's_tongyuan_buff', description: 's_tongyuan_buff_description' })
export class TongYuanBuff extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === RecoverEffectStage.BeforeRecoverEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.RecoverEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return cardUseEvent.fromId === owner.Id && Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'wuxiekeji';
    } else if (identifier === GameEventIdentifiers.RecoverEvent) {
      const recoverEvent = content as ServerEventFinder<GameEventIdentifiers.RecoverEvent>;
      return (
        recoverEvent.recoverBy === owner.Id &&
        recoverEvent.cardIds !== undefined &&
        Sanguosha.getCardById(recoverEvent.cardIds[0]).GeneralName === 'peach'
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.RecoverEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.CardUseEvent) {
      EventPacker.setUnoffsetableEvent(unknownEvent);
    } else {
      (unknownEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>).recoveredHp++;
    }

    return true;
  }
}
