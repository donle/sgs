import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
  SkillEffectStage,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FlagEnum } from 'core/shares/types/flag_list';
import {
  ActiveSkill,
  CommonSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'pingjian', description: 'pingjian_description' })
export class PingJian extends ActiveSkill {
  public static readonly PingJianSkillPool: string[][] = [
    [
      'rende',
      'yijue',
      'zhiheng',
      'qixi',
      'fanjian',
      'guose',
      'jieyin',
      'qingnang',
      'lijian',
      'qiangxi',
      'quhu',
      'tianyi',
      'luanji',
      'dimeng',
      'jiuchi',
      'zhijian',
      'sanyao',
      'jianyan',
      'ganlu',
      'mingce',
      'xianzhen',
      'anxu',
      'gongji',
      'qice',
      'mieji',
      'shenxing',
      'jijie',
      'gongxin',
    ],
    [
      'jianxiong',
      'fankui',
      'ganglie',
      'jieming',
      'fangzhu',
      'enyuan',
      '#jiushi',
      'zhichi',
      'zhiyu',
      'chengxiang',
      'yuce',
      'wangxi',
      'guixin',
    ],
    ['biyue', 'jushou', 'miji', 'zhiyan', 'juece', 'bingyi', 'jujian'],
  ];

  public static readonly PingJianSkillMap: { [mainSkill: string]: string[] } = {
    zhijian: ['#zhijian'],
  };

  public static readonly FakeHookedSkillMap: { [mainSkill: string]: string[] } = {
    tianyi: ['##tianyi', '###tianyi'],
    xianzhen: ['#xianzhen', '##xianzhen'],
  };

  public canUse(room: Room, owner: Player): boolean {
    const skillsUsed = owner.getFlag<string[][]>(this.Name) || [];
    skillsUsed[0] = skillsUsed[0] || [];
    return !owner.hasUsedSkill(this.Name) && skillsUsed[0].length < PingJian.PingJianSkillPool[0].length;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    let newSkillPool: string[] = [...PingJian.PingJianSkillPool[0]];
    const from = room.getPlayerById(fromId);

    const skillsUsed = from.getFlag<string[][]>(this.Name) || [];
    skillsUsed[0] = skillsUsed[0] || [];
    if (skillsUsed.length > 0) {
      newSkillPool = newSkillPool.filter(skill => !skillsUsed[0].includes(skill));
    }

    const options: string[] = [];
    const n = newSkillPool.length;
    for (let i = 0; i < Math.min(n, 3); i++) {
      const chosenSkill = newSkillPool[Math.floor(Math.random() * newSkillPool.length)];
      options.push(chosenSkill);
      const index = newSkillPool.findIndex(skill => skill === chosenSkill);
      newSkillPool.splice(index, 1);
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher('{0}: please choose pingjian options', this.Name).extract(),
      toId: fromId,
      triggeredBySkills: [this.Name],
    });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      askForChooseEvent,
      fromId,
    );

    response.selectedOption = response.selectedOption || options[0];
    if (!from.hasSkill(response.selectedOption)) {
      await room.obtainSkill(fromId, response.selectedOption, true);
      skillsUsed[0].push(response.selectedOption);
      room.setFlag<string[][]>(fromId, this.Name, skillsUsed);
      from.setFlag<string[]>(FlagEnum.SkillsUsing, [
        ...(from.getFlag<string[]>(FlagEnum.SkillsUsing) || []),
        response.selectedOption,
      ]);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PingJian.Name, description: PingJian.Description })
