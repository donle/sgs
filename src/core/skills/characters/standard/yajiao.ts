import {
  CardLostReason,
  CardObtainedReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardLostStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yajiao', description: 'yajiao_description' })
export class YaJiao extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardLostEvent>, stage?: AllStage) {
    return (
      stage === CardLostStage.AfterCardLostEffect &&
      [CardLostReason.CardResponse, CardLostReason.CardUse].includes(event.reason)
    );
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardLostEvent>) {
    return owner.Id === content.fromId && room.CurrentPlayer.Id !== owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const cardUseOrResponseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardLostEvent>;
    const card = room.getCards(1, 'top');
    const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId: skillUseEvent.fromId,
      displayCards: card,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1} from top of draw stack',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
        TranslationPack.patchCardInTranslation(...card),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);

    const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: room.AlivePlayers.map((p) => p.Id),
      requiredAmount: 1,
      conversation: 'please choose a player',
      toId: skillUseEvent.fromId,
      triggeredBySkills: [this.Name],
    };
    room.notify(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(choosePlayerEvent),
      skillUseEvent.fromId,
    );
    const { selectedPlayers } = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      skillUseEvent.fromId,
    );
    const selectedPlayer = selectedPlayers ? selectedPlayers[0] : skillUseEvent.fromId;
    await room.obtainCards(
      {
        toId: selectedPlayer,
        reason: CardObtainedReason.PassiveObtained,
        cardIds: card,
        givenBy: skillUseEvent.fromId,
      },
      true,
    );

    const lostCard = Sanguosha.getCardById(cardUseOrResponseEvent.cards[0].cardId);
    const obtainedCard = Sanguosha.getCardById(card[0]);
    if (lostCard.BaseType !== obtainedCard.BaseType) {
      const { responseEvent } = await room.askForCardDrop(
        skillUseEvent.fromId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
      );

      if (responseEvent) {
        await room.dropCards(
          CardLostReason.ActiveDrop,
          responseEvent.droppedCards,
          skillUseEvent.fromId,
          skillUseEvent.fromId,
          this.Name,
        );
      }
    }

    return true;
  }
}
