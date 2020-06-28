import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'alcohol', description: 'alcohol_description' })
export class AlcoholSkill extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsed(this.Name);
  }

  isRefreshAt(stage: PlayerPhase) {
    return stage === PlayerPhase.PrepareStage;
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  isAvailableTarget() {
    return false;
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return event.fromId !== undefined;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const from = room.getPlayerById(event.fromId!);
    from.getDrunk();
    room.broadcast(GameEventIdentifiers.DrunkEvent, { toId: event.fromId!, drunk: true });
    return true;
  }
}
