import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qieting', description: 'qieting_description' })
export class QieTing extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.BeforePhaseChange && event.from === PlayerPhase.PhaseFinish;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id !== content.fromPlayer &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
        event => {
          return (
            event.fromId === content.fromPlayer &&
            event.targetGroup !== undefined &&
            TargetGroupUtil.getRealTargets(event.targetGroup).find(player => player !== content.fromPlayer) !==
              undefined
          );
        },
        content.fromPlayer,
        'round',
        undefined,
        1,
      ).length === 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const phaseStageChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
    const toId = phaseStageChangeEvent.fromPlayer!;

    const canMoveCards = room
      .getPlayerById(toId)
      .getCardIds(PlayerCardsArea.EquipArea)
      .filter(cardId => room.canPlaceCardTo(cardId, fromId));
    const options: string[] = ['qieting:draw'];
    if (canMoveCards.length > 0) {
      options.unshift('qieting:move');
    }

    if (options.length > 1) {
      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose qieting options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
        ).extract(),
        toId: fromId,
      });

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        askForChooseEvent,
        fromId,
      );

      response.selectedOption = response.selectedOption || askForChooseEvent.options[0];

      if (response.selectedOption === askForChooseEvent.options[0]) {
        const askForChooseCardEvent =
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>({
            toId: fromId,
            cardIds: canMoveCards,
            amount: 1,
            customTitle: 'qieting: please move one of these cards to you',
          });

        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
          GameEventIdentifiers.AskForChoosingCardEvent,
          askForChooseCardEvent,
          fromId,
        );

        response.selectedCards = response.selectedCards || [
          canMoveCards[Math.floor(Math.random() * canMoveCards.length)],
        ];

        await room.moveCards({
          movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.EquipArea }],
          fromId: toId,
          toId: fromId,
          moveReason: CardMoveReason.PassiveMove,
          toArea: CardMoveArea.EquipArea,
          proposer: fromId,
          movedByReason: this.Name,
        });
      } else {
        await room.drawCards(1, fromId, 'top', fromId, this.Name);
      }
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}
