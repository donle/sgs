import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CharacterGender } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jianyan', description: 'jianyan_description' })
export class JianYan extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 0;
  }

  public targetFilter(): boolean {
    return true;
  }

  public cardFilter(): boolean {
    return true;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  private jianYanMatch(cardType: string): CardMatcher {
    switch (cardType) {
      case 'basic card':
        return new CardMatcher({ type: [CardType.Basic] });
      case 'trick card':
        return new CardMatcher({ type: [CardType.Trick] });
      case 'equip card':
        return new CardMatcher({ type: [CardType.Equip] });
      case 'jianyan:red':
        return new CardMatcher({ suit: [CardSuit.Diamond, CardSuit.Heart] });
      case 'jianyan:black':
        return new CardMatcher({ suit: [CardSuit.Club, CardSuit.Spade] });
      default:
        throw new Error('Unknown jianyan type');
    }
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId } = skillUseEvent;

    const options: string[] = ['basic card', 'trick card', 'equip card', 'jianyan:red', 'jianyan:black'];
    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose a card type or color',
        this.Name,
      ).extract(),
      toId: fromId,
    });

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, fromId);

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);
    response.selectedOption = response.selectedOption || 'trick card';

    const cardMatcher: CardMatcher = this.jianYanMatch(response.selectedOption);

    let pendingCardIds = room.findCardsByMatcherFrom(cardMatcher);
    if (pendingCardIds.length === 0) {
      pendingCardIds = room.findCardsByMatcherFrom(cardMatcher, false);
      room.shuffle();
    }
    if (pendingCardIds.length === 0) {
      return false;
    }

    const displayCards: CardId[] = [pendingCardIds[0]];

    await room.moveCards({
      movingCards: displayCards.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
      toArea: CardMoveArea.ProcessingArea,
      moveReason: CardMoveReason.PassiveMove,
      movedByReason: this.Name,
    });

    const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: displayCards,
      selected: [],
    };
    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent);

    const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: room
        .getAlivePlayersFrom()
        .filter(p => p.Gender === CharacterGender.Male)
        .map(p => p.Id),
      toId: fromId,
      requiredAmount: 1,
      conversation: 'jianyan:Please choose a target to obtain the card you show',
    };
    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent, fromId);

    const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      fromId,
    );

    const target =
      choosePlayerResponse.selectedPlayers === undefined ? fromId : choosePlayerResponse.selectedPlayers[0];

    room.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {});
    await room.moveCards({
      movingCards: displayCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
      toId: target,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}
