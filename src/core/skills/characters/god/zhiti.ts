import { CharacterEquipSections } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PinDianStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, GlobalRulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'zhiti', description: 'zhiti_description' })
export class ZhiTi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PinDianEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === DamageEffectStage.AfterDamageEffect ||
      stage === DamageEffectStage.AfterDamagedEffect ||
      stage === PinDianStage.PinDianResultConfirmed
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PinDianEvent>,
    stage?: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (owner.DisabledEquipSections.length === 0) {
      return false;
    }

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const toId = stage === DamageEffectStage.AfterDamageEffect ? damageEvent.toId : damageEvent.fromId;
      if (!toId) {
        return false;
      }

      const to = room.getPlayerById(toId);
      return (
        ((damageEvent.fromId === owner.Id &&
          damageEvent.cardIds &&
          Sanguosha.getCardById(damageEvent.cardIds[0]).GeneralName === 'duel') ||
          damageEvent.toId === owner.Id) &&
        !to.Dead &&
        room.withinAttackDistance(owner, to) &&
        to.LostHp > 0
      );
    } else if (identifier === GameEventIdentifiers.PinDianEvent) {
      const pindianEvent = content as ServerEventFinder<GameEventIdentifiers.PinDianEvent>;
      const currentProcedureIndex = pindianEvent.procedures.length - 1;
      const currentProcedure = pindianEvent.procedures[currentProcedureIndex];
      let toId = owner.Id;
      if (pindianEvent.fromId === owner.Id) {
        toId = currentProcedure.toId;
      } else if (currentProcedure.toId === owner.Id) {
        toId = pindianEvent.fromId;
      }
      if (toId !== owner.Id) {
        const to = room.getPlayerById(toId);
        return (
          to &&
          !to.Dead &&
          room.withinAttackDistance(owner, to) &&
          to.LostHp > 0 &&
          currentProcedure.winner === owner.Id
        );
      }
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: room.getPlayerById(fromId).DisabledEquipSections,
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose and resume an equip section',
          this.Name,
        ).extract(),
        triggeredBySkills: [this.Name],
      }),
      fromId,
    );

    resp.selectedOption = resp.selectedOption || room.getPlayerById(fromId).DisabledEquipSections[0];

    await room.resumePlayerEquipSections(fromId, resp.selectedOption as CharacterEquipSections);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZhiTi.Name, description: ZhiTi.Description })
export class ZhiTiShadow extends GlobalRulesBreakerSkill {
  public breakAdditionalCardHold(room: Room, owner: Player, target: Player): number {
    return room.withinAttackDistance(owner, target) && target.LostHp > 0 ? -1 : 0;
  }
}
