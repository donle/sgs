import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'cuirui', description: 'cuirui_description' })
export class CuiRui extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, owner: Player) {
    room.Analytics.getRecordEvents<GameEventIdentifiers.PhaseChangeEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseChangeEvent &&
        event.to === PlayerPhase.PhaseBegin &&
        event.toPlayer === owner.Id,
      undefined,
      undefined,
      undefined,
      1,
    ).length > 0 && owner.setFlag<boolean>(this.Name, true);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    const canUse =
      content.to === PlayerPhase.PhaseBegin && content.toPlayer === owner.Id && !owner.getFlag<boolean>(this.Name);

    if (canUse) {
      owner.setFlag<boolean>(this.Name, true);
    }

    return (
      canUse &&
      owner.Hp > 0 &&
      room.getOtherPlayers(owner.Id).find(player => player.getCardIds(PlayerCardsArea.HandArea).length > 0) !==
        undefined
    );
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= owner.Hp;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner && room.getPlayerById(targetId).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose at most {1} targets to prey cards?',
      this.Name,
      owner.Hp,
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
      const options: CardChoosingOptions = {
        [PlayerCardsArea.HandArea]: room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, false, true);
      if (!response) {
        return false;
      }

      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: CardMoveArea.HandArea }],
        fromId: toId,
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
