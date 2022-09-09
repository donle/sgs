import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'youyan', description: 'youyan_description' })
export class YouYan extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return [PlayerPhase.PhaseBegin, PlayerPhase.DropCardStage].includes(stage);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    if (owner.hasUsedSkill(this.Name) || room.CurrentPlayer !== owner) {
      return false;
    }

    const suitsRecorded: CardSuit[] = [];
    for (const info of event.infos) {
      if (
        info.fromId !== owner.Id ||
        ![CardMoveReason.SelfDrop, CardMoveReason.PassiveDrop].includes(info.moveReason)
      ) {
        continue;
      }

      for (const cardInfo of info.movingCards) {
        if (
          cardInfo.asideMove ||
          (cardInfo.fromArea !== CardMoveArea.HandArea && cardInfo.fromArea !== CardMoveArea.EquipArea)
        ) {
          continue;
        }

        const suit = Sanguosha.getCardById(cardInfo.card).Suit;
        suitsRecorded.includes(suit) || suitsRecorded.push(suit);
      }

      if (suitsRecorded.length > 3) {
        break;
      }
    }

    if (suitsRecorded.length > 0 && suitsRecorded.length < 4) {
      owner.setFlag<CardSuit[]>(this.Name, suitsRecorded);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const suitsDiscarded = room.getFlag<CardSuit[]>(event.fromId, this.Name) || [];
    const uncontainedSuits = Algorithm.unique(
      [CardSuit.Club, CardSuit.Spade, CardSuit.Diamond, CardSuit.Heart],
      suitsDiscarded,
    );

    const toObtain: CardId[] = [];
    for (const cardSuit of uncontainedSuits) {
      const cardsMatched = room.findCardsByMatcherFrom(new CardMatcher({ suit: [cardSuit] }));
      cardsMatched.length > 0 && toObtain.push(cardsMatched[Math.floor(Math.random() * cardsMatched.length)]);
    }

    toObtain.length > 0 &&
      (await room.moveCards({
        movingCards: toObtain.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}
