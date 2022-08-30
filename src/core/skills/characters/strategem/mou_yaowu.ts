import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'mou_yaowu', description: 'mou_yaowu_description' })
export class MouYaoWu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    const { fromId, toId, cardIds } = content;
    if (cardIds === undefined || Sanguosha.getCardById(cardIds[0]).GeneralName !== 'slash') {
      return false;
    }

    const card = Sanguosha.getCardById(cardIds[0]);
    if (card.isRed() && (!fromId || room.getPlayerById(fromId).Dead)) {
      return false;
    }

    return owner.Id === toId;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    if (Sanguosha.getCardById(damageEvent.cardIds![0]).isRed()) {
      const source = damageEvent.fromId!;
      let selectedOption = 'mou_yaowu:draw';

      if (room.getPlayerById(source).LostHp > 0) {
        const options = [selectedOption, 'mou_yaowu:recover'];
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          {
            options,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please choose mou_yaowu options',
              this.Name,
            ).extract(),
            toId: source,
            triggeredBySkills: [this.Name],
          },
          source,
          true,
        );

        selectedOption = response.selectedOption || options[0];
      }

      if (selectedOption === 'mou_yaowu:recover') {
        await room.recover({
          toId: source,
          recoveredHp: 1,
          recoverBy: event.fromId,
        });
      } else {
        await room.drawCards(1, source, 'top', source, this.Name);
      }
    } else {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
