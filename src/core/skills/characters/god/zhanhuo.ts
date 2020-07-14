import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ActiveSkill, LimitSkill } from 'core/skills/skill';

@LimitSkill({ name: 'zhanhuo', description: 'zhanhuo_description' })
export class ZhanHuo extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return owner.getMark(MarkEnum.JunLve) > 0;
  }

  public cardFilter() {
    return true;
  }

  public isAvailableCard() {
    return false;
  }

  public numberOfTargets() {
    return [];
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length <= owner.getMark(MarkEnum.JunLve) && targets.length > 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return room.getPlayerById(target).ChainLocked === true;
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = skillUseEvent;
    const from = room.getPlayerById(fromId);

    room.addMark(fromId, MarkEnum.JunLve, -from.getMark(MarkEnum.JunLve));

    for (const targetId of toIds!) {
      const target = room.getPlayerById(targetId);
      const equips = target.getCardIds(PlayerCardsArea.EquipArea);
      if (equips.length > 0) {
        await room.dropCards(CardMoveReason.PassiveDrop, equips, targetId, fromId, this.Name);
      }
    }

    const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: fromId,
      players: toIds!,
      requiredAmount: 1,
      conversation: 'zhanhuo: please choose a target to whom you cause 1 fire damage',
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForPlayerChoose, fromId);

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingPlayerEvent, fromId);

    const starter = response.selectedPlayers === undefined ? toIds![0] : response.selectedPlayers[0];
    await room.damage({
      fromId,
      toId: starter,
      damage: 1,
      damageType: DamageType.Fire,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
