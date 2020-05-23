import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'buqu', description: 'buqu_description' })
export class BuQu extends TriggerSkill {
  public static readonly buquPile: string = 'Chuang';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>, stage?: AllStage): boolean {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForPeachEvent;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>): boolean {
    return !room.getFlag(owner.Id, this.GeneralName) && content.fromId === owner.Id && content.toId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const event = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>;
    const from = room.getPlayerById(skillUseEvent.fromId);
    const chuang = room.getCards(1, 'top');
    const chuangCards = from
      .getCardIds(PlayerCardsArea.OutsideArea, BuQu.buquPile)
      .map(id => Sanguosha.getCardById(id).CardNumber);
    const overload = !!chuang.find(id => chuangCards.includes(Sanguosha.getCardById(id).CardNumber));

    await room.moveCards({
      movingCards: chuang.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
      toId: overload ? undefined : skillUseEvent.fromId,
      toArea: overload ? CardMoveArea.DropStack : PlayerCardsArea.OutsideArea,
      moveReason: overload ? CardMoveReason.PlaceToDropStack : CardMoveReason.ActiveMove,
      toOutsideArea: BuQu.buquPile,
      proposer: skillUseEvent.fromId,
      movedByReason: this.Name,
    });

    if (!overload) {
      await room.recover({
        recoveredHp: 1 - from.Hp,
        recoverBy: skillUseEvent.fromId,
        toId: skillUseEvent.fromId,
      });

      EventPacker.terminate(event);
    }

    room.setFlag(skillUseEvent.fromId, this.GeneralName, true);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: BuQu.GeneralName, description: BuQu.Description })
export class BuQuShadow extends RulesBreakerSkill {
  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.getCardIds(PlayerCardsArea.OutsideArea, BuQu.buquPile).length;
  }
}

@ShadowSkill
@CompulsorySkill({ name: '#' + BuQu.GeneralName, description: BuQu.Description })
export class BuQuClear extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.AfterPlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return !!room.getFlag(owner.Id, this.GeneralName) && content.dying === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    room.removeFlag(skillUseEvent.fromId, this.GeneralName);
    return true;
  }
}
