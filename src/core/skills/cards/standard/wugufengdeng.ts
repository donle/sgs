import { WuGuFengDengSkillTrigger } from 'core/ai/skills/cards/wugufengdeng';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, AI, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

type SelectedCard = {
  card: CardId;
  player?: PlayerId;
};

@AI(WuGuFengDengSkillTrigger)
@CommonSkill({ name: 'wugufengdeng', description: 'wugufengdeng_description' })
export class WuGuFengDengSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    if (containerCard) {
      for (const target of room.getAlivePlayersFrom()) {
        if (owner.canUseCardTo(room, containerCard, target.Id)) {
          return true;
        }
      }
    }

    return false;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }

  public isCardAvailableTarget(): boolean {
    return true;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const all = room.getAlivePlayersFrom();
    const from = room.getPlayerById(event.fromId);
    const groups = all.filter(player => from.canUseCardTo(room, event.cardId, player.Id)).map(player => [player.Id]);
    event.targetGroup = [...groups];

    return true;
  }

  public async beforeEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const showCardNum = event.allTargets?.length || 0;
    event.toCardIds = room.getCards(showCardNum, 'top');
    room.addProcessingCards(event.cardId.toString(), ...event.toCardIds);
    EventPacker.addMiddleware(
      {
        tag: event.cardId.toString(),
        data: [],
      },
      event,
    );

    const wugufengdengEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: event.toCardIds!,
      selected: [],
    };

    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, wugufengdengEvent);

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const toId = Precondition.exists(event.toIds, 'Unknown targets of wugufengdeng')[0];
    const selectedCards = Precondition.exists(
      EventPacker.getMiddleware<SelectedCard[]>(event.cardId.toString(), event),
      'Unable to get wugufengdeng cards',
    );

    const wugufengdengEvent: ServerEventFinder<GameEventIdentifiers.AskForContinuouslyChoosingCardEvent> = {
      cardIds: event.toCardIds!,
      selected: selectedCards,
      toId,
      userId: event.fromId,
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForContinuouslyChoosingCardEvent, wugufengdengEvent, toId);
    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
      toId,
    );
    selectedCards.push({
      card: response.selectedCard,
      player: toId,
    });
    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, wugufengdengEvent);
    room.endProcessOnCard(response.selectedCard);

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.ProcessingArea }],
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
    });

    return true;
  }

  public async afterEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const wugufengdengCards = room.getProcessingCards(event.cardId.toString());

    const droppedCards: CardId[] = [];
    for (const cardId of event.toCardIds!) {
      if (wugufengdengCards.includes(cardId)) {
        droppedCards.push(cardId);
      }
    }

    await room.moveCards({
      movingCards: droppedCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
      toArea: CardMoveArea.DropStack,
      moveReason: CardMoveReason.PlaceToDropStack,
    });

    room.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {
      translationsMessage:
        droppedCards.length > 0
          ? TranslationPack.translationJsonPatcher(
              '{0} has been placed into drop stack',
              TranslationPack.patchCardInTranslation(...droppedCards),
            ).extract()
          : undefined,
    });

    return true;
  }
}
