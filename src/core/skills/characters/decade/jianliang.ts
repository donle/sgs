import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jianliang', description: 'jianliang_description' })
export class JianLiang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.playerId === owner.Id &&
      event.toStage === PlayerPhaseStages.DrawCardStageStart &&
      !!room
        .getOtherPlayers(owner.Id)
        .find(
          player =>
            player.getCardIds(PlayerCardsArea.HandArea).length > owner.getCardIds(PlayerCardsArea.HandArea).length,
        )
    );
  }

  public numberOfTargets(): number[] {
    return [1, 2];
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose at most 2 targets to draw 1 card each?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    for (const toId of event.toIds) {
      await room.drawCards(1, toId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
