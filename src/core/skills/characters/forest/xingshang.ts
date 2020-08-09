import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'xingshang', description: 'xingshang_description' })
export class XingShang extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage) {
    return stage === PlayerDiedStage.PlayerDied;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>) {
    const to = room.getPlayerById(content.playerId);
    return owner.Id !== content.playerId && !(owner.Hp >= owner.MaxHp && to.getPlayerCards().length <= 0);
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { playerId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>;
    const fromId = skillUseEvent.fromId;
    const dead = room.getPlayerById(playerId);
    const caopi = room.getPlayerById(fromId);

    if (dead.getPlayerCards().length <= 0) {
      await room.recover({
        recoveredHp: 1,
        toId: fromId,
        recoverBy: fromId,
      });
    } else if (caopi.Hp >= caopi.MaxHp) {
      const heritage = dead.getPlayerCards();
      await room.moveCards({
        movingCards: heritage.map(cardId => ({ card: cardId, fromArea: dead.cardFrom(cardId) })),
        fromId: playerId,
        moveReason: CardMoveReason.ActivePrey,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        proposer: fromId,
        movedByReason: this.Name,
      });
    } else {
      const askForOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['xingshang:recover', 'xingshang:pickup'],
        conversation: 'please choose',
        toId: fromId,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForOptionsEvent),
        fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);
      response.selectedOption = response.selectedOption || 'xingshang:pickup';
      if (response.selectedOption === 'xingshang:recover') {
        await room.recover({
          recoveredHp: 1,
          toId: fromId,
          recoverBy: fromId,
        });
      } else {
        const heritage = dead.getPlayerCards();
        await room.moveCards({
          movingCards: heritage.map(cardId => ({ card: cardId, fromArea: dead.cardFrom(cardId) })),
          fromId: playerId,
          moveReason: CardMoveReason.ActivePrey,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          proposer: fromId,
          movedByReason: this.Name,
        });
      }
    }

    return true;
  }
}
