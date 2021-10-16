import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'songshu', description: 'songshu_description' })
export class SongShu extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.getFlag<boolean>(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public async whenRefresh(room: Room, owner: Player) {
    room.removeFlag(owner.Id, this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.canPindian(owner, target);
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const { pindianRecord } = await room.pindian(event.fromId, event.toIds, this.Name);
    if (pindianRecord[0].winner !== event.fromId) {
      await room.drawCards(2, event.toIds[0], 'top', event.toIds[0], this.Name);
      room.setFlag<boolean>(event.fromId, this.Name, true);
    }

    return true;
  }
}
