import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'fangzhu', description: 'fangzhu_description' })
export class FangZhu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === event.toId;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = skillUseEvent;
    const to = room.getPlayerById(toIds![0]);
    const from = room.getPlayerById(fromId);

    if (to.getPlayerCards().length < from.LostHp) {
      await room.turnOver(toIds![0]);
      await room.drawCards(from.LostHp, toIds![0], undefined, fromId, this.Name);
    } else {
      const askForOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['option-one', 'option-two'],
        conversation: TranslationPack.translationJsonPatcher(
          'please choose fangzhu options:{0}',
          from.LostHp,
        ).extract(),
        toId: toIds![0],
        askedBy: fromId,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForOptionsEvent),
        toIds![0],
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        toIds![0],
      );
      response.selectedOption = response.selectedOption || 'option-one';
      if (response.selectedOption === 'option-one') {
        await room.turnOver(toIds![0]);
        await room.drawCards(from.LostHp, toIds![0], undefined, fromId, this.Name);
      } else {
        const response = await room.askForCardDrop(
          toIds![0],
          from.LostHp,
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          undefined,
          this.Name,
        );
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds![0]);
        await room.loseHp(toIds![0], 1);
      }
    }

    return true;
  }
}
