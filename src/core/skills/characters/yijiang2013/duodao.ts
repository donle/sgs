import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

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
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (fromId !== undefined) {
      const weapon = room.getPlayerById(fromId).getEquipment(CardType.Weapon);
      if (weapon === undefined) {
        return true;
      }
      await room.moveCards({
        movingCards: [{ card: weapon, fromArea: CardMoveArea.EquipArea }],
        fromId,
        toId: skillUseEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: skillUseEvent.fromId,
      });
    }
    return true;
  }
}
