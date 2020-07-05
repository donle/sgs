import { Card } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder, CardMoveReason, CardMoveArea } from 'core/event/event';
import { AllStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({name: 'xingshang', description: 'xingshang_description'})
export class Xingshang extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage) {
    return stage === PlayerDiedStage.PlayerDied;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>) {
    return owner.Id !== content.playerId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { playerId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>;
    const dead = room.getPlayerById(playerId);
    const caopi = room.getPlayerById(skillUseEvent.fromId);

    if (dead.getPlayerCards().length <= 0) {
      room.recover({
        recoveredHp: 1,
        toId: skillUseEvent.fromId,
      });
    } else {
      const askForOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['xingshang:recover', 'xingshang:pickup'],
        conversation: 'please choose',
        toId: skillUseEvent.fromId,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForOptionsEvent),
        skillUseEvent.fromId,
      );

      const response = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, skillUseEvent.fromId);
      response.selectedOption = response.selectedOption || 'xingshang:pickup';
      if (response.selectedOption === 'xingshang:recover') {
        room.recover({
          recoveredHp: 1,
          toId: skillUseEvent.fromId,
        });
      } else {
        const heritage = Card.getActualCards(dead.getPlayerCards());
        await room.moveCards({
          movingCards: heritage.map(cardId => ({card: cardId, fromArea: dead.cardFrom(cardId)})),
          fromId: playerId,
          moveReason: CardMoveReason.ActivePrey,
          toId: skillUseEvent.fromId,
          toArea: CardMoveArea.HandArea,
          proposer: skillUseEvent.fromId,
          movedByReason: this.Name,
        });
      }
    }

    return true;
  }
}
