import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'kuanggu', description: 'kuanggu_description'})
export class Kuanggu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.getFlag<boolean>(this.GeneralName) === true;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const fromId = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (fromId !== undefined) {
      const weiyan = room.getPlayerById(skillUseEvent.fromId);
      weiyan.removeFlag(this.GeneralName);

      const options: string[] = ['kuanggu:draw'];

      if (weiyan.Hp < weiyan.MaxHp) {
        options.push('kuanggu:recover');
      }

      const askForChooseEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options,
        toId: skillUseEvent.fromId,
        conversation: 'Kuanggu triggered, please choose one'
      };
      
      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChooseEvent),
        skillUseEvent.fromId,
      );
      
      const { selectedOption } = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        skillUseEvent.fromId
      );

      if (selectedOption === 'kuanggu:draw') {
        await room.drawCards(1, skillUseEvent.fromId);
      } else  {
        await room.recover({
          recoveredHp: 1,
          recoverBy: skillUseEvent.fromId,
          toId: skillUseEvent.fromId,
        });
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
    weiyan.setFlag<boolean>(this.GeneralName, true);

    return true;
  }
}
