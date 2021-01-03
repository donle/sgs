import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'botu', description: 'botu_description' })
export class BoTu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (owner.Id === content.playerId && PlayerPhaseStages.PhaseFinishEnd === content.toStage) {
      return (
        room.Analytics.getUsedCard(owner.Id, true, [PlayerPhase.PlayCardStage]).reduce<CardSuit[]>(
          (allSuits, cardId) => {
            const card = Sanguosha.getCardById(cardId);
            if (!allSuits.includes(card.Suit) && card.Suit !== CardSuit.NoSuit) {
              allSuits.push(card.Suit);
            }

            return allSuits;
          },
          [],
        ).length === 4
      );
    }

    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.insertPlayerRound(skillUseEvent.fromId);
    return true;
  }
}
