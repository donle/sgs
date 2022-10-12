import { KunFen, KunFenEX } from './kunfen';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TiaoXin } from 'core/skills';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@AwakeningSkill({ name: 'fengliang', description: 'fengliang_description' })
export class FengLiang extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['tiaoxin'];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return content.dying === owner.Id && owner.Hp < 1;
  }

  public async onTrigger(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.changeMaxHp(fromId, -1);
    await room.recover({
      toId: fromId,
      recoveredHp: 2 - room.getPlayerById(fromId).Hp,
      recoverBy: fromId,
    });

    await room.obtainSkill(fromId, TiaoXin.Name, true);
    await room.updateSkill(fromId, KunFen.Name, KunFenEX.Name);

    return true;
  }
}
