import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardType } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { ActiveSkill } from 'core/skills/skill';
import type { CardId } from 'core/cards/libs/card_props';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { ZhiHeng } from 'core/skills';

export class ZhiHengSkillTrigger extends ActiveSkillTriggerClass<ZhiHeng> {
  skillTrigger = (room: Room, ai: Player, skill: ZhiHeng) => {
    if (!skill.canUse(room, ai)) {
      return;
    }

    const mustKeepCardNames = ['wuzhongshengyou', 'peach', 'guohechaiqiao', 'lebusishu'];
    const handcards = ai.getCardIds(PlayerCardsArea.HandArea);
    const zhihengCards: CardId[] = [...handcards];
    const weaponId = ai.getEquipment(CardType.Weapon);
    const offenseRideId = ai.getEquipment(CardType.OffenseRide);
    const enemies = AiLibrary.sortEnemiesByRole(room, ai);

    if (enemies.find(enemy => room.distanceBetween(ai, enemy) <= 1)) {
      mustKeepCardNames.push('shunshouqianyang', 'bingliangcunduan');
      if (weaponId !== undefined) {
        const weapon = Sanguosha.getCardById(weaponId);
        if (weapon.Name !== 'guanshifu' && weapon.Name !== 'qinggang') {
          zhihengCards.push(weaponId);
        }
      }

      if (offenseRideId !== undefined) {
        zhihengCards.push(offenseRideId);
      }
    }
    if (
      enemies.filter(enemy => {
        const equip = enemy.getEquipment(CardType.Shield);
        return equip !== undefined && Sanguosha.getCardById(equip).Name !== 'tengjia';
      }).length >=
      enemies.length / 2
    ) {
      mustKeepCardNames.push('nanmanruqing', 'wanjianqifa');
    }

    const shieldId = ai.getEquipment(CardType.Shield);
    const shield = shieldId ? Sanguosha.getCardById(shieldId) : undefined;
    if (shield && shield.Name === 'baiyinshizi') {
      zhihengCards.push(shieldId!);
    }

    const availableCards = zhihengCards.filter(card => !mustKeepCardNames.includes(Sanguosha.getCardById(card).Name));
    return {
      fromId: ai.Id,
      skillName: skill.Name,
      cardIds: availableCards,
    };
  };

  public dynamicallyAdjustSkillUsePriority(
    room: Room,
    ai: Player,
    skill: ZhiHeng,
    sortedActions: (ActiveSkill | CardId)[],
  ) {
    const highPriorityCards = ['wuzhongshengyou', 'shunshouqianyang', 'guohechaiqiao', 'bingliangcunduan', 'lebusishu'];

    const index = sortedActions.findIndex(item => item === skill);
    let lasthighPriorityCardIndex = -1;

    for (let i = 0; i < sortedActions.length; i++) {
      const item = sortedActions[i];
      if (!(item instanceof ActiveSkill)) {
        const card = Sanguosha.getCardById(item);
        if (highPriorityCards.includes(card.Name)) {
          lasthighPriorityCardIndex = i;
        }
      }
    }

    if (lasthighPriorityCardIndex >= 0) {
      const swap = skill;
      sortedActions[index] = sortedActions[lasthighPriorityCardIndex];
      sortedActions[lasthighPriorityCardIndex] = swap;
    }

    return sortedActions;
  }
}
