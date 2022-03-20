import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pinghe', description: 'pinghe_description' })
export class PingHe extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage) {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return (
      !!content.fromId &&
      content.fromId !== owner.Id &&
      content.toId === owner.Id &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      owner.MaxHp > 1
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId } = event;
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    EventPacker.terminate(damageEvent);

    await room.changeMaxHp(fromId, -1);

    const hands = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea);
    if (hands.length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForSkillUseEvent>(
        GameEventIdentifiers.AskForSkillUseEvent,
        {
          invokeSkillNames: [PingHeSelect.Name],
          toId: fromId,
          conversation: 'pinghe: please give a handcard to another player',
        },
        fromId,
        true,
      );

      const others = room.getOtherPlayers(fromId);
      const cardIds = response.cardIds || [hands[Math.floor(Math.random() * hands.length)]];
      const toIds = response.toIds || [others[Math.floor(Math.random() * others.length)].Id];

      await room.moveCards({
        movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId,
        toId: toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
      });
    }

    if (damageEvent.fromId && !room.getPlayerById(damageEvent.fromId).Dead) {
      room.addMark(damageEvent.fromId, MarkEnum.PingDing, 1);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PingHe.GeneralName, description: PingHe.Description })
export class PingHeShadow extends RulesBreakerSkill {
  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.LostHp;
  }
}

@ShadowSkill
@CommonSkill({ name: 'shadow_pinghe', description: 'shadow_pinghe_description' })
export class PingHeSelect extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}
