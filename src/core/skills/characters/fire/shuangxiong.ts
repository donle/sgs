import { Card, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Duel } from 'core/cards/standard/duel';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, DrawCardStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shuangxiong', description: 'shuangxiong_description' })
export class ShuangXiong extends ViewAsSkill implements OnDefineReleaseTiming {
  public static readonly Red = 'shuangxiong_red';
  public static readonly Black = 'shuangxiong_black';

  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public canViewAs(): string[] {
    return ['duel'];
  }

  public canUse(room: Room, owner: Player) {
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['duel'] })) &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      (room.getFlag<boolean>(owner.Id, ShuangXiong.Red) !== undefined ||
        room.getFlag<boolean>(owner.Id, ShuangXiong.Black) !== undefined)
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return (
      (room.getFlag<boolean>(owner.Id, ShuangXiong.Red) === true && !Sanguosha.getCardById(pendingCardId).isRed()) ||
      (room.getFlag<boolean>(owner.Id, ShuangXiong.Black) === true && !Sanguosha.getCardById(pendingCardId).isBlack())
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<Duel>(
      {
        cardName: 'duel',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: ShuangXiong.GeneralName, description: ShuangXiong.Description })
export class ShuangXiongShadow extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.DamageEvent>,
    stage: AllStage,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(event);
    return (
      (unknownEvent === GameEventIdentifiers.DrawCardEvent && stage === DrawCardStage.BeforeDrawCardEffect) ||
      (unknownEvent === GameEventIdentifiers.DamageEvent && stage === DamageEffectStage.AfterDamagedEffect)
    );
  }

  private findSlash(room: Room, fromId: string): CardId[] {
    return room.Analytics.getRecordEvents<GameEventIdentifiers.CardResponseEvent>(
      (event: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>) => {
        if (EventPacker.getIdentifier(event) !== GameEventIdentifiers.CardResponseEvent) {
          return false;
        }
        if (event.fromId === fromId) {
          return false;
        }

        const { responseToEvent } = event;

        if (responseToEvent && EventPacker.getIdentifier(responseToEvent) === GameEventIdentifiers.CardEffectEvent) {
          const cardEffectEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
          const card = Sanguosha.getCardById(cardEffectEvent.cardId);
          if (card.GeneralName === 'duel' && card.isVirtualCard()) {
            const shuangxiongCard = card as VirtualCard;

            const responseCard = Sanguosha.getCardById(event.cardId);
            const hasRealResponseCard = responseCard.isVirtualCard()
              ? (responseCard as VirtualCard).ActualCardIds.length > 0
              : true;

            return hasRealResponseCard && shuangxiongCard.findByGeneratedSkill(this.GeneralName);
          }
        }

        return false;
      },
    ).reduce<CardId[]>(
      (cards, event) => [
        ...cards,
        ...Card.getActualCards([event.cardId]).filter(
          cardId => room.isCardInDropStack(cardId) && !cards.includes(cardId),
        ),
      ],
      [],
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.DamageEvent>,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(event);
    if (unknownEvent === GameEventIdentifiers.DrawCardEvent) {
      const drawEvent = event as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      return (
        owner.Id === drawEvent.fromId &&
        room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
        drawEvent.drawAmount > 0 &&
        drawEvent.bySpecialReason === CardDrawReason.GameStage
      );
    } else if (unknownEvent === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (
        damageEvent.cardIds &&
        damageEvent.cardIds.length === 1 &&
        Sanguosha.getCardById(damageEvent.cardIds[0]).isVirtualCard()
      ) {
        const damageCard = Sanguosha.getCardById(damageEvent.cardIds[0]) as VirtualCard;

        return (
          owner.Id === damageEvent.toId &&
          damageCard.findByGeneratedSkill(this.GeneralName) &&
          damageEvent.fromId !== undefined &&
          this.findSlash(room, owner.Id).length > 0
        );
      }
    }

    return false;
  }

  public getSkillLog(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>) {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      return super.getSkillLog(room, owner, event);
    } else {
      return 'shuangxiong: do you wanna to obtain slashes from "shuangxiong" ?';
    }
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.DamageEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      const drawEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      const { fromId } = drawEvent;

      drawEvent.drawAmount = 0;
      const displayCards = room.getCards(2, 'top');
      const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
        displayCards,
        fromId,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, display cards: {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          this.Name,
          TranslationPack.patchCardInTranslation(...displayCards),
        ).extract(),
      };
      room.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);

      const chooseCardEvent = {
        toId: fromId,
        cardIds: displayCards,
        amount: 1,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>(chooseCardEvent),
        fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingCardEvent, fromId);

      if (response.selectedCards === undefined) {
        response.selectedCards = [displayCards[0]];
      }

      const chosenOne = response.selectedCards[0];
      await room.moveCards({
        movingCards: [{ card: chosenOne, fromArea: CardMoveArea.ProcessingArea }],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        movedByReason: this.Name,
      });

      const chosenCard = Sanguosha.getCardById(chosenOne);
      chosenCard.isRed() && room.setFlag<boolean>(fromId, ShuangXiong.Red, true, true);
      chosenCard.isBlack() && room.setFlag<boolean>(fromId, ShuangXiong.Black, true, true);
      await room.moveCards({
        movingCards: displayCards
          .filter(id => id !== chosenOne)
          .map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        moveReason: CardMoveReason.PlaceToDropStack,
        toArea: CardMoveArea.DropStack,
        hideBroadcast: true,
        movedByReason: this.Name,
      });
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const { fromId, toId } = damageEvent;

      if (fromId) {
        const toObtain = this.findSlash(room, toId);
        await room.moveCards({
          movingCards: toObtain.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
          toId,
          moveReason: CardMoveReason.ActivePrey,
          toArea: CardMoveArea.HandArea,
        });
      }
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ShuangXiongShadow.Name, description: ShuangXiongShadow.Description })
export class ShuangXiongRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage: PhaseChangeStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged && event.from === PlayerPhase.PhaseFinish;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.fromPlayer === owner.Id &&
      (room.getFlag<boolean>(owner.Id, ShuangXiong.Red) !== undefined ||
        room.getFlag<boolean>(owner.Id, ShuangXiong.Black) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    if (room.getFlag<boolean>(skillUseEvent.fromId, ShuangXiong.Red) !== undefined) {
      room.removeFlag(skillUseEvent.fromId, ShuangXiong.Red);
    }

    if (room.getFlag<boolean>(skillUseEvent.fromId, ShuangXiong.Black) !== undefined) {
      room.removeFlag(skillUseEvent.fromId, ShuangXiong.Black);
    }

    return true;
  }
}
