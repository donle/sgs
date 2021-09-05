import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'anguo', description: 'anguo_description' })
export class AnGuo extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toIds[0]);

    let flag = 1;
    for (const player of [to, from]) {
      if (
        flag % 2 !== 0 &&
        !room
          .getOtherPlayers(player.Id)
          .find(p => p.getCardIds(PlayerCardsArea.HandArea).length < player.getCardIds(PlayerCardsArea.HandArea).length)
      ) {
        flag *= 2;
        await room.drawCards(1, player.Id, 'top', fromId, this.Name);
      }

      if (flag % 3 !== 0 && !room.getOtherPlayers(player.Id).find(p => p.Hp < player.Hp) && player.LostHp > 0) {
        flag *= 3;
        await room.recover({
          toId: player.Id,
          recoveredHp: 1,
          recoverBy: fromId,
        });
      }

      if (
        flag % 5 !== 0 &&
        !room
          .getOtherPlayers(player.Id)
          .find(
            p => p.getCardIds(PlayerCardsArea.EquipArea).length < player.getCardIds(PlayerCardsArea.EquipArea).length,
          )
      ) {
        const equips = room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Equip] }));
        if (equips.length > 0) {
          const randomEquip = equips[Math.floor(Math.random() * equips.length)];
          if (player.canUseCardTo(room, randomEquip, player.Id)) {
            flag *= 5;
            await room.useCard({
              fromId: player.Id,
              targetGroup: [[player.Id]],
              cardId: randomEquip,
              customFromArea: CardMoveArea.DrawStack,
              triggeredBySkills: [this.Name],
            });
          }
        }
      }
    }

    return true;
  }
}
