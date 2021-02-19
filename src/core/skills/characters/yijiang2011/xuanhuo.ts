import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xuanhuo', description: 'xuanhuo_description' })
export class XuanHuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      room.AlivePlayers.length > 2 &&
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.DrawCardStageEnd &&
      owner.getCardIds(PlayerCardsArea.HandArea).length >= 2
    );
  }

  public numberOfTargets() {
    return 2;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 2;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = event;
    return [
      { from: fromId, tos: [toIds![0]] },
      { from: toIds![0], tos: [toIds![1]] },
    ];
  }

  public resortTargets() {
    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = event;
    const first = toIds![0];
    const second = toIds![1];

    await room.moveCards({
      movingCards: cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: first,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: fromId,
      movedByReason: this.Name,
    });

    const options: string[] = [];
    const attackCards = Sanguosha.getCardsByMatcher(new CardMatcher({ generalName: ['slash'] })).reduce<string[]>(
      (allName, card) => {
        allName.push(card.Name);
        return allName;
      },
      [],
    );
    attackCards.push('duel');

    const newOptions: string[] = [];

    for (const acard of attackCards) {
      if (
        room
          .getPlayerById(first)
          .canUseCardTo(
            room,
            acard !== 'duel' ? new CardMatcher({ name: [acard] }) : new CardMatcher({ generalName: [acard] }),
            second,
          )
      ) {
        if (!options.includes('xuanhuo:attack')) {
          options.push('xuanhuo:attack');
        }
        newOptions.push(acard);
      }
    }

    if (room.getPlayerById(first).getCardIds(PlayerCardsArea.HandArea).length > 0) {
      options.push('xuanhuo:give');
    }

    if (options.length === 0) {
      return false;
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose xuanhuo options: {1}',
        this.Name,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(second)),
      ).extract(),
      toId: first,
    });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      askForChooseEvent,
      first,
    );

    response.selectedOption = response.selectedOption || askForChooseEvent.options[0];

    if (response.selectedOption === 'xuanhuo:attack') {
      if (newOptions.length === 0) {
        return false;
      }

      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: newOptions,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose xuanhuo attack options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(second)),
        ).extract(),
        toId: first,
      });
  
      const newResponse = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        askForChooseEvent,
        first,
      );

      newResponse.selectedOption = newResponse.selectedOption || askForChooseEvent.options[0];

      const cardUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: first,
        targetGroup: [[second]],
        cardId: VirtualCard.create({ cardName: newResponse.selectedOption, bySkill: this.Name }).Id,
      };
      await room.useCard(cardUseEvent);
    } else {
      const handcards = room.getPlayerById(first).getCardIds(PlayerCardsArea.HandArea);
      await room.moveCards({
        movingCards: handcards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: first,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: first,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}
