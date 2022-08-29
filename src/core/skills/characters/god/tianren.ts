import { CardType } from 'core/cards/card';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'tianren', description: 'tianren_description' })
export class TianRen extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.infos.find(info => {
        if (info.moveReason === CardMoveReason.CardUse) {
          return false;
        }

        info.movingCards.find(move => {
          const card = Sanguosha.getCardById(move.card);
          return card.is(CardType.Basic) || (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick));
        });
      }) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const content = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const player = room.getPlayerById(event.fromId);
    let coundMatchedCards = 0;

    for (const info of content.infos) {
      coundMatchedCards += info.movingCards.filter(move => {
        const card = Sanguosha.getCardById(move.card);
        return card.is(CardType.Basic) || (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick));
      }).length;
    }

    room.addMark(player.Id, MarkEnum.TianRen, coundMatchedCards);

    let tianrenMarks = room.getMark(player.Id, MarkEnum.TianRen);
    while (tianrenMarks >= player.MaxHp) {
      tianrenMarks -= player.MaxHp;

      room.addMark(player.Id, MarkEnum.TianRen, -1 * player.MaxHp);
      await room.changeMaxHp(player.Id, 1);
      await room.drawCards(2, player.Id, undefined, undefined, this.Name);
    }

    return true;
  }
}
