import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { Sanguosha } from 'core/game/engine';

@CommonSkill({ name: 'guzheng', description: 'guzheng_description' })
export class GuZheng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (content.playerId === owner.Id) {
      return false;
    }
    const events = room.Analytics.getCardDropRecord(content.playerId, true, [PlayerPhase.DropCardStage]);
    const findFunc = (event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) => {
      return event.movingCards.find(
        ({card, fromArea}) => {
          return fromArea === CardMoveArea.HandArea;
        }
      )
    };
    if (events.find(findFunc) !== undefined) {
      EventPacker.addMiddleware(
        {
          tag: this.Name,
          data: events,
        },
        content,
      );
      return true;
    } else {
      return false;
    }
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;

    const events = EventPacker.getMiddleware<ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[]>(this.Name, triggeredOnEvent!);
    if (events === undefined) {
      return false;
    }

    const erzhang = room.getPlayerById(fromId);
    //const unabledCards: { card: CardId; player?: PlayerId }[] = [];

    const allCards = events.reduce<CardId[]>(
      (cards, event) => [
        ...cards,
        ...event.movingCards['card'].filter(
          ({ card, fromArea }) => {
            return room.isCardInDropStack(card) && !cards.includes(card);
          }
        ),
      ],
      [],
    );

    const unableCards = events.reduce<CardId[]>(
      (cards, event) => [
        ...cards,
        ...event.movingCards['card'].filter(
          ({ card, fromArea }) => {
            return !cards.includes(card) && fromArea === CardMoveArea.HandArea;
          }
        ),
      ],
      [],
    );

    const selectedCardIds: { card: CardId; player?: PlayerId }[] = [];

    return true;
  }
}
