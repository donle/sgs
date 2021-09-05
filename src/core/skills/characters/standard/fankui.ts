import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'fankui', description: 'fankui_description' })
export class FanKui extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    const damageFrom = content.fromId !== undefined && room.getPlayerById(content.fromId);
    return (
      owner.Id === content.toId &&
      damageFrom &&
      !damageFrom.Dead &&
      (content.toId === content.fromId
        ? damageFrom.getCardIds(PlayerCardsArea.EquipArea).length > 0
        : damageFrom.getPlayerCards().length > 0)
    );
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (fromId !== undefined) {
      const damageFrom = room.getPlayerById(fromId);
      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: damageFrom.getCardIds(PlayerCardsArea.EquipArea),
      };

      if (fromId !== skillUseEvent.fromId) {
        options[PlayerCardsArea.HandArea] = damageFrom.getCardIds(PlayerCardsArea.HandArea).length;
      }

      const chooseCardEvent = {
        fromId: skillUseEvent.fromId,
        toId: fromId,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, false, true);
      if (!response) {
        return false;
      }

      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
        fromId: chooseCardEvent.toId,
        toId: chooseCardEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: chooseCardEvent.fromId,
        movedByReason: this.Name,
      });
    }
    return true;
  }
}
