import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'wumou', description: 'wumou_description' })
export class WuMou extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const usedCard = Sanguosha.getCardById(event.cardId);
    return usedCard.is(CardType.Trick) && !usedCard.is(CardType.DelayedTrick) && event.fromId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const options = ['wumou: loseHp'];
    room.getMark(skillUseEvent.fromId, MarkEnum.Wrath) && options.unshift('wumou: loseMark');

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: skillUseEvent.fromId,
      conversation: 'wumou: please choose the cost for your Normal Trick',
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      skillUseEvent.fromId,
    );

    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    if (selectedOption === 'wumou: loseMark') {
      room.addMark(skillUseEvent.fromId, MarkEnum.Wrath, -1);
    } else {
      await room.loseHp(skillUseEvent.fromId, 1);
    }

    return true;
  }
}
