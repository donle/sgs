import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'dangxian', description: 'dangxian_description' })
export class DangXian extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.to === PlayerPhase.PhaseBegin && content.toPlayer === owner.Id;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, started an extra {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
      Functional.getPlayerPhaseRawText(PlayerPhase.PlayCardStage),
    ).extract();
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const card = room.getCardsByNameFromStack('slash', 'drop', 1)[0];
    
    if (card) {
      await room.moveCards({
        moveReason: CardMoveReason.ActivePrey,
        movedByReason: this.Name,
        toArea: CardMoveArea.HandArea,
        toId: skillUseEvent.fromId,
        movingCards: [{ card, fromArea: CardMoveArea.DropStack }],
      });
    }

    room.insertPlayerPhase(skillUseEvent.fromId, PlayerPhase.PlayCardStage);
    return true;
  }
}
