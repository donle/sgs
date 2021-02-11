import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'alcohol', description: 'alcohol_description' })
export class AlcoholSkill extends ActiveSkill implements ExtralCardSkillProperty {
  private readonly recoverTag = 'recover';

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsed(this.Name);
  }

  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseBegin;
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

  public isCardAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    const self = room.getPlayerById(owner);
    const player = room.getPlayerById(target);
    let isAvailable = true;
    if (self.Dying) {
      isAvailable = player.Hp < player.MaxHp;
    }
    return owner !== target && isAvailable;
  }

  isAvailableTarget() {
    return false;
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    Precondition.exists(event.fromId, 'no fromId for alcohol');
    const from = room.getPlayerById(event.fromId);
    if (from.Dying) {
      EventPacker.addMiddleware({ tag: this.recoverTag, data: true }, event);
    } else {
      event.toIds = [event.fromId];
    }
    event.targetGroup = [[event.fromId]];
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds } = event;
    const toId = Precondition.exists(toIds, 'no toIds for alcohol')[0];
    if (EventPacker.getMiddleware<boolean>(this.recoverTag, event)) {
      await room.recover({
        recoveredHp: 1,
        recoverBy: event.fromId,
        toId,
      });
    } else {
      room.getPlayerById(toId).getDrunk();
      room.broadcast(GameEventIdentifiers.DrunkEvent, { toId, drunk: true });
    }
    return true;
  }
}
