import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'mobile_yizheng', description: 'mobile_yizheng_description' })
export class MobileYiZheng extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getPlayerById(owner).Hp >= room.getPlayerById(target).Hp && room.canPindian(owner, target);
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const pindianReport = await room.pindian(fromId, toIds, this.Name);
    if (pindianReport.pindianRecord[0].winner === fromId) {
      room.getFlag<boolean>(toIds[0], this.Name) || room.setFlag<boolean>(toIds[0], this.Name, true, this.Name);
      room.getPlayerById(toIds[0]).hasShadowSkill(MobileYiZhengDebuff.Name) ||
        (await room.obtainSkill(toIds[0], MobileYiZhengDebuff.Name));
    } else {
      await room.changeMaxHp(fromId, -1);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_myizheng_debuff', description: 's_myizheng_debuff_description' })
export class MobileYiZhengDebuff extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.toPlayer === owner.Id && content.to === PlayerPhase.DrawCardStage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, MobileYiZheng.Name);
    await room.skip(event.fromId, PlayerPhase.DrawCardStage);

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}
