import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'liangjue', description: 'liangjue_description' })
export class LiangJue extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      owner.Hp > 1 &&
      content.infos.find(
        info =>
          (info.toId === owner.Id &&
            (info.toArea === CardMoveArea.JudgeArea || info.toArea === CardMoveArea.EquipArea) &&
            info.movingCards.find(cardInfo => Sanguosha.getCardById(cardInfo.card).isBlack())) ||
          (info.fromId === owner.Id &&
            info.movingCards.find(
              cardInfo =>
                Sanguosha.getCardById(cardInfo.card).isBlack() &&
                (cardInfo.fromArea === CardMoveArea.EquipArea || cardInfo.fromArea === CardMoveArea.JudgeArea),
            )),
      ) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.loseHp(event.fromId, 1);
    await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
