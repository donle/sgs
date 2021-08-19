import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'fenji', description: 'fenji_description' })
export class FenJi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      event.infos.find(info => {
        if (!info.movingCards.find(card => card.fromArea === PlayerCardsArea.HandArea)) {
          return false;
        }

        if (info.moveReason === CardMoveReason.ActivePrey) {
          return !!info.fromId && !!info.toId && info.fromId !== info.toId;
        } else if (info.moveReason === CardMoveReason.PassiveDrop) {
          return !!info.fromId;
        } else if (info.moveReason === CardMoveReason.PassiveMove) {
          return !!info.toId && info.toArea === CardMoveArea.HandArea;
        }

        return false;
      }) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    await room.loseHp(skillUseEvent.fromId, 1);

    const info =
      moveCardEvent.infos.length === 1
        ? moveCardEvent.infos[0]
        : moveCardEvent.infos.find(info => {
            if (!info.movingCards.find(card => card.fromArea === PlayerCardsArea.HandArea)) {
              return false;
            }

            if (info.moveReason === CardMoveReason.ActivePrey) {
              return !!info.fromId && !!info.toId && info.fromId !== info.toId;
            } else if (info.moveReason === CardMoveReason.PassiveDrop) {
              return !!info.fromId;
            } else if (info.moveReason === CardMoveReason.PassiveMove) {
              return !!info.toId && info.toArea === CardMoveArea.HandArea;
            }

            return false;
          });
    await room.drawCards(2, info!.fromId, 'top', undefined, this.Name);

    return true;
  }
}
