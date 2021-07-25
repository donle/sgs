import { CharacterEquipSections } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  CommonSkill,
  PersistentSkill,
  ShadowSkill,
  Skill,
  SkillProhibitedSkill,
  SkillType,
  TriggerSkill,
} from 'core/skills/skill';
import { OnDefineReleaseTiming, SkillLifeCycle } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'duorui', description: 'duorui_description' })
export class DuoRui extends TriggerSkill {
  public static readonly DuoRuiTarget = 'duorui_target';
  public static readonly DuoRuiSkill = 'duorui_skill';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer === owner &&
      content.toId !== owner.Id &&
      owner.AvailableEquipSections.length > 0 &&
      (owner.getFlag<PlayerId>(DuoRui.DuoRuiTarget) === undefined ||
        owner.getFlag<string>(DuoRui.DuoRuiSkill) === undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const from = room.getPlayerById(fromId);

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: from.AvailableEquipSections,
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose and abort an equip section',
          this.Name,
        ).extract(),
      }),
      fromId,
    );

    response.selectedOption = response.selectedOption || from.AvailableEquipSections[0];

    await room.abortPlayerEquipSections(fromId, response.selectedOption as CharacterEquipSections);

    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const toId = damageEvent.toId;
    const to = room.getPlayerById(toId);
    const skills = to
      .getPlayerSkills()
      .filter(
        skill =>
          !skill.isShadowSkill() &&
          skill.SkillType !== SkillType.Awaken &&
          skill.SkillType !== SkillType.Limit &&
          !skill.isLordSkill(),
      );
    if (!to.Dead && skills.length > 0) {
      const skillNames = skills.map(skill => skill.Name);
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
          options: skillNames,
          toId: fromId,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose a skill to nullify and you obtain it until the end of target’s turn',
            this.Name,
          ).extract(),
        }),
        fromId,
      );

      resp.selectedOption = resp.selectedOption || skillNames[0];

      room.setFlag<string>(
        toId,
        this.Name,
        resp.selectedOption,
        TranslationPack.translationJsonPatcher('duorui target skill: {0}', resp.selectedOption).toString(),
      );
      from.setFlag<PlayerId>(DuoRui.DuoRuiTarget, toId);
      room.setFlag<string>(
        fromId,
        DuoRui.DuoRuiSkill,
        resp.selectedOption,
        TranslationPack.translationJsonPatcher('duorui skill: {0}', resp.selectedOption).toString(),
      );

      await room.obtainSkill(toId, DuoRuiProhibited.Name);
      await room.obtainSkill(fromId, resp.selectedOption);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 'shadow_duorui', description: 'shadow_duorui_description' })
export class DuoRuiProhibited extends SkillProhibitedSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    if (!player.getFlag<string>(DuoRui.Name)) {
      return;
    }

    for (const playerSkill of player.getSkillProhibitedSkills(true)) {
      this.skillFilter(playerSkill, player) &&
        (await SkillLifeCycle.executeHookedOnNullifying(playerSkill, room, player));
    }
  }

  public async whenLosingSkill(room: Room, player: Player) {
    if (!player.getFlag<string>(DuoRui.Name)) {
      return;
    }

    for (const playerSkill of player.getSkillProhibitedSkills(true)) {
      this.skillFilter(playerSkill, player) &&
        (await SkillLifeCycle.executeHookedOnNullifying(playerSkill, room, player));
    }
  }

  public skillFilter(skill: Skill, owner: Player): boolean {
    return skill.GeneralName === owner.getFlag<string>(DuoRui.Name);
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: DuoRui.Name, description: DuoRui.Description })
export class DuoRuiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.from === PlayerPhase.PhaseFinish && content.fromPlayer === owner.getFlag<PlayerId>(DuoRui.DuoRuiTarget)
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const toId = from.getFlag<PlayerId>(DuoRui.DuoRuiTarget);
    if (toId) {
      const to = room.getPlayerById(toId);

      if (to && to.hasShadowSkill(DuoRuiProhibited.Name)) {
        await room.loseSkill(toId, DuoRuiProhibited.Name);
      }

      room.removeFlag(toId, this.GeneralName);
    }

    room.removeFlag(fromId, DuoRui.DuoRuiTarget);
    const skill = from.getFlag<string>(DuoRui.DuoRuiSkill);
    room.removeFlag(fromId, DuoRui.DuoRuiSkill);
    if (skill && from.hasSkill(skill)) {
      await room.loseSkill(fromId, skill);
    }

    return true;
  }
}
