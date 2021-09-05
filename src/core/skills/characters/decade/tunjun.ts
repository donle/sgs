import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { LveMing } from './lveming';

@LimitSkill({ name: 'tunjun', description: 'tunjun_description' })
export class TunJun extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return (owner.getFlag<number>(LveMing.Name) || 0) > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getPlayerById(target).getEmptyEquipSections().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    const times = room.getFlag<number>(event.fromId, LveMing.Name);
    const emptyEquipSections = room.getPlayerById(toIds[0]).getEmptyEquipSections();

    let usedNum = 0;
    for (let i = 0; i < times; i++) {
      const equips = room.findCardsByMatcherFrom(new CardMatcher({ type: [emptyEquipSections[i]] }));
      if (equips.length === 0) {
        continue;
      }

      const randomEquip = equips[Math.floor(Math.random() * equips.length)];
      if (room.getPlayerById(toIds[0]).canUseCardTo(room, randomEquip, toIds[0])) {
        await room.useCard({
          fromId: toIds[0],
          targetGroup: [[toIds[0]]],
          cardId: randomEquip,
          customFromArea: CardMoveArea.DrawStack,
        });
        if (usedNum++ === times) {
          break;
        }
      }
    }

    return true;
  }
}
