import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { LimitSkill, TriggerSkill } from 'core/skills/skill';

@LimitSkill({ name: 'niepan', description: 'niepan_description' })
export class NiePan extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>) {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForPeachEvent;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AskForPeachEvent>): boolean {
    return content.fromId === owner.Id && content.toId === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const from = room.getPlayerById(fromId);

    const wholeCards = from.getPlayerCards();
    const judgeAreaCards = from.getCardIds(PlayerCardsArea.JudgeArea);
    if (judgeAreaCards.length > 0) {
      for (const cardId of judgeAreaCards) {
        wholeCards.push(cardId);
      }
    }

    wholeCards.length > 0 && (await room.dropCards(CardMoveReason.SelfDrop, wholeCards, fromId, fromId, this.Name));

    !from.isFaceUp() && (await room.turnOver(skillUseEvent.fromId));
    from.ChainLocked && (await room.chainedOn(fromId));

    await room.drawCards(3, fromId, 'top', fromId, this.Name);
    await room.recover({
      recoveredHp: 3 - from.Hp,
      recoverBy: fromId,
      toId: fromId,
    });

    const options: string[] = ['bazhen', 'huoji', 'kanpo'];
    options.filter(option => !from.hasSkill(option));

    if (options.length > 0) {
      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        conversation: 'please choose',
        toId: fromId,
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, fromId);

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);

      response.selectedOption = response.selectedOption || options[0];
      await room.obtainSkill(fromId, response.selectedOption, true);
    }

    return true;
  }
}
