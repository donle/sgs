import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'pve_classic_tianji', description: 'pve_classic_tianji_description' })
export class PveClassicTianJi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    const noDamage =
      room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
        event => {
          return EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent;
        },
        content.playerId,
        'round',
        undefined,
        1,
      ).length === 0;
    return (
      owner.Id !== content.playerId &&
      noDamage &&
      PlayerPhaseStages.FinishStageEnd === content.toStage &&
      owner.getPlayerCards().length > 0
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const current = room.CurrentPhasePlayer;

    const resp = await room.askForCardDrop(
      fromId!,
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      true,
      undefined,
      this.Name,
      TranslationPack.translationJsonPatcher(
        'please discard a card to deal 1 thunder damage to {0} ?',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(current.Id)),
      ).extract(),
    );

    if (resp.droppedCards.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, resp.droppedCards, fromId);
      if (!current.Dead) {
        await room.damage({
          fromId,
          toId: current.Id,
          damage: 1,
          damageType: DamageType.Thunder,
          triggeredBySkills: [this.GeneralName],
        });
      }
    }

    return true;
  }
}
