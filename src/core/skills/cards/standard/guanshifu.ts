import { CardId } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class GuanShiFuSkill extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.AfterCardUseEffect;
  }

  constructor() {
    super('guanshifu', 'guanshifu_description');
  }

  canUse(room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (!content) {
      return false;
    }

    const { responseToEvent } = content;
    if (!responseToEvent) {
      return false;
    }
    const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    return (
      Sanguosha.getCardById(slashEvent.cardId).GeneralName === 'slash' &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'jink' &&
      slashEvent.fromId === owner.Id
    );
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const cardDropEvent: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent> = {
      fromArea: [PlayerCardsArea.EquipArea, PlayerCardsArea.HandArea],
      except: [room.getPlayerById(event.fromId).getWeaponCardId()!],
      cardAmount: 2,
      toId: event.fromId,
      conversation: TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', this.name).extract(),
    };

    room.notify(GameEventIdentifiers.AskForCardDropEvent, cardDropEvent, event.fromId);
    const { droppedCards } = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForCardDropEvent,
      event.fromId,
    );

    if (droppedCards.length === 0) {
      EventPacker.terminate(event);
      return false;
    }

    EventPacker.addMiddleware(
      {
        tag: this.name,
        data: droppedCards,
      },
      event,
    );
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cards = EventPacker.getMiddleware<CardId[]>(this.name, event);
    if (!cards) {
      return false;
    }

    await room.dropCards(CardLostReason.ActiveDrop, cards, event.fromId);
    const { triggeredOnEvent } = event;
    const jinkEvent = Precondition.exists(triggeredOnEvent, 'Unable to get jink event') as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent
    >;
    EventPacker.terminate(jinkEvent);
    return true;
  }
}
