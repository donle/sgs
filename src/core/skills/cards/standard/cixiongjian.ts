import { CardId } from 'core/cards/libs/card_props';
import { CharacterGender } from 'core/characters/character';
import {
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'cixiongjian', description: 'cixiongjian_description' })
export class CiXiongJianSkill extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAim &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }
  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    if (!content) {
      return false;
    }

    const { fromId, allTargets: toIds } = content;

    return (
      fromId === owner.Id &&
      toIds.find(targetId => {
        const target = room.getPlayerById(targetId);
        return (
          target.Gender !== owner.Gender &&
          target.Gender !== CharacterGender.Neutral &&
          owner.Gender !== CharacterGender.Neutral
        );
      }) !== undefined
    );
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = event;
    const aimEvent = Precondition.exists(triggeredOnEvent, 'Cannot find aim event in cixiongjian') as ServerEventFinder<
      GameEventIdentifiers.AimEvent
    >;

    const from = room.getPlayerById(fromId);
    const { toId } = aimEvent;
    const to = room.getPlayerById(toId);
    if (to.Gender === from.Gender) {
      return false;
    }

    if (to.getCardIds(PlayerCardsArea.HandArea).length === 0) {
      await room.drawCards(1, fromId, undefined, toId, this.Name);
      return true;
    }

    const askForOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options: ['cixiongjian:drop-card', 'cixiongjian:draw-card'],
      conversation: 'please choose',
      toId,
      askedBy: fromId,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForOptionsEvent),
      toId,
    );
    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);
    response.selectedOption = response.selectedOption || 'cixiongjian:draw-card';
    if (response.selectedOption === 'cixiongjian:drop-card') {
      const response = await room.askForCardDrop(toId, 1, [PlayerCardsArea.HandArea], true, undefined, this.Name);
      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId);
    } else {
      await room.drawCards(1, fromId, undefined, toId, this.Name);
    }
    return true;
  }
}
