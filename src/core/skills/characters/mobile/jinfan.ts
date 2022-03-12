import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jinfan', description: 'jinfan_description' })
export class JinFan extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.DropCardStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length < 4
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0 && cards.length <= 4 - owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    const ownerPlayer = room.getPlayerById(owner);
    const suits = [...ownerPlayer.getCardIds(PlayerCardsArea.OutsideArea, this.Name), ...selectedCards].reduce<
      CardSuit[]
    >((allSuits, id) => {
      const suit = Sanguosha.getCardById(id).Suit;
      allSuits.includes(suit) || allSuits.push(suit);
      return allSuits;
    }, []);

    return !suits.includes(Sanguosha.getCardById(cardId).Suit);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: event.cardIds.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId: event.fromId,
      toId: event.fromId,
      toArea: CardMoveArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: event.fromId,
      isOutsideAreaInPublic: true,
      toOutsideArea: this.Name,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JinFan.Name, description: JinFan.Description })
export class JinFanShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.CardMoving;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.CardMoving || stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    if (stage === CardMoveStage.CardMoving) {
      const ling = content.infos
        .filter(
          info =>
            info.fromId === owner.Id &&
            info.movingCards.find(
              cardInfo =>
                cardInfo.fromArea === PlayerCardsArea.OutsideArea &&
                owner.getOutsideAreaNameOf(cardInfo.card) === this.GeneralName,
            ),
        )
        .reduce<CardId[]>((allCards, info) => {
          if (info.fromId === owner.Id) {
            allCards.push(
              ...info.movingCards
                .filter(
                  cardInfo =>
                    cardInfo.fromArea === PlayerCardsArea.OutsideArea &&
                    owner.getOutsideAreaNameOf(cardInfo.card) === this.GeneralName,
                )
                .map(cardInfo => cardInfo.card),
            );
          }

          return allCards;
        }, []);

      if (ling.length > 0) {
        EventPacker.addMiddleware({ tag: this.GeneralName, data: ling }, content);
      }
    }

    return (
      stage === CardMoveStage.AfterCardMoved &&
      EventPacker.getMiddleware<CardId[]>(this.GeneralName, content) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const ling = EventPacker.getMiddleware<CardId[]>(
      this.GeneralName,
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>,
    )!;

    const suits = ling.reduce<CardSuit[]>((allSuits, id) => {
      const suit = Sanguosha.getCardById(id).Suit;
      allSuits.includes(suit) || allSuits.push(suit);
      return allSuits;
    }, []);

    const toGain: CardId[] = [];
    for (const suit of suits) {
      const randomCards = room.findCardsByMatcherFrom(new CardMatcher({ suit: [suit] }));
      randomCards.length > 0 && toGain.push(randomCards[Math.floor(Math.random() * randomCards.length)]);
    }

    toGain.length > 0 &&
      (await room.moveCards({
        movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.GeneralName],
      }));

    return true;
  }
}
