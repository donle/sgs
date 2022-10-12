import { TieSuoLianHuanSkillTrigger } from 'core/ai/skills/cards/tiesuolianhuan';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, AI, CommonSkill } from 'core/skills/skill';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@AI(TieSuoLianHuanSkillTrigger)
@CommonSkill({ name: 'tiesuolianhuan', description: 'tiesuolianhuan_description' })
export class TieSuoLianHuanSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return [1, 2];
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return room.getPlayerById(owner).canUseCardTo(room, containerCard, target);
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return this.isCardAvailableTarget(owner, room, target, selectedCards, selectedTargets, containerCard);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds } = event;
    for (const toId of toIds!) {
      await room.chainedOn(toId);
    }
    return true;
  }
}
