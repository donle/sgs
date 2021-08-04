import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ZhiHeng } from 'core/skills';
import { AiLibrary } from '../ai_lib';
import { ActiveSkillTrigger, ActiveSkillTriggerPair } from '../ai_skill_trigger';

export const ZhiHengTrigger: ActiveSkillTrigger<ZhiHeng> = (room: Room, ai: Player, skill: ZhiHeng) => {
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

export const zhiHengTriggerPair: ActiveSkillTriggerPair<ZhiHeng> = [ZhiHeng.GeneralName, ZhiHengTrigger];
