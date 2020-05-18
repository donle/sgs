import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'xiaoji', description: 'xiaoji_description' })
export class XiaoJi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    if (owner.Id !== content.fromId) {
      return false;
    }

    const equipCards = content.movingCards.filter(card => card.fromArea === PlayerCardsArea.EquipArea);
    return owner.Id === content.fromId && equipCards.length > 0;
  }

  async onTrigger() {
    return true;
  }

  async doDrawCards(room: Room, fromId: PlayerId) {
    await room.drawCards(2, fromId, 'top', undefined, this.Name);
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId, movingCards } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;

    const equipCards = movingCards.filter(card => card.fromArea === PlayerCardsArea.EquipArea);
    let times = equipCards.length;
    const skillInvoke: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      invokeSkillNames: [this.Name],
      toId: fromId!,
    };
    await this.doDrawCards(room, fromId!);
    while (--times > 0) {
      room.notify(GameEventIdentifiers.AskForSkillUseEvent, skillInvoke, fromId!);
      const { invoke } = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId!);
      if (!invoke) {
        break;
      }

      await this.doDrawCards(room, fromId!);
    }

    return true;
  }
}
