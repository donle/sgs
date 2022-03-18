import { VirtualCard } from 'core/cards/card';
import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'liubing', description: 'liubing_description' })
export class LiuBing extends TriggerSkill {
  public audioIndex(): number {
    return 0
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardUseDeclared;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const cardUsed = Sanguosha.getCardById(content.cardId);
    return (
      !owner.hasUsedSkill(this.Name) &&
      content.fromId === owner.Id &&
      cardUsed.Suit !== CardSuit.NoSuit &&
      cardUsed.GeneralName === 'slash'
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const cardUsed = Sanguosha.getCardById(cardUseEvent.cardId);
    cardUseEvent.cardId = VirtualCard.create(
      { cardName: cardUsed.Name, cardSuit: CardSuit.Diamond, cardNumber: cardUsed.CardNumber, bySkill: this.Name },
      [cardUseEvent.cardId],
    ).Id;

    return true;
  }
}
