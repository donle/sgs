import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'bingyi', description: 'bingyi_description' })
export class BingYi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      PlayerPhaseStages.FinishStageStart === content.toStage &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const from = room.getPlayerById(skillUseEvent.fromId);
    const handCards = from.getCardIds(PlayerCardsArea.HandArea);
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
      fromId: skillUseEvent.fromId,
      displayCards: handCards,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...handCards),
      ).extract(),
    });

    const firstCardColor = Sanguosha.getCardById(handCards[0]).Color;
    const isSameColor = handCards.every(cardId => Sanguosha.getCardById(cardId).Color === firstCardColor);
    if (isSameColor) {
      const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        players: room.AlivePlayers.map(player => player.Id),
        toId: from.Id,
        requiredAmount: [1, handCards.length],
        conversation: TranslationPack.translationJsonPatcher(
          'please choose less than {0} player to draw 1 crad.',
          handCards.length,
        ).extract(),
        triggeredBySkills: [this.GeneralName],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(askForPlayerChoose),
        from.Id,
      );

      const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        from.Id,
      );

      if (selectedPlayers !== undefined) {
        for (const playerId of selectedPlayers) {
          await room.drawCards(1, playerId, 'top', from.Id, this.Name);
        }
      }
    }

    return true;
  }
}
