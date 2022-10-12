import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jigong', description: 'jigong_description' })
export class JiGong extends TriggerSkill {
  public static readonly JiGongNum = 'jigong_num';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.Id === event.playerId && event.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;

    const options = ['jigong:draw1', 'jigong:draw2', 'jigong:draw3'];
    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher('{0}: please choose jigong options', this.Name).extract(),
      },
      fromId,
    );
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      fromId,
    );

    if (selectedOption) {
      EventPacker.addMiddleware(
        { tag: this.Name, data: options.findIndex(option => option === selectedOption) + 1 },
        event,
      );

      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const num = EventPacker.getMiddleware<number>(this.Name, event);
    if (!num) {
      return false;
    }

    await room.drawCards(num, event.fromId, 'top', event.fromId, this.Name);

    const damage = room.Analytics.getDamageRecord(event.fromId, 'phase').reduce<number>(
      (sum, event) => sum + event.damage,
      0,
    );
    room.setFlag<number>(
      event.fromId,
      this.Name,
      damage,
      TranslationPack.translationJsonPatcher('jigong damage: {0}', damage).toString(),
    );

    room.getPlayerById(event.fromId).setFlag<number>(JiGong.JiGongNum, num);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JiGong.Name, description: JiGong.Description })
export class JiGongShadow extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.getFlag<number>(this.GeneralName) !== undefined ? owner.getFlag<number>(this.GeneralName) : -1;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JiGongShadow.Name, description: JiGongShadow.Description })
export class JiGongRemover extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage !== PhaseStageChangeStage.StageChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >,
    stage?: AllStage,
  ): boolean {
    return (
      stage === DamageEffectStage.DamageDone ||
      stage === PhaseStageChangeStage.StageChanged ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    const damage = owner.getFlag<number>(this.GeneralName);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.fromId === owner.Id && damage !== undefined;
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.DropCardStageStart &&
        damage !== undefined
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.from === PlayerPhase.PhaseFinish && damage !== undefined;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const num =
        room.getFlag<number>(fromId, this.GeneralName) +
        (unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage;
      room.setFlag<number>(
        fromId,
        this.GeneralName,
        num,
        TranslationPack.translationJsonPatcher('jigong damage: {0}', num).toString(),
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      room.getFlag<number>(fromId, this.GeneralName) >= room.getFlag<number>(fromId, JiGong.JiGongNum) &&
        (await room.recover({
          toId: fromId,
          recoveredHp: 1,
          recoverBy: fromId,
        }));

      room.getPlayerById(fromId).removeFlag(JiGong.JiGongNum);
    } else {
      room.removeFlag(fromId, this.GeneralName);
      room.getFlag<number>(fromId, JiGong.JiGongNum) !== undefined &&
        room.getPlayerById(fromId).removeFlag(JiGong.JiGongNum);
    }

    return true;
  }
}
