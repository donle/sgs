import { VirtualCard } from 'core/cards/card';
import { Slash } from 'core/cards/standard/slash';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yonglve', description: 'yonglve_description' })
export class YongLve extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.JudgeStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id !== content.playerId &&
      room.getPlayerById(content.playerId).getCardIds(PlayerCardsArea.JudgeArea).length > 0
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to drop a card from {1}’s judge area?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.playerId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const phaseStageChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    const toId = phaseStageChangeEvent.playerId;

    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toId);
    const judgeAreaCards = to.getCardIds(PlayerCardsArea.JudgeArea);

    const askForChooseCardEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>({
      toId: fromId,
      cardIds: judgeAreaCards,
      amount: 1,
      customTitle: 'yonglve: please drop one of these cards',
    });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
      GameEventIdentifiers.AskForChoosingCardEvent,
      askForChooseCardEvent,
      fromId,
    );

    response.selectedCards = response.selectedCards || [
      judgeAreaCards[Math.floor(Math.random() * judgeAreaCards.length)],
    ];
    await room.dropCards(CardMoveReason.PassiveDrop, response.selectedCards, toId, fromId, this.Name);

    if (room.withinAttackDistance(from, to)) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    } else {
      const slash = VirtualCard.create<Slash>({
        cardName: 'slash',
        bySkill: this.Name,
      }).Id;
      if (from.canUseCardTo(room, slash, toId)) {
        await room.useCard({
          fromId,
          cardId: slash,
          targetGroup: [[toId]],
        });
      }
    }

    return true;
  }
}
