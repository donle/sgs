import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
} from 'core/skills/skill';

@CommonSkill({ name: 'qiangxi', description: 'qiangxi_description' })
export class QiangXi extends ActiveSkill {
  public static readonly exUse = 'QiangXi_ExUse';

  public async whenRefresh(room: Room, owner: Player) {
    room.removeFlag(owner.Id, QiangXi.exUse);
    for (const player of room.AlivePlayers) {
      room.removeFlag(player.Id, this.GeneralName);
    }
  }

  public canUse(room: Room, owner: Player) {
    return owner.hasUsedSkillTimes(this.Name) < 2;
  }

  public numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length <= 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getFlag<boolean>(target, this.Name) !== true;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).is(CardType.Weapon);
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = skillUseEvent;
    room.setFlag<boolean>(fromId, QiangXi.exUse, true);
    room.setFlag<boolean>(toIds![0], this.Name, true, false);

    if (cardIds && cardIds.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    } else {
      await room.loseHp(fromId, 1);
    }

    await room.damage({
      fromId,
      toId: toIds![0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
