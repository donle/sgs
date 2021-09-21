import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xingxue', description: 'xingxue_description' })
export class XingXue extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['xingxue_ex'];
  }

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
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart && owner.Hp > 0;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= owner.Hp;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose at most {1} target(s) to draw a card?',
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
      await room.drawCards(1, toId, 'top', toId, this.Name);
    }

    for (const toId of event.toIds) {
      if (room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea).length <= room.getPlayerById(toId).Hp) {
        continue;
      }

      const response = await room.doAskForCommonly(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please put a card onto the top of draw stack',
            this.Name,
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        toId,
        true,
      );

      const cards = room.getPlayerById(toId).getPlayerCards();
      response.selectedCards =
        response.selectedCards.length > 0 ? response.selectedCards : [cards[Math.floor(Math.random() * cards.length)]];

      await room.moveCards({
        movingCards: [
          { card: response.selectedCards[0], fromArea: room.getPlayerById(toId).cardFrom(response.selectedCards[0]) },
        ],
        fromId: toId,
        toArea: CardMoveArea.DrawStack,
        moveReason: CardMoveReason.PlaceToDrawStack,
        proposer: toId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

@CommonSkill({ name: 'xingxue_ex', description: 'xingxue_ex_description' })
export class XingXueEX extends XingXue {
  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= owner.MaxHp;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose at most {1} target(s) to draw a card?',
      this.Name,
      owner.MaxHp,
    ).extract();
  }
}
