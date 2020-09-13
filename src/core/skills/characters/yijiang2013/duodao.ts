import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
<<<<<<< HEAD
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
=======
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
>>>>>>> 0f6d464... mazhong
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
<<<<<<< HEAD
@CommonSkill({ name: 'duodao', description: 'duodao_description' })
export class DuoDao extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAim;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    const damageFrom = content.fromId !== undefined && room.getPlayerById(content.fromId);
    return (
      owner.Id !== content.fromId &&
      damageFrom &&
      !damageFrom.Dead &&
      damageFrom.getEquipment(CardType.Weapon) !== undefined &&
      owner.getPlayerCards().length > 0 &&
      content.byCardId !== undefined &&
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash'
=======

@CommonSkill({ name: 'duodao', description: 'duoda_description' })
export class DuoDao extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    const damageFrom = content.fromId !== undefined && room.getPlayerById(content.fromId);
    return (
      owner.Id === content.toId &&
      damageFrom &&
      !damageFrom.Dead &&
      damageFrom.getEquipment(CardType.Weapon) !== undefined &&
      owner.getPlayerCards().length > 0
>>>>>>> 0f6d464... mazhong
    );
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }
  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
<<<<<<< HEAD
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );
=======
    const { toId, fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
>>>>>>> 0f6d464... mazhong
    if (fromId !== undefined) {
      const weapon = room.getPlayerById(fromId).getEquipment(CardType.Weapon);
      if (weapon === undefined) {
        return true;
      }
      await room.moveCards({
        movingCards: [{ card: weapon, fromArea: CardMoveArea.EquipArea }],
<<<<<<< HEAD
        fromId,
        toId: skillUseEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: skillUseEvent.fromId,
=======
        fromId: fromId,
        toId: toId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: toId,
>>>>>>> 0f6d464... mazhong
      });
    }
    return true;
  }
}
