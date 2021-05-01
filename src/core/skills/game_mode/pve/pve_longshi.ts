import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { ServerEventFinder, GameEventIdentifiers, EventPacker, CardMoveReason } from 'core/event/event';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { PlayerCardsArea } from 'core/player/player_props';
import { TriggerSkill } from 'core/skills/skill';
import { PhaseStageChangeStage, PlayerPhaseStages, AllStage } from 'core/game/stage_processor';

// 【龙识】锁定技，准备阶段开始时，你依次弃置其它角色两张牌，如此做后，若其手牌区及装备区均无牌，其失去一点体力上限。
@CompulsorySkill({ name: 'pve_longshi', description: 'pve_longshi_description' })
export class PveLongShi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStage;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === event.playerId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const fromId = skillUseEvent.fromId;
    const targetPlayers: Player[] = room.AlivePlayers.filter(player => player.Id !== fromId);

    for (const target of targetPlayers) {
      for (let i = 0; i < 2; i++) {
        if (target.getPlayerCards().length === 0) {
          continue;
        }

        const options: CardChoosingOptions = {
          [PlayerCardsArea.HandArea]: target.getCardIds(PlayerCardsArea.HandArea).length,
          [PlayerCardsArea.EquipArea]: target.getCardIds(PlayerCardsArea.EquipArea),
        };

        const askForChoosingCardEvent = {
          fromId,
          toId: target.Id,
          options,
        };

        room.notify(
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
            askForChoosingCardEvent,
          ),
          fromId,
        );

        const response = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
          fromId,
        );

        if (response.selectedCard === undefined) {
          const handCardIds = target.getCardIds(PlayerCardsArea.HandArea);
          response.selectedCard = handCardIds[Math.floor(Math.random() * handCardIds.length)];
        }

        await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard], target.Id, fromId, this.Name);
      }

      if (target.getPlayerCards().length === 0) {
        await room.changeMaxHp(target.Id, -1);
      }
    }

    return true;
  }
}
