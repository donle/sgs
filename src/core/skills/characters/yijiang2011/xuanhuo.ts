import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xuanhuo', description: 'xuanhuo_description' })
export class XuanHuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId, toIds } = skillEffectEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount = 0;

    const toId = toIds![0];
    await room.drawCards(2, toId, undefined, fromId, this.Name);

    const to = room.getPlayerById(toId);
    const targetIds = room
      .getOtherPlayers(toId)
      .filter(target => {
        return to.getAttackDistance(room) >= room.distanceBetween(to, target);
      })
      .map(target => target.Id);

    if (targetIds.length <= 0) {
      await this.doSlashFail(room, fromId, toId);
    } else {
      const askForChoosingPlayer: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        toId: fromId,
        players: targetIds,
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          'xuanhuo: please choose a target who {0} can slash',
          TranslationPack.patchPlayerInTranslation(to),
        ).extract(),
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(askForChoosingPlayer),
        fromId,
      );

      const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        fromId,
      );

      const victimId = selectedPlayers![0];
      const askForUseSlashTo: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        toId,
        cardUserId: toId,
        scopedTargets: [victimId],
        cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
        extraUse: true,
        commonUse: true,
        conversation: TranslationPack.translationJsonPatcher(
          'xuanhuo: please use slash to {0}, else {1} obtain 2 cards from you',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(victimId)),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).extract(),
      };

      const response = await room.askForCardUse(askForUseSlashTo, toId);
      if (response.cardId !== undefined) {
        const slashUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
          fromId: response.fromId,
          toIds: response.toIds,
          cardId: response.cardId,
          triggeredBySkills: [this.Name],
        };

        await room.useCard(slashUseEvent);
      } else {
        await this.doSlashFail(room, fromId, toId);
      }
    }

    return true;
  }

  private async doSlashFail(room: Room, fromId: PlayerId, toId: PlayerId) {
    const to = room.getPlayerById(toId);
    const ownedCards = to.getPlayerCards();

    if (ownedCards.length <= 0) {
      return;
    }

    const numOfObtain = Math.min(ownedCards.length, 2);

    const cardsChooseEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      amount: numOfObtain,
      customCardFields: {
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      },
      toId: fromId,
      customTitle: TranslationPack.translationJsonPatcher(
        '{0}: please choose {1} cards to obtain',
        this.Name,
        numOfObtain,
      ).toString(),
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>(cardsChooseEvent),
      fromId,
    );

    const { selectedCards, selectedCardsIndex } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      fromId,
    );

    const selectableCards: {
      card: CardId;
      fromArea: PlayerCardsArea | undefined;
    }[] = to.getPlayerCards().map(card => ({ card, fromArea: to.cardFrom(card) }));

    let movingCards: {
      card: CardId | number;
      fromArea: PlayerCardsArea | undefined;
    }[];

    if (selectableCards === undefined && selectedCardsIndex === undefined) {
      movingCards = Algorithm.randomPick(numOfObtain, selectableCards);
    } else if (selectedCardsIndex === undefined) {
      movingCards = selectedCards!.map(card => ({ card, fromArea: PlayerCardsArea.EquipArea }));
    } else if (selectedCards === undefined) {
      const randomHandcards = Algorithm.randomPick(numOfObtain, to.getCardIds(PlayerCardsArea.HandArea));
      movingCards = randomHandcards.map(card => ({ card, fromArea: PlayerCardsArea.HandArea }));
    } else {
      movingCards = [];
      for (const card of selectedCards) {
        movingCards.push({ card, fromArea: PlayerCardsArea.EquipArea });
      }
      for (const card of Algorithm.randomPick(selectedCardsIndex.length, to.getCardIds(PlayerCardsArea.HandArea))) {
        movingCards.push({ card, fromArea: PlayerCardsArea.HandArea });
      }
    }

    await room.moveCards({
      fromId: toId,
      movingCards,
      toId: fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      movedByReason: this.Name,
      proposer: fromId,
      engagedPlayerIds: [fromId],
    });
  }
}
