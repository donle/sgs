import { CardType } from 'core/cards/card';
import {  CardMoveReason, GameEventIdentifiers,  ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

// 难1 【肃威】锁定技，当你成为其它角色锦囊牌的目标后，你弃置其装备区内全部牌。
@CompulsorySkill({ name: 'pve_suwei', description: 'pve_suwei_description' })
export class PveSuWei extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed && event.byCardId !== undefined;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return (
      event.toId === owner.Id &&
      event.fromId !== owner.Id && Sanguosha.getCardById(event.byCardId!).is(CardType.Trick) &&
      room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.EquipArea).length > 0
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toId } = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const owner = room.getPlayerById(fromId); 
    await room.dropCards(CardMoveReason.PassiveDrop,owner.getCardIds(PlayerCardsArea.EquipArea) , fromId, toId, this.Name); 
    return true;
  }
}
