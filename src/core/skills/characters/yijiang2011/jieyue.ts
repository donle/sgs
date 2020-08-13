import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jieyue', description: 'jieyue_description' })
export class JieYue extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      owner.getPlayerCards().length > 0
    );
  }

  public numberOfCards() {
    return [1];
  }

  public isAvailableCard() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: string, room: Room, target: string) {
    return target !== owner;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const yujinId = skillUseEvent.fromId;
    const yujin = room.getPlayerById(yujinId);
    const toId = skillUseEvent.toIds![0];
    await room.moveCards({
      movingCards: skillUseEvent.cardIds!.map(card => ({ card, fromArea: yujin.cardFrom(card) })),
      fromId: yujinId,
      toArea: CardMoveArea.HandArea,
      toId,
      moveReason: CardMoveReason.ActiveMove,
      proposer: yujinId,
      movedByReason: this.Name,
    });

    const to = room.getPlayerById(toId);
    if (to.getPlayerCards().length <= 0) {
      await room.drawCards(3, yujinId, undefined, toId, this.Name);
    } else {
      const askForChoice: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['option-one', 'option-two'],
        askedBy: yujinId,
        toId,
        conversation: TranslationPack.translationJsonPatcher('{0}: please choose jieyue options', this.Name).extract(),
        triggeredBySkills: [this.Name],
      };

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChoice, toId);

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);

      if (response.selectedOption === 'option-one') {
        const askForDiscards: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent> = {
          toId,
          amount: 2,
          customCardFields: {
            [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea),
            [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
          },
          customMessage: 'please choose cards that you want to keep',
        };

        room.notify(GameEventIdentifiers.AskForChoosingCardWithConditionsEvent, askForDiscards, toId);

        const { selectedCards } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
          toId,
        );

        if (selectedCards === undefined) {
          return false;
        } else {
          await room.dropCards(CardMoveReason.SelfDrop, selectedCards, toId, toId, this.Name);
        }
      } else {
        await room.drawCards(3, yujinId, undefined, toId, this.Name);
      }
    }

    return true;
  }
}
