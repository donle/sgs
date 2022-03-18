import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, SkillUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { FlagEnum } from 'core/shares/types/flag_list';
import { ActiveSkill, Skill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, LimitSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'god_huishi_sec', description: 'god_huishi_sec_description' })
export class GodHuiShiSec extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(): boolean {
    return true;
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

    const awakeningSkills: Skill[] = [];
    const to = room.getPlayerById(toIds[0]);
    for (const skill of to.getPlayerSkills('awaken', true)) {
      to.hasUsedSkill(skill.Name) || awakeningSkills.push(skill);
    }
    if (room.getPlayerById(fromId).MaxHp >= room.AlivePlayers.length && awakeningSkills.length > 0) {
      const options = awakeningSkills.map(skill => skill.Name);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose god_huishi_sec options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption = response.selectedOption || options[0];

      const originalSkillNames = to.getFlag<string[]>(FlagEnum.EnableToAwaken) || [];
      if (!originalSkillNames.includes(response.selectedOption)) {
        originalSkillNames.push(response.selectedOption);
        let tag = '{0}[';
        for (let i = 1; i <= originalSkillNames.length; i++) {
          tag = tag + '{' + i + '}';
        }
        tag = tag + ']';
        room.setFlag<string[]>(
          toIds[0],
          FlagEnum.EnableToAwaken,
          originalSkillNames,
          TranslationPack.translationJsonPatcher(tag, this.Name, ...originalSkillNames).toString(),
        );

        to.hasShadowSkill(GodHuiShiSecRemover.Name) || (await room.obtainSkill(toIds[0], GodHuiShiSecRemover.Name));
      }
    } else {
      await room.drawCards(4, toIds[0], 'top', fromId, this.Name);
    }

    await room.changeMaxHp(fromId, -2);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_god_huishi_sec_remover', description: 's_god_huishi_sec_remover_description' })
export class GodHuiShiSecRemover extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>, stage?: AllStage): boolean {
    return stage === SkillUseStage.BeforeSkillUse;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): boolean {
    return owner.Id === content.fromId && owner.getFlag<string[]>(FlagEnum.EnableToAwaken)?.includes(content.skillName);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const content = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.SkillUseEvent>;

    const originalSkillNames = room.getFlag<string[]>(content.fromId, FlagEnum.EnableToAwaken) || [];
    if (originalSkillNames.includes(content.skillName)) {
      const index = originalSkillNames.findIndex(name => name === content.skillName);
      originalSkillNames.splice(index, 1);

      if (originalSkillNames.length === 0) {
        room.removeFlag(content.fromId, FlagEnum.EnableToAwaken);
        await room.loseSkill(content.fromId, this.Name);
      } else {
        let tag = '{0}[';
        for (let i = 1; i <= originalSkillNames.length; i++) {
          tag = tag + '{' + i + '}';
        }
        tag = tag + ']';
        room.setFlag<string[]>(
          content.fromId,
          FlagEnum.EnableToAwaken,
          originalSkillNames,
          TranslationPack.translationJsonPatcher(tag, GodHuiShiSec.Name, ...originalSkillNames).toString(),
        );
      }
    }

    return true;
  }
}
