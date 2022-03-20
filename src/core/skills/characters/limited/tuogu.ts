import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { SkillType, TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tuogu', description: 'tuogu_description' })
export class TuoGu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return (
      content.playerId !== owner.Id &&
      room
        .getPlayerById(content.playerId)
        .getPlayerSkills(undefined, true)
        .find(
          skill =>
            !skill.isShadowSkill() &&
            !skill.isLordSkill() &&
            skill.SkillType !== SkillType.Limit &&
            skill.SkillType !== SkillType.Awaken &&
            skill.SkillType !== SkillType.Quest &&
            !skill.isStubbornSkill(),
        ) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    const deadMan = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>).playerId;
    const skillNames = room
      .getPlayerById(deadMan)
      .getPlayerSkills(undefined, true)
      .filter(
        skill =>
          !skill.isShadowSkill() &&
          !skill.isLordSkill() &&
          skill.SkillType !== SkillType.Limit &&
          skill.SkillType !== SkillType.Awaken &&
          skill.SkillType !== SkillType.Quest &&
          !skill.isStubbornSkill(),
      )
      .map(skill => skill.Name);

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: skillNames,
        toId: deadMan,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a skill to let {1} gain it',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).extract(),
        triggeredBySkills: [this.Name],
      }),
      deadMan,
    );

    response.selectedOption = response.selectedOption || skillNames[Math.floor(Math.random() * skillNames.length)];

    const from = room.getPlayerById(fromId);
    const lastSkillName = room.getFlag<string>(fromId, this.Name);
    lastSkillName && (await room.loseSkill(fromId, lastSkillName, true));
    room.removeFlag(fromId, this.Name);

    if (!from.hasSkill(response.selectedOption)) {
      await room.obtainSkill(fromId, response.selectedOption);
      from.setFlag<string>(this.Name, response.selectedOption);
    }

    return true;
  }
}
