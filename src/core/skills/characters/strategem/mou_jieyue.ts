import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mou_jieyue', description: 'mou_jieyue_description' })
export class MouJieYue extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to gain 1 armor?',
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

    await room.changeArmor(event.toIds[0], 1);

    if (room.getPlayerById(event.toIds[0]).getPlayerCards().length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
          cardAmount: 1,
          toId: event.toIds[0],
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: do you want to give 1 card to {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        }),
        event.toIds[0],
      );

      response.selectedCards.length > 0 &&
        (await room.moveCards({
          movingCards: [
            {
              card: response.selectedCards[0],
              fromArea: room.getPlayerById(event.toIds[0]).cardFrom(response.selectedCards[0]),
            },
          ],
          fromId: event.toIds[0],
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: event.toIds[0],
          triggeredBySkills: [this.Name],
        }));
    }

    return true;
  }
}
