import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'yuhua', description: 'yuhua_description' })
export class YuHua extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>, stage: AllStage): boolean {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>) {
    return room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;

    const askForCardDropEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
    const player = room.getPlayerById(askForCardDropEvent.toId);
    const unbasic = player
      .getCardIds(PlayerCardsArea.HandArea)
      .filter(cardId => !Sanguosha.getCardById(cardId).is(CardType.Basic));

    if (unbasic.length > 0) {
      const otherHandCards = player.getCardIds(PlayerCardsArea.HandArea).filter(card => !unbasic.includes(card));
      const discardAmount = otherHandCards.length - player.getMaxCardHold(room);

      askForCardDropEvent.cardAmount = discardAmount;
      askForCardDropEvent.except = askForCardDropEvent.except ? [...askForCardDropEvent.except, ...unbasic] : unbasic;
    }

    return true;
  }
}
