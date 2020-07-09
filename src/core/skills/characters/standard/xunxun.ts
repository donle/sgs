import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'xunxun', description: 'xunxun_description' })
export class XunXun extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.DrawCardStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cards = room.getCards(4, 'top');
    const askForChooseCards: ServerEventFinder<GameEventIdentifiers.AskForPlaceCardsInDileEvent> = {
      toId: skillUseEvent.fromId,
      cardIds: cards,
      top: 4,
      topStackName: 'draw stack bottom',
      bottom: 2,
      bottomStackName: 'draw stack top',
      bottomMaxCard: 2,
      bottomMinCard: 2,
      movable: true,
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForPlaceCardsInDileEvent, askForChooseCards, skillUseEvent.fromId);
    const { top, bottom } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      skillUseEvent.fromId,
    );
    room.putCards('top', ...bottom);
    room.putCards('bottom', ...top);

    return true;
  }
}
