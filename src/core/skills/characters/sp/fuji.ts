import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'fuji', description: 'fuji_description' })
export class FuJi extends TriggerSkill {
  private static readonly FuJiUntriggerable: string[] = ['jink', 'peach', 'alcohol'];

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const card = Sanguosha.getCardById(content.cardId);
    return (
      content.fromId === owner.Id &&
      !FuJi.FuJiUntriggerable.includes(card.GeneralName) &&
      !card.is(CardType.DelayedTrick) &&
      !card.is(CardType.Equip) &&
      room.getAlivePlayersFrom().find(target => room.distanceBetween(target, owner) === 1) !== undefined
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    const targets = room
      .getAlivePlayersFrom()
      .filter(target => room.distanceBetween(target, from) === 1)
      .map(player => player.Id);

    cardUseEvent.disresponsiveList = targets;

    return true;
  }
}
