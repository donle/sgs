import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({name: 'fangzhu', description: 'fangzhu_description'})
export class Fangzhu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === event.toId;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = skillUseEvent;
    const to = room.getPlayerById(toIds![0]);
    const from = room.getPlayerById(fromId);

    const lostHp = from.MaxHp - from.Hp
    if (to.getCardIds(PlayerCardsArea.HandArea).length + to.getCardIds(PlayerCardsArea.EquipArea).length < lostHp) {
      await room.turnOver(toIds![0]);
      await room.drawCards(lostHp, toIds![0]);
      return true;
    }

    const askForOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options: ['fangzhu:turnover', 'fangzhu:losehp'],
      conversation: 'please choose',
      toId: toIds![0],
      askedBy: fromId
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForOptionsEvent),
      toIds![0]
    );

    const response = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toIds![0]);
    response.selectedOption = response.selectedOption || 'fangzhu:turnover';
    if (response.selectedOption === 'fangzhu:turnover') {
      await room.turnOver(toIds![0]);
      await room.drawCards(lostHp, toIds![0]);
    } else {
      const response = await room.askForCardDrop(toIds![0], lostHp, [PlayerCardsArea.HandArea], true, undefined, this.Name);
      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds![0]);
      room.loseHp(toIds![0], 1);
    }

    return true;
  }
}
