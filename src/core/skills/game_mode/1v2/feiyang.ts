import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill } from 'core/skills/skill_wrappers';

@PersistentSkill({ stubbornSkill: true })
@CommonSkill({ name: 'feiyang', description: 'feiyang_description' })
export class FeiYang extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  getPriority() {
    return StagePriority.High;
  }

  get Muted() {
    return true;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.JudgeStageStart &&
      owner.getCardIds(PlayerCardsArea.JudgeArea).length > 0 &&
      owner.getCardIds(PlayerCardsArea.HandArea).filter(id => room.canDropCard(owner.Id, id)).length >= 2
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const response = await room.askForCardDrop(fromId, 2, [PlayerCardsArea.HandArea], false, undefined, this.Name);

    if (response.droppedCards.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, fromId, fromId, this.Name);

      const from = room.getPlayerById(fromId);
      const askForChoosingCard: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
        toId: fromId,
        amount: 1,
        customCardFields: {
          [PlayerCardsArea.JudgeArea]: from.getCardIds(PlayerCardsArea.JudgeArea),
        },
        customTitle: 'please drop a judge card',
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>(askForChoosingCard),
        fromId,
      );

      const { selectedCards } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardEvent,
        fromId,
      );
      await room.moveCards({
        movingCards: [
          {
            fromArea: CardMoveArea.JudgeArea,
            card: selectedCards![0],
          },
        ],
        fromId,
        moveReason: CardMoveReason.ActiveMove,
        toArea: CardMoveArea.DropStack,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}
