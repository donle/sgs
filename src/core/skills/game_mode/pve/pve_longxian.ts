import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

// 难2 【龙弦】锁定技，你造成伤害改为增加等量体力（且能超过体力上限）；准备阶段开始时，其他角色当前体力调整为已损失体力值并摸一张牌。
@CompulsorySkill({ name: 'pve_longxian', description: 'pve_longxian_description' })
export class PveLongXian extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage: AllStage) {
    return stage === DamageEffectStage.DamageEffect && !event.isFromChainedDamage;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.hasSkill(this.GeneralName) && event.fromId === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    damageEvent.damage = -damageEvent.damage;
    damageEvent.messages = damageEvent.messages || [];
    damageEvent.messages.push(
      TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, damage change to {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(damageEvent.fromId!)),
        this.Name,
        -damageEvent.damage,
      ).toString(),
    );

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveLongXian.Name, description: PveLongXian.Description })
export class PveLongXianShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.PrepareStage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    for (const player of room.getOtherPlayers(fromId)) {
      if (player.LostHp>=player.Hp) {
        await room.recover({
          recoveredHp:  player.LostHp-player.Hp,
          recoverBy: player.Id,
          toId: player.Id,
        });
      }else{
        await room.loseHp(player.Id, player.Hp-player.LostHp);
      }
    await room.drawCards(1, player.Id, 'top', player.Id, this.Name);
  }
    return true;
  }
}
