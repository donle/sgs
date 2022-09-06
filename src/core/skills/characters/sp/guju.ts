import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'guju', description: 'guju_description' })
export class GuJu extends TriggerSkill implements OnDefineReleaseTiming {
  private readonly HiddenFlag = 'guju_hidden_flag';

  public async whenLosingSkill(room: Room, owner: Player) {
    if (owner.getFlag<number>(this.Name)) {
      owner.setFlag<number>(this.HiddenFlag, owner.getFlag<number>(this.Name));
      room.removeFlag(owner.Id, this.Name);
    }
  }

  public async whenObtainingSkill(room: Room, owner: Player) {
    owner.getFlag<number>(this.HiddenFlag) &&
      room.setFlag<number>(
        owner.Id,
        this.Name,
        owner.getFlag<number>(this.HiddenFlag),
        TranslationPack.translationJsonPatcher('guju times: {0}', owner.getFlag<number>(this.HiddenFlag)).toString(),
      );
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return room.getMark(content.toId, MarkEnum.Kui) > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    const originalTimes = room.getFlag<number>(event.fromId, this.Name) || 0;
    room.setFlag<number>(
      event.fromId,
      this.Name,
      originalTimes + 1,
      TranslationPack.translationJsonPatcher('guju times: {0}', originalTimes + 1).toString(),
    );

    return true;
  }
}
