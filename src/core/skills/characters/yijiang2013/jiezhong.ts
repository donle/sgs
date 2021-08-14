import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'jiezhong', description: 'jiezhong_description' })
export class JieZhong extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length < owner.MaxHp
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s)?',
      this.GeneralName,
      owner.MaxHp - owner.getCardIds(PlayerCardsArea.HandArea).length,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    await room.drawCards(
      from.MaxHp - from.getCardIds(PlayerCardsArea.HandArea).length,
      fromId,
      'top',
      fromId,
      this.Name,
    );

    return true;
  }
}
