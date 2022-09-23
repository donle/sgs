import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'tianyin', description: 'tianyin_description' })
export class TianYin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const cardTypes: CardType[] = [];
    for (const record of room.Analytics.getCardUseRecord(event.fromId, 'round')) {
      const type = Sanguosha.getCardById(record.cardId).BaseType;
      cardTypes.includes(type) || cardTypes.push(type);

      if (cardTypes.length === 3) {
        break;
      }
    }

    EventPacker.addMiddleware({ tag: this.Name, data: cardTypes }, event);

    return cardTypes.length < 3;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardTypes = EventPacker.getMiddleware<CardType[]>(this.Name, event) || [];
    const differentTypes = [CardType.Basic, CardType.Trick, CardType.Equip].filter(type => !cardTypes.includes(type));

    const cardIdsChosen: CardId[] = [];
    for (const cardType of differentTypes) {
      const cardIds = room.findCardsByMatcherFrom(new CardMatcher({ type: [cardType] }));
      cardIds.length > 0 && cardIdsChosen.push(cardIds[Math.floor(Math.random() * cardIds.length)]);
    }

    cardIdsChosen.length > 0 &&
      (await room.moveCards({
        movingCards: cardIdsChosen.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}
