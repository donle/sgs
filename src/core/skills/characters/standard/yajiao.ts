import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yajiao', description: 'yajiao_description' })
export class YaJiao extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return (
      stage === CardMoveStage.AfterCardMoved &&
      [CardMoveReason.CardResponse, CardMoveReason.CardUse].includes(event.moveReason)
    );
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return owner.Id === content.fromId && room.CurrentPlayer.Id !== owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const cardUseOrResponseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
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
      players: room.AlivePlayers.map(p => p.Id),
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
    await room.moveCards({
      movingCards: card.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
      proposer: skillUseEvent.fromId,
      toId: selectedPlayer,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
    });

    const lostCard = Sanguosha.getCardById(cardUseOrResponseEvent.movingCards[0].card);
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
          CardMoveReason.SelfDrop,
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
