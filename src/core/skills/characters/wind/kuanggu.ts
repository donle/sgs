import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'kuanggu', description: 'kuanggu_description'})
export class Kuanggu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.fromId && owner.getFlag<boolean>(this.GeneralName) === true;
  }

  async onTrigger() {
    return true;
  }

  private async doKuanggu(room: Room, weiyan_id: PlayerId) {
    const weiyan = room.getPlayerById(weiyan_id);

    const options: string[] = ['kuanggu:draw'];

    if (weiyan.Hp < weiyan.MaxHp) {
      options.push('kuanggu:recover');
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent> ({
      options,
      conversation: 'please choose',
      toId: weiyan_id,
    });

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      askForChooseEvent,
      weiyan_id,
    );

    const response = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent, 
      weiyan_id
    );

    response.selectedOption = response.selectedOption || 'kuanggu:draw';
    if (response.selectedOption === 'kuanggu:draw') {
      await room.drawCards(1, weiyan_id);
    } else  {
      await room.recover({
        recoveredHp: 1,
        recoverBy: weiyan_id,
        toId: weiyan_id,
      });
    }

  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { damage, fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const weiyan = room.getPlayerById(skillUseEvent.fromId);
      weiyan.removeFlag(this.GeneralName);
    if (fromId !== undefined) {
      await this.doKuanggu(room, fromId);

      let triggerTimes = damage - 1;
      while (triggerTimes-- > 0) {
        const continuouslyTrigger: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
          invokeSkillNames: [this.Name],
          toId: fromId
        }

        room.notify(GameEventIdentifiers.AskForSkillUseEvent, continuouslyTrigger, fromId);

        const {invoke} = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);
        if (!invoke) {
          break;
        }

        await this.doKuanggu(room, fromId);
      }
    }
    
    return true;
  }  
}

@ShadowSkill
@CompulsorySkill({name: Kuanggu.GeneralName, description: Kuanggu.Description})
export class KuangguShadow extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage: DamageEffectStage) {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return room.distanceBetween(owner, room.getPlayerById(content.toId)) <= 1;
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
