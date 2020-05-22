import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'kuanggu', description: 'kuanggu_description' })
export class Kuanggu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.fromId && owner.getFlag<boolean>(this.GeneralName) === true;
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

    const response = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, weiyanId);

    response.selectedOption = response.selectedOption || 'kuanggu:draw';
    if (response.selectedOption === 'kuanggu:draw') {
      await room.drawCards(1, weiyanId);
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
    const weiyan = room.getPlayerById(skillUseEvent.fromId);
    weiyan.removeFlag(this.GeneralName);

    if (fromId !== undefined) {
      await this.doKuanggu(room, fromId);
    }
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: Kuanggu.GeneralName, description: Kuanggu.Description })
export class KuangguShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage: DamageEffectStage) {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.fromId && room.distanceBetween(owner, room.getPlayerById(content.toId)) <= 1;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const weiyan = room.getPlayerById(event.fromId);
    weiyan.setFlag<boolean>(Kuanggu.GeneralName, true);
    return true;
  }
}
