import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'yaowu', description: 'yaowu_description' })
export class YaoWu extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    const { fromId, toId, cardIds } = content;
    if (cardIds === undefined) {
      return false;
    }

    const card = Sanguosha.getCardById(cardIds[0]);
    if (card.isRed() && (!fromId || room.getPlayerById(fromId).Dead)) {
      return false;
    }

    return owner.Id === toId && card.GeneralName === 'slash';
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId, cardIds } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    if (Sanguosha.getCardById(cardIds![0]).isRed()) {
      let selectedOption: string | undefined;

      if (fromId === undefined) {
        return false;
      }
      const source = room.getPlayerById(fromId);
      const from = room.getPlayerById(skillUseEvent.fromId);
      if (source.Hp < source.MaxHp) {
        const chooseOptionEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          toId: fromId,
          options: ['yaowu:recover', 'yaowu:draw'],
          conversation: TranslationPack.translationJsonPatcher(
            '{0} used skill {1} to you, please choose',
            TranslationPack.patchPlayerInTranslation(from),
            this.Name,
          ).extract(),
          askedBy: skillUseEvent.fromId,
        };
        room.notify(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(chooseOptionEvent),
          fromId,
        );
        const response = await room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          fromId,
        );
        selectedOption = response.selectedOption;
      }

      if (!selectedOption || selectedOption === 'yaowu:draw') {
        await room.drawCards(1, fromId, 'top', undefined, this.Name);
      } else {
        await room.recover({
          recoveredHp: 1,
          toId: fromId,
        });
      }
    } else {
      await room.drawCards(1, skillUseEvent.fromId, 'top', undefined, this.Name);
    }
    return true;
  }
}
