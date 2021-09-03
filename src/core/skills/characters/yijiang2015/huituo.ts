import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'huituo', description: 'huituo_description' })
export class HuiTuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return content.toId === owner.Id;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to judge? if the result is red, he recover, otherwise he draw {1} cards',
      this.Name,
      content.damage,
    ).extract();
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return event.toIds ? [{ from: event.fromId, tos: event.toIds }] : [];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }
    const judgeEvent = await room.judge(toIds[0], undefined, this.Name);

    if (Sanguosha.getCardById(judgeEvent.judgeCardId).isRed()) {
      await room.recover({
        toId: toIds[0],
        recoveredHp: 1,
        recoverBy: toIds[0],
      });
    } else if (Sanguosha.getCardById(judgeEvent.judgeCardId).isBlack()) {
      await room.drawCards(
        (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage,
        toIds[0],
        'top',
        toIds[0],
        this.Name,
      );
    }

    return true;
  }
}
