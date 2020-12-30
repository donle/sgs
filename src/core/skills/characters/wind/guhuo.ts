import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ChanYuan } from './chanyuan';

@CommonSkill({ name: 'guhuo', description: 'guhuo_description' })
export class GuHuo extends ViewAsSkill {
  public canViewAs(): string[] {
    return Sanguosha.getCardNameByType(
      types =>
        (types.includes(CardType.Trick) || types.includes(CardType.Basic)) && !types.includes(CardType.DelayedTrick),
    );
  }

  isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PhaseBegin;
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown guhuo card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
        cardNumber: 0,
        cardSuit: CardSuit.NoSuit,
        hideActualCard: true,
      },
      selectedCards,
    );
  }

  nominateForwardTarget() {
    return [];
  }
}

@ShadowSkill
@CommonSkill({ name: GuHuo.Name, description: GuHuo.Description })
export class GuHuoShadow extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === CardUseStage.PreCardUse || stage === CardResponseStage.PreCardResponse) &&
      Card.isVirtualCardId(event.cardId)
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return (
      content.fromId === owner.Id &&
      Sanguosha.getCardById<VirtualCard>(content.cardId).findByGeneratedSkill(this.GeneralName)
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    const preuseCard = Sanguosha.getCardById<VirtualCard>(cardEvent.cardId);
    const realCard = Sanguosha.getCardById(preuseCard.ActualCardIds[0]);
    const from = room.getPlayerById(cardEvent.fromId);

    preuseCard.Suit = realCard.Suit;
    preuseCard.CardNumber = realCard.CardNumber;
    if (!room.isCardOnProcessing(preuseCard.Id)) {
      await room.moveCards({
        movingCards: [{ card: preuseCard.Id }],
        fromId: cardEvent.fromId,
        toArea: CardMoveArea.ProcessingArea,
        moveReason: CardMoveReason.CardUse,
        movedByReason: this.GeneralName,
        hideBroadcast: true,
      });
    }

    const chooseOptionEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = EventPacker.createUncancellableEvent<
      GameEventIdentifiers.AskForChoosingOptionsEvent
    >({
      toId: event.fromId,
      options: ['guhuo:doubt', 'guhuo:no-doubt'],
      conversation: TranslationPack.translationJsonPatcher(
        'do you doubt the pre-use of {0} from {1}',
        TranslationPack.patchCardInTranslation(cardEvent.cardId),
        TranslationPack.patchPlayerInTranslation(from),
      ).extract(),
      ignoreNotifiedStatus: true,
    });

    const askingResponses: Promise<ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent>>[] = [];
    const askForPlayers = room
      .getAlivePlayersFrom()
      .filter(player => !player.hasSkill(ChanYuan.Name) && player.Id !== cardEvent.fromId)
      .map(player => player.Id);
    room.doNotify(askForPlayers);
    for (const playerId of askForPlayers) {
      chooseOptionEvent.toId = playerId;
      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, chooseOptionEvent, playerId);
      askingResponses.push(
        room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, playerId),
      );
    }

    const responses = await Promise.all(askingResponses);
    const messages = responses.map(response =>
      TranslationPack.translationJsonPatcher(
        '{0} selected {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(response.fromId)),
        response.selectedOption!,
      ).toString(),
    );
    messages.push(
      TranslationPack.translationJsonPatcher(
        '{0} displayed guhuo cards {1}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(realCard.Id),
      ).toString(),
    );

    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      messages,
    });

    let success = true;
    const chooseOptions: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = EventPacker.createUncancellableEvent<
      GameEventIdentifiers.AskForChoosingOptionsEvent
    >({
      options: ['guhuo:lose-hp', 'guhuo:drop-card'],
      toId: '',
      conversation: 'please choose',
    });
    for (const response of responses) {
      if (preuseCard.Name === realCard.Name) {
        if (response.selectedOption === 'guhuo:doubt') {
          const player = room.getPlayerById(response.fromId);
          if (player.getPlayerCards().length > 0) {
            chooseOptions.toId = response.fromId;
            room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, chooseOptions, response.fromId);
            const { selectedOption } = await room.onReceivingAsyncResponseFrom(
              GameEventIdentifiers.AskForChoosingOptionsEvent,
              response.fromId,
            );
            if (selectedOption === 'guhuo:loseHp') {
              await room.loseHp(response.fromId, 1);
            } else {
              const dropResponse = await room.askForCardDrop(
                response.fromId,
                1,
                [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
                true,
                undefined,
                this.Name,
              );
              await room.dropCards(
                CardMoveReason.SelfDrop,
                dropResponse.droppedCards,
                response.fromId,
                response.fromId,
                this.Name,
              );
            }
          } else {
            await room.loseHp(response.fromId, 1);
          }
          await room.obtainSkill(response.fromId, ChanYuan.Name, true);
          room.setFlag(response.fromId, ChanYuan.Name, true, true);
        }
      } else {
        if (response.selectedOption === 'guhuo:doubt') {
          success = false;
          await room.drawCards(1, response.fromId, undefined, event.fromId, this.GeneralName);
        }
      }
    }

    if (!success) {
      EventPacker.terminate(cardEvent);
      await room.moveCards({
        movingCards: [{ card: realCard.Id, fromArea: CardMoveArea.ProcessingArea }],
        moveReason: CardMoveReason.PlaceToDropStack,
        toArea: CardMoveArea.DropStack,
        hideBroadcast: true,
        movedByReason: this.Name,
      });
      room.endProcessOnTag(preuseCard.Id.toString());

      return false;
    } else {
      cardEvent.cardId = preuseCard.Id;
    }

    return true;
  }
}
