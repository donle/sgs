import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
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
      room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent &&
          event.fromId === content.fromPlayer &&
          event.toId !== content.fromPlayer,
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
    const to = room.getPlayerById(toId);

    const canMoveCards = to.getCardIds(PlayerCardsArea.EquipArea).filter(cardId => room.canPlaceCardTo(cardId, fromId));
    const options: string[] = ['qieting:draw'];
    if (canMoveCards.length > 0) {
      options.unshift('qieting:move');
    }

    if (to.getCardIds(PlayerCardsArea.HandArea).length > 0) {
      options.unshift('qieting:prey');
    }

    if (options.length > 1) {
      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose qieting options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(to),
        ).extract(),
        toId: fromId,
      });

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        askForChooseEvent,
        fromId,
      );

      response.selectedOption = response.selectedOption || askForChooseEvent.options[options.length - 1];

      if (response.selectedOption === 'qieting:prey') {
        const options: CardChoosingOptions = {
          [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea),
        };

        if (to.getCardIds(PlayerCardsArea.HandArea).length > 2) {
          options[PlayerCardsArea.HandArea] = Algorithm.randomPick(2, to.getCardIds(PlayerCardsArea.HandArea));
        }

        const chooseCardEvent = {
          fromId,
          toId,
          options,
          triggeredBySkills: [this.Name],
        };

        const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, false, true);
        if (!response) {
          return false;
        }

        await room.moveCards({
          movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
          fromId: chooseCardEvent.toId,
          toId: chooseCardEvent.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: chooseCardEvent.fromId,
          movedByReason: this.Name,
        });
      } else if (response.selectedOption === 'qieting:move') {
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
