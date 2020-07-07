import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, HpChangeStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'kuanggu', description: 'kuanggu_description' })
export class Kuanggu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>, stage: AllStage) {
    return stage === HpChangeStage.AtferHpChange && event.byReaon === 'damage';
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>) {
    return owner.Id === content.fromId && room.distanceBetween(owner, room.getPlayerById(content.toId)) <= 1;
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.HpChangeEvent>) {
    return event.amount;
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
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.HpChangeEvent>;

    if (fromId !== undefined) {
      await this.doKuanggu(room, fromId);
    }
    return true;
  }
}
