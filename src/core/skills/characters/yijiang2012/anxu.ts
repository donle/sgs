import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'anxu', description: 'anxu_description' })
export class AnXu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PlayCardStage;
  }

  public numberOfTargets(): number {
    return 2;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    return (
      target !== owner && (selectedTargets.length === 1
        ? room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0
        : true)
    );
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = event;
    return [
      { from: fromId, tos: [toIds![0]] },
      { from: toIds![0], tos: [toIds![1]] },
    ];
  }

  public nominateForwardTarget(targets?: PlayerId[]) {
    return [targets![0]];
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = event;
    const first = toIds![0];
    const second = toIds![1];
    const secondPlayer = room.getPlayerById(second);

    const options: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: secondPlayer.getCardIds(PlayerCardsArea.HandArea).length,
      [PlayerCardsArea.EquipArea]: secondPlayer.getCardIds(PlayerCardsArea.EquipArea),
    };

    const chooseCardEvent = {
      fromId: first,
      toId: second,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      first,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      first,
    );

    if (response.selectedCard === undefined) {
      const cardIds = secondPlayer.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
      fromId: chooseCardEvent.toId,
      toId: chooseCardEvent.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: chooseCardEvent.fromId,
      movedByReason: this.Name,
    });

    if (response.fromArea !== PlayerCardsArea.EquipArea) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    const firstHandNum = room.getPlayerById(first).getCardIds(PlayerCardsArea.HandArea).length;
    const secondHandNum = secondPlayer.getCardIds(PlayerCardsArea.HandArea).length;
    let lessOne: PlayerId | undefined;
    
    if (firstHandNum > secondHandNum) {
      lessOne = second;
    } else if (firstHandNum < secondHandNum) {
      lessOne = first;
    }

    if (lessOne) {
      const askForInvokeSkill: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        toId: fromId,
        options: ['yes', 'no'],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to let {1} draw a card?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(lessOne)),
        ).extract(),
      };
      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForInvokeSkill, fromId);
      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        fromId,
      );
      if (selectedOption === 'yes') {
        await room.drawCards(1, lessOne, 'top', fromId, this.Name);
      }
    }

    return true;
  }
}