export class PingJianShadow extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const skillsUsed = owner.getFlag<string[][]>(this.GeneralName) || [];

    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      skillsUsed[1] = skillsUsed[1] || [];
      return damageEvent.toId === owner.Id && skillsUsed[1].length < PingJian.PingJianSkillPool[1].length;
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      skillsUsed[2] = skillsUsed[2] || [];
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        skillsUsed[2].length < PingJian.PingJianSkillPool[2].length
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    let realEvent: ServerEventFinder<GameEventIdentifiers> = unknownEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent
    >;
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      realEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    }
    const index = identifier === GameEventIdentifiers.DamageEvent ? 1 : 2;
    let newSkillPool: string[] = [...PingJian.PingJianSkillPool[index]];
    const from = room.getPlayerById(fromId);

    const skillsUsed = from.getFlag<string[][]>(this.GeneralName) || [];
    skillsUsed[index] = skillsUsed[index] || [];
    if (skillsUsed.length > 0) {
      newSkillPool = newSkillPool.filter(skill => !skillsUsed[index].includes(skill));
    }

    const options: string[] = [];
    const poolLength = newSkillPool.length;
    for (let i = 0; i < Math.min(poolLength, 3); i++) {
      const chosenSkill = newSkillPool[Math.floor(Math.random() * newSkillPool.length)];
      options.push(chosenSkill);
      const pindex = newSkillPool.findIndex(skill => skill === chosenSkill);
      newSkillPool.splice(pindex, 1);
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose pingjian options',
        this.GeneralName,
      ).extract(),
      toId: fromId,
      triggeredBySkills: [this.Name],
    });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      askForChooseEvent,
      fromId,
    );

    response.selectedOption = response.selectedOption || options[0];
    const realSkill = Sanguosha.getSkillBySkillName(response.selectedOption);
    if (!(realSkill instanceof TriggerSkill)) {
      return false;
    }

    const currentStage =
      identifier === GameEventIdentifiers.DamageEvent
        ? DamageEffectStage.AfterDamagedEffect
        : PhaseStageChangeStage.StageChanged;
    if (
      !from.hasSkill(response.selectedOption) &&
      realSkill.isTriggerable(realEvent, currentStage) &&
      realSkill.canUse(room, from, realEvent, currentStage)
    ) {
      await room.obtainSkill(fromId, response.selectedOption, true);
      skillsUsed[index].push(response.selectedOption);
      room.setFlag<string[][]>(fromId, this.GeneralName, skillsUsed);
      from.setFlag<string[]>(FlagEnum.SkillsUsing, [
        ...(from.getFlag<string[]>(FlagEnum.SkillsUsing) || []),
        response.selectedOption,
      ]);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: PingJianShadow.Name, description: PingJianShadow.Description })
export class PingJianLoseSkill extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.SkillEffectEvent>,
    stage: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === SkillEffectStage.BeforeSkillEffect;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.SkillEffectEvent>,
  ) {
    const skillsUsing = owner.getFlag<string[]>(FlagEnum.SkillsUsing);
    if (!skillsUsing) {
      return false;
    }

    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PlayCardStageEnd
      );
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.SkillEffectEvent) {
      const skillEffectEvent = content as ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>;
      return (
        skillEffectEvent.fromId === owner.Id &&
        skillsUsing.find(
          skill =>
            skill === skillEffectEvent.skillName ||
            (PingJian.PingJianSkillMap[skill] && PingJian.PingJianSkillMap[skill].includes(skillEffectEvent.skillName)),
        ) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.SkillEffectEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const skillsUsing = from.getFlag<string[]>(FlagEnum.SkillsUsing);
      from.removeFlag(FlagEnum.SkillsUsing);
      for (const skill of skillsUsing) {
        if (from.hasSkill(skill)) {
          await room.loseSkill(fromId, skill, true);
        }
      }
    } else if (identifier === GameEventIdentifiers.SkillEffectEvent) {
      const skillEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>;
      if (from.hasSkill(skillEffectEvent.skillName)) {
        const skillsUsing = from.getFlag<string[]>(FlagEnum.SkillsUsing);
        const index = skillsUsing.findIndex(
          skill =>
            skill === skillEffectEvent.skillName ||
            (PingJian.PingJianSkillMap[skill] && PingJian.PingJianSkillMap[skill].includes(skillEffectEvent.skillName)),
        );
        const skillName = skillsUsing.splice(index, 1)[0];
        from.setFlag<string[]>(FlagEnum.SkillsUsing, skillsUsing);
        await room.loseSkill(fromId, skillName, true);
        for (const shadowSkill of Sanguosha.getShadowSkillsBySkillName(skillName)) {
          if (
            PingJian.FakeHookedSkillMap[skillName] &&
            PingJian.FakeHookedSkillMap[skillName].includes(shadowSkill.Name)
          ) {
            await room.obtainSkill(fromId, shadowSkill.Name);
          }
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: PingJianLoseSkill.Name, description: PingJianLoseSkill.Description })
export class PingJianHookSkill extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    let canUse = content.fromPlayer === owner.Id && content.from === PlayerPhase.PhaseFinish;
    if (canUse) {
      canUse = false;
      for (const hookedSkills of Object.values(PingJian.FakeHookedSkillMap)) {
        if (hookedSkills.find(skill => owner.hasShadowSkill(skill))) {
          canUse = true;
          break;
        }
      }
    }

    return canUse;
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    for (const hookedSkills of Object.values(PingJian.FakeHookedSkillMap)) {
      const skill = hookedSkills.find(skill => room.getPlayerById(fromId).hasShadowSkill(skill));
      if (skill) {
        await room.loseSkill(fromId, skill);
      }
    }
    return true;
  }
}
