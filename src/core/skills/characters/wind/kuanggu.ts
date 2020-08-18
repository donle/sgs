import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, HpChangeStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'kuanggu', description: 'kuanggu_description' })
export class KuangGu extends TriggerSkill {
  public static readonly KuangGuTag = 'kuangGuTag';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.fromId && EventPacker.getMiddleware<boolean>(KuangGu.KuangGuTag, content) === true;
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onTrigger() {
    return true;
  }

  private async doKuanggu(room: Room, weiyanId: PlayerId) {
    const weiyan = room.getPlayerById(weiyanId);

    const options: string[] = ['kuanggu:draw'];

    if (weiyan.Hp < weiyan.MaxHp) {
      options.push('kuanggu:recover');
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: 'please choose',
      toId: weiyanId,
    });

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, weiyanId);

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, weiyanId);

    response.selectedOption = response.selectedOption || 'kuanggu:draw';
    if (response.selectedOption === 'kuanggu:draw') {
      await room.drawCards(1, weiyanId, undefined, weiyanId, this.Name);
    } else {
      await room.recover({
        recoveredHp: 1,
        recoverBy: weiyanId,
        toId: weiyanId,
      });
    }
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    if (fromId !== undefined) {
      await this.doKuanggu(room, fromId);
    }
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: KuangGu.Name, description: KuangGu.Description })
export class KuangGuShadow extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>, stage?: AllStage) {
    return event.byReaon === 'damage' && stage === HpChangeStage.BeforeHpChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>) {
    return owner.Id === content.fromId && room.distanceBetween(owner, room.getPlayerById(content.toId)) <= 1;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;

    triggeredOnEvent &&
      EventPacker.addMiddleware(
        {
          tag: KuangGu.KuangGuTag,
          data: true,
        },
        triggeredOnEvent,
      );

    return true;
  }
}
