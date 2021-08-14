import { VirtualCard } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {  AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'pve_lige', description: 'pve_lige_description' })
export class PveLiGe extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id !== event.playerId && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const From = room.getPlayerById(event.fromId);
    if (room.CurrentPhasePlayer.getCardIds(PlayerCardsArea.HandArea).length > 0) {
      const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: room.CurrentPhasePlayer.Id,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you need to give a handcard to {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(From),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea],
          triggeredBySkills: [this.Name],
        },
        room.CurrentPhasePlayer.Id,
      );
      if (selectedCards.length > 0) {
        await room.moveCards({
          movingCards: selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
          moveReason: CardMoveReason.ActiveMove,
          fromId: room.CurrentPhasePlayer.Id,
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          proposer: event.fromId,
        });
      }else if(selectedCards.length === 0){
        await room.drawCards(2,event.fromId)
      }
    }
    const duelUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId: event.fromId,
      cardId: VirtualCard.create({
        cardName: 'duel',
        bySkill: this.GeneralName,
      }).Id,
      targetGroup: [[room.CurrentPhasePlayer.Id]],
    };

    await room.useCard(duelUseEvent);

    return true;
  }
}
