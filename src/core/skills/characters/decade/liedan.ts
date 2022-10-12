import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { ZhuangDan } from './zhuangdan';

@CompulsorySkill({ name: 'liedan', description: 'liedan_description' })
export class LieDan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      ((content.playerId !== owner.Id && !room.getPlayerById(content.playerId).Dead) ||
        (content.playerId === owner.Id && owner.getMark(MarkEnum.DanLie) >= 5)) &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      !owner.getFlag<boolean>(ZhuangDan.Name)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const currentPlayer = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>)
      .playerId;
    const from = room.getPlayerById(event.fromId);

    if (currentPlayer !== event.fromId) {
      let num = 0;
      const opponent = room.getPlayerById(currentPlayer);

      from.Hp > opponent.Hp && num++;
      from.getCardIds(PlayerCardsArea.HandArea).length > opponent.getCardIds(PlayerCardsArea.HandArea).length && num++;
      from.getCardIds(PlayerCardsArea.EquipArea).length > opponent.getCardIds(PlayerCardsArea.EquipArea).length &&
        num++;

      if (num > 0) {
        await room.drawCards(num, event.fromId, 'top', event.fromId, this.Name);
        num === 3 && from.MaxHp < 8 && (await room.changeMaxHp(event.fromId, 1));
      } else {
        await room.loseHp(event.fromId, 1);
        room.addMark(event.fromId, MarkEnum.DanLie, 1);
      }
    } else {
      await room.kill(from);
    }

    return true;
  }
}
