import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

// 难3 【龙鳞】锁定技，准备阶段开始时，你装备区域内每无一张牌，你摸两张牌；当你使用装备牌时，你摸三张牌。
@CompulsorySkill({ name: 'pve_longlin', description: 'pve_longlin_description' })
export class PveLongLin extends TriggerSkill {
  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ) {
    const unknownEvent = EventPacker.getIdentifier(event);
    if (unknownEvent === GameEventIdentifiers.PhaseStageChangeEvent) {
      return stage === PhaseStageChangeStage.StageChanged;
    }
    if (unknownEvent === GameEventIdentifiers.CardUseEvent) {
      return stage === CardUseStage.CardUsing;
    }
    return false;
  }

  canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.CardUseEvent>,
  ) {
    const unknownEvent = EventPacker.getIdentifier(event);
    if (unknownEvent === GameEventIdentifiers.CardUseEvent) {
      event = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      if (event.fromId !== owner.Id) {
        return false;
      }
      const card = Sanguosha.getCardById(event.cardId);
      return card.BaseType === CardType.Equip;
    }
    if (unknownEvent === GameEventIdentifiers.PhaseStageChangeEvent) {
      event = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.PrepareStage;
    }
    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const identifier = EventPacker.getIdentifier(
      triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.CardUseEvent
      >,
    );
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      await room.drawCards(
        2 * (5 - room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.EquipArea).length),
        event.fromId,
        'top',
        event.fromId,
        this.Name,
      );
    }
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      await room.drawCards(3, event.fromId, 'top', event.fromId, this.Name);
    }
    return true;
  }
}
