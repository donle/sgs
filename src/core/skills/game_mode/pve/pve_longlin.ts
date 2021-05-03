import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TriggerSkill } from 'core/skills/skill';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { Sanguosha } from 'core/game/engine';
import { CardType } from 'core/cards/card';

// 【龙鳞】锁定技，当你使用装备牌时，若你已受伤，你回复一点体力并摸一张牌，若你未受伤，你摸三张牌
@CompulsorySkill({ name: 'pve_longlin', description: 'pve_longlin_description' })
export class PveLongLin extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (event.fromId !== owner.Id) {
      return false;
    }

    const card = Sanguosha.getCardById(event.cardId);

    return card.BaseType === CardType.Equip;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (room.getPlayerById(event.fromId).isInjured()) {
      await room.recover({ recoverBy: event.fromId, recoveredHp: 1, toId: event.fromId });
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    } else {
      await room.drawCards(3, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
